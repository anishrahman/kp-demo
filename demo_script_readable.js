
const IM = require("./extractedImages.json");
const st=document.createElement('style');st.textContent=Object.keys(IM).filter(k=>k.length==3).map(k=>'.i-'+k+',.i-'+k+' .inner{background-image:url('+IM[k]+')}').join('');document.head.appendChild(st);
const $=i=>document.getElementById(i);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MEM={};
function sget(k,def){try{const v=localStorage.getItem(k);if(v!==null)return JSON.parse(v)}catch(e){}return k in MEM?MEM[k]:def}
function sset(k,v){MEM[k]=v;try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const IG='your_instagram_id';
document.querySelectorAll('.igh').forEach(e=>e.textContent='@'+IG);
const KEYS=['crm','blk','kal','mar'],KN={crm:'Cream zari',blk:'Black colour bands',kal:'Kalamkari print',mar:'Maroon check'};
const DEF=[{id:'c-chettinad',n:'Chettinad Cotton',k:'mar',d:'Checks with gold zari borders',on:true},{id:'c-mangalagiri',n:'Mangalagiri',k:'blk',d:'Rich colour bands on black',on:true},{id:'c-kalamkari',n:'Kalamkari',k:'kal',d:'Hand-painted style motifs',on:true},{id:'c-mulmul',n:'Mulmul Cotton',k:'crm',d:'Light, soft and breezy',on:true}];
const okc=a=>Array.isArray(a)&&a.length<=24&&a.every(x=>x&&typeof x.id=='string'&&/^[\w-]{1,40}$/.test(x.id)&&typeof x.n=='string'&&typeof x.d=='string'&&KEYS.includes(x.k));
let C=sget('kp_cats',null);C=okc(C)?C.map(x=>({...x,on:!!x.on})):DEF.map(x=>({...x}));
let P=[];
function buildP(){P=[];C.forEach((c,i)=>['Classic','Festive','Everyday'].forEach((t,j)=>P.push({id:P.length,cid:c.id,n:c.n+' '+t,p:999+j*400+(i%4)*150,best:j==0})))}
const cOf=p=>C.find(c=>c.id==p.cid);
const VP=()=>P.filter(p=>{const c=cOf(p);return c&&c.on});
const DEFNM={crm:'Mulmul Cotton',blk:'Mangalagiri',kal:'Kalamkari',mar:'Chettinad Cotton'};
const capt=k=>{const c=C.find(x=>x.k==k&&x.on);return c?c.n:DEFNM[k]};
const card=p=>'<button class="t" onclick="prod('+p.id+')"><div class="sw i-'+cOf(p).k+'">'+(p.best?'<span class="badge">Bestseller</span>':'')+'</div><b>'+esc(p.n)+'</b><span class="price">&#8377;'+p.p+'</span></button>';
const ppl=s=>{const vc=C.filter(c=>c.on);if(!vc.length)return '';return [0,1,2,3].map(i=>'<div class="sw i-'+vc[(i+s)%vc.length].k+'" style="background-size:260%;background-position:'+['70% 20%','30% 15%','60% 55%','40% 35%'][i]+'"></div>').join('')};
function renderCats(){
 buildP();const vc=C.filter(c=>c.on);
 $('links').innerHTML=vc.map(c=>'<a href="#" onclick="return cat(\''+c.id+'\')">'+esc(c.n)+'</a>').join('')+'<a href="#" class="nw" onclick="return newc()">New Collection</a>';
 $('catgrid').innerHTML=vc.length?vc.map(c=>'<button class="t" onclick="cat(\''+c.id+'\')"><div class="sw i-'+c.k+'"></div><b>'+esc(c.n)+'</b><span>'+esc(c.d)+'</span></button>').join(''):'<p>No categories are visible yet. Add one from Admin.</p>';
 $('bs').innerHTML=VP().filter(p=>p.best).map(card).join('');
 $('cf').innerHTML=ppl(0);$('pr').innerHTML=ppl(2);
 document.querySelectorAll('.pc').forEach(e=>{const n=capt(e.dataset.k);e.textContent=n;const cv=e.parentNode.querySelector('canvas');if(cv)cv.setAttribute('aria-label',n+' saree')});
}
renderCats();
function view(v){['home','list','prod'].forEach(x=>$('v-'+x).classList.toggle('on',x==v));document.body.classList.toggle('pdv',v=='prod');$('links').classList.remove('open');scrollTo(0,0);return false}
function go(v,a){view(v);if(a)setTimeout(()=>jump(a),50);return false}
function jump(id){$(id).scrollIntoView();return false}
const NEW=[{k:'kal'},{k:'mar'},{k:'crm'},{k:'blk'},{k:'mar'},{k:'kal'}];
const LOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
function newc(){view('list');$('lt').textContent='New Collection';$('lc').textContent='New Collection';$('cfw').style.display='none';
 $('li').hidden=false;$('li').textContent='Fresh designs are on the way. The photos stay hidden until launch day. Tap Notify me and we will message you on WhatsApp.';
 $('lg').innerHTML=NEW.map((x,i)=>'<div class="t nwc"><div class="sw"><div class="bi i-'+x.k+'"></div><div class="lk">'+LOCK+'<span>Revealed at launch</span></div><span class="badge">Coming soon</span></div><b>New design '+(i+1)+'</b><span>Launching soon</span><br><button class="btn o sm" type="button" onclick="notify()">Notify me</button></div>').join('');return false}
function notify(){const c=sget('kp_customer',null);toast(c&&c.phone?'Done. We will message '+c.phone+' at launch.':'Please sign in with your name and mobile number first.')}
function cat(id){const c=C.find(x=>x.id==id);if(!c)return false;view('list');$('li').hidden=true;$('cfw').style.display='';$('lt').textContent=c.n+' Sarees';$('lc').textContent=c.n;$('lg').innerHTML=VP().filter(p=>p.cid==id).map(card).join('');return false}
function srch(q){q=q.trim().toLowerCase();if(!q)return;view('list');$('li').hidden=true;$('cfw').style.display='';$('lt').textContent='Results for "'+q+'"';$('lc').textContent='Search';$('lg').innerHTML=VP().filter(p=>p.n.toLowerCase().includes(q)).map(card).join('')||'<p>No sarees found. Try another name.</p>'}
let pcur;const V=['Front','Back','Side','Fabric','Video'];
function prod(id){pcur=P[id];if(!pcur)return;const c=cOf(pcur);view('prod');document.title=pcur.n+' | KP Clothing';$('pt').textContent=pcur.n;$('pp').textContent='₹'+pcur.p;$('pn').textContent=pcur.n;$('pc').textContent=c.n;$('pc').onclick=()=>cat(c.id);
$('th').innerHTML=V.map((v,i)=>'<button onclick="pic('+i+')" class="v'+(i>3?0:i)+' i-'+c.k+'"><div class="inner"></div><span>'+v+'</span></button>').join('');pic(0)}
function pic(i){const m=$('main');m.className='main v'+(i>3?0:i)+' i-'+cOf(pcur).k;m.innerHTML='<div class="inner"></div>'+(i==4?'<span class="vid">&#9654; Product video</span>':'');[...$('th').children].forEach((b,k)=>b.classList.toggle('on',k==i))}
let n=0;function add(){n++;$('cc').textContent=n;$('cc').parentNode.style.display='block';toast('Added to cart')}
function toast(t){const e=$('toast');e.textContent=t;e.style.display='block';clearTimeout(e.t);e.t=setTimeout(()=>e.style.display='none',1800)}
const HS=[{h:'Comfort meets <em>elegance</em>',s:'Handpicked cotton sarees for every you',im:['crm','blk','kal']},{h:'Handloom cotton, <em>real zari</em>',s:'Chettinad checks and gold borders',im:['mar','crm','blk']},{h:'Kalamkari <em>stories</em>',s:'Hand-painted style motifs on soft cotton',im:['kal','mar','crm']}];
$('hsl').innerHTML=HS.map((s,i)=>'<div class="hs'+(i?'':' on')+'"><div class="ht"><h1>'+s.h+'</h1><p>'+s.s+'</p><a class="btn" href="#cats" onclick="return jump(\'cats\')">Shop now &#8594;</a></div><div class="hi">'+s.im.map(k=>'<div class="ph"><canvas data-k="'+k+'" role="img" aria-label="'+esc(capt(k))+' saree"></canvas><span class="pc" data-k="'+k+'">'+esc(capt(k))+'</span></div>').join('')+'</div></div>').join('');
$('dts').innerHTML=HS.map((s,i)=>'<button onclick="hg('+i+')" aria-label="Slide '+(i+1)+'"></button>').join('');
let hi=0,ht;function hg(n){hi=(n+HS.length)%HS.length;[...$('hsl').children].forEach((e,k)=>e.classList.toggle('on',k==hi));[...$('dts').children].forEach((e,k)=>e.classList.toggle('on',k==hi));clearInterval(ht);if(!matchMedia('(prefers-reduced-motion:reduce)').matches)ht=setInterval(()=>hg(hi+1),5000)}
function hp(d){hg(hi+d)}hg(0);

const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,BW=480,SR={crm:{i:IM.crm,m:IM.crmm,a:10,l:6},blk:{i:IM.blk,m:IM.blkm,a:9,l:3},kal:{i:IM.kal,m:IM.kalm,a:10,l:6},mar:{i:IM.mar,m:IM.marm,a:9,l:3}},BASE={};
const ss=(a,b,x)=>{x=Math.max(0,Math.min(1,(x-a)/(b-a)));return x*x*(3-2*x)};
function draw(o,t){const{W,H,src,wt,px,s}=o,K=W/640,dst=o.out.data,gust=.65+.35*Math.sin(t*.5)+.15*Math.sin(t*1.3+1)+.12*Math.sin(t*4.1+2),ph=t*2.2,A=s.a,L=s.l;
for(let i=0;i<px.length;i++){const p=px[i],y=(p/W)|0,x=p-y*W,w=wt[p]*gust,xx=x/K,yy=y/K,f=y/H;
const dx=K*A*w*(Math.sin(yy*.0084-ph+xx*.01)+.5*Math.sin(yy*.0189-ph*1.6+xx*.02));
const dy=K*(-L*w*ss(.58,.94,f)*(.5+.5*Math.sin(xx*.02-ph*.9))+.25*A*w*Math.sin(xx*.015-ph*1.2+yy*.01));
let sx=x-dx,sy=y-dy;sx=sx<0?0:sx>W-1.01?W-1.01:sx;sy=sy<0?0:sy>H-1.01?H-1.01:sy;
const x0=sx|0,y0=sy|0,fx=sx-x0,fy=sy-y0,a=(y0*W+x0)*4,b=a+4,c=a+W*4,e=c+4,w1=(1-fx)*(1-fy),w2=fx*(1-fy),w3=(1-fx)*fy,w4=fx*fy,q=p*4;
dst[q]=src[a]*w1+src[b]*w2+src[c]*w3+src[e]*w4;dst[q+1]=src[a+1]*w1+src[b+1]*w2+src[c+1]*w3+src[e+1]*w4;dst[q+2]=src[a+2]*w1+src[b+2]*w2+src[c+2]*w3+src[e+2]*w4}
o.cg.putImageData(o.out,0,0)}

function loadBase(k){return BASE[k]||(BASE[k]=new Promise(res=>{const s=SR[k],a=new Image(),b=new Image();let c=0;a.onload=b.onload=()=>{if(++c<2)return;const W=BW,H=Math.round(BW*a.naturalHeight/a.naturalWidth),o=document.createElement('canvas');o.width=W;o.height=H;const g=o.getContext('2d');g.drawImage(a,0,0,W,H);const src=g.getImageData(0,0,W,H).data;g.clearRect(0,0,W,H);g.drawImage(b,0,0,W,H);const md=g.getImageData(0,0,W,H).data,wt=new Float32Array(W*H),px=[];for(let p=0;p<W*H;p++){const w=md[p*4]/255;wt[p]=w;if(w>.002)px.push(p)}res({W,H,src,wt,px,s})};a.src=s.i;b.src=s.m}))}
const PN=[];document.querySelectorAll('#hsl canvas').forEach((cv,n)=>loadBase(cv.dataset.k).then(b=>{cv.width=b.W;cv.height=b.H;const cg=cv.getContext('2d'),out=cg.createImageData(b.W,b.H);out.data.set(b.src);const inst={...b,out,cg};draw(inst,0);PN.push({inst,cv,n})}));
function frame(ms){const t=ms/1000*.75*(RM?.2:1);PN.forEach(p=>{if(p.cv.offsetParent)draw(p.inst,t+p.n*1.7)});requestAnimationFrame(frame)}requestAnimationFrame(frame);

/* ---------- login gate: name + mobile only ---------- */
function blk(on){['header','main','footer','.wa'].forEach(s=>{const e=document.querySelector(s);if(e)e.inert=on})}
function normPhone(v){let d=String(v).replace(/\D/g,'');if(d.length==12&&d.startsWith('91'))d=d.slice(2);else if(d.length==11&&d[0]=='0')d=d.slice(1);return /^[6-9]\d{9}$/.test(d)?d:''}
function setCust(){const c=sget('kp_customer',null),b=$('lgn');if(c&&c.name){b.title='Signed in as '+c.name;b.setAttribute('aria-label','Account: '+c.name)}else{b.title='Login';b.setAttribute('aria-label','Login')}}
let gedit=false;
function nameOk(v){return (String(v).match(/\p{L}/gu)||[]).length>=2}
function gchk(){const a=nameOk($('gn').value),p=normPhone($('gp').value);$('gb').disabled=!(a&&p);if(a)$('gne').textContent='';if(p)$('gpe').textContent=''}
function gerr(w){if(w=='n')$('gne').textContent=nameOk($('gn').value)?'':'Enter your name (at least 2 letters).';else $('gpe').textContent=normPhone($('gp').value)?'':'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.'}
function showGate(edit){gedit=!!edit;const c=sget('kp_customer',null);$('gn').value=edit&&c?c.name:'';$('gp').value=edit&&c?String(c.phone).replace('+91',''):'';$('gne').textContent='';$('gpe').textContent='';$('gout').hidden=!edit;$('gt').textContent=edit?'Your details':'Login';$('gs').textContent=edit?'Update your name or phone number':'Get access to your orders, new arrivals and offers';$('gb').textContent=edit?'Save':'Continue';gchk();$('gate').hidden=false;blk(true);document.documentElement.style.overflow='hidden';setTimeout(()=>$('gn').focus(),50)}
function hideGate(){$('gate').hidden=true;blk(false);document.documentElement.style.overflow='';setCust();if(location.hash=='#admin')openAdm()}
function gsave(e){e.preventDefault();const n=$('gn').value.trim(),d=normPhone($('gp').value);let bad=null;
 if(!nameOk(n)){gerr('n');bad=bad||$('gn')}else $('gne').textContent='';
 if(!d){gerr('p');bad=bad||$('gp')}else $('gpe').textContent='';
 if(bad){bad.focus();return false}
 const ph='+91'+d,day=new Date().toISOString().slice(0,10);let L=sget('kp_customers',[]);if(!Array.isArray(L))L=[];
 const ex=L.find(x=>x&&x.phone==ph);if(ex){ex.name=n}else L.unshift({name:n,phone:ph,at:day});
 sset('kp_customers',L);sset('kp_customer',{name:n,phone:ph});hideGate();toast('Welcome, '+n);return false}
function gout(){sset('kp_customer',null);showGate(false)}
function loginClick(){const c=sget('kp_customer',null);showGate(!!(c&&c.name))}
function initGate(){setCust();const c=sget('kp_customer',null);if(!(c&&c.name&&c.phone))showGate(false);else if(location.hash=='#admin')openAdm()}
document.addEventListener('keydown',e=>{if(e.key!='Escape')return;if(!$('revp').hidden)closeRev();else if(!$('gate').hidden)hideGate();else if(!$('adm').hidden)closeAdm()});

/* ---------- admin (demo): categories + customers ---------- */
function openAdm(){$('adm').hidden=false;blk(true);document.documentElement.style.overflow='hidden';atab('cat');setTimeout(()=>$('adm').querySelector('button').focus(),0)}
function closeAdm(){$('adm').hidden=true;blk(false);document.documentElement.style.overflow='';view('home')}
function atab(t){$('tb-cat').classList.toggle('on',t=='cat');$('tb-cus').classList.toggle('on',t=='cus');$('tb-cat').setAttribute('aria-pressed',t=='cat');$('tb-cus').setAttribute('aria-pressed',t=='cus');$('ap').innerHTML=t=='cat'?aCat():aCus()}
const kopts=sel=>KEYS.map(k=>'<option value="'+k+'"'+(k==sel?' selected':'')+'>'+KN[k]+'</option>').join('');
function aCat(){
 let h='<div class="note">Add, rename, hide or reorder categories here. The menu, "Shop by saree type" and the product pages update straight away. <b>Demo only:</b> saved in this browser. In your real project this saves to the Spring Boot database, behind the admin login.</div>';
 h+='<form class="af" onsubmit="return cadd(event)"><div><label class="fl" for="an">Category name</label><input id="an" type="text" maxlength="40" placeholder="e.g. Banarasi Cotton"></div><div><label class="fl" for="ad">Short description</label><input id="ad" type="text" maxlength="80" placeholder="One line under the name"></div><div><label class="fl" for="ak">Photo</label><select id="ak">'+kopts('crm')+'</select></div><button class="btn" type="submit">Add category</button></form>';
 h+=C.map((c,i)=>'<div class="crow"><div class="th2 i-'+c.k+'" id="th-'+c.id+'"></div><input type="text" maxlength="40" value="'+esc(c.n)+'" aria-label="Category name" onchange="cu(\''+c.id+'\',\'n\',this.value)"><input type="text" maxlength="80" value="'+esc(c.d)+'" aria-label="Short description" onchange="cu(\''+c.id+'\',\'d\',this.value)"><select aria-label="Photo" onchange="cu(\''+c.id+'\',\'k\',this.value)">'+kopts(c.k)+'</select><label class="sw2"><input type="checkbox"'+(c.on?' checked':'')+' onchange="cu(\''+c.id+'\',\'on\',this.checked)"> Show on site</label><div class="mini"><button type="button" aria-label="Move up" onclick="cmv(\''+c.id+'\',-1)"'+(i==0?' disabled':'')+'>&#9650;</button><button type="button" aria-label="Move down" onclick="cmv(\''+c.id+'\',1)"'+(i==C.length-1?' disabled':'')+'>&#9660;</button><button type="button" aria-label="Delete category" onclick="cdel(\''+c.id+'\',this)">&#10005;</button></div></div>').join('');
 if(!C.length)h+='<p>No categories yet. Add your first one above.</p>';
 return h+'<p><button class="btn o sm" type="button" onclick="crst(this)">Reset to the 4 default categories</button></p>'}
function csave(){sset('kp_cats',C);renderCats()}
function cu(id,f,v){const c=C.find(x=>x.id==id);if(!c)return;
 if(f=='n'){v=String(v).trim().slice(0,40);if(!v){toast('Category name cannot be empty.');atab('cat');return}}
 if(f=='d')v=String(v).trim().slice(0,80);
 if(f=='k'&&!KEYS.includes(v))return;
 c[f]=f=='on'?!!v:v;csave();if(f=='k'){const th=$('th-'+id);if(th)th.className='th2 i-'+v}}
function cmv(id,d){const i=C.findIndex(x=>x.id==id),j=i+d;if(i<0||j<0||j>=C.length)return;[C[i],C[j]]=[C[j],C[i]];csave();atab('cat')}
function cadd(e){e.preventDefault();const n=$('an').value.trim().slice(0,40),k=$('ak').value;
 if(!n){toast('Enter a category name.');$('an').focus();return false}
 if(C.some(c=>c.n.toLowerCase()==n.toLowerCase())){toast('That category already exists.');return false}
 if(C.length>=24){toast('The demo allows up to 24 categories.');return false}
 C.push({id:'c'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36),n,k:KEYS.includes(k)?k:'crm',d:$('ad').value.trim().slice(0,80)||'New collection',on:true});
 csave();atab('cat');toast('Added "'+n+'". It now shows on the site.');return false}
