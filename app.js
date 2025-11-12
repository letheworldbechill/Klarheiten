// PWA
let deferredPrompt=null;
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js'));}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;document.getElementById('btn-install').style.display='inline-block';});
document.getElementById('btn-install').addEventListener('click',()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;}});

// Utils
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s), avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
function toast(m){const t=document.createElement('div');t.textContent=m;t.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:#111a;color:#fff;padding:10px 14px;border-radius:10px;backdrop-filter:blur(8px);z-index:9999;';document.body.appendChild(t);setTimeout(()=>t.remove(),1600);}

// Theme
if(localStorage.getItem('rp_theme')==='dark')document.body.classList.add('dark');
document.getElementById('btn-theme').addEventListener('click',()=>{document.body.classList.toggle('dark');localStorage.setItem('rp_theme',document.body.classList.contains('dark')?'dark':'light');});
document.getElementById('lang').addEventListener('change',e=>localStorage.setItem('rp_lang',e.target.value));

// Tabs
$$('.tabs button').forEach(b=>b.addEventListener('click',()=>{$$('.tabs button').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('main > section').forEach(s=>s.classList.remove('active'));$('#tab-'+b.dataset.tab).classList.add('active');}));

// Intro
const intro=$('#intro'); if(!localStorage.getItem('rp_intro')){intro.showModal();$('#intro-ok').addEventListener('click',()=>{intro.close();localStorage.setItem('rp_intro','1');});}

// Ort der Sicherheit
$('#btn-safety').addEventListener('click',()=>{const box=$('#safety-text');box.style.display='inline-block';setTimeout(()=>box.style.display='none',2600);});

// Wohnung
const rooms=[{k:'schl'},{k:'wohn'},{k:'kue'},{k:'bad'}];
rooms.forEach(r=>['boden','flaechen','atmo'].forEach(sub=>{const el=$(`#${r.k}-${sub}`),o=$(`#${r.k}-${sub}-o`);el.addEventListener('input',()=>{o.textContent=el.value;updateRoom(r.k);updateHome();});}));
function label10(v){if(v<=3)return'Überreizt – hier fließt Energie ab.';if(v<=6)return'Unruhig – Raum braucht Aufmerksamkeit.';if(v<=8)return'Im Gleichgewicht.';return'Stabil und nährend.';}
function rmean(k){return Math.round(avg([+$('#'+k+'-boden').value,+$('#'+k+'-flaechen').value,+$('#'+k+'-atmo').value]));}
function updateRoom(k){$('#'+k+'-note').textContent=label10(rmean(k));}
function updateHome(){const total=Math.round(avg(rooms.map(r=>rmean(r.k)))*10);const el=$('#home-result');let t=`Gesamt: ${total}% · `,c='#ffd166',tip='—';if(total>=80){t+='ruhig';c='#8ce0c0';tip='Genieße den Frieden – atme durch.';}else if(total>=50){t+='leicht unruhig';c='#fff3bf';tip='Ein Raum braucht dich heute – fühl hinein, welcher.';}else{t+='überfordert';c='#ffc9c9';tip='Fang bei einem Quadratmeter an.';}el.textContent=t;el.style.background=c;$('#home-tip').textContent=tip;}
rooms.forEach(r=>updateRoom(r.k)); updateHome();
$('#btn-home-save').addEventListener('click',()=>{const day=new Date().toISOString().slice(0,10);const data=JSON.parse(localStorage.getItem('hist_home')||'[]');const total=Math.round(avg(rooms.map(r=>rmean(r.k)))*10);const it=data.find(d=>d.date===day);if(it)it.total=total;else data.push({date:day,total});while(data.length>30)data.shift();localStorage.setItem('hist_home',JSON.stringify(data));toast('Gespeichert');});
$('#btn-home-repeat').addEventListener('click',()=>{rooms.forEach(r=>['boden','flaechen','atmo'].forEach(s=>{$(`#${r.k}-${s}`).value=5;$(`#${r.k}-${s}-o`).textContent='5';}));rooms.forEach(r=>updateRoom(r.k));updateHome();});
$('#rest-home').addEventListener('input',()=>$('#rest-home-note').textContent=restText($('#rest-home').value));$('#rest-home').dispatchEvent(new Event('input'));

// Scan
['s-boden','s-licht','s-luft','s-klang','s-ordnung'].forEach(id=>$('#'+id).addEventListener('input',scanUpdate));
function scanTotal(){return ['s-boden','s-licht','s-luft','s-klang','s-ordnung'].map(id=>+$('#'+id).value).reduce((a,b)=>a+b,0);}
function scanUpdate(){['boden','licht','luft','klang','ordnung'].forEach(n=>$('#s-'+n+'-o').textContent=$('#s-'+n).value);const total=scanTotal();const pct=Math.round(((total-5)/45)*100);const b=$('#scan-result');let t=`Neutral · ${pct}%`,c='#ffd166';if(pct>=70){t=`Ruhig · ${pct}%`;c='#8ce0c0';}else if(pct<=35){t=`Unruhig · ${pct}%`;c='#ffc9c9';}b.textContent=t;b.style.background=c;}
scanUpdate();
$('#btn-scan-save').addEventListener('click',()=>{const day=new Date().toISOString().slice(0,10);const data=JSON.parse(localStorage.getItem('hist_scan')||'[]');const total=scanTotal();const it=data.find(d=>d.date===day);if(it)it.total=total;else data.push({date:day,total});while(data.length>7)data.shift();localStorage.setItem('hist_scan',JSON.stringify(data));renderBars();toast('Gespeichert');});
$('#btn-scan-reset').addEventListener('click',()=>{['s-boden','s-licht','s-luft','s-klang','s-ordnung'].forEach(id=>$('#'+id).value=5);scanUpdate();});
function renderBars(){const wrap=$('#scan-bars');wrap.innerHTML='';(JSON.parse(localStorage.getItem('hist_scan')||'[]')).forEach(d=>{const h=Math.max(12,Math.round((d.total/50)*56));const div=document.createElement('div');div.className='bar';div.style.height=h+'px';div.innerHTML=`<small>${new Date(d.date).toLocaleDateString()}</small>`;wrap.appendChild(div);});}
renderBars();
$('#rest-scan').addEventListener('input',()=>$('#rest-scan-note').textContent=restText($('#rest-scan').value));$('#rest-scan').dispatchEvent(new Event('input'));

// Resonanz
$('#btn-reso-calc').addEventListener('click',()=>{const vals=Array.from($$('#reso-form input')).map(i=>+i.value);const mean=avg(vals);const pct=Math.round(((mean-1)/4)*100);let label='Reaktion',tip='Du fühlst – prüfe, ob du auch danach handelst.',c='#fff3bf';if(pct>=66){label='Resonanz';tip='Du bist verbunden und handlungsbewusst.';c='#8ce0c0';}else if(pct<=33){label='Eigenfilm';tip='Pause. Beobachte dich, bevor du reagierst.';c='#ffc9c9';}$('#reso-result').textContent=`${label} · ${pct}%`;$('#reso-result').style.background=c;$('#reso-tip').textContent=tip;localStorage.setItem('last_reso',JSON.stringify({pct,ts:Date.now()}));});
$('#btn-reso-reset').addEventListener('click',()=>{$$('#reso-form input').forEach(i=>i.value=3);$('#reso-result').textContent='–';$('#reso-result').style.background='';$('#reso-tip').textContent='';});
$('#rest-reso').addEventListener('input',()=>$('#rest-reso-note').textContent=restText($('#rest-reso').value));$('#rest-reso').dispatchEvent(new Event('input'));

// Bindung
function ynInit(){ $$('#bind-yn .yn').forEach(row=>{ row.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>{ row.querySelectorAll('button').forEach(b=>b.classList.remove('active','y','n')); btn.classList.add('active', btn.textContent==='Ja'?'y':'n'); })); }); }
ynInit();
function loveCalc(){const vals=Array.from($$('#love-form input')).map(i=>+i.value);const m=avg(vals);let t='Gemischt',c='#fff3bf';if(m<=2.4){t='Natürlich';c='#8ce0c0';}else if(m>=3.8){t='Überwältigend';c='#ffc9c9';}$('#love-result').textContent=t;$('#love-result').style.background=c;}
Array.from($$('#love-form input')).forEach(i=>i.addEventListener('input',loveCalc));loveCalc();
$('#btn-bind-calc').addEventListener('click',()=>{const vals=Array.from($$('#bind-form input')).map(i=>+i.value);const mean=avg(vals);const ynNo=$$('#bind-yn button.active.n').length;let score=Math.max(0,Math.min(100,Math.round((mean-1)*25)))-ynNo*5;if(score<0)score=0;let label='Muster prüfen',tip='Emotionale Unstimmigkeit, wach bleiben.',c='#fff3bf';if(score>=75){label='Klar & tragfähig';tip='Vertrauen verdient, Basis für Entwicklung.';c='#8ce0c0';}else if(score<25){label='Selbstschutz aktivieren';tip='Gefahr für Selbstwert oder Sicherheit.';c='#ffc9c9';}else if(score<50){label='Innere Alarmzone';tip='Manipulative Dynamik möglich.';c='#ffe0b3';}$('#bind-result').textContent=`${label} (${score}%)`;$('#bind-result').style.background=c;$('#bind-tip').textContent=tip;localStorage.setItem('last_bind',JSON.stringify({score,ts:Date.now(),note:$('#bind-note').value}));});
$('#btn-bind-reset').addEventListener('click',()=>{$$('#bind-form input').forEach(i=>i.value=3);$$('#bind-yn button').forEach(b=>b.classList.remove('active','y','n'));$('#bind-note').value='';$('#bind-result').textContent='–';$('#bind-result').style.background='';$('#bind-tip').textContent='';});
$('#rest-bind').addEventListener('input',()=>$('#rest-bind-note').textContent=restText($('#rest-bind').value));$('#rest-bind').dispatchEvent(new Event('input'));

