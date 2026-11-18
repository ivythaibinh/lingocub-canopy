/* Xếp nhóm (grp) — sort words by the character / character part they share. 8-bit look.
   Words are built from the red pictograph flashcards (thẻ chữ tượng hình) used in "Luyện chữ Hán".
   One engine, five themed boards: windows (U3), carts (U5), shelf (U6), pens (U9), hoops (U10).
   Used by the Lingo Cub station pages (replaces "Nhìn hình chọn pinyin" in Lesson 2) and by the CES demo. */
(function(){
'use strict';

/* word: [zh, pinyin, group key ('*' = Khác), char that carries the part (part groups), extra note] */
var CFG = {
  '3-2': { theme:'windows', name:'Xếp nhóm: 早 · 午 · 晚', win:'Cả ngày đã vào đúng ô cửa!',
    intro:'Mỗi ô cửa sổ có một chữ. Chạm một thẻ, rồi chạm ô cửa sổ có chữ đó nhé!', cheer:'Con nhìn ra 早, 午, 晚 rất giỏi!',
    bins:[ {k:'早',sub:'buổi sáng',ic:'dawn'}, {k:'午',sub:'buổi trưa',ic:'sun'}, {k:'晚',sub:'buổi tối',ic:'moon'}, {k:'*',ic:'q'} ],
    words:[ ['早上','zǎoshang','早'],['吃早饭','chī zǎofàn','早'],['中午','zhōngwǔ','午'],['吃午饭','chī wǔfàn','午'],
            ['晚上','wǎnshang','晚'],['吃晚饭','chī wǎnfàn','晚'],['起床','qǐchuáng','*'],['睡觉','shuìjiào','*'],['洗脸','xǐliǎn','*'],['去上学','qù shàngxué','*'] ] },
  '5-2': { theme:'carts', name:'Xếp nhóm: 园 · 店', win:'Xe đẩy đầy ắp rồi!',
    intro:'Mỗi xe đẩy có một chữ. Chạm một thẻ, rồi bỏ vào xe đẩy có chữ đó nhé!', cheer:'Con nhận ra 园 và 店 rất nhanh!',
    bins:[ {k:'园',sub:'nơi có cây, có thú',ic:'park'}, {k:'店',sub:'nơi bán hàng, nấu ăn',ic:'shop'}, {k:'*',ic:'q'} ],
    words:[ ['公园','gōngyuán','园'],['动物园','dòngwùyuán','园'],['商店','shāngdiàn','店'],['饭店','fàndiàn','店'],
            ['家','jiā','*'],['学校','xuéxiào','*'],['回家','huíjiā','*'],['去上学','qù shàngxué','*'] ] },
  '6-2': { theme:'shelf', name:'Xếp nhóm: 师 · 医', win:'Giá sách gọn gàng rồi!',
    intro:'Mỗi ngăn giá sách có một chữ. Chạm một cuốn sách, rồi xếp lên ngăn có chữ đó nhé!', cheer:'Con nhớ 师 và 医 rất giỏi!',
    bins:[ {k:'师',sub:'người làm nghề giỏi',ic:'board'}, {k:'医',sub:'chữa bệnh',ic:'cross'}, {k:'*',ic:'q'} ],
    words:[ ['老师','lǎoshī','师'],['厨师','chúshī','师'],['医生','yīshēng','医'],['牙医','yáyī','医'],
            ['司机','sījī','*'],['员工','yuángōng','*'],['学生','xuésheng','*'] ] },
  '9-2': { theme:'pens', name:'Xếp nhóm: 犭 · 鸟', win:'Các bạn thú đã về chuồng!',
    intro:'Mỗi chuồng có một phần chữ. Chạm một bạn thú, rồi lùa vào chuồng có phần chữ đó nhé!', cheer:'Con nhìn ra 犭 và 鸟 trong chữ rất giỏi!',
    bins:[ {k:'犭',sub:'thú có lông',where:'bên trái',ic:'paw'}, {k:'鸟',sub:'loài có cánh',where:'bên phải',ic:'bird'}, {k:'*',ic:'q'} ],
    words:[ ['猪','zhū','犭','猪'],['猴子','hóuzi','犭','猴'],['鸡','jī','鸟','鸡'],['鸭子','yāzi','鸟','鸭'],
            ['牛','niú','*'],['羊','yáng','*'],['马','mǎ','*'],['老虎','lǎohǔ','*'],['大象','dàxiàng','*'] ] },
  '10-2': { theme:'hoops', name:'Xếp nhóm: 艹 · 氵', win:'Bóng nào cũng vào rổ!',
    intro:'Mỗi rổ có một phần chữ. Chạm một quả bóng, rồi ném vào rổ có phần chữ đó nhé!', cheer:'Con nhìn ra 艹 và 氵 rất giỏi!',
    bins:[ {k:'艹',sub:'cây cỏ',where:'trên đầu',ic:'grass'}, {k:'氵',sub:'có nước',where:'bên trái',ic:'drop'}, {k:'*',ic:'q'} ],
    words:[ ['花','huā','艹','花'],['草','cǎo','艹','草'],['河','hé','氵','河'],['洗脸','xǐliǎn','氵','洗',' Rửa mặt cần nước!'],['漂亮','piàoliang','氵','漂'],
            ['树','shù','*'],['山','shān','*'],['石头','shítou','*'],['太阳','tàiyáng','*'],['月亮','yuèliang','*'] ] }
};
/* flashcards that live in another unit's folder; 园 has no flashcard and is drawn as a red character */
var CARDDIR = {'猴':'u8','虎':'u8','大':'u8','象':'u8','洗':'u1to4','脸':'u1to4','漂':'u9'};
var NOCARD = ['园'];

var THEME = {
  windows:{ verb:'ô cửa sổ', thing:'thẻ',       fly:'straight' },
  carts:  { verb:'xe đẩy',   thing:'thẻ',       fly:'drop' },
  shelf:  { verb:'ngăn sách',thing:'cuốn sách', fly:'slide' },
  pens:   { verb:'chuồng',   thing:'bạn thú',   fly:'hop' },
  hoops:  { verb:'rổ',       thing:'quả bóng',  fly:'arc' }
};

/* ---------- 8-bit icons (12×12 pixel maps) ---------- */
var PAL={k:'#0e1526',r:'#c8322b',y:'#ffcd3c',o:'#ff8a3c',w:'#ffffff',b:'#2e95c2',l:'#8fd3ff',g:'#3f8f3a',G:'#6cc04a',n:'#8a5a34',p:'#ffc58f',d:'#1f2a44',c:'#fff3b0',x:'#c9ced8'};
var ICON={
  dawn:['............','............','....yyyy....','..yyyyyyyy..','.yyyyyyyyyy.','.yyyyyyyyyy.','oooooooooooo','pppppppppppp','oooooooooooo','pppppppppppp','oooooooooooo','pppppppppppp'],
  sun:['.....yy.....','.y...yy...y.','..y......y..','....yyyy....','...yyyyyy...','yy.yyyyyy.yy','yy.yyyyyy.yy','...yyyyyy...','....yyyy....','..y......y..','.y...yy...y.','.....yy.....'],
  moon:['dddddddddddd','dwdddddddcdd','ddddccccdddd','dddcccdddddd','ddcccddddddd','ddcccddddwdd','ddcccddddddd','ddcccddddddd','dddcccdddddd','ddddccccdddd','dwdddddddddd','dddddddddddd'],
  q:['yyyyyyyyyyyy','yyyyyyyyyyyy','yyykkkkkyyyy','yykkyyykkyyy','yyyyyyykkyyy','yyyyyykkyyyy','yyyyykkyyyyy','yyyyykkyyyyy','yyyyyyyyyyyy','yyyyykkyyyyy','yyyyykkyyyyy','yyyyyyyyyyyy'],
  park:['rrrrrrrrrrrr','rrrrrrrrrrrr','nn........nn','nn...GG...nn','nn..GGGG..nn','nn.GGGGGG.nn','nn.GGgGGG.nn','nn..GGGG..nn','nn...nn...nn','nn...nn...nn','nn...nn...nn','nn...nn...nn'],
  shop:['rrwwrrwwrrww','rrwwrrwwrrww','.rr..rr..rr.','oooooooooooo','oooooooooooo','ollllooonnoo','ollllooonnoo','ollllooonnoo','oooooooonnoo','oooooooonnoo','oooooooonnoo','oooooooonnoo'],
  board:['nnnnnnnnnnnn','nggggggggggn','ngwwwwgggggn','nggggggggggn','ngwwwwwwwggn','nggggggggggn','ngwwwggggggn','nggggggggggn','nnnnnnnnnnnn','...n....n...','..n......n..','.n........n.'],
  cross:['kkkkkkkkkkkk','kwwwwwwwwwwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwrrrrrrrrwk','kwrrrrrrrrwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwwwwwwwwwwk','kkkkkkkkkkkk'],
  paw:['............','.nn......nn.','.nn......nn.','............','nn..nnnn..nn','nn.nnnnnn.nn','...nnnnnn...','..nnnnnnnn..','..nnnnnnnn..','..nnnnnnnn..','...nnnnnn...','............'],
  bird:['............','....bbbb....','...bbbbbb...','...bwkbbbo..','..bbbbbbboo.','bbbbbbbbb...','.bbblbbbb...','..bblllbb...','...bbbbb....','....bbb.....','....o..o....','...oo..oo...'],
  grass:['............','.G....G...G.','.G...GG..GG.','.GG..G...G..','..GG.G.G.G..','G..GGG.GGG.G','GG.GGGGGGGGG','.GGGGGGGGGG.','gggggggggggg','gggggggggggg','nnnnnnnnnnnn','nnnnnnnnnnnn'],
  drop:['.....b......','.....b......','....bbb.....','....bbb.....','...bbbbb....','...blbbb....','..bblbbbb...','..bblbbbbb..','..bbbbbbbb..','...bbbbbb...','....bbbb....','............'],
  spk:['............','.....k......','....kk...k..','...kkk....k.','kkkkkk..k.k.','kkkkkk...k.k','kkkkkk...k.k','kkkkkk..k.k.','...kkk....k.','....kk...k..','.....k......','............']
};
function pix(name,size,label){ var m=ICON[name]||[], o='';
  m.forEach(function(row,y){ var x=0; while(x<row.length){ var ch=row[x], s=x; while(x<row.length&&row[x]===ch) x++; if(ch!=='.') o+='<rect x="'+s+'" y="'+y+'" width="'+(x-s)+'" height="1" fill="'+PAL[ch]+'"/>'; } });
  return '<svg class="grp-px" viewBox="0 0 12 12" width="'+size+'" height="'+size+'" shape-rendering="crispEdges" '+(label?'role="img" aria-label="'+label+'"':'aria-hidden="true"')+'>'+o+'</svg>'; }

var CSS = [
'.grp{--g-ink:var(--ink,#0e1526);--g-hi:var(--sun,var(--yel,#ffcd3c));--g-paper:var(--paper,#fff);--g-cream:#f3e6c4;--g-red:#c8322b;--g-okd:var(--ok-d,#2e7d32);--g-mute:var(--mute,#4a5068);--g-px:var(--f-px,"Press Start 2P",ui-monospace,monospace);display:flex;flex-direction:column;gap:16px;color:var(--g-ink)}',
'.grp .zh{font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;font-weight:700}',
'.grp-px{display:block;flex:none;image-rendering:pixelated}',
/* instruction row: pixel buddy + speech box */
'.grp-top{display:flex;align-items:center;gap:12px}',
'.grp-ava{flex:none;width:72px;height:auto;image-rendering:pixelated}',
'.grp-box{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--g-paper);border:4px solid var(--g-ink)}',
'.grp-spk{flex:none;display:grid;place-items:center;width:46px;height:46px;padding:0;background:var(--g-hi);border:4px solid var(--g-ink);cursor:pointer}',
'.grp-msg{margin:0;flex:1;min-width:0;font-weight:700;font-size:clamp(14px,2.2vw,18px);line-height:1.4}',
'.grp-msg.good{color:var(--g-okd)}.grp-msg.bad{color:var(--g-red)}',
'.grp-msg i{font-style:normal;font-weight:600;color:var(--g-mute)}',
'.grp-count{flex:none;padding:6px 8px;background:var(--g-ink);color:var(--g-hi);font-family:var(--g-px);font-size:11px;line-height:1}',
'@media (max-width:520px){.grp-ava{width:52px}.grp-spk{width:40px;height:40px}}',
/* group boards */
'.grp-bins{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr));gap:14px}',
'.grp-bins.n3{grid-template-columns:repeat(auto-fit,minmax(min(104px,100%),1fr));gap:10px}',
'.grp-bin{position:relative;display:flex;flex-direction:column;gap:8px;min-height:190px;padding:12px;border:4px solid var(--g-ink);background:var(--g-cream);color:var(--g-ink);font:inherit;text-align:left;cursor:pointer}',
'.grp-bin:focus-visible,.grp-card:focus-visible,.grp-spk:focus-visible{outline:4px solid var(--g-hi);outline-offset:3px}',
'.grp-bin.ready{box-shadow:6px 6px 0 var(--g-hi)}',
'.grp-lab{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
'.grp-lab b{font-size:clamp(32px,5vw,44px);line-height:1}',
'.grp-lab b.oth{font-family:inherit;font-weight:800;font-size:clamp(26px,4vw,38px)}',
'.grp-sub{font-size:13px;font-weight:700;color:var(--g-mute);line-height:1.3}',
'.grp-pile{flex:1;display:flex;flex-wrap:wrap;align-content:flex-start;gap:8px;min-height:60px}',
/* flashcard tiles */
'.grp-tiles{display:flex;gap:4px}',
'.grp-tile{display:grid;place-items:center;width:var(--t,70px);height:var(--t,70px);background:#fff;border:2px dashed #e6d7b8;overflow:hidden}',
'.grp-tile img{width:100%;height:100%;object-fit:contain;display:block}',
'.grp-tile.txt b{font-family:"Ma Shan Zheng","Noto Sans SC",serif;color:var(--g-red);font-size:calc(var(--t,70px)*.72);line-height:1}',
'.grp-tile.hl{border:4px solid var(--g-red);animation:grpBob .5s steps(2) 3}',
'@keyframes grpBob{50%{transform:translateY(-6px)}}',
'.grp-chip{display:inline-flex;padding:3px;background:var(--g-paper);border:3px solid var(--g-ink);--t:34px}',
'.grp-chip .grp-tile{border:1px solid #eee2c6}',
/* tray */
'.grp-trayh{margin:0;font-weight:800;font-size:15px}',
'.grp-tray{display:flex;flex-wrap:wrap;gap:14px;min-height:96px}',
'.grp-card{display:inline-flex;align-items:stretch;border:4px solid var(--g-ink);background:var(--g-paper);box-shadow:6px 6px 0 var(--g-ink);cursor:pointer;user-select:none;animation:grpIn .25s steps(3)}',
'@keyframes grpIn{from{transform:translateY(12px);opacity:0}}',
'.grp-card .grp-tiles{padding:8px}',
'.grp-card .grp-say{display:grid;place-items:center;width:52px;border:0;border-left:4px solid var(--g-ink);background:var(--g-hi);color:var(--g-ink);cursor:pointer;padding:0}',
'.grp-card[aria-pressed="true"]{background:var(--g-hi);transform:translate(3px,3px);box-shadow:3px 3px 0 var(--g-ink)}',
'.grp-card[aria-pressed="true"] .grp-say{background:#fff}',
'@media (max-width:520px){.grp-card{--t:54px}.grp-card .grp-tiles{padding:6px}.grp-card .grp-say{width:42px}}',
'.grp-card.shake,.grp-bin.shake,.grp-tray.shake{animation:grpShake .4s steps(4)}',
'@keyframes grpShake{25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-4px)}}',
'.grp-bin.hit{animation:grpHit .4s steps(2)}',
'@keyframes grpHit{50%{transform:translateY(-6px)}}',
'.grp-fly{position:fixed;z-index:95;margin:0;pointer-events:none}',
/* windows (U3) */
'.t-windows .grp-bin{background:#8a5a34}',
'.t-windows .grp-lab{padding:6px 8px;background:var(--g-cream);border:4px solid var(--g-ink)}',
'.t-windows .grp-sub{display:block;width:100%}',
'.t-windows .grp-glass{position:relative;flex:1;display:flex;border:4px solid var(--g-ink);min-height:110px}',
'.t-windows .grp-glass::before,.t-windows .grp-glass::after{content:"";position:absolute;background:var(--g-ink);opacity:.4}',
'.t-windows .grp-glass::before{left:50%;top:0;bottom:0;width:4px;margin-left:-2px}.t-windows .grp-glass::after{top:50%;left:0;right:0;height:4px;margin-top:-2px}',
'.t-windows .grp-glass .grp-pile{position:relative;z-index:1;padding:8px}',
'.t-windows .sky-dawn{background:linear-gradient(#ffd27a 0 34%,#ffb070 34% 67%,#ff8a5c 67%)}',
'.t-windows .sky-sun{background:linear-gradient(#5fb8ff 0 50%,#8fd3ff 50%)}',
'.t-windows .sky-moon{background:linear-gradient(#141c33 0 50%,#1f2a44 50%)}',
'.t-windows .sky-q{background:repeating-linear-gradient(90deg,#a8743f 0 20px,#7a4f2a 20px 24px)}',
/* carts (U5) */
'.t-carts .grp-bin{padding-bottom:40px}',
'.t-carts .grp-basket{position:relative;flex:1;display:flex;margin-right:14px;border:4px solid var(--g-ink);background:repeating-linear-gradient(90deg,transparent 0 14px,rgba(14,21,38,.22) 14px 18px),repeating-linear-gradient(0deg,transparent 0 14px,rgba(14,21,38,.22) 14px 18px),#dff0ff;padding:8px}',
'.t-carts .grp-basket::after{content:"";position:absolute;right:-18px;top:-4px;width:14px;height:24px;border:4px solid var(--g-ink);border-left:0;border-bottom:0}',
'.t-carts .grp-bin::before,.t-carts .grp-bin::after{content:"";position:absolute;bottom:10px;width:16px;height:16px;background:var(--g-ink);box-shadow:inset 0 0 0 4px #9aa3b5}',
'.t-carts .grp-bin::before{left:22%}.t-carts .grp-bin::after{right:30%}',
/* shelf (U6) */
'.t-shelf .grp-bins{grid-template-columns:1fr;gap:0;border:8px solid #4a2f17;background:#7a4f2a;padding:8px 8px 0}',
'.t-shelf .grp-bin{flex-direction:row;align-items:flex-end;min-height:126px;border:0;border-bottom:12px solid #3e2713;background:#a26b3a;margin-bottom:8px;padding:10px 12px 0}',
'.t-shelf .grp-lab{flex:none;align-self:center;width:190px;padding:6px 10px;background:var(--g-cream);border:4px solid var(--g-ink)}',
'.t-shelf .grp-pile{align-items:flex-end;align-content:flex-end;min-height:104px;gap:4px}',
'.t-shelf .grp-chip{border-bottom:0;--t:30px;padding:6px 4px}',
'.t-shelf .grp-chip .grp-tiles{flex-direction:column}',
'.t-shelf .grp-chip:nth-child(3n+1){background:#ffd76a}.t-shelf .grp-chip:nth-child(3n+2){background:#8fd3ff}.t-shelf .grp-chip:nth-child(3n){background:#ff9a8a}',
'.t-shelf .grp-card{border-left-width:16px}',
'.t-shelf .grp-card:nth-child(3n+1){border-left-color:#e0a800}.t-shelf .grp-card:nth-child(3n+2){border-left-color:#2e95c2}.t-shelf .grp-card:nth-child(3n){border-left-color:#c8322b}',
'@media (max-width:560px){.t-shelf .grp-lab{width:112px}.t-shelf .grp-lab b{font-size:28px}.t-shelf .grp-sub{font-size:11px}}',
/* pens (U9) */
'.t-pens .grp-bin{background:linear-gradient(#8fd3ff 0 30%,#6cc04a 30%)}',
'.t-pens .grp-lab{padding:6px 8px;background:#e8c48a;border:4px solid #6b4a2b}',
'.t-pens .grp-sub{display:block;width:100%}',
'.t-pens .grp-fence{flex:1;display:flex;border:4px solid #6b4a2b;border-top:0;background:repeating-linear-gradient(90deg,#c98b4f 0 8px,transparent 8px 22px) top/100% 20px no-repeat;padding:26px 6px 6px}',
'.t-pens .grp-card{border-color:#6b4a2b;box-shadow:6px 6px 0 #6b4a2b;background:#fff6e0}',
'.t-pens .grp-card .grp-say{border-left-color:#6b4a2b}',
/* hoops (U10) */
'.t-hoops .grp-bin{align-items:center;background:linear-gradient(var(--g-cream) 0 68%,#d9b98a 68% 72%,#c9a46e 72%)}',
'.t-hoops .grp-board{display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 12px;background:#fff;border:4px solid var(--g-ink);min-width:78%}',
'.t-hoops .grp-board .grp-lab{justify-content:center}',
'.t-hoops .grp-rim{width:64%;height:8px;background:#e8622c;border:4px solid var(--g-ink);margin-top:-4px;box-sizing:content-box}',
'.t-hoops .grp-net{width:52%;height:30px;background:repeating-conic-gradient(#fff 0 25%,transparent 0 50%) 0 0/8px 8px;opacity:.95}',
'.t-hoops .grp-pile{justify-content:center;width:100%}',
'.t-hoops .grp-chip{background:#ff8a3c}',
'.t-hoops .grp-card{background:#ff8a3c}',
'.t-hoops .grp-card .grp-tile{border-color:#ffd0a8}',
'.t-hoops .grp-bin.hit .grp-net{animation:grpNet .4s steps(2)}',
'@keyframes grpNet{50%{transform:scaleY(1.4)}}',
'@media (prefers-reduced-motion:reduce){.grp *{animation:none!important}}',
/* celebration (CES demo) */
'.grp-spark{position:absolute;width:8px;height:8px;z-index:40;pointer-events:none;animation:grpSpark 1.1s steps(8) forwards}',
'@keyframes grpSpark{to{transform:translate(var(--dx),var(--dy));opacity:0}}'
].join('\n');

function injectCSS(){ if(document.getElementById('grpCss')) return;
  var f=document.createElement('link'); f.rel='stylesheet'; f.href='https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@700&family=Ma+Shan+Zheng&text='+encodeURIComponent('犭艹氵鸟园')+'&display=swap'; document.head.appendChild(f);
  var s=document.createElement('style'); s.id='grpCss'; s.textContent=CSS; document.head.appendChild(s); }
function shuffle(a){ a=a.slice(); for(var i=a.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function cj(s){ return esc(s).replace(/([⺀-鿿豈-﫿]+)/g,'<span class="zh">$1</span>'); }
function reduce(){ try{ return matchMedia('(prefers-reduced-motion: reduce)').matches; }catch(e){ return false; } }
function isPart(b){ return !!b.where; }

function binHTML(b,theme,keys){
  var other=b.k==='*', sub=other?'Không có '+keys.join(', '):(isPart(b)?'Có '+b.k+' '+b.where+' · '+b.sub:'Có chữ '+b.k+' · '+b.sub);
  var lab='<span class="grp-lab">'+pix(b.ic,40)+(other?'<b class="oth">Khác</b>':'<b class="zh">'+esc(b.k)+'</b>')+'<span class="grp-sub">'+cj(sub)+'</span></span>', pile='<span class="grp-pile"></span>';
  var inner;
  if(theme==='windows') inner=lab+'<span class="grp-glass sky-'+b.ic+'">'+pile+'</span>';
  else if(theme==='carts') inner=lab+'<span class="grp-basket">'+pile+'</span>';
  else if(theme==='pens') inner=lab+'<span class="grp-fence">'+pile+'</span>';
  else if(theme==='hoops') inner='<span class="grp-board">'+lab+'</span><i class="grp-rim"></i><i class="grp-net"></i>'+pile;
  else inner=lab+pile;
  return '<button type="button" class="grp-bin" data-k="'+esc(b.k)+'" aria-label="'+esc((other?'Nhóm Khác: ':'Nhóm '+b.k+': ')+sub)+'">'+inner+'</button>';
}

function path(kind,dx,dy){
  function T(x,y,s,r){ return {transform:'translate('+x+'px,'+y+'px) scale('+s+') rotate('+(r||0)+'deg)'}; }
  var o=[T(0,0,1)];
  if(kind==='drop'){ o.push(Object.assign(T(dx,dy-150,.8),{offset:.6})); o.push(T(dx,dy,.45)); }
  else if(kind==='slide'){ o.push(Object.assign(T(dx*.5,dy*.5-40,.75,-8),{offset:.5})); o.push(T(dx,dy,.45,0)); }
  else if(kind==='hop'){ [.33,.66,1].forEach(function(t,i){ o.push(Object.assign(T((t-.165)*dx,(t-.165)*dy-70+i*10,.8-i*.1),{offset:t-.165})); o.push(Object.assign(T(dx*t,dy*t,.75-i*.12),{offset:t})); }); }
  else if(kind==='arc'){ var top=Math.min(dy,0)-170; o.push(Object.assign(T(dx*.5,top,.8,180),{offset:.5})); o.push(Object.assign(T(dx,dy-30,.55,320),{offset:.85})); o.push(T(dx,dy,.45,360)); }
  else o.push(T(dx,dy,.45));
  return o;
}
function fly(from,to,kind,done){
  if(reduce()||!from.animate){ done(); return; }
  var a=from.getBoundingClientRect(), b=to.getBoundingClientRect();
  var c=from.cloneNode(true); c.classList.add('grp-fly'); c.style.left=a.left+'px'; c.style.top=a.top+'px'; c.style.width=a.width+'px'; c.style.height=a.height+'px'; c.style.animation='none';
  (from.closest('.grp')||document.body).appendChild(c);
  var dx=b.left+b.width/2-(a.left+a.width/2), dy=b.top+Math.min(b.height,60)/2-(a.top+a.height/2);
  var an=c.animate(path(kind,dx,dy),{duration:kind==='hop'||kind==='arc'?900:650,easing:'steps(14)',fill:'forwards'});
  from.style.visibility='hidden';
  an.onfinish=function(){ c.remove(); done(); };
}

/* host: element to fill · cfg: one CFG entry
   ad: {say(zh), sayVi(text), ding(), buzz(), done(N), img(char)->url|null, avatar:url} */
function mount(host,cfg,ad){
  injectCSS();
  var th=THEME[cfg.theme], keys=cfg.bins.filter(function(b){return b.k!=='*';}).map(function(b){return b.k;});
  var words=shuffle(cfg.words.map(function(w,i){ return {i:i,zh:w[0],py:w[1],bin:w[2],ch:w[3]||'',extra:w[4]||'',tries:0,done:false}; }));
  var N=words.length, placed=0, sel=null, busy=false, SHOW=4, hint=cfg.intro;
  host.innerHTML='<div class="grp t-'+cfg.theme+'"><div class="grp-top">'+(ad.avatar?'<img class="grp-ava" src="'+esc(ad.avatar)+'" alt="">':'')+
    '<div class="grp-box"><button type="button" class="grp-spk" aria-label="Nghe hướng dẫn">'+pix('spk',26)+'</button><p class="grp-msg" role="status" aria-live="polite"></p><span class="grp-count">0/'+N+'</span></div></div>'+
    '<div class="grp-bins n'+cfg.bins.length+'">'+cfg.bins.map(function(b){ return binHTML(b,cfg.theme,keys); }).join('')+'</div>'+
    '<p class="grp-trayh">Chạm một '+esc(th.thing)+', rồi chạm '+esc(th.verb)+' của nó</p><div class="grp-tray"></div></div>';
  var root=host.firstChild, msg=root.querySelector('.grp-msg'), tray=root.querySelector('.grp-tray'), count=root.querySelector('.grp-count');
  function say(t,cls,plain){ msg.className='grp-msg'+(cls?' '+cls:''); msg.innerHTML=t; hint=plain||msg.textContent; }
  say(esc(cfg.intro),'',cfg.intro);
  root.querySelector('.grp-spk').onclick=function(){ if(ad.sayVi) ad.sayVi(hint); };
  function tiles(w,hl){ return '<span class="grp-tiles">'+w.zh.split('').map(function(c){ var u=NOCARD.indexOf(c)<0&&ad.img?ad.img(c):null;
    return '<span class="grp-tile'+(u?'':' txt')+(hl&&c===hl?' hl':'')+'" data-c="'+esc(c)+'">'+(u?'<img src="'+esc(u)+'" alt="" draggable="false">':'<b>'+esc(c)+'</b>')+'</span>'; }).join('')+'</span>'; }
  function cardHTML(k){ var w=words[k]; return '<div class="grp-card" role="button" tabindex="0" aria-pressed="false" aria-label="'+esc(w.zh)+'" data-k="'+k+'">'+tiles(w)+'<button type="button" class="grp-say" aria-label="Nghe '+esc(w.zh)+'">'+pix('spk',24)+'</button></div>'; }
  function wire(card){ var k=+card.dataset.k;
    card.onclick=function(e){ if(e.target.closest('.grp-say')){ e.stopPropagation(); ad.say(words[k].zh); return; } pick(card); };
    card.onkeydown=function(e){ if(e.target===card&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); pick(card); } }; }
  function refill(){ var shown=[].map.call(tray.querySelectorAll('.grp-card'),function(c){ return +c.dataset.k; });
    for(var k=0;k<N&&shown.length<SHOW;k++){ if(!words[k].done&&shown.indexOf(k)<0){ tray.insertAdjacentHTML('beforeend',cardHTML(k)); wire(tray.lastElementChild); shown.push(k); } } }
  refill();
  function binOf(k){ return cfg.bins.filter(function(b){ return b.k===k; })[0]; }
  function pick(card){ if(busy) return; tray.querySelectorAll('.grp-card').forEach(function(c){ c.setAttribute('aria-pressed',String(c===card)); });
    sel=card; root.querySelectorAll('.grp-bin').forEach(function(b){ b.classList.add('ready'); }); var w=words[+card.dataset.k]; ad.say(w.zh);
    say('Con chọn <b class="zh">'+esc(w.zh)+'</b>. Giờ chạm '+esc(th.verb)+' của nó nhé!','', 'Giờ chạm '+th.verb+' của nó nhé!'); }
  function why(w){ var b=binOf(w.bin), word='<b class="zh">'+esc(w.zh)+'</b> <i>'+esc(w.py)+'</i>';
    if(w.bin==='*') return word+' không có '+cj(keys.join(', '))+'.';
    if(isPart(b)) return word+': chữ <b class="zh">'+esc(w.ch)+'</b> có '+cj(b.k)+' '+b.where+'.'+esc(w.extra);
    return word+' có chữ '+cj(b.k)+'.'; }
  root.querySelectorAll('.grp-bin').forEach(function(bin){ bin.onclick=function(){
    if(busy) return;
    if(!sel){ say('Con chạm một '+esc(th.thing)+' ở dưới trước nhé!'); tray.classList.remove('shake'); void tray.offsetWidth; tray.classList.add('shake'); return; }
    var card=sel, w=words[+card.dataset.k];
    if(bin.dataset.k===w.bin){
      busy=true; ad.ding(); ad.say(w.zh);
      var chip=document.createElement('span'); chip.className='grp-chip'; chip.title=w.zh+' · '+w.py; chip.setAttribute('aria-label',w.zh); chip.innerHTML=tiles(w);
      fly(card,bin.querySelector('.grp-pile'),th.fly,function(){
        bin.querySelector('.grp-pile').appendChild(chip); card.remove(); w.done=true; sel=null; busy=false; placed++;
        count.textContent=placed+'/'+N; root.querySelectorAll('.grp-bin').forEach(function(b){ b.classList.remove('ready'); });
        bin.classList.remove('hit'); void bin.offsetWidth; bin.classList.add('hit');
        say('Đúng rồi! '+why(w),'good'); refill();
        if(placed>=N) setTimeout(function(){ ad.done(N); },700);
      });
    } else {
      w.tries++; ad.buzz(); bin.classList.remove('shake'); void bin.offsetWidth; bin.classList.add('shake');
      if(w.tries<2){ say('<b class="zh">'+esc(w.zh)+'</b> chưa hợp '+esc(th.verb)+' này. Con nhìn kỹ từng chữ đỏ nhé!','bad'); return; }
      var b=binOf(w.bin), hl=w.bin==='*'?'':(isPart(b)?w.ch:w.bin);
      card.querySelector('.grp-tiles').outerHTML=tiles(w,hl);
      if(w.bin==='*') say('Gợi ý: <b class="zh">'+esc(w.zh)+'</b> không có '+cj(keys.join(', '))+'. Thử nhóm Khác nhé!','bad');
      else if(isPart(b)) say('Gợi ý: nhìn '+b.where+' của chữ đang nhảy nhé!','bad');
      else say('Gợi ý: nhìn chữ đang nhảy nhé!','bad');
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

window.GRPKit={CFG:CFG,mount:mount,celebrate:celebrate,css:injectCSS,chars:function(){ var o={}; Object.keys(CFG).forEach(function(k){ CFG[k].words.forEach(function(w){ w[0].split('').forEach(function(c){ if(NOCARD.indexOf(c)<0) o[c]=CARDDIR[c]||''; }); }); }); return o; }};

/* ---------- Lingo Cub station pages ---------- */
if(typeof UNITS==='undefined' || typeof paintLesson!=='function') return;
try{ if(typeof GAMEACTS!=='undefined' && GAMEACTS.indexOf('grp')<0) GAMEACTS.push('grp'); }catch(e){}
var pq=document.getElementById('ap-pyquiz'); if(!pq) return;
var P=document.createElement('div'); P.className='box panel'; P.id='ap-grp'; P.hidden=true; P.style.position='relative';
P.innerHTML='<div class="panel-h"></div><div class="grp-host"></div>'; pq.parentNode.insertBefore(P,pq.nextSibling);
var host=P.querySelector('.grp-host'), G={started:false};
var BUDDY=['leo','bunny','buffy','xiaobao'];
function entry(){ return (L.hanzi||[]).concat(L.vocab||[]).filter(function(a){ return a.act==='grp'; })[0]; }
function head(){ var a=entry(); if(a) P.querySelector('.panel-h').innerHTML='<h3>'+a.h+'</h3><span class="how">'+cj(a.how)+'</span>'; }
function cardSrc(c){ return (CARDDIR[c]?'../'+CARDDIR[c]+'/':'')+'img/'+c.codePointAt(0)+'_red.webp'; }
function start(){ var cfg=CFG[UN+'-'+LN]; if(!cfg) return; G.started=true; P.querySelectorAll('.result').forEach(function(r){ r.remove(); }); head();
  mount(host,cfg,{ img:cardSrc, avatar:'../img/c_'+(BUDDY[LN-1]||'bunny')+'.webp',
    say:function(t){ try{ say(t,'zh'); }catch(e){} }, sayVi:function(t){ try{ say(t,'vi'); }catch(e){} },
    ding:function(){ try{ ding(); }catch(e){} }, buzz:function(){ try{ buzz(); }catch(e){} },
    done:function(N){ try{ markDone('grp'); }catch(e){} resultCard(P,cfg.win,0,'Chúc mừng con đã hoàn thành '+N+'/'+N+' câu! '+cfg.cheer,start); } }); }
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.act[data-act="grp"]'); if(b && !G.started) setTimeout(start,0); });
var _pl=paintLesson; paintLesson=function(){ G.started=false; host.innerHTML=''; var r=_pl.apply(this,arguments); head(); return r; };
head();
})();