function arm(b,txt,fn){if(b.dataset.arm){fn();return}const o=b.textContent;b.dataset.arm='1';b.textContent=txt;setTimeout(()=>{if(b.isConnected){delete b.dataset.arm;b.textContent=o}},3000)}
function cdel(id,b){arm(b,'Sure?',()=>{C=C.filter(x=>x.id!=id);csave();atab('cat');toast('Category deleted.')})}
function crst(b){arm(b,'Reset everything? Tap again',()=>{C=DEF.map(x=>({...x}));csave();atab('cat');toast('Default categories restored.')})}
function aCus(){let L=sget('kp_customers',[]);if(!Array.isArray(L))L=[];L=L.filter(x=>x&&typeof x.name=='string'&&typeof x.phone=='string');
 let h='<div class="note">Everyone who enters a name and mobile number on the opening screen appears here. <b>Demo only:</b> this list is stored in this browser. In your real project it goes to the customers table through your existing /api/customers/register endpoint.</div>';
 h+='<p><b>'+L.length+'</b> customer'+(L.length==1?'':'s')+' <button class="btn o sm" type="button" style="margin-left:12px" onclick="cexp()"'+(L.length?'':' disabled')+'>Download CSV</button></p>';
 return h+(L.length?'<div style="overflow-x:auto"><table class="ct"><thead><tr><th>Name</th><th>Mobile</th><th>Joined</th></tr></thead><tbody>'+L.map(x=>'<tr><td>'+esc(x.name)+'</td><td>'+esc(x.phone)+'</td><td>'+esc(x.at||'')+'</td></tr>').join('')+'</tbody></table></div>':'<p>No customers yet.</p>')}
