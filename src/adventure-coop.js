// Adventure — real-time CO-OP simulation + Durable Object (one instance per match).
//
// The world is authoritative and shared: two heroes (slots "X" and "O") explore the
// same maze, share objects/dragons/castle gates, and win together by returning the
// Chalice to the Gold Castle. Each client only *renders* the other hero when they are
// in the same room (see public/play/adv/), but the server always tracks both.
//
// The room map + movement/collision mirror the single-player sim in
// public/games/adventure/index.html so behaviour matches; this copy is the one bundled
// into the Worker/DO. The pure functions (newWorld/coopTick/…) are headless-tested.

const SIZE=200, HS=8, OBJ=8, BW=14, DS=14, SPEED=7, DSPEED=5, TICK_MS=80, DEATH_MS=1200;
export const CONSTS={SIZE,HS,OBJ,BW,DS,SPEED,DSPEED,TICK_MS};

const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const pRect=(p)=>({x:p.x,y:p.y,w:HS,h:HS});

export const ROOMS={
  commons:{ name:"The Commons", color:"#3a7d3a", exits:{N:"north",S:"south",E:"east",W:"west"},
    castle:{name:"Gold",gate:{x:84,y:66,w:32,h:20},interior:"goldIn"} },
  north:{ name:"Blue Antechamber", color:"#2b52a0", exits:{S:"commons",N:"belfry"} },
  south:{ name:"Violet Hollow", color:"#6a2d8a", exits:{N:"commons",S:"catacomb"},
    inner:[{x:40,y:96,w:52,h:12},{x:108,y:96,w:52,h:12}] },
  east:{ name:"Teal Corridor", color:"#1f8a76", exits:{W:"commons",E:"blackgate"} },
  blackgate:{ name:"The Black Gate", color:"#2a2a2a", exits:{W:"east"},
    inner:[{x:36,y:112,w:128,h:12}],
    castle:{name:"Black",gate:{x:84,y:52,w:32,h:20},interior:"blackIn"} },
  west:{ name:"West Woods", color:"#3a6a2a", exits:{E:"commons",N:"grotto",W:"maze1"} },
  grotto:{ name:"The Grotto", color:"#1f5a6a", exits:{S:"west"} },
  maze1:{ name:"Twisting Maze", color:"#6a5a2a", exits:{E:"west",W:"maze2"}, inner:[{x:40,y:60,w:12,h:120},{x:120,y:20,w:12,h:120}] },
  maze2:{ name:"Deep Maze", color:"#5a3a6a", exits:{E:"maze1"}, inner:[{x:60,y:0,w:12,h:130},{x:132,y:70,w:12,h:130}] },
  belfry:{ name:"The Belfry", color:"#2b4a8a", exits:{S:"north"} },
  catacomb:{ name:"The Catacomb", color:"#3a2a3a", exits:{N:"south",E:"crypt"}, inner:[{x:90,y:40,w:12,h:100}] },
  crypt:{ name:"The Crypt", color:"#242438", exits:{W:"catacomb"} },
  goldIn:{ name:"Inside the Gold Castle", color:"#12101c", exits:{S:"commons"}, exitReturn:{x:96,y:96} },
  // Mirrors the single-player black castle maze (public/games/adventure/
  // index.html) — see that file's comment for the full player-feedback
  // context. Same 5-room layout: entry hall, a forking hall with a dead
  // end, a barrier room only the bridge lets you cross, and the vault
  // holding the chalice.
  blackIn:{ name:"Inside the Black Castle", color:"#12101c", exits:{S:"blackgate",N:"blackIn2"}, exitReturn:{x:96,y:80} },
  blackIn2:{ name:"Black Castle: Forking Hall", color:"#161320", exits:{S:"blackIn",N:"blackIn3",E:"blackIn2b"} },
  blackIn2b:{ name:"Black Castle: Dead End", color:"#161320", exits:{W:"blackIn2"} },
  blackIn3:{ name:"Black Castle: The Chasm", color:"#1c1420", exits:{S:"blackIn2",N:"blackIn4"}, inner:[{x:0,y:95,w:200,h:10}] },
  blackIn4:{ name:"Black Castle: The Vault", color:"#221a12", exits:{S:"blackIn3"} },
};

export function borderWalls(id){
  const ex=ROOMS[id].exits||{}, g0=80,g1=120, W=[];
  if(ex.N){ W.push({x:0,y:0,w:g0,h:BW}); W.push({x:g1,y:0,w:SIZE-g1,h:BW}); } else W.push({x:0,y:0,w:SIZE,h:BW});
  if(ex.S){ W.push({x:0,y:SIZE-BW,w:g0,h:BW}); W.push({x:g1,y:SIZE-BW,w:SIZE-g1,h:BW}); } else W.push({x:0,y:SIZE-BW,w:SIZE,h:BW});
  if(ex.W){ W.push({x:0,y:0,w:BW,h:g0}); W.push({x:0,y:g1,w:BW,h:SIZE-g1}); } else W.push({x:0,y:0,w:BW,h:SIZE});
  if(ex.E){ W.push({x:SIZE-BW,y:0,w:BW,h:g0}); W.push({x:SIZE-BW,y:g1,w:BW,h:SIZE-g1}); } else W.push({x:SIZE-BW,y:0,w:BW,h:SIZE});
  return W;
}
const roomWalls=(id)=>borderWalls(id).concat(ROOMS[id].inner||[]);
function collide(id,rect,bridge){ if(bridge) return false; for(const w of roomWalls(id)) if(overlap(rect,w)) return true; return false; }

