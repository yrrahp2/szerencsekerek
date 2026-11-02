// Szókavalkád 6.3: külön Socket.IO névtér és saját játékállapot.
// A meglévő Szerencsekerék és Csillagsakk eseményeit nem módosítja.
const {readFileSync,writeFileSync,renameSync}=require('fs');
const path=require('path');
module.exports=function installSzokavalkad(app, socketServer){
const io=socketServer.of('/szokavalkad');
const words=JSON.parse(readFileSync(path.join(__dirname,'szokavalkad-words.json')));
// Globális feladvány-előzmény, a szerver újraindítását is túléli, ha a tárhely megmarad.
const historyFile=path.join(__dirname,'szokavalkad-played-words.json');
let played=new Set();
try{const saved=JSON.parse(readFileSync(historyFile,'utf8'));if(Array.isArray(saved))played=new Set(saved.filter(x=>typeof x==='string'));}catch(e){if(e.code!=='ENOENT')console.warn('Előzmények nem olvashatók:',e.message)}
const savePlayed=()=>{try{const temp=path.join(__dirname,'szokavalkad-played-words.tmp');writeFileSync(temp,JSON.stringify([...played]));renameSync(temp,historyFile);}catch(e){console.error('Nem sikerült menteni a feladvány-előzményt:',e.message)}};
const rooms=new Map();
const roomNames=new Map();
const nameKey=s=>String(s||'').normalize('NFC').trim().toLocaleLowerCase('hu-HU').replace(/\s+/g,' ');
const clean=s=>String(s||'').trim().slice(0,32);const norm=s=>clean(s).normalize('NFC').toLocaleUpperCase('hu-HU').replace(/\s+/g,' ');
const shuffle=s=>{let a=[...s];for(let tries=0;tries<15;tries++){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(a.join('')!==s)return a.join(' ')}return a.reverse().join(' ')};
const view=r=>({roomName:r.roomName,host:r.host,players:[...r.players].map(([id,p])=>({id,name:p.name,score:p.score})),round:r.round?{category:r.round.category,letters:r.round.letters,ends:r.round.ends,remaining:r.round.remaining,active:r.round.active,answer:r.round.active?null:r.round.answer,winner:r.round.winner}:null,mode:r.mode,target:r.target,champion:r.champion,auto:r.auto,gameType:r.gameType||'free'});
const emit=r=>io.to(r.code).emit('state',view(r));
function finish(r,winner=null){if(!r.round?.active)return;clearTimeout(r.timer);r.round.remaining=winner?Math.max(0,Math.ceil((r.round.ends-Date.now())/1000)):0;r.round.active=false;r.round.winner=winner;if(winner){r.players.get(winner).score++;if(r.target&&r.players.get(winner).score>=r.target){r.champion=winner;}}emit(r);if(r.champion){io.to(r.code).emit('notice',`Bajnokság vége! A győztes: ${r.players.get(r.champion).name}, ${r.target} ponttal!`);}io.to(r.code).emit('notice',winner?`${r.players.get(winner).name} megfejtette! A helyes szó: ${r.round.answer}`:`Lejárt az idő! A helyes megfejtés: ${r.round.answer}`);if((r.auto||(r.gameType==='competition'&&r.target))&&r.players.size&&!r.champion){clearTimeout(r.nextTimer);r.nextTimer=setTimeout(()=>{if(rooms.get(r.code)===r&&(r.auto||(r.gameType==='competition'&&r.target))&&!r.round?.active&&!r.champion)startRound(r)},5000)}}
function startRound(r){if(!r||!r.players.size||r.round?.active||r.champion)return;clearTimeout(r.nextTimer);
if(!words.length){io.to(r.code).emit('notice','Nincsenek feladványok az adatbázisban.');return;}
let available=words.filter(w=>!played.has(w.word));
if(!available.length){played.clear();savePlayed();available=words;io.to(r.code).emit('notice','Az összes feladvány elfogyott, a gyűjtemény újraindul.');}
const w=available[Math.floor(Math.random()*available.length)];played.add(w.word);savePlayed();r.round={answer:norm(w.word),category:w.category,letters:shuffle(norm(w.word)),ends:Date.now()+120000,active:true,winner:null};r.timer=setTimeout(()=>finish(r),120000);emit(r);io.to(r.code).emit('notice',`Új feladvány! ${w.category}. Betűk: ${r.round.letters.split(' ').join(', ')}.`)}
io.on('connection',socket=>{
 socket.on('join',({name,code,roomName,auto=false},cb)=>{
  name=clean(name);roomName=clean(roomName);code='';
  if(!name)return cb({error:'Adj meg egy játékosnevet!'});
  if(socket.data.code)return cb({error:'Már szobában vagy.'});
  let r;
  if(roomName){const existingCode=roomNames.get(nameKey(roomName));if(existingCode)r=rooms.get(existingCode);}
  if(!r&&code)r=rooms.get(code);
  if(!r&&code)return cb({error:'Nincs ilyen szoba.'});
  if(!r){
   if(!roomName)return cb({error:'Adj meg egy szobanevet!'});
   do{code=Math.random().toString(36).slice(2,8).toUpperCase()}while(rooms.has(code));
   r={code,roomName,host:socket.id,players:new Map(),used:new Set(),round:null,timer:null,nextTimer:null,auto:false,gameType:'free',mode:'Szabad játék',target:0,champion:null};
   rooms.set(code,r);roomNames.set(nameKey(roomName),code);
  }
  if(r.players.size>=10)return cb({error:'A szoba megtelt. Maximum 10 játékos csatlakozhat.'});
  r.players.set(socket.id,{name,score:0});socket.data.code=r.code;socket.join(r.code);
  cb({ok:true,roomName:r.roomName});emit(r);
  io.to(r.code).emit('chat',{name:'Rendszer',text:`${name} csatlakozott.`});
 });
 socket.on('playstyle',(kind)=>{const r=rooms.get(socket.data.code);if(!r||!r.players.has(socket.id))return;if(!['free','auto','competition'].includes(kind))return;if(r.gameType===kind){socket.emit('notice','Ez a játékmód már aktív.');return;}clearTimeout(r.timer);clearTimeout(r.nextTimer);r.timer=null;r.nextTimer=null;r.gameType=kind;r.auto=kind==='auto';r.target=0;r.mode=kind==='auto'?'Automatikus játék':kind==='competition'?'Verseny – válasszatok célpontot':'Szabad játék';r.champion=null;r.round=null;r.players.forEach(p=>p.score=0);emit(r);io.to(r.code).emit('notice',r.mode+'. Játékmódváltás: minden játékos pontja nullázódott.');if(r.auto)startRound(r);});
 socket.on('mode',(target)=>{const r=rooms.get(socket.data.code);if(!r||r.gameType!=='competition'||r.round?.active)return;target=Number(target);if(![50,100,150].includes(target))return;clearTimeout(r.nextTimer);r.target=target;r.mode=target+' pontos bajnokság';r.champion=null;r.round=null;r.players.forEach(p=>p.score=0);emit(r);io.to(r.code).emit('notice',r.mode+' kezdődik. Mindenki nulláról indul.');startRound(r);});
 socket.on('start',()=>{const r=rooms.get(socket.data.code);if(!r||r.round?.active||r.champion)return;if(r.gameType==='competition'&&!r.target){socket.emit('notice','Előbb válasszatok 50, 100 vagy 150 pontos versenyt!');return;}startRound(r)});
 socket.on('guess',(guess)=>{const r=rooms.get(socket.data.code);if(!r?.round?.active||!r.players.has(socket.id))return;if(norm(guess)===r.round.answer)finish(r,socket.id);else {const name=r.players.get(socket.id).name;const text=clean(guess);if(text){io.to(r.code).emit('attempt',{name,text});socket.emit('notice','Helytelen megfejtés. Próbáld újra!');}}});
 socket.on('chat',(msg)=>{const r=rooms.get(socket.data.code);if(!r||!r.players.has(socket.id))return;const t=clean(msg).slice(0,250);if(t)io.to(r.code).emit('chat',{name:r.players.get(socket.id).name,text:t})});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.code);if(!r)return;r.players.delete(socket.id);if(r.players.size===0){clearTimeout(r.timer);clearTimeout(r.nextTimer);rooms.delete(r.code);roomNames.delete(nameKey(r.roomName));return}if(r.host===socket.id)r.host=r.players.keys().next().value;emit(r)})
});

};