function cexp(){let L=sget('kp_customers',[]);if(!Array.isArray(L))L=[];
 const q=v=>{v=String(v==null?'':v);if(/^[=+\-@\t\r]/.test(v)&&!/^\+91\d{10}$/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 const rows=[['Name','Mobile','Joined']].concat(L.map(x=>[x.name,x.phone,x.at]));
 const b=new Blob(['﻿'+rows.map(r=>r.map(q).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'});
 const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='kp-customers.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}

/* ---------- customer review popup with confetti ---------- */
let rvFrom=null,cfRaf=0;
function openRev(){rvFrom=document.activeElement;$('revp').hidden=false;blk(true);document.documentElement.style.overflow='hidden';setTimeout(()=>$('revp').querySelector('.gx').focus(),50);confetti()}
function closeRev(){$('revp').hidden=true;blk(false);document.documentElement.style.overflow='';stopCf();if(rvFrom&&rvFrom.focus)rvFrom.focus()}
function stopCf(){cancelAnimationFrame(cfRaf);const cv=$('cf2');cv.hidden=true;cv.getContext('2d').clearRect(0,0,cv.width,cv.height)}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const cv=$('cf2'),g=cv.getContext('2d');cv.hidden=false;const W=cv.width=innerWidth,H=cv.height=innerHeight,cols=['#B8923A','#E8C766','#7A2E2E','#4A5240','#FFF8EC','#C9A227'];
 const ps=Array.from({length:120},()=>({x:Math.random()*W,y:-20-Math.random()*H*.6,w:6+Math.random()*7,h:9+Math.random()*9,vy:2.2+Math.random()*3.4,vx:-1.2+Math.random()*2.4,r:Math.random()*6.3,vr:-.2+Math.random()*.4,c:cols[(Math.random()*cols.length)|0]}));
 const t0=performance.now();cancelAnimationFrame(cfRaf);
 (function f(now){const el=now-t0;g.clearRect(0,0,W,H);let alive=0;
  ps.forEach(p=>{p.x+=p.vx+Math.sin(p.y*.02)*.6;p.y+=p.vy;p.r+=p.vr;if(p.y<H+20)alive++;g.save();g.translate(p.x,p.y);g.rotate(p.r);g.fillStyle=p.c;g.globalAlpha=Math.max(0,Math.min(1,(3600-el)/900));g.fillRect(-p.w/2,-p.h/2,p.w,p.h);g.restore()});
  if(el<3600&&alive)cfRaf=requestAnimationFrame(f);else stopCf()})(t0)}