export function newWorld(){
  return {
    players:{}, // slot -> hero
    objects:{
      sword:{room:"north",x:100,y:100,carried:false,by:null},
      bridge:{room:"south",x:60,y:150,carried:false,by:null},
      blackkey:{room:"east",x:56,y:60,carried:false,by:null},
      chalice:{room:"blackIn4",x:96,y:100,carried:false,by:null},
    },
    dragons:[
      {id:"yellow",color:"#d8c020",room:"south",x:100,y:60,hx:100,hy:60,alive:true},
      {id:"green", color:"#38b038",room:"east", x:120,y:120,hx:120,hy:120,alive:true},
      {id:"red",   color:"#d03020",room:"blackgate",x:100,y:150,hx:100,hy:150,alive:true},
    ],
    gates:{black:false}, won:false, winner:null,
  };
}
const START_X={X:84,O:108};
export function addPlayer(w,slot,name){
  if(!w.players[slot]) w.players[slot]={name,x:START_X[slot]||96,y:150,room:"commons",dir:"up",carry:null,alive:true,deadT:0,input:null,dropLock:null};
  else w.players[slot].name=name;
  return w.players[slot];
}
export function setInput(w,slot,dir){ const p=w.players[slot]; if(p) p.input=dir; }
export function playerNames(w){ const o={}; for(const s in w.players) o[s]=w.players[s].name; return o; }

function moveHero(w,p){
  const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[p.input]||[0,0];
  const dx=v[0]*SPEED, dy=v[1]*SPEED;
  if(dx) p.dir=dx>0?"right":"left"; else if(dy) p.dir=dy>0?"down":"up";
  const bridge=p.carry==="bridge";
  if(!collide(p.room,{x:p.x+dx,y:p.y,w:HS,h:HS},bridge)) p.x+=dx;
  if(!collide(p.room,{x:p.x,y:p.y+dy,w:HS,h:HS},bridge)) p.y+=dy;
}
function enter(p,room,fromDir,old){
  p.room=room; const er=ROOMS[old].exitReturn;
  if(fromDir==="S"&&er){ p.x=er.x; p.y=er.y; return; }
  if(fromDir==="E") p.x=2; else if(fromDir==="W") p.x=SIZE-HS-2;
  else if(fromDir==="N") p.y=SIZE-HS-2; else if(fromDir==="S") p.y=2;
}
function transition(p){
  const ex=ROOMS[p.room].exits||{}, old=p.room, cx=p.x+HS/2, cy=p.y+HS/2;
  if(cx>SIZE){ if(ex.E) enter(p,ex.E,"E",old); else p.x=SIZE-HS; }
  else if(cx<0){ if(ex.W) enter(p,ex.W,"W",old); else p.x=0; }
  if(cy>SIZE){ if(ex.S) enter(p,ex.S,"S",old); else p.y=SIZE-HS; }
  else if(cy<0){ if(ex.N) enter(p,ex.N,"N",old); else p.y=0; }
}
function castle(w,p){
  const c=ROOMS[p.room].castle; if(!c) return;
  if(!overlap(pRect(p),c.gate)) return;
  if(c.name==="Gold"){
    if(p.carry==="chalice"){ w.won=true; w.winner="coop"; return; }
    p.room=c.interior; p.x=96; p.y=SIZE-BW-HS-4;
  } else {
    if(w.gates.black){ p.room=c.interior; p.x=96; p.y=SIZE-BW-HS-4; }
    else if(p.carry==="blackkey"){ w.gates.black=true; }
  }
}
function pickup(w,p,slot){
  // release the drop-lock once this hero has stepped off the item they just dropped
  if(p.dropLock){ const o=w.objects[p.dropLock];
    if(!o||o.carried||o.room!==p.room||!overlap(pRect(p),{x:o.x,y:o.y,w:OBJ,h:OBJ})) p.dropLock=null; }
  if(p.carry) return;
  for(const k in w.objects){ if(k===p.dropLock) continue; const o=w.objects[k]; if(o.carried||o.room!==p.room) continue;
    if(overlap(pRect(p),{x:o.x,y:o.y,w:OBJ,h:OBJ})){ p.carry=k; o.carried=true; o.by=slot; break; } }
}
function dropAt(w,p,slot){
  if(!p.carry) return;
  const k=p.carry; const o=w.objects[k]; o.carried=false; o.by=null; o.room=p.room;
  o.x=clamp(p.x,BW,SIZE-BW-OBJ); o.y=clamp(p.y,BW,SIZE-BW-OBJ); p.carry=null; p.dropLock=k;
}
export function coopDrop(w,slot){ const p=w.players[slot]; if(p&&p.alive) dropAt(w,p,slot); }

