/* Xếp nhóm (grp) — sort words by the character / character part they share.
   One engine, five themed looks: windows (U3), carts (U5), shelf (U6), pens (U9), hoops (U10).
   Used by the Lingo Cub station pages (replaces "Nhìn hình chọn pinyin" in Lesson 2) and by the CES demo. */
(function(){
'use strict';

var CFG = {
  '3-2': { theme:'windows', name:'Xếp nhóm: 早 · 午 · 晚', win:'Cả ngày đã vào đúng ô cửa!',
    intro:'Mỗi ô cửa sổ có một chữ. Chạm một thẻ, rồi chạm ô cửa sổ có chữ đó nhé!',
    cheer:'Con nhìn ra 早, 午, 晚 rất giỏi!',
    bins:[ {k:'早',sub:'buổi sáng',sky:'dawn'}, {k:'午',sub:'buổi trưa',sky:'noon'}, {k:'晚',sub:'buổi tối',sky:'night'}, {k:'*'} ],
    words:[ ['早上','zǎoshang','早'],['吃早饭','chī zǎofàn','早'],['中午','zhōngwǔ','午'],['吃午饭','chī wǔfàn','午'],
            ['晚上','wǎnshang','晚'],['吃晚饭','chī wǎnfàn','晚'],['起床','qǐchuáng','*'],['睡觉','shuìjiào','*'],['洗脸','xǐliǎn','*'],['去上学','qù shàngxué','*'] ] },
  '5-2': { theme:'carts', name:'Xếp nhóm: 园 · 店', win:'Xe đẩy đầy ắp rồi!',
    intro:'Mỗi xe đẩy có một chữ. Chạm một thẻ, rồi bỏ vào xe đẩy có chữ đó nhé!',
    cheer:'Con nhận ra 园 và 店 rất nhanh!',
    bins:[ {k:'园',sub:'nơi có cây, có thú'}, {k:'店',sub:'nơi bán hàng, nấu ăn'}, {k:'*'} ],
    words:[ ['公园','gōngyuán','园'],['动物园','dòngwùyuán','园'],['商店','shāngdiàn','店'],['饭店','fàndiàn','店'],
            ['家','jiā','*'],['学校','xuéxiào','*'],['回家','huíjiā','*'],['去上学','qù shàngxué','*'] ] },
  '6-2': { theme:'shelf', name:'Xếp nhóm: 师 · 医', win:'Giá sách gọn gàng rồi!',
    intro:'Mỗi ngăn giá sách có một chữ. Chạm một cuốn sách, rồi xếp lên ngăn có chữ đó nhé!',
    cheer:'Con nhớ 师 và 医 rất giỏi!',
    bins:[ {k:'师',sub:'người làm nghề giỏi'}, {k:'医',sub:'chữa bệnh'}, {k:'*'} ],
    words:[ ['老师','lǎoshī','师'],['厨师','chúshī','师'],['医生','yīshēng','医'],['牙医','yáyī','医'],
            ['司机','sījī','*'],['员工','yuángōng','*'],['学生','xuésheng','*'] ] },
  '9-2': { theme:'pens', name:'Xếp nhóm: 犭 · 鸟', win:'Các bạn thú đã về chuồng!',
    intro:'Mỗi chuồng có một phần chữ. Chạm một bạn thú, rồi lùa vào chuồng có phần chữ đó nhé!',
    cheer:'Con nhìn ra 犭 và 鸟 trong chữ rất giỏi!',
    bins:[ {k:'犭',sub:'thú có lông',where:'bên trái'}, {k:'鸟',sub:'loài có cánh',where:'bên phải'}, {k:'*'} ],
    words:[ ['猪','zhū','犭','猪'],['猴子','hóuzi','犭','猴'],['鸡','jī','鸟','鸡'],['鸭子','yāzi','鸟','鸭'],
            ['牛','niú','*'],['羊','yáng','*'],['马','mǎ','*'],['老虎','lǎohǔ','*'],['大象','dàxiàng','*'] ] },
  '10-2': { theme:'hoops', name:'Xếp nhóm: 艹 · 氵', win:'Bóng nào cũng vào rổ!',
    intro:'Mỗi rổ có một phần chữ. Chạm một quả bóng, rồi ném vào rổ có phần chữ đó nhé!',
    cheer:'Con nhìn ra 艹 và 氵 rất giỏi!',
    bins:[ {k:'艹',sub:'cây cỏ',where:'trên đầu'}, {k:'氵',sub:'có nước',where:'bên trái'}, {k:'*'} ],
    words:[ ['花','huā','艹','花'],['草','cǎo','艹','草'],['河','hé','氵','河'],['洗脸','xǐliǎn','氵','洗',' Rửa mặt cần nước!'],['漂亮','piàoliang','氵','漂'],
            ['树','shù','*'],['山','shān','*'],['石头','shítou','*'],['太阳','tàiyáng','*'],['月亮','yuèliang','*'] ] }
};

var THEME = {
  windows:{ verb:'vào ô cửa sổ', tray:'Chạm một thẻ, rồi chạm ô cửa sổ của nó', other:'Cửa bí ẩn', fly:'straight' },
  carts:  { verb:'vào xe đẩy',   tray:'Chạm một thẻ, rồi chạm xe đẩy của nó',   other:'Xe đẩy Khác', fly:'drop' },
  shelf:  { verb:'lên ngăn',     tray:'Chạm một cuốn sách, rồi chạm ngăn của nó', other:'Ngăn Khác', fly:'slide' },
  pens:   { verb:'vào chuồng',   tray:'Chạm một bạn thú, rồi chạm chuồng của nó', other:'Chuồng Khác', fly:'hop' },
  hoops:  { verb:'vào rổ',       tray:'Chạm một quả bóng, rồi chạm rổ của nó',  other:'Rổ Khác', fly:'arc' }
};

var SPK='<svg viewBox="0 0 16 16" width="18" height="18" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 6h3v4H1zM4 5h2v6H4zM6 4h2v8H6zM8 3h1v10H8zM11 5h1v6h-1zM13 3h1v10h-1z"/></svg>';

var CSS = [
'.grp{--g-ink:var(--ink,#0e1526);--g-hi:var(--sun,var(--yel,#ffcd3c));--g-paper:var(--paper,#fff);--g-cream:var(--cream,#fff6e0);--g-red:var(--red,#c8322b);--g-ok:var(--ok,#e5f4dc);--g-okd:var(--ok-d,#2e7d32);--g-mute:var(--mute,#4a5068);display:flex;flex-direction:column;gap:14px;color:var(--g-ink)}',
'.grp .zh,#ap-grp .how .zh{font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;font-weight:700}',
'.grp-top{display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--g-paper);border:4px solid var(--g-ink)}',
'.grp-msg{margin:0;flex:1;min-width:0;font-weight:700;font-size:clamp(14px,2.2vw,17px);line-height:1.4}',
'.grp-msg.good{color:var(--g-okd)}.grp-msg.bad{color:var(--g-red)}',
'.grp-count{flex:none;padding:4px 8px;background:var(--g-ink);color:var(--g-hi);font-weight:800;font-size:13px;font-variant-numeric:tabular-nums}',
'.grp-bins{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:14px}',
'.grp-bins.n3{grid-template-columns:repeat(auto-fit,minmax(min(96px,100%),1fr));gap:10px}',
'.grp-bin{position:relative;display:flex;flex-direction:column;gap:8px;min-height:170px;padding:12px;border:4px solid var(--g-ink);background:var(--g-cream);color:var(--g-ink);font:inherit;text-align:left;cursor:pointer}',
'.grp-bin:focus-visible,.grp-card:focus-visible{outline:4px solid var(--g-hi);outline-offset:3px}',
'.grp-bin.ready{box-shadow:0 0 0 4px var(--g-hi)}',
'.grp-lab{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}',
'.grp-lab b{font-size:clamp(30px,5vw,40px);line-height:1}',
'.grp-lab small{font-size:13px;font-weight:700;color:var(--g-mute)}',
'.grp-pile{flex:1;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6px;min-height:52px}',
'.grp-chip{display:inline-flex;flex-direction:column;align-items:center;padding:4px 8px;background:var(--g-paper);border:3px solid var(--g-ink);line-height:1.15}',
'.grp-chip b{font-size:20px}.grp-chip small{font-size:11px;font-weight:700;color:var(--g-mute)}',
'.grp-chip .hl,.grp-card .hl{color:var(--g-red)}',
'.grp-trayh{margin:0;font-weight:800;font-size:15px}',
'.grp-tray{display:flex;flex-wrap:wrap;gap:12px;min-height:76px}',
'.grp-card{display:inline-flex;align-items:stretch;border:4px solid var(--g-ink);background:var(--g-paper);box-shadow:4px 4px 0 var(--g-ink);cursor:pointer;user-select:none}',
'.grp-card .zh{display:flex;align-items:center;padding:8px 16px;font-size:clamp(26px,4.4vw,36px);line-height:1.1}',
'.grp-card .grp-say{display:grid;place-items:center;width:48px;border:0;border-left:4px solid var(--g-ink);background:var(--g-hi);color:var(--g-ink);cursor:pointer}',
'.grp-card[aria-pressed="true"]{background:var(--g-hi);transform:translate(2px,2px);box-shadow:2px 2px 0 var(--g-ink)}',
'.grp-card.shake,.grp-bin.shake{animation:grpShake .4s}',
'@keyframes grpShake{20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}',
'.grp-bin.hit{animation:grpHit .5s}',
'@keyframes grpHit{40%{transform:scale(1.04)}}',
'.grp-fly{position:fixed;z-index:95;margin:0;pointer-events:none}',
'.grp-q{display:grid;place-items:center;width:44px;height:44px;background:var(--g-hi);border:3px solid var(--g-ink);font-weight:800;font-size:26px}',
/* windows */
'.t-windows .grp-bin{background:#6b4a2b;border-color:var(--g-ink);padding:10px}',
'.t-windows .grp-lab{padding:4px 8px;background:var(--g-cream);border:3px solid var(--g-ink)}',
'.t-windows .grp-glass{position:relative;flex:1;display:flex;flex-direction:column;border:4px solid var(--g-ink);overflow:hidden;min-height:110px}',
'.t-windows .grp-glass::before{content:"";position:absolute;left:50%;top:0;bottom:0;width:4px;margin-left:-2px;background:var(--g-ink);opacity:.35}',
'.t-windows .grp-glass .grp-pile{position:relative;z-index:1;padding:8px}',
'.t-windows .sky-dawn{background:linear-gradient(#ffb38a,#ffe39a)}.t-windows .sky-noon{background:linear-gradient(#5fb8ff,#bfe6ff)}.t-windows .sky-night{background:linear-gradient(#1f2a44,#3a4a78)}.t-windows .sky-other{background:repeating-linear-gradient(90deg,#a8743f 0 18px,#94622f 18px 22px)}',
'.t-windows .orb{position:absolute;border-radius:50%}',
'.t-windows .sky-dawn .orb{width:34px;height:34px;left:12px;bottom:-10px;background:#ff7a3c}',
'.t-windows .sky-noon .orb{width:30px;height:30px;right:12px;top:10px;background:#ffd23f;box-shadow:0 0 0 6px rgba(255,210,63,.35)}',
'.t-windows .sky-night .orb{width:24px;height:24px;right:14px;top:10px;background:#fff6c8;box-shadow:-7px 3px 0 0 #1f2a44 inset}',
'.t-windows .sky-night::after{content:"";position:absolute;left:18px;top:16px;width:3px;height:3px;background:#fff;box-shadow:30px 22px #fff,60px 6px #fff,12px 46px #fff}',
'.t-windows .grp-bin.hit .grp-glass{box-shadow:inset 0 0 0 6px var(--g-hi)}',
/* carts */
'.t-carts .grp-bin{background:var(--g-cream);padding-bottom:34px}',
'.t-carts .grp-basket{flex:1;display:flex;border:4px solid var(--g-ink);border-top-width:6px;background:repeating-linear-gradient(90deg,transparent 0 14px,rgba(14,21,38,.14) 14px 17px),#dff0ff;clip-path:polygon(0 0,100% 0,92% 100%,8% 100%);padding:6px 14px 10px}',
'.t-carts .grp-bin::before,.t-carts .grp-bin::after{content:"";position:absolute;bottom:8px;width:18px;height:18px;border-radius:50%;background:var(--g-ink);box-shadow:inset 0 0 0 5px #8a8f9e}',
'.t-carts .grp-bin::before{left:24%}.t-carts .grp-bin::after{right:24%}',
'.t-carts .grp-handle{position:absolute;right:-4px;top:58px;width:22px;height:6px;background:var(--g-ink)}',
'.t-carts .grp-bin.hit{animation:grpRoll .6s}',
'@keyframes grpRoll{30%{transform:translateX(8px) rotate(1deg)}65%{transform:translateX(-5px)}}',
'.t-carts .grp-card{border-radius:0;background:#fff}',
'.t-carts .grp-card .zh{border-right:4px dashed rgba(14,21,38,.25)}',
/* shelf */
'.t-shelf .grp-bins{grid-template-columns:1fr;gap:0;border:6px solid #5a3a1f;background:#7a4f2a;padding:8px 8px 0}',
'.t-shelf .grp-bin{flex-direction:row;align-items:flex-end;min-height:118px;border:0;border-bottom:12px solid #3e2713;background:#a26b3a;margin-bottom:8px;padding:10px 12px 0}',
'.t-shelf .grp-lab{flex:none;flex-direction:column;align-items:flex-start;gap:2px;align-self:center;width:150px;padding:6px 10px;background:var(--g-cream);border:3px solid var(--g-ink)}',
'.t-shelf .grp-pile{align-items:flex-end;align-content:flex-end;min-height:96px;gap:4px}',
'.t-shelf .grp-chip{writing-mode:vertical-rl;padding:8px 4px;min-height:90px;justify-content:center;border-width:3px;border-bottom:0}',
'.t-shelf .grp-chip small{writing-mode:horizontal-tb;display:none}',
'.t-shelf .grp-chip:nth-child(3n+1){background:#ffe08a}.t-shelf .grp-chip:nth-child(3n+2){background:#bfe6ff}.t-shelf .grp-chip:nth-child(3n){background:#ffc2b8}',
'.t-shelf .grp-card{border-left-width:14px}',
'.t-shelf .grp-card:nth-child(3n+1){border-left-color:#e0a800}.t-shelf .grp-card:nth-child(3n+2){border-left-color:#2e95c2}.t-shelf .grp-card:nth-child(3n){border-left-color:#c8322b}',
'@media (max-width:520px){.t-shelf .grp-lab{width:104px}.t-shelf .grp-lab b{font-size:28px}}',
/* pens */
'.t-pens .grp-bin{background:linear-gradient(#8fd3ff 0 26%,#6cc04a 26%);border-width:4px;padding-top:6px}',
'.t-pens .grp-lab{align-self:flex-start;padding:4px 10px;background:#c98b4f;border:3px solid var(--g-ink);color:#fff6e0}',
'.t-pens .grp-lab small{color:#fff6e0}',
'.t-pens .grp-fence{flex:1;display:flex;border:4px solid #6b4a2b;border-top:0;background:repeating-linear-gradient(90deg,transparent 0 22px,rgba(107,74,43,.5) 22px 26px) top/100% 18px no-repeat;padding:24px 6px 6px}',
'.t-pens .grp-card{border-radius:0;background:#fff6e0;border-color:#6b4a2b;box-shadow:4px 4px 0 #6b4a2b}',
'.t-pens .grp-card .grp-say{border-left-color:#6b4a2b}',
'.t-pens .grp-bin.hit{animation:grpHop .5s}',
'@keyframes grpHop{30%{transform:translateY(-6px)}60%{transform:translateY(0)}80%{transform:translateY(-3px)}}',
/* hoops */
'.t-hoops .grp-bin{align-items:center;background:linear-gradient(var(--g-cream) 0 70%,#d9c19a 70%);padding-top:10px}',
'.t-hoops .grp-board{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 14px;background:#fff;border:4px solid var(--g-ink);min-width:70%}',
'.t-hoops .grp-board small{font-size:12px;font-weight:700;color:var(--g-mute)}',
'.t-hoops .grp-board b{font-size:clamp(30px,5vw,40px);line-height:1}',
'.t-hoops .grp-rim{width:62%;height:8px;background:#e8622c;border:3px solid var(--g-ink);margin-top:-2px}',
'.t-hoops .grp-net{width:52%;height:34px;background:repeating-linear-gradient(45deg,transparent 0 6px,#fff 6px 8px),repeating-linear-gradient(-45deg,transparent 0 6px,#fff 6px 8px);clip-path:polygon(0 0,100% 0,82% 100%,18% 100%);opacity:.95}',
'.t-hoops .grp-pile{justify-content:center;width:100%}',
'.t-hoops .grp-chip{border-radius:999px;background:#ff9b4a;padding:4px 10px}',
'.t-hoops .grp-card{border-radius:999px;background:#ff9b4a;overflow:hidden;box-shadow:4px 4px 0 var(--g-ink)}',
'.t-hoops .grp-card .zh{padding:10px 18px 10px 22px;background:radial-gradient(circle at 30% 30%,#ffc08a,#ff8a2c 70%)}',
'.t-hoops .grp-card .grp-say{border-left-color:var(--g-ink)}',
'.t-hoops .grp-bin.hit .grp-net{animation:grpNet .5s}',
'@keyframes grpNet{40%{transform:scaleY(1.35)}}',
'@media (prefers-reduced-motion:reduce){.grp *{animation:none!important}}',
/* celebration (CES demo) */
'.grp-spark{position:absolute;width:8px;height:8px;z-index:40;pointer-events:none;animation:grpSpark 1.1s ease-out forwards}',
'@keyframes grpSpark{to{transform:translate(var(--dx),var(--dy)) scale(.4);opacity:0}}'
].join('\n');

function injectCSS(){ if(document.getElementById('grpCss')) return;
  var f=document.createElement('link'); f.rel='stylesheet'; f.href='https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700&text='+encodeURIComponent('犭艹氵鸟')+'&display=swap'; document.head.appendChild(f);
  var s=document.createElement('style'); s.id='grpCss'; s.textContent=CSS; document.head.appendChild(s); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function cj(s){ return esc(s).replace(/([\u2E80-\u9FFF\uF900-\uFAFF]+)/g,'<span class="zh">$1</span>'); }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function reduce(){ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function isPart(b){ return !!b.where; }

function zhHTML(w,hl){ var key=hl; return w.zh.split('').map(function(c){ return '<span'+(key&&c===key?' class="hl"':'')+'>'+esc(c)+'</span>'; }).join(''); }

function binHTML(b,theme,keys){
  var other=b.k==='*', lab=other?'<span class="grp-q" aria-hidden="true">?</span><b>Khác</b>':'<b class="zh">'+esc(b.k)+'</b>';
  var sub=other?'Không có '+keys.join(', '):(isPart(b)?'Có '+b.k+' '+b.where+' · '+b.sub:'Có chữ '+b.k+' · '+b.sub);
  var labH='<span class="grp-lab">'+lab+'<small>'+cj(sub)+'</small></span>', pile='<span class="grp-pile"></span>';
  var aria=other?'Nhóm Khác: '+sub:'Nhóm '+b.k+': '+sub;
  var inner;
  if(theme==='windows') inner=labH+'<span class="grp-glass sky-'+(other?'other':b.sky)+'"><i class="orb"></i>'+pile+'</span>';
  else if(theme==='carts') inner=labH+'<span class="grp-basket">'+pile+'</span><i class="grp-handle"></i>';
  else if(theme==='pens') inner=labH+'<span class="grp-fence">'+pile+'</span>';
  else if(theme==='hoops') inner='<span class="grp-board">'+(other?'<b>?</b><small>Khác · '+cj(sub)+'</small>':'<b class="zh">'+esc(b.k)+'</b><small>'+cj(sub)+'</small>')+'</span><i class="grp-rim"></i><i class="grp-net"></i>'+pile;
  else inner=labH+pile;
  return '<button type="button" class="grp-bin" data-k="'+esc(b.k)+'" aria-label="'+esc(aria)+'">'+inner+'</button>';
}

function path(kind,dx,dy){
  function T(x,y,s,r){ return {transform:'translate('+x+'px,'+y+'px) scale('+s+') rotate('+(r||0)+'deg)'}; }
  var o=[T(0,0,1)];
  if(kind==='drop'){ o.push(Object.assign(T(dx,dy-150,.85),{offset:.6})); o.push(T(dx,dy,.45)); }
  else if(kind==='slide'){ o.push(Object.assign(T(dx*.5,dy*.5-40,.8,-8),{offset:.5})); o.push(T(dx,dy,.5,0)); }
  else if(kind==='hop'){ [.33,.66,1].forEach(function(t,i){ var px=(t-.165)*dx, py=(t-.165)*dy; o.push(Object.assign(T(px,py-70+i*10,.85-i*.1),{offset:t-.165})); o.push(Object.assign(T(dx*t,dy*t,.8-i*.12),{offset:t})); }); }
  else if(kind==='arc'){ var top=Math.min(dy,0)-170; o.push(Object.assign(T(dx*.5,top,.85,300),{offset:.5})); o.push(Object.assign(T(dx,dy-30,.6,520),{offset:.85})); o.push(T(dx,dy,.5,600)); }
  else o.push(T(dx,dy,.5));
  return o;
}
function fly(from,to,kind,done){
  if(reduce()||!from.animate){ done(); return; }
  var a=from.getBoundingClientRect(), b=to.getBoundingClientRect();
  var c=from.cloneNode(true); c.classList.add('grp-fly'); c.removeAttribute('id');
  c.style.left=a.left+'px'; c.style.top=a.top+'px'; c.style.width=a.width+'px'; c.style.height=a.height+'px';
  (from.closest('.grp')||document.body).appendChild(c);
  var dx=b.left+b.width/2-(a.left+a.width/2), dy=b.top+Math.min(b.height,60)/2-(a.top+a.height/2);
  var an=c.animate(path(kind,dx,dy),{duration:kind==='hop'||kind==='arc'?900:650,easing:'ease-in-out',fill:'forwards'});
  from.style.visibility='hidden';
  an.onfinish=function(){ c.remove(); done(); };
}

/* host: element to fill; cfg: one CFG entry; ad: {say(zh), ding(), buzz(), done(N)} */
function mount(host,cfg,ad){
  injectCSS();
  var th=THEME[cfg.theme], keys=cfg.bins.filter(function(b){return b.k!=='*';}).map(function(b){return b.k;});
  var words=shuffle(cfg.words.map(function(w,i){ return {i:i,zh:w[0],py:w[1],bin:w[2],ch:w[3]||'',extra:w[4]||'',tries:0}; }));
  var N=words.length, placed=0, sel=null, busy=false;
  host.innerHTML='<div class="grp t-'+cfg.theme+'"><div class="grp-top"><p class="grp-msg" role="status" aria-live="polite"></p><span class="grp-count">0/'+N+'</span></div>'+
    '<div class="grp-bins n'+cfg.bins.length+'">'+cfg.bins.map(function(b){ return binHTML(b,cfg.theme,keys); }).join('')+'</div>'+
    '<p class="grp-trayh">'+esc(th.tray)+'</p><div class="grp-tray"></div></div>';
  var root=host.firstChild, msg=root.querySelector('.grp-msg'), tray=root.querySelector('.grp-tray'), count=root.querySelector('.grp-count');
  function say(t,cls){ msg.className='grp-msg'+(cls?' '+cls:''); msg.innerHTML=t; }
  say(esc(cfg.intro));
  tray.innerHTML=words.map(function(w,k){ return '<div class="grp-card" role="button" tabindex="0" aria-pressed="false" data-k="'+k+'"><span class="zh" lang="zh">'+zhHTML(w)+'</span><button type="button" class="grp-say" data-k="'+k+'" aria-label="Nghe '+esc(w.zh)+'">'+SPK+'</button></div>'; }).join('');
  function binOf(k){ return cfg.bins.filter(function(b){ return b.k===k; })[0]; }
  function pick(card){ if(busy) return; tray.querySelectorAll('.grp-card').forEach(function(c){ c.setAttribute('aria-pressed',String(c===card)); });
    sel=card; root.querySelectorAll('.grp-bin').forEach(function(b){ b.classList.add('ready'); }); var w=words[+card.dataset.k]; ad.say(w.zh);
    say('Con chọn <b class="zh">'+esc(w.zh)+'</b>. Giờ chạm '+esc(th.verb)+' của nó nhé!'); }
  tray.querySelectorAll('.grp-card').forEach(function(card){
    card.onclick=function(e){ if(e.target.closest('.grp-say')) return; pick(card); };
    card.onkeydown=function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); pick(card); } };
  });
  tray.querySelectorAll('.grp-say').forEach(function(b){ b.onclick=function(e){ e.stopPropagation(); ad.say(words[+b.dataset.k].zh); }; });
  function why(w){ var b=binOf(w.bin);
    if(w.bin==='*') return '<b class="zh">'+esc(w.zh)+'</b> không có '+cj(keys.join(', '))+'.';
    if(isPart(b)) return 'Chữ <b class="zh">'+esc(w.ch)+'</b> có '+cj(b.k)+' '+b.where+'.'+esc(w.extra);
    return '<b class="zh">'+zhHTML(w,b.k)+'</b> có chữ '+cj(b.k)+'.'; }
  root.querySelectorAll('.grp-bin').forEach(function(bin){ bin.onclick=function(){
    if(busy) return;
    if(!sel){ say('Con chạm một '+(cfg.theme==='hoops'?'quả bóng':cfg.theme==='pens'?'bạn thú':cfg.theme==='shelf'?'cuốn sách':'thẻ')+' ở dưới trước nhé!'); tray.classList.remove('shake'); void tray.offsetWidth; tray.classList.add('shake'); return; }
    var card=sel, w=words[+card.dataset.k];
    if(bin.dataset.k===w.bin){
      busy=true; ad.ding(); ad.say(w.zh);
      var chip=document.createElement('span'); chip.className='grp-chip'; chip.innerHTML='<b class="zh">'+(w.bin!=='*'&&!isPart(binOf(w.bin))?zhHTML(w,w.bin):esc(w.zh))+'</b><small>'+esc(w.py)+'</small>';
      fly(card,bin.querySelector('.grp-pile'),th.fly,function(){
        bin.querySelector('.grp-pile').appendChild(chip); card.remove(); sel=null; busy=false; placed++;
        count.textContent=placed+'/'+N; root.querySelectorAll('.grp-bin').forEach(function(b){ b.classList.remove('ready'); });
        bin.classList.remove('hit'); void bin.offsetWidth; bin.classList.add('hit');
        say('Đúng rồi! '+why(w),'good');
        if(placed>=N) setTimeout(function(){ ad.done(N); },700);
      });
    } else {
      w.tries++; ad.buzz(); bin.classList.remove('shake'); void bin.offsetWidth; bin.classList.add('shake');
      if(w.tries<2){ say('<b class="zh">'+esc(w.zh)+'</b> chưa hợp nhóm này. Con nhìn kỹ từng chữ nhé!','bad'); return; }
      var b=binOf(w.bin);
      if(w.bin==='*') say('Gợi ý: <b class="zh">'+esc(w.zh)+'</b> không có '+cj(keys.join(', '))+'. Thử nhóm Khác nhé!','bad');
      else if(isPart(b)){ card.querySelector('.zh').innerHTML=zhHTML(w,w.ch); say('Gợi ý: nhìn '+b.where+' của chữ màu đỏ <b class="zh">'+esc(w.ch)+'</b> nhé!','bad'); }
      else { card.querySelector('.zh').innerHTML=zhHTML(w,w.bin); say('Gợi ý: nhìn chữ màu đỏ trong <b class="zh">'+esc(w.zh)+'</b> nhé!','bad'); }
    }
  }; });
}

/* small celebration for pages that have no fireworks of their own (CES demo) */
function celebrate(host){
  try{ var C=window.AudioContext||window.webkitAudioContext; if(C){ var c=celebrate.c||(celebrate.c=new C()), t0=c.currentTime;
    [0,.4,.75].forEach(function(dt){ var t=t0+dt+.4, n=c.createBuffer(1,c.sampleRate*.7|0,c.sampleRate), x=n.getChannelData(0); for(var i=0;i<x.length;i++) x[i]=(Math.random()*2-1)*Math.pow(1-i/x.length,2);
      var s=c.createBufferSource(), g=c.createGain(); s.buffer=n; g.gain.value=.4; s.connect(g).connect(c.destination); s.start(t); }); } }catch(e){}
  if(reduce()) return;
  var cols=['#ffdf01','#ff6b6b','#6cc04a','#8fd3ff','#ffffff','#ffa53b'];
  [[25,30,0],[75,25,380],[50,15,760]].forEach(function(p){ setTimeout(function(){ for(var i=0;i<16;i++){ var s=document.createElement('i'); s.className='grp-spark'; var a=i/16*Math.PI*2, r=60+Math.random()*50;
    s.style.left=p[0]+'%'; s.style.top=p[1]+'%'; s.style.background=cols[i%cols.length]; s.style.setProperty('--dx',Math.round(Math.cos(a)*r)+'px'); s.style.setProperty('--dy',Math.round(Math.sin(a)*r)+'px');
    host.appendChild(s); setTimeout(function(x){ return function(){ x.remove(); }; }(s),1200); } },p[2]); });
}

window.GRPKit={CFG:CFG,mount:mount,celebrate:celebrate,css:injectCSS};

/* ---------- Lingo Cub station pages ---------- */
if(typeof UNITS==='undefined' || typeof paintLesson!=='function') return;
try{ if(typeof GAMEACTS!=='undefined' && GAMEACTS.indexOf('grp')<0) GAMEACTS.push('grp'); }catch(e){}
var pq=document.getElementById('ap-pyquiz'); if(!pq) return;
var P=document.createElement('div'); P.className='box panel'; P.id='ap-grp'; P.hidden=true; P.style.position='relative';
P.innerHTML='<div class="panel-h"></div><div class="grp-host"></div>'; pq.parentNode.insertBefore(P,pq.nextSibling);
var host=P.querySelector('.grp-host'), G={started:false};
function entry(){ return (L.hanzi||[]).concat(L.vocab||[]).filter(function(a){ return a.act==='grp'; })[0]; }
function head(){ var a=entry(); if(a) P.querySelector('.panel-h').innerHTML='<h3>'+a.h+'</h3><span class="how">'+cj(a.how)+'</span>'; }
function start(){ var cfg=CFG[UN+'-'+LN]; if(!cfg) return; G.started=true; P.querySelectorAll('.result').forEach(function(r){ r.remove(); }); head();
  mount(host,cfg,{ say:function(t){ try{ say(t,'zh'); }catch(e){} }, ding:function(){ try{ ding(); }catch(e){} }, buzz:function(){ try{ buzz(); }catch(e){} },
    done:function(N){ try{ markDone('grp'); }catch(e){} resultCard(P,cfg.win,0,'Chúc mừng con đã hoàn thành '+N+'/'+N+' câu! '+cfg.cheer,start); } }); }
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.act[data-act="grp"]'); if(b && !G.started) setTimeout(start,0); });
var _pl=paintLesson; paintLesson=function(){ G.started=false; host.innerHTML=''; var r=_pl.apply(this,arguments); head(); return r; };
head();
})();
