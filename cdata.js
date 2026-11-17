/* Canopy · shared data for the city map and the 12 station pages (Lingo Cub) */
(function(){
  var U = {
    1:{en:'Date and time (1)',zh:'日期和时间（一）',py:'rìqī hé shíjiān (yī)',b:'Tháp đồng hồ',q:'Hôm nay là thứ mấy? Bây giờ là mấy giờ?',sEn:'What time is it?',sZh:'现在几点？',n:4},
    2:{en:'Date and time (2)',zh:'日期和时间（二）',py:'rìqī hé shíjiān (èr)',b:'Tiệm bánh sinh nhật',q:'Sinh nhật của con là ngày nào?',sEn:'When is your birthday?',sZh:'你的生日是几月几号？',n:4},
    3:{en:'My day',zh:'我的一天',py:'wǒ de yì tiān',b:'Ngôi nhà của con',q:'Một ngày của con diễn ra thế nào?',sEn:'I get up at six thirty.',sZh:'我六点半起床。',n:5},
    4:{en:'My hobbies',zh:'我的爱好',py:'wǒ de àihào',b:'Câu lạc bộ sở thích',q:'Con thích làm gì nhất?',sEn:'What is your hobby?',sZh:'你的爱好是什么？',n:5},
    5:{en:'Places',zh:'地方',py:'dìfang',b:'Cửa hàng và công viên',q:'Con đi đâu, để làm gì?',sEn:'I’m going to school.',sZh:'我去学校。',n:5},
    6:{en:'Jobs',zh:'工作',py:'gōngzuò',b:'Bệnh viện',q:'Mọi người làm nghề gì?',sEn:'What does he do?',sZh:'他做什么工作？',n:5},
    7:{en:'Transports',zh:'交通工具',py:'jiāotōng gōngjù',b:'Bến xe buýt',q:'Con đi bằng gì?',sEn:'How do you go to the park?',sZh:'你怎么去公园？',n:5},
    8:{en:'At the zoo',zh:'在动物园',py:'zài dòngwùyuán',b:'Vườn thú',q:'Đây là con vật gì?',sEn:'What animal is this?',sZh:'这是什么动物？',n:5},
    9:{en:'At the farm',zh:'在农场',py:'zài nóngchǎng',b:'Nông trại',q:'Con vật ở nông trại trông thế nào?',sEn:'I have a puppy.',sZh:'我有一只小狗。',n:5},
    10:{en:'Nature (1)',zh:'大自然（一）',py:'dàzìrán (yī)',b:'Núi mặt trời',q:'Con nhìn thấy gì ngoài thiên nhiên?',sEn:'I see a tree.',sZh:'我看到树。',n:5},
    11:{en:'Nature (2)',zh:'大自然（二）',py:'dàzìrán (èr)',b:'Công viên bờ hồ',q:'Con mèo đang ở đâu?',sEn:'The cat is under the tree.',sZh:'猫在树下面。',n:5},
    12:{en:'All in one place!',zh:'大集合！',py:'dà jíhé!',b:'Lâu đài Canopy',q:'Con nhớ được bao nhiêu điều rồi?',sEn:'Welcome to my city!',sZh:'欢迎来我的城市！',n:5}
  };
  /* lesson kinds: name, Chinese, pinyin, companion */
  var K = {
    tu:{vi:'Cùng học từ mới',zh:'一起学新词',py:'yìqǐ xué xīn cí'},
    tr:{vi:'Cùng đọc truyện',zh:'一起读故事',py:'yìqǐ dú gùshi'},
    lt:{vi:'Cùng luyện tập',zh:'一起练习',py:'yìqǐ liànxí'},
    ot:{vi:'Cùng ôn tập',zh:'一起复习',py:'yìqǐ fùxí'},
    en:{vi:'English practice',zh:'',py:''}
  };
  var WHO = ['leo','bunny','buffy','xiaobao','abc'];
  var PLAN = {def:['tu','tu','tr','lt','en'], 1:['tu','tu','tu','ot'], 2:['tu','tu','tr','tr'], 12:['ot','ot','ot','ot','en']};
  function lessons(u){
    var p = PLAN[u] || PLAN.def, n = U[u] ? U[u].n : p.length;
    var out = [];
    for(var i=0;i<n;i++){ var k=K[p[i]]; out.push({n:i+1,vi:k.vi,zh:k.zh,py:k.py,who:WHO[i],abc:WHO[i]==='abc',kind:p[i]}); }
    return out;
  }

  /* ---------- pixel buildings: 20 x 32 box, ground line at y = 32 ---------- */
  var A = {
    1:[['#c8643c','5 9 10 23'],['#a24c2a','14 9 1 23'],['#7a2e1c','4 7 12 2 6 5 8 2 8 3 4 2 9 0 2 3'],['#3a2a20','6 11 8 8'],['#fff8e3','7 12 6 6'],['#0b1f45','9 13 1 3 10 15 2 1'],['#ffdf01','7 22 2 2 11 22 2 2'],['#5a2e1a','8 27 4 5']],
    2:[['#f7b3c4','1 17 16 15'],['#d98ea2','16 17 1 15'],['#ffffff','0 14 18 3'],['#e8453c','0 14 2 3 4 14 2 3 8 14 2 3 12 14 2 3 16 14 2 3 7 4 1 1 10 4 1 1'],['#9fd8f5','3 20 7 6'],['#fff8e3','5 23 3 3 5 8 8 6'],['#c8322b','5 23 3 1'],['#f7b3c4','5 8 8 1 5 11 8 1'],['#fcc100','6 21 1 2 7 5 1 3 10 5 1 3'],['#8a5a34','12 23 4 9']],
    3:[['#fbe3a6','2 19 14 13'],['#e0c47f','15 19 1 13'],['#c8322b','0 17 18 2 2 15 14 2 4 13 10 2 6 11 6 2 8 9 2 2'],['#386CB9','7 24 4 8'],['#9fd8f5','3 22 3 3 12 22 3 3'],['#fcc100','10 28 1 1'],['#8a5a34','13 10 2 4']],
    4:[['#8fc4f0','1 15 16 17'],['#6aa3d6','16 15 1 17'],['#174793','0 13 18 2 7 25 4 7'],['#fcc100','3 8 12 5'],['#0b1f45','10 9 1 3 8 11 2 1 11 9 1 1'],['#fff8e3','3 18 3 3 8 18 3 3 13 18 3 3']],
    5:[['#f1a300','1 12 13 20'],['#c97f2a','13 12 1 20'],['#ffffff','0 9 15 3'],['#e8453c','0 9 2 3 4 9 2 3 8 9 2 3 12 9 2 3'],['#174793','2 5 11 3'],['#fff8e3','3 6 1 1 5 6 1 1 7 6 1 1 9 6 1 1 11 6 1 1'],['#9fd8f5','2 15 6 5'],['#8a5a34','9 21 4 11'],['#3f8f3a','15 17 5 6'],['#2f6f2c','18 19 2 4'],['#7a4a2a','17 23 1 9']],
    6:[['#f4f7fb','2 10 16 22'],['#c9d4e6','17 10 1 22'],['#386CB9','1 8 18 2 8 25 4 7'],['#e8453c','8 12 4 8 6 14 8 4'],['#9fd8f5','3 22 3 3 14 22 3 3 9 26 2 2']],
    7:[['#5a6070','1 4 1 24'],['#386CB9','0 1 4 4'],['#ffffff','1 2 2 2'],['#fcc100','3 16 17 11'],['#f1a300','3 15 17 1 3 25 17 2'],['#9fd8f5','5 18 3 3 9 18 3 3 13 18 3 3'],['#174793','17 18 2 7'],['#0b1f45','5 27 4 4 14 27 4 4'],['#9aa3b5','6 28 2 2 15 28 2 2']],
    8:[['#8a5a34','0 10 3 22 17 10 3 22'],['#3f8f3a','0 5 20 5'],['#fcc100','3 7 2 1 6 7 2 1 9 7 2 1 12 7 2 1 15 7 2 1'],['#9aa3b5','4 21 9 7 11 17 5 6 15 22 1 6'],['#b6bdcc','11 18 2 4'],['#7d8596','5 28 2 4 10 28 2 4'],['#0b1f45','14 19 1 1']],
    9:[['#c8322b','2 15 16 17'],['#a3261f','17 15 1 17'],['#7a2e1c','1 13 18 2 3 11 14 2 5 9 10 2 7 7 6 2'],['#fff8e3','6 22 8 10 8 15 4 4'],['#8a3020','7 23 6 9'],['#fff8e3','7 23 1 1 8 24 1 1 9 25 1 1 10 26 1 1 11 27 1 1 12 28 1 1 12 23 1 1 11 24 1 1 8 27 1 1 7 28 1 1'],['#fcc100','9 16 2 2']],
    10:[['#386CB9','1 24 18 8 3 20 14 4 5 16 10 4 7 12 6 4'],['#174793','12 16 3 4 14 20 3 4 16 24 3 8 10 12 3 4'],['#ffffff','7 12 6 2 6 14 2 1 12 14 1 1'],['#fcc100','14 1 5 5'],['#ffdf01','15 2 3 3'],['#3f8f3a','0 30 20 2']],
    11:[['#3f8f3a','3 4 12 10 1 7 16 6'],['#2f6f2c','10 8 4 4 3 11 3 2'],['#7a4a2a','8 14 2 12'],['#2e95c2','0 26 20 6'],['#9fd8f5','3 27 3 1 12 29 3 1'],['#f1a300','14 22 3 2 16 21 1 1'],['#0b1f45','15 22 1 1']],
    12:[['#729ED9','3 14 14 18'],['#386CB9','0 10 5 22 15 10 5 22 7 6 6 10'],['#386CB9','0 8 1 2 2 8 1 2 4 8 1 2 15 8 1 2 17 8 1 2 19 8 1 2'],['#174793','8 23 4 9 9 22 2 1'],['#fcc100','2 15 1 2 17 15 1 2 9 9 2 2'],['#0b1f45','10 0 1 6'],['#f1a300','11 0 4 3']]
  };
  function rects(list){
    return list.map(function(p){ var a=p[1].split(' ').map(Number), o='';
      for(var i=0;i+3<a.length;i+=4) o+='M'+a[i]+' '+a[i+1]+'h'+a[i+2]+'v'+a[i+3]+'h-'+a[i+2]+'z';
      return '<path fill="'+p[0]+'" d="'+o+'"/>'; }).join('');
  }
  function art(u){ return rects(A[u]||[]); }
  /* clip the building to rows y0..y1 (ground is y = 32) */
  function clip(u,y0,y1){
    return (A[u]||[]).map(function(p){ var a=p[1].split(' ').map(Number), o='';
      for(var i=0;i+3<a.length;i+=4){ var y=Math.max(a[i+1],y0), y2=Math.min(a[i+1]+a[i+3],y1); if(y2>y) o+='M'+a[i]+' '+y+'h'+a[i+2]+'v'+(y2-y)+'h-'+a[i+2]+'z'; }
      return o?'<path fill="'+p[0]+'" d="'+o+'"/>':''; }).join('');
  }
  /* each finished lesson adds one part, from the ground up */
  function cutAt(k,n){ return Math.round(32-32*k/n); }
  function partial(u,frac){ if(!(frac>0)) return ''; if(frac>=1) return art(u); return clip(u,Math.round(32-32*frac),32); }
  function band(u,k,n){ return {y0:cutAt(k,n), y1:cutAt(k-1,n), svg:clip(u,cutAt(k,n),cutAt(k-1,n))}; }
  var PLOT = [['#8a5a34','1 24 18 8'],['#b07d4f','2 25 16 6']];
  var SIGN = [['#6b4226','9 14 2 11 4 5 12 10'],['#e0b77a','5 6 10 8']];
  var SCAF = [['#c99566','0 29 20 3'],['#8a5a34','1 3 1 27 18 3 1 27 1 10 18 1 1 18 18 1']];

  /* explorer avatars: 10 x 10 pixel portraits */
  var AV = [
    {n:'Bạn nhỏ tóc đen', r:[['#729ed9','0 0 10 10'],['#f2c29b','2 3 6 4'],['#2a1a12','2 1 6 1 1 2 8 2 1 4 1 2 8 4 1 2'],['#0b1f45','3 4 1 1 6 4 1 1'],['#c8643c','4 6 2 1'],['#f1a300','1 7 8 3'],['#fff8e3','4 7 2 1']]},
    {n:'Bạn nhỏ thắt nơ', r:[['#f7b3c4','0 0 10 10'],['#f2c29b','2 3 6 4'],['#6b3a1e','2 1 6 1 1 2 8 2 1 4 1 4 8 4 1 4'],['#e8453c','7 0 2 2 4 6 2 1'],['#0b1f45','3 4 1 1 6 4 1 1'],['#386CB9','2 7 6 3']]},
    {n:'Bạn nhỏ đội mũ', r:[['#9fd8f5','0 0 10 10'],['#f2c29b','2 3 6 4'],['#e8453c','2 1 6 2 5 3 4 1'],['#2a1a12','1 3 1 2'],['#0b1f45','3 4 1 1 6 4 1 1'],['#c8643c','4 6 2 1'],['#3f8f3a','1 7 8 3']]},
    {n:'Bạn nhỏ tóc vàng', r:[['#dbe6f6','0 0 10 10'],['#f2c29b','2 3 6 4'],['#e8b923','2 1 6 1 1 2 8 2 1 4 1 3 8 4 1 3 0 4 1 3 9 4 1 3'],['#0b1f45','3 4 1 1 6 4 1 1'],['#e8453c','4 6 2 1'],['#c8322b','2 7 6 3']]},
    {n:'Mèo cam', r:[['#fff1c9','0 0 10 10'],['#f1a300','1 1 2 2 7 1 2 2 1 3 8 5 2 8 6 2'],['#f7b3c4','2 2 1 1 7 2 1 1'],['#c97f2a','4 3 2 1 1 5 1 1 8 5 1 1'],['#0b1f45','3 4 1 1 6 4 1 1'],['#e8453c','4 6 2 1']]},
    {n:'Cún nâu', r:[['#c9e8b5','0 0 10 10'],['#c99566','2 2 6 6'],['#7a4a2a','1 2 2 4 7 2 2 4 2 8 6 2'],['#fff1d6','3 6 4 2'],['#0b1f45','3 4 1 1 6 4 1 1 4 6 2 1'],['#386CB9','2 8 6 1']]},
    {n:'Cáo nhỏ', r:[['#dff1ff','0 0 10 10'],['#e8742c','1 1 2 2 7 1 2 2 1 3 8 4 2 7 6 1 3 8 4 1'],['#0b1f45','1 1 1 1 8 1 1 1 3 4 1 1 6 4 1 1 4 8 2 1'],['#fff8e3','1 5 2 2 7 5 2 2 4 7 2 1']]},
    {n:'Gấu nâu', r:[['#fde3c0','0 0 10 10'],['#7a4a2a','1 1 2 2 7 1 2 2'],['#8a5a34','1 2 8 6 2 8 6 2'],['#c99566','2 2 1 1 7 2 1 1'],['#e0b77a','3 5 4 3'],['#2a1a12','3 4 1 1 6 4 1 1 4 5 2 1 4 7 2 1']]}
  ];
  window.CANOPY = {
    demoOpenAll:false, /* true = every station open (demo); false = stations unlock in order */
    site:!!window.CANOPY_SITE, /* one website (GitHub Pages): map and stations share progress */
    U:U, lessons:lessons, art:art, partial:partial, band:band, rects:rects, PLOT:PLOT, SIGN:SIGN, SCAF:SCAF,
    /* compact hash formats shared by the map and the station pages */
    reportStr:function(map){ return Object.keys(map).map(function(u){ return 'r'+u+'x'+map[u]; }).join('-'); },
    parseReport:function(h){ var out={}, re=/r(\d{1,2})x([01]{1,9})/g, m; while((m=re.exec(h))) out[+m[1]]=m[2]; return out; },
    goStr:function(u,l,t){ return 'go-u'+u+(l?'-l'+l:'')+(t?'-t':''); },
    parseGo:function(h){ var m=/go-u(\d{1,2})(?:-l(\d))?(-t)?/.exec(h||''); return m?{u:+m[1],l:m[2]?+m[2]:0,t:!!m[3]}:null; },
    /* lesson-card companion pictures (station pages carry these files) */
    whoImg:{leo:'img/c_leo.webp',bunny:'img/c_bunny.webp',buffy:'img/c_buffy.webp',xiaobao:'img/c_xiaobao.webp'},
    AV:AV, avatar:function(i){ var a=AV[i]||AV[0]; return '<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">'+rects(a.r)+'</svg>'; },
    CITY_KEY:'canopy_city_v2',
    readCity:function(){ try{ var o=JSON.parse(localStorage.getItem('canopy_city_v2')||'null'); if(o&&typeof o==='object') return o; }catch(e){} return {p:{},a:{},name:'',teacher:false,av:0}; },
    writeCity:function(o){ try{ localStorage.setItem('canopy_city_v2',JSON.stringify(o)); }catch(e){} }
  };
})();