function nearestPlayer(w,room,x,y){
  let best=null,bd=1e9;
  for(const s in w.players){ const p=w.players[s]; if(!p.alive||p.room!==room) continue;
    const d=(p.x-x)*(p.x-x)+(p.y-y)*(p.y-y); if(d<bd){ bd=d; best={slot:s,p}; } }
  return best;
}
function dragonStep(w,d){
  if(!d.alive) return;
  const t=nearestPlayer(w,d.room,d.x+DS/2,d.y+DS/2); if(!t) return;
  const p=t.p, hx=p.x+HS/2, hy=p.y+HS/2, cx=d.x+DS/2, cy=d.y+DS/2;
  d.x=clamp(d.x+Math.sign(hx-cx)*DSPEED,0,SIZE-DS);
  d.y=clamp(d.y+Math.sign(hy-cy)*DSPEED,0,SIZE-DS);
  if(overlap({x:d.x,y:d.y,w:DS,h:DS},pRect(p))){
    if(p.carry==="sword"){ d.alive=false; }
    else if(p.alive){ p.alive=false; p.deadT=0; dropAt(w,p,t.slot); }
  }
}
export function coopTick(w, now){
  if(w.won) return w;
  for(const slot in w.players){
    const p=w.players[slot];
    if(p.alive){ moveHero(w,p); transition(p); castle(w,p); pickup(w,p,slot); }
    else { p.deadT+=TICK_MS; if(p.deadT>DEATH_MS){ p.alive=true; p.deadT=0; p.room="commons"; p.x=START_X[slot]||96; p.y=150; p.input=null; p.dropLock=null; } }
    if(w.won) break;
  }
  // carried objects ride with their holder
  for(const k in w.objects){ const o=w.objects[k]; if(o.carried&&o.by&&w.players[o.by]){ const h=w.players[o.by]; o.room=h.room; o.x=h.x; o.y=h.y; } }
  for(const d of w.dragons) dragonStep(w,d);
  return w;
}
export function snapshot(w){
  const players={}; for(const s in w.players){ const p=w.players[s]; players[s]={name:p.name,x:Math.round(p.x),y:Math.round(p.y),room:p.room,dir:p.dir,carry:p.carry,alive:p.alive}; }
  const objects={}; for(const k in w.objects){ const o=w.objects[k]; objects[k]={room:o.room,x:Math.round(o.x),y:Math.round(o.y),carried:o.carried,by:o.by}; }
  const dragons=w.dragons.map(d=>({id:d.id,color:d.color,room:d.room,x:Math.round(d.x),y:Math.round(d.y),alive:d.alive}));
  return {players,objects,dragons,gates:w.gates,won:w.won,winner:w.winner};
}

// ---------------------------------------------------------------------------
// Durable Object: one per co-op match. Standard (non-hibernation) WebSockets keep
// the DO resident so the in-memory world persists across the alarm-driven tick loop.
// ---------------------------------------------------------------------------
export class AdventureRoom {
  constructor(state, env){ this.state=state; this.env=env; this.world=newWorld(); this.sessions=new Map(); this.running=false; }

  async fetch(request){
    const url=new URL(request.url);
    const slot=url.searchParams.get("slot");
    if(!slot) return new Response("adventure-room", { status:200 });
    if((request.headers.get("Upgrade")||"").toLowerCase()!=="websocket") return new Response("expected websocket", { status:426 });
    const name=url.searchParams.get("name")||slot;
    const pair=new WebSocketPair();
    const client=pair[0], server=pair[1];
    server.accept();
    addPlayer(this.world, slot, name);
    const prev=this.sessions.get(slot); if(prev){ try{ prev.close(4000,"replaced"); }catch(_){} }
    this.sessions.set(slot, server);
    server.send(JSON.stringify({ type:"welcome", slot, rooms:ROOMS, consts:CONSTS, players:playerNames(this.world) }));
    server.addEventListener("message",(e)=>{ try{ const m=JSON.parse(e.data);
      if(m.type==="input") setInput(this.world, slot, m.dir);
      else if(m.type==="drop") coopDrop(this.world, slot);
    }catch(_){}} );
    const bye=()=>{ if(this.sessions.get(slot)===server) this.sessions.delete(slot); };
    server.addEventListener("close", bye);
    server.addEventListener("error", bye);
    this.ensureLoop();
    return new Response(null, { status:101, webSocket:client });
  }

  ensureLoop(){ if(!this.running){ this.running=true; this.state.storage.setAlarm(Date.now()+CONSTS.TICK_MS); } }

  async alarm(){
    coopTick(this.world, Date.now());
    const msg=JSON.stringify(Object.assign({ type:"state", t:Date.now() }, snapshot(this.world)));
    for(const [slot,ws] of this.sessions){ try{ ws.send(msg); }catch(_){ this.sessions.delete(slot); } }
    if(this.sessions.size>0 && !this.world.won){ this.state.storage.setAlarm(Date.now()+CONSTS.TICK_MS); }
    else { this.running=false; }
  }
}