// Selbst
$('#btn-self-calc').addEventListener('click',()=>{const vals=Array.from($$('#self-form input')).map(i=>+i.value);const m=avg(vals);let l='Helfer‑Modus',tip='Achte, wo Hilfe zu Druck wird.',c='#fff3bf';if(m<=2){l='Klarer Fokus';tip='Du respektierst Grenzen, deine und fremde.';c='#8ce0c0';}else if(m>3.5){l='Rettungs‑Modus';tip='Du trägst Verantwortung, die nicht deine ist.';c='#ffc9c9';}$('#self-result').textContent=`${l} (${m.toFixed(1)})`;$('#self-result').style.background=c;$('#self-tip').textContent=tip;localStorage.setItem('last_self',JSON.stringify({m,ts:Date.now()}));});
$('#btn-self-reset').addEventListener('click',()=>{$$('#self-form input').forEach(i=>i.value=3);$('#self-result').textContent='–';$('#self-result').style.background='';$('#self-tip').textContent='';});
$('#rest-self').addEventListener('input',()=>$('#rest-self-note').textContent=restText($('#rest-self').value));$('#rest-self').dispatchEvent(new Event('input'));

// Reset 4-7-8
let breathTimer=null;
$('#breath-start').addEventListener('click',()=>{if(breathTimer){clearInterval(breathTimer);breathTimer=null;}const circle=$('#breath-circle'),phase=$('#breath-phase');const seq=[{t:4,txt:'Einatmen'},{t:7,txt:'Halten'},{t:8,txt:'Ausatmen'}];let i=0,left=seq[0].t;phase.textContent='Einatmen';circle.style.transform='scale(1.2)';breathTimer=setInterval(()=>{left--;if(left<=0){i=(i+1)%seq.length;phase.textContent=seq[i].txt;left=seq[i].t;circle.style.transform=(seq[i].txt==='Einatmen')?'scale(1.2)':'scale(1)';}},1000);});

// Archiv
function renderArch(){const ul=$('#arch-list');ul.innerHTML='';const it=JSON.parse(localStorage.getItem('archive')||'[]');it.forEach((t,idx)=>{const li=document.createElement('li');li.textContent=t;li.className='card-min';li.addEventListener('click',()=>{if(confirm('Eintrag löschen?')){it.splice(idx,1);localStorage.setItem('archive',JSON.stringify(it));renderArch();}});ul.appendChild(li);});}
$('#arch-add').addEventListener('click',()=>{const v=$('#arch-input').value.trim();if(!v)return;const it=JSON.parse(localStorage.getItem('archive')||'[]');it.push(new Date().toLocaleString()+': '+v);localStorage.setItem('archive',JSON.stringify(it));$('#arch-input').value='';renderArch();});
$('#arch-clear').addEventListener('click',()=>{if(confirm('Archiv wirklich leeren?')){localStorage.removeItem('archive');renderArch();}});
renderArch();

function restText(v){v=+v;if(v<=3)return'Klar. Körper beruhigt.';if(v<=6)return'Leichte Nachwirkung – sanft weiter.';return'Stark geladen – entscheide später.';}
