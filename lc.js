/* Lingo Cub · Canopy station layer: station home (hero, lesson cards, passport), lesson view,
   lessons/units unlock in order, step-by-step speaking practice, report back to the city map */
(function(){
  'use strict';
  var CFG = window.LC_CFG || {}, C = window.CANOPY;
  if(!C) return;
  function el(id){ return document.getElementById(id); }
  function esc(s){ return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function g(name){ try{ return (0,eval)(name); }catch(e){ return undefined; } }
  function gset(name){ try{ (0,eval)(name+'=window.__lcv'); }catch(e){} }
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }

  /* ---------- progress, read from the page's own record ---------- */
  function pkey(u,n,id){ return u===1 ? (n===1 ? id : 'L'+n+'_'+id) : 'U'+u+'L'+n+'_'+id; }
  function unitsHere(){ var UNITS=g('UNITS')||{}; return Object.keys(UNITS).map(Number).sort(function(a,b){return a-b;}); }
  function lessonNums(u){ var UNITS=g('UNITS'); return UNITS&&UNITS[u] ? Object.keys(UNITS[u].lessons).map(Number).sort(function(a,b){return a-b;}) : []; }
  function acts(u,n){ var UNITS=g('UNITS'); var L=UNITS&&UNITS[u]&&UNITS[u].lessons[n]; return (L&&L.acts)||[]; }
  function nDone(u,n){ var P=g('PROG')||{}; return acts(u,n).filter(function(a){ return P[pkey(u,n,a)]; }).length; }
  function lessonDone(u,n){ var a=acts(u,n); return a.length>0 && nDone(u,n)===a.length; }
  function unitDone(u){ var ns=lessonNums(u); return ns.length>0 && ns.every(function(n){ return lessonDone(u,n); }); }
  var TGT = C.site ? '' : ' target="_blank" rel="noopener"';
  function teacher(){ return ls('lc_teacher')==='1' || (C.site && !!C.readCity().teacher); }
  function cityDone(u){ if(!C.site) return false; var b=(C.readCity().p||{})[u]; return !!b && b.indexOf('0')<0; }
  function syncCity(){ if(!C.site) return; var o=C.readCity(); o.p=o.p||{}; o.a=o.a||{};
    unitsHere().forEach(function(u){ o.p[u]=bits(u); var d=0,t=0; lessonNums(u).forEach(function(n){ d+=nDone(u,n); t+=acts(u,n).length; }); o.a[u]=[d,t]; });
    C.writeCity(o); }
  function openSet(){ try{ return JSON.parse(ls('lc_open')||'[]'); }catch(e){ return []; } }
  function unitOpen(u){ if(C.demoOpenAll||teacher()||u===1||cityDone(u-1)) return true; if(openSet().indexOf(u)>=0) return true; var UNITS=g('UNITS'); return !!(UNITS&&UNITS[u-1]&&unitDone(u-1)); }
  function lessonOpen(u,n){ if(!unitOpen(u)) return false; if(teacher()||C.demoOpenAll) return true; var ns=lessonNums(u), i=ns.indexOf(n); return i===0 || (i>0 && lessonDone(u,ns[i-1])); }
  function bits(u){ return lessonNums(u).map(function(n){ return lessonDone(u,n)?'1':'0'; }).join(''); }
  function hubHref(){ if(!CFG.hub) return ''; var m={}; unitsHere().forEach(function(u){ m[u]=bits(u); }); return CFG.hub+'#'+C.reportStr(m); }
  function info(u){ return C.U[u] || {en:'Unit '+u,zh:'',py:'',b:'',q:'',n:lessonNums(u).length}; }
  function lmeta(u,n){ return C.lessons(u)[n-1] || {n:n,vi:'Bài '+n,zh:'',py:'',who:'leo'}; }
  function topic(u,n){ var UNITS=g('UNITS'); var L=UNITS&&UNITS[u]&&UNITS[u].lessons[n]; return L?L.title:''; }

  /* ---------- small UI parts ---------- */
  function chIcon(m,size){ return m.abc ? '<span class="lc-abc" aria-hidden="true"><i>A</i><i>B</i><i>C</i></span>' :
    '<span class="lc-ch" aria-hidden="true"><img src="'+C.whoImg[m.who]+'" alt=""></span>'; }
  function figure(u,frac){
    var body = frac>=1 ? C.art(u) : C.partial(u,frac)+C.rects(C.SCAF);
    return '<svg viewBox="-8 -3 36 38" shape-rendering="crispEdges" role="img" aria-label="Bản vẽ công trình: '+esc(info(u).b)+'"><rect x="-8" y="-3" width="36" height="38" fill="#dff1ff"/><rect x="-8" y="32" width="36" height="3" fill="#6cc04a"/><path fill="#5aa83c" d="M-6 33h1v1h-1z M24 33h1v1h-1z M3 34h1v1h-1z"/>'+body+'</svg>';
  }
  function temHTML(u){
    var ns=lessonNums(u), n=ns.length;
    return ns.map(function(L,i){ var b=C.band(u,i+1,n), done=lessonDone(u,L), h=Math.max(1,b.y1-b.y0);
      return '<div class="lc-tem'+(done?' on':'')+'" style="--r:'+[-5,4,-3,6,-4][i%5]+'deg" title="Bài '+L+(done?' · đã xong':' · chưa xong')+'"><svg viewBox="-1 '+(b.y0-1)+' 22 '+(h+2)+'" preserveAspectRatio="xMidYMid meet" shape-rendering="crispEdges" aria-hidden="true">'+b.svg+'</svg><span class="pxl">BÀI '+L+'</span></div>'; }).join('');
  }
  var LOCK='<svg viewBox="0 0 7 8" width="18" height="20" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M2 0h3v1h-3z M1 1h1v3h-1z M5 1h1v3h-1z M0 4h7v4h-7z"/></svg>';

  var VIEW='station';
  function buildShell(){
    if(el('lcTop')) return;
    var main=document.querySelector('main.wrap'); if(!main) return;
    var top=document.createElement('div'); top.id='lcTop'; top.className='lc-top';
    var st=document.createElement('section'); st.id='lcStation'; st.className='lc-station';
    var lock=document.createElement('section'); lock.id='lcLock'; lock.className='box lc-lock'; lock.hidden=true;
    var bar=document.createElement('div'); bar.id='lcBar'; bar.className='box lc-bar';
    bar.innerHTML='<div class="lc-bar-l" id="lcBarL"></div><div class="lc-bar-r" id="lcBarR"></div><div class="lc-bar-b" id="lcBarB"></div>';
    main.insertBefore(top,main.firstChild); top.after(lock); lock.after(st); st.after(bar);
    /* keep the app's own music + activity counter, now in the lesson bar */
    var r=bar.querySelector('#lcBarR'); ['starBox','musicBtn'].forEach(function(id){ var x=el(id); if(x) r.appendChild(x); });
    var rs=el('resetAll'); if(rs) rs.addEventListener('click',function(){ setTimeout(refresh,60); });
    document.body.classList.add('lc-ready');
  }

  function paintTop(){
    var UN=g('UN'), href=hubHref(), I=info(UN), ns=lessonNums(UN), d=ns.filter(function(n){return lessonDone(UN,n);}).length;
    var hub = href ? '<a class="btn lc-map" href="'+esc(href)+'"'+TGT+'><span aria-hidden="true">◀</span> Bản đồ</a>' : '';
    el('lcTop').innerHTML='<a class="lc-logo" '+(href?'href="'+esc(href)+'"'+TGT+'':'')+' aria-label="Lingo Cub · về bản đồ"><img src="img/lingocub.webp" alt="Lingo Cub"></a>'+
      hub+(VIEW==='lesson'?'<button type="button" class="btn lc-tostation"><span aria-hidden="true">◀</span> Trạm '+UN+'</button>':'')+
      '<span class="lc-topnote">Trạm '+UN+' · '+esc(I.en)+' · đã xong '+d+'/'+ns.length+' bài</span>'+
      (teacher()?'<span class="lc-tchip">Chế độ giáo viên</span>':'');
    var b=el('lcTop').querySelector('.lc-tostation'); if(b) b.onclick=function(){ showStation(); };
  }

  function paintStation(){
    var UN=g('UN'), I=info(UN), ns=lessonNums(UN), dn=ns.filter(function(n){return lessonDone(UN,n);}).length, frac=ns.length?dn/ns.length:0;
    var cards=ns.map(function(n){
      var m=lmeta(UN,n), done=lessonDone(UN,n), op=lessonOpen(UN,n), a=acts(UN,n).length, k=nDone(UN,n);
      var firstTodo=ns.filter(function(x){return !lessonDone(UN,x);})[0];
      var cls=done?'done':(op&&n===firstTodo?'cur':(op?'open':'lock'));
      var btn = done ? '<button type="button" class="btn" data-go="'+n+'">Học lại</button>' :
        op ? '<button type="button" class="btn go" data-go="'+n+'">'+(k?'Học tiếp ▶':'Bắt đầu ▶')+'</button>' :
        '<span class="lc-locknote">'+LOCK+' Học xong Bài '+(n-1)+' để mở</span>';
      return '<li class="lc-card '+cls+'">'+
        '<div class="lc-card-h">'+chIcon(m)+'<span class="pxl">BÀI '+n+'</span>'+(done?'<span class="lc-okb">✓ Xong</span>':'')+'</div>'+
        '<b class="lc-card-t">'+esc(m.vi)+'</b>'+
        '<span class="lc-card-s">'+esc(topic(UN,n))+'</span>'+
        '<div class="lc-meter" role="img" aria-label="'+k+' trên '+a+' hoạt động"><span style="width:'+(a?Math.round(k/a*100):0)+'%"></span></div>'+
        '<span class="lc-card-c">★ '+k+'/'+a+' hoạt động</span>'+(k&&!done?'<span class="lc-card-miss">Còn thiếu: '+esc(missTextFor(UN,n))+'</span>':'')+btn+'</li>';
    }).join('');
    var left=ns.length-dn;
    el('lcStation').innerHTML=
      '<section class="box lc-hero" aria-labelledby="lcHeroT"><div class="lc-hero-t"><span class="pxl lc-tram">TRẠM '+UN+'</span><h1 id="lcHeroT">'+esc(I.en)+'</h1>'+
        '<div class="lc-uzh"><span class="zh">'+esc(I.zh)+'</span><span class="py">'+esc(I.py)+'</span></div>'+
        '<span class="lc-q">'+esc(I.q)+'</span>'+
        '<span class="lc-d">'+(dn===ns.length?'Con đã xong cả trạm! '+esc(I.b)+' đã mọc lên trên bản đồ của con.':'Xong '+ns.length+' bài là '+esc(I.b)+' mọc lên trên bản đồ của con.')+'</span></div>'+
        '<figure class="lc-fig">'+figure(UN,frac)+'<figcaption>Bản vẽ công trình của trạm '+UN+'</figcaption></figure></section>'+
      '<section class="lc-ls" aria-labelledby="lcLsT"><h2 id="lcLsT">Các bài của trạm</h2><ol class="lc-cards">'+cards+'</ol></section>'+
      '<div class="lc-row">'+
        '<section class="box lc-pass" aria-labelledby="lcPassT"><h2 id="lcPassT">Tem của trạm '+UN+'</h2><div class="lc-tems">'+temHTML(UN)+'</div><span class="lc-cap">Mỗi bài học xong được 1 tem, là 1 bộ phận của '+esc(I.b)+' · '+dn+'/'+ns.length+' tem</span></section>'+
        '<section class="box lc-build" aria-labelledby="lcBuildT"><h2 id="lcBuildT">'+(left?'Đang xây ':'Đã xây xong ')+esc(I.b)+'</h2><div class="lc-segs" style="grid-template-columns:repeat('+ns.length+',minmax(0,1fr))">'+ns.map(function(n){return '<span class="'+(lessonDone(UN,n)?'on':'')+'"></span>';}).join('')+'</div>'+
          '<p>'+(left?'Còn '+left+' bài nữa là công trình mọc lên trên bản đồ.':'Bấm “Bản đồ” để xem công trình mới trong thành phố của con!')+'</p></section>'+
      '</div>';
    el('lcStation').querySelectorAll('[data-go]').forEach(function(b){ b.onclick=function(){ openLesson(+b.dataset.go); }; });
  }

  function paintBar(){
    var UN=g('UN'), LN=g('LN'), m=lmeta(UN,LN), I=info(UN), ns=lessonNums(UN), dn=ns.filter(function(n){return lessonDone(UN,n);}).length;
    el('lcBarB').innerHTML='<figure class="lc-bar-fig">'+figure(UN,ns.length?dn/ns.length:0)+'</figure>'+
      '<div class="lc-bar-tem"><span class="lc-bar-cap"><b>'+(dn===ns.length?'Đã xây xong ':'Đang xây ')+esc(I.b)+'</b> · '+dn+'/'+ns.length+' tem</span><div class="lc-tems">'+temHTML(UN)+'</div></div>';
    setTimeout(paintMiss,0);
    el('lcBarL').innerHTML=chIcon(m)+'<div class="lc-bt"><span class="pxl">TRẠM '+UN+' · BÀI '+LN+'</span><b>'+esc(m.vi)+'</b><span class="lc-bs">'+esc(topic(UN,LN))+(m.zh?' · <span class="zh">'+esc(m.zh)+'</span>':'')+'</span></div>';
  }
  function paintLock(){
    var UN=g('UN');
    el('lcLock').innerHTML='<div class="lc-lock-ic">'+LOCK.replace('width="18" height="20"','width="42" height="48"')+'</div><span class="pxl lc-tram">TRẠM '+UN+'</span><h1>Trạm này chưa mở</h1>'+
      '<p>Con học xong Trạm '+(UN-1)+' trước, rồi mở trạm này từ <b>Bản đồ</b> nhé.</p>'+(CFG.hub?'<a class="btn go" href="'+esc(hubHref())+'"'+TGT+'>◀ Về bản đồ</a>':'');
  }

  function setView(v){
    VIEW=v; var body=document.body;
    body.classList.toggle('lc-v-station',v==='station'); body.classList.toggle('lc-v-lesson',v==='lesson'); body.classList.toggle('lc-v-lock',v==='lock');
    body.classList.toggle('lc-teacher',teacher());
    el('lcLock').hidden=v!=='lock';
    paintTop();
    if(v==='station') paintStation(); if(v==='lesson') paintBar(); if(v==='lock') paintLock();
  }
  function showStation(){ try{ var vv=el('vid'); if(vv) vv.pause(); }catch(e){} setView(unitOpen(g('UN'))?'station':'lock'); window.scrollTo(0,0); }
  function openLesson(n){
    var UN=g('UN'); if(!lessonOpen(UN,n)) return;
    var b=document.querySelector('#lessonNav button[data-lesson="'+n+'"]');
    if(b) b.click();
    setView('lesson'); window.scrollTo(0,0);
  }
  function switchUnit(u){
    if(u===g('UN')) return;
    var b=document.querySelector('#unitNav button[data-unit="'+u+'"]'); if(b) b.click();
  }
  function refresh(){ syncCity(); if(VIEW==='station') paintStation(); if(VIEW==='lesson') paintBar(); paintTop(); }

  /* ---------- celebrations ---------- */
  function modal(html){
    var m=document.createElement('div'); m.className='lc-modal'; m.setAttribute('role','dialog'); m.setAttribute('aria-modal','true');
    m.innerHTML='<div class="box lc-modal-b">'+html+'</div>'; document.body.appendChild(m);
    var f=m.querySelector('button,a'); if(f) f.focus();
    return m;
  }
  function celebrate(u,n){
    var ns=lessonNums(u), nx=ns[ns.indexOf(n)+1], m=lmeta(u,n), I=info(u);
    try{ var c=g('confetti'); if(typeof c==='function') c(40); }catch(e){}
    if(unitDone(u)){
      var nextHere=unitsHere().indexOf(u+1)>=0;
      var md=modal('<span class="pxl lc-tram">TRẠM '+u+' · HOÀN THÀNH</span><div class="lc-modal-fig">'+figure(u,1)+'</div>'+
        '<h2>'+esc(I.b)+' đã xây xong!</h2><p>Con đã học hết '+ns.length+' bài của trạm '+u+'. Bấm <b>Về bản đồ</b> để xem công trình mọc lên và mở trạm '+(u<12?u+1:'')+(u<12?'':'… mà con đã đi hết thành phố rồi!')+'.</p>'+
        '<div class="lc-row-b">'+(CFG.hub?'<a class="btn go" href="'+esc(hubHref())+'"'+TGT+'>Về bản đồ ▶</a>':'')+
        (nextHere?'<button type="button" class="btn sun" data-next="1">Sang Trạm '+(u+1)+' ▶</button>':'')+
        '<button type="button" class="btn" data-x="1">Ở lại trạm</button></div>');
      md.querySelector('[data-x]').onclick=function(){ md.remove(); showStation(); };
      var nb=md.querySelector('[data-next]'); if(nb) nb.onclick=function(){ md.remove(); switchUnit(u+1); showStation(); };
      var ha=md.querySelector('a'); if(ha) ha.addEventListener('click',function(){ setTimeout(function(){ md.remove(); showStation(); },200); });
      return;
    }
    var nm=nx?lmeta(u,nx):null;
    var md2=modal('<div class="lc-modal-stamp">'+(m.abc?'<span class="lc-abc" aria-hidden="true"><i>A</i><i>B</i><i>C</i></span>':'<img src="'+C.whoImg[m.who]+'" alt="">')+'<span class="pxl">BÀI '+n+'</span></div>'+
      '<h2>Con đã xong Bài '+n+' · '+esc(m.vi)+'!</h2><p>Con được thêm 1 tem vào hộ chiếu trạm '+u+'.'+(nm?' <b>Bài '+nx+' · '+esc(nm.vi)+'</b> đã mở khoá.':'')+'</p>'+
      '<p class="lc-modal-note">Một phần '+esc(I.b)+' vừa được xây thêm. Bấm <b>Xem trên bản đồ</b> để thấy nhé!</p>'+
      '<div class="lc-row-b">'+(nm?'<button type="button" class="btn go" data-l="'+nx+'">Học Bài '+nx+' ▶</button>':'')+(CFG.hub?'<a class="btn sun" href="'+esc(hubHref())+'"'+TGT+'>Xem trên bản đồ</a>':'')+'<button type="button" class="btn" data-x="1">Về trạm '+u+'</button></div>');
    md2.querySelector('[data-x]').onclick=function(){ md2.remove(); showStation(); };
    var lb=md2.querySelector('[data-l]'); if(lb) lb.onclick=function(){ md2.remove(); openLesson(+lb.dataset.l); };
  }

  /* ---------- speaking practice: one step per screen ---------- */
  var WZ=[];
  function practicePanels(root){
    return [].slice.call(root.querySelectorAll('.panel')).filter(function(p){
      var steps=[].slice.call(p.children).filter(function(c){return c.classList.contains('md-step');});
      if(steps.length<2) return false;
      var last=steps[steps.length-1];
      return !!last.querySelector('video.myvid, input[type=file][accept*="video"]');
    });
  }
  function stepTitle(s){ var h=s.querySelector('h4'); if(!h) return ''; var c=h.cloneNode(true); var sn=c.querySelector('.lc-sn'); if(sn) sn.remove(); return c.textContent.replace(/\s+/g,' ').trim().replace(/^bước\s*\d+\s*[·:.-]?\s*/i,''); }
  function hasBadge(h){ return [].some.call(h.children,function(x){ return /^\s*bước\s*\d/i.test(x.textContent); }); }

  function buildWizard(p){
    if(p._lc && p.contains(p._lc.nav)) return p._lc;
    var kids=[].slice.call(p.children), steps=[], cur=-1;
    kids.forEach(function(c){
      if(/\blc-/.test(c.className)) return;
      if(c.classList.contains('md-step')){ steps.push({el:c,extra:[]}); cur=steps.length-1; }
      else if(cur>=0){ c.classList.add('lc-extra'); steps[cur].extra.push(c); }
    });
    p.classList.add('lc-wiz');
    var W={p:p,steps:steps,i:0,seen:{0:true},ready:{}};
    steps.forEach(function(s,k){ var h=s.el.querySelector('h4'); if(h && !h.querySelector('.lc-sn') && !hasBadge(h)){ var sp=document.createElement('span'); sp.className='lc-sn'; sp.textContent='BƯỚC '+(k+1); h.prepend(sp); } });
    var ol=document.createElement('ol'); ol.className='lc-steps'; ol.setAttribute('aria-label','Các bước');
    ol.innerHTML=steps.map(function(s,k){ return '<li><button type="button" data-k="'+k+'"><span class="n">'+(k+1)+'</span><span class="t">'+esc(stepTitle(s.el))+'</span></button></li>'; }).join('');
    p.insertBefore(ol,steps[0].el);
    var nav=document.createElement('div'); nav.className='lc-nav';
    nav.innerHTML='<button type="button" class="btn lc-back">◀ Quay lại</button>'+
      '<div class="lc-tip" role="status"><img src="img/xiaobao.png" alt=""><span></span></div>'+
      '<span class="lc-pos"></span>'+
      '<button type="button" class="btn lc-next">Tiếp ▶</button>';
    p.appendChild(nav);
    W.ol=ol; W.nav=nav;
    ol.addEventListener('click',function(e){ var b=e.target.closest('button[data-k]'); if(!b||b.disabled) return; go(W,+b.dataset.k); });
    nav.querySelector('.lc-back').onclick=function(){ go(W,W.i-1); };
    nav.querySelector('.lc-next').onclick=function(){ go(W,W.i+1); };
    var mark=function(e){ if(e.target.closest('.lc-nav,.lc-steps,.lc-submit,.lc-cam')) return; var s=steps[W.i]; if(!s) return;
      if(s.el.contains(e.target) || s.extra.some(function(x){return x.contains(e.target);})) setReady(W,W.i); };
    ['click','change','input','drop'].forEach(function(t){ p.addEventListener(t,mark,true); });
    videoStep(W,steps[steps.length-1].el);
    p._lc=W; WZ.push(W);
    show(W);
    return W;
  }
  function setReady(W,k){ if(k>=W.steps.length-1) return; W.ready[k]=true; if(k===W.i) paintNav(W); }
  function go(W,k){ if(k<0||k>=W.steps.length) return; W.i=k; W.seen[k]=true; show(W);
    var top=W.ol.getBoundingClientRect().top; if(top<0||top>window.innerHeight*.6) W.ol.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(function(){ try{ window.dispatchEvent(new Event('resize')); }catch(e){} },30); }
  function show(W){
    W.steps.forEach(function(s,k){ var on=k===W.i; s.el.classList.toggle('lc-on',on); s.extra.forEach(function(x){ x.classList.toggle('lc-on',on); }); });
    paintNav(W);
  }
  function paintNav(W){
    var n=W.steps.length, k=W.i;
    W.ol.querySelectorAll('li').forEach(function(li,j){ li.className=(j===k?'cur':'')+(W.seen[j]&&j!==k?' seen':''); var b=li.querySelector('button'); b.disabled=!W.seen[j]&&j!==k+1; b.setAttribute('aria-current',j===k?'step':'false'); });
    var back=W.nav.querySelector('.lc-back'), next=W.nav.querySelector('.lc-next'), tip=W.nav.querySelector('.lc-tip'), pos=W.nav.querySelector('.lc-pos');
    back.hidden = k===0; next.hidden = k===n-1;
    pos.textContent='BƯỚC '+(k+1)+'/'+n;
    if(k<n-1){ next.textContent = (k+1===n-1 ? 'Tiếp: quay video ▶' : 'Tiếp: bước '+(k+2)+' ▶');
      var r=!!W.ready[k]; next.classList.toggle('ready',r); tip.classList.toggle('on',r);
      tip.querySelector('span').textContent = r ? 'Xong bước '+(k+1)+' rồi! Bấm “'+next.textContent.replace(' ▶','')+'” nhé.' : '';
    } else { tip.classList.remove('on'); }
  }

  /* last step: camera recorder + review + submit */
  function videoStep(W,step){
    var vid=step.querySelector('video.myvid'), file=step.querySelector('input[type=file]');
    if(!vid) return;
    var cam=document.createElement('div'); cam.className='lc-cam';
    cam.innerHTML='<div class="lc-camrow"><button type="button" class="btn sun lc-camgo">● Bật camera và quay</button><button type="button" class="btn lc-camstop" hidden>■ Dừng quay</button></div>'+
      '<video class="lc-live" muted playsinline hidden></video><div class="msg lc-cammsg" hidden></div>';
    var row=file ? file.closest('.row') : null; (row||vid).after(cam);
    var sub=document.createElement('div'); sub.className='lc-submit'; sub.hidden=true; vid.after(sub);
    var st={blob:null,name:''}; W.vs=st;
    var live=cam.querySelector('.lc-live'), go=cam.querySelector('.lc-camgo'), stop=cam.querySelector('.lc-camstop'), msg=cam.querySelector('.lc-cammsg');
    var rec=null, stream=null, parts=[];
    function say(t){ msg.hidden=!t; msg.textContent=t||''; }
    go.onclick=async function(){
      say('');
      if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder){ say('Máy này chưa bật được camera ở đây. Con bấm “Chọn hoặc quay video” để quay bằng điện thoại nhé.'); return; }
      try{ stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:true}); }
      catch(e){ say('Chưa mở được camera. Con bấm “Chọn hoặc quay video” để quay bằng điện thoại, hoặc nhờ ba mẹ cho phép dùng camera nhé.'); return; }
      live.srcObject=stream; live.hidden=false; try{ await live.play(); }catch(e){}
      var types=['video/webm;codecs=vp9,opus','video/webm','video/mp4']; var mt=types.find(function(t){ try{return MediaRecorder.isTypeSupported(t);}catch(e){return false;} })||'';
      parts=[]; rec=new MediaRecorder(stream, mt?{mimeType:mt}:undefined);
      rec.ondataavailable=function(e){ if(e.data&&e.data.size) parts.push(e.data); };
      rec.onstop=function(){ var type=rec.mimeType||'video/webm'; st.blob=new Blob(parts,{type:type}); st.name='canopy-video.'+(type.indexOf('mp4')>=0?'mp4':'webm');
        stream.getTracks().forEach(function(t){t.stop();}); live.srcObject=null; live.hidden=true;
        vid.src=URL.createObjectURL(st.blob); vid.hidden=false; review(); };
      rec.start(); go.hidden=true; stop.hidden=false; say('Đang quay… Con đọc kịch bản thật to nhé!');
    };
    stop.onclick=function(){ if(rec&&rec.state!=='inactive') rec.stop(); stop.hidden=true; go.hidden=false; say(''); };
    if(file) file.addEventListener('change',function(){ var f=file.files&&file.files[0]; if(f){ st.blob=f; st.name=f.name; } });
    new MutationObserver(function(){ if(!vid.hidden && vid.getAttribute('src')) review(); }).observe(vid,{attributes:true,attributeFilter:['hidden','src']});
    function review(){
      if(sub.dataset.state==='done' && st.doneSrc===vid.src) return;
      sub.dataset.state='review'; sub.hidden=false;
      sub.innerHTML='<h5>Con xem lại video của mình nhé!</h5><div>Thấy ổn rồi thì bấm <b>Nộp bài</b>. Chưa ổn thì bấm <b>Quay lại video</b>.</div>'+
        '<div class="row"><button type="button" class="btn lc-redo">↺ Quay lại video</button><button type="button" class="btn lc-send">✔ Nộp bài</button></div>';
      sub.querySelector('.lc-redo').onclick=redo;
      sub.querySelector('.lc-send').onclick=submit;
    }
    function redo(){ try{ vid.pause(); }catch(e){} vid.removeAttribute('src'); vid.load(); vid.hidden=true; if(file) file.value=''; st.blob=null; sub.hidden=true; sub.dataset.state=''; go.focus(); }
    function submit(){
      var UN=g('UN'), LN=g('LN'), L=g('L'), sec=W.p.id.replace(/^ap-/,'');
      try{ if(L && L.acts && L.acts.indexOf(sec)>=0 && typeof window.markDone==='function') window.markDone(sec); else if(typeof g('markDone')==='function' && L && L.acts && L.acts.indexOf(sec)>=0) g('markDone')(sec); }catch(e){}
      try{ var k='lc_submit'; var a=JSON.parse(localStorage.getItem(k)||'[]'); a.push({unit:UN,lesson:LN,sec:sec,at:new Date().toISOString()}); localStorage.setItem(k,JSON.stringify(a)); }catch(e){}
      st.doneSrc=vid.src; sub.dataset.state='done';
      sub.innerHTML='<div class="lc-done"><div class="lc-stamp">ĐÃ<br>NỘP<br>BÀI</div><div><p><b>Con đã nộp bài Unit '+UN+' · Bài '+LN+'. Giỏi quá!</b></p><p>Bấm “Lưu video” để lưu về máy và gửi cho cô qua nhóm lớp nhé.</p>'+
        '<div class="row"><button type="button" class="btn sun lc-save">⬇ Lưu video</button><button type="button" class="btn lc-again">↺ Quay video khác</button></div><div class="msg lc-savemsg" hidden></div></div></div>';
      sub.querySelector('.lc-save').onclick=save; sub.querySelector('.lc-again').onclick=redo;
      try{ var c=g('confetti'); if(typeof c==='function') c(30); }catch(e){}
    }
    async function save(){
      var m=sub.querySelector('.lc-savemsg'); m.hidden=false;
      if(!st.blob){ m.textContent='Con bấm dấu ⋮ ở góc video để tải xuống nhé.'; return; }
      var name='canopy-u'+g('UN')+'-bai'+g('LN')+'-'+new Date().toISOString().slice(0,10)+'.'+((st.name.split('.').pop())||'webm');
      var d=null; try{ d=window.claude&&window.claude.use?await window.claude.use('downloads'):null; }catch(e){}
      if(d){ try{ await d.save({filename:name,data:st.blob}); m.textContent='Đã lưu video. Gửi cho cô qua nhóm lớp nhé!'; return; }catch(e){ if(e&&e.code==='declined'){ m.textContent='Con chưa lưu video. Muốn lưu thì bấm lại “Lưu video”.'; return; } } }
      try{ var a=document.createElement('a'); a.href=URL.createObjectURL(st.blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); m.textContent='Đang tải video xuống máy.'; }
      catch(e){ m.textContent='Con bấm dấu ⋮ ở góc video để tải xuống nhé.'; }
    }
  }


  function wizardize(){
    document.querySelectorAll('.secpanel').forEach(function(sp){ if(sp.hidden) return; practicePanels(sp).forEach(buildWizard); });
  }
  function decorateLesson(){
    var LN=g('LN'), UN=g('UN'), m=lmeta(UN,LN);
    var h=el('lsTitle'); if(h) h.textContent='Bài '+LN+' · '+m.vi;
    var st=el('secTiles'); if(st) [].forEach.call(st.querySelectorAll('button .nm'),function(x,i){ x.textContent=(i+1)+'. '+x.textContent.replace(/^\d+\.\s*/,''); });
    document.title='Canopy · Trạm '+UN+' · '+info(UN).en;
  }

  /* ===================== 17/11: game music, fireworks, dub tabs, recorder, "còn thiếu" ===================== */
  var FLAG={
    en:'<svg class="lc-flag" viewBox="0 0 60 30" aria-hidden="true"><clipPath id="lcUk"><path d="M0 0v30h60V0z"/></clipPath><g clip-path="url(#lcUk)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" stroke-width="2.4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g></svg>',
    zh:'<svg class="lc-flag" viewBox="0 0 30 20" aria-hidden="true"><path fill="#EE1C25" d="M0 0h30v20H0z"/><g fill="#FFFF00"><path d="M5 2l1.18 3.62H10L6.9 7.86 8.09 11.5 5 9.26 1.91 11.5 3.1 7.86 0 5.62h3.82z"/><circle cx="10" cy="2" r=".9"/><circle cx="12" cy="4" r=".9"/><circle cx="12" cy="7" r=".9"/><circle cx="10" cy="9" r=".9"/></g></svg>'
  };
  function curL(){ return g('L')||{}; }
  function stripTags(s){ return String(s||'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim(); }
  function dubWord(L){ L=L||curL(); return L.dub&&L.dub.kara ? 'Hát karaoke' : 'Lồng tiếng'; }
  function lessonObj(u,n){ var U=g('UNITS'); return (U&&U[u]&&U[u].lessons[n])||curL(); }
  function actLabel(a,L){
    L=L||curL();
    if(a==='dub_en') return dubWord(L)+' - tiếng Anh';
    if(a==='dub_zh') return dubWord(L)+' - tiếng Trung';
    var v=(L.vocab||[]).concat(L.hanzi||[]).filter(function(x){ return x.act===a; })[0]; if(v) return stripTags(v.nm||v.h||a);
    var s=(L.sections||[]).filter(function(x){ return x.sec===a; })[0]; if(s) return stripTags(s.nm);
    return a;
  }
  function missingActs(u,n){ var P=g('PROG')||{}; return acts(u,n).filter(function(a){ return !P[pkey(u,n,a)]; }); }
  function goAct(a){
    var L=curL(), tiles=el('secTiles');
    function sec(s){ var b=tiles&&tiles.querySelector('button[data-sec="'+s+'"]'); if(b) b.click(); else { var f=g('openSec'); if(typeof f==='function') f(s); } }
    if(a==='dub_en'||a==='dub_zh'){ sec('dub'); var sb=document.querySelector('#sec-dub .seg button[data-v="'+a.slice(4)+'"]'); if(sb) sb.click(); var p=el('sec-dub'); if(p) p.scrollIntoView({behavior:'smooth',block:'start'}); return; }
    var inV=(L.vocab||[]).some(function(x){return x.act===a;}), inH=(L.hanzi||[]).some(function(x){return x.act===a;});
    if(inV||inH){ sec(inV?'vocab':'hanzi'); var t=document.querySelector('.act[data-act="'+a+'"]'); if(t){ t.click(); t.scrollIntoView({behavior:'smooth',block:'center'}); } return; }
    sec(a); var sp=el('sec-'+a); if(sp) sp.scrollIntoView({behavior:'smooth',block:'start'});
  }
  /* reminder of the parts still missing in this lesson */
  function paintMiss(){
    var bar=el('lcBar'); if(!bar) return;
    var box=el('lcMiss'); if(!box){ box=document.createElement('div'); box.id='lcMiss'; box.className='lc-miss'; var b=el('lcBarB'); if(b) bar.insertBefore(box,b); else bar.appendChild(box); }
    var UN=g('UN'), LN=g('LN'), miss=missingActs(UN,LN), done=nDone(UN,LN);
    if(!miss.length){ box.hidden=false; box.className='lc-miss ok'; box.innerHTML='<b>✓ Con đã làm đủ mọi phần của bài này. Công trình đã có thêm 1 bộ phận!</b>'; return; }
    if(!done){ box.hidden=true; return; }
    box.hidden=false; box.className='lc-miss';
    box.innerHTML='<span class="lc-miss-t"><b>Con còn thiếu '+miss.length+' phần</b> để hoàn thiện công trình:</span>'+
      miss.map(function(a){ var f=a==='dub_en'?FLAG.en:a==='dub_zh'?FLAG.zh:''; return '<button type="button" class="lc-mchip" data-a="'+esc(a)+'">'+f+esc(actLabel(a))+' ▶</button>'; }).join('');
    box.querySelectorAll('[data-a]').forEach(function(b){ b.onclick=function(){ goAct(b.dataset.a); }; });
  }
  function missTextFor(u,n){ return missText(u,n,3); }
  function missText(u,n,max){ var m=missingActs(u,n), Lo=lessonObj(u,n); var s=m.slice(0,max).map(function(a){ return actLabel(a,Lo); }).join(', '); return m.length>max ? s+'… (còn '+(m.length-max)+' phần nữa)' : s; }
  var toastT=0;
  function toast(html){ var t=el('lcToast'); if(!t){ t=document.createElement('div'); t.id='lcToast'; t.className='lc-toast'; t.setAttribute('role','status'); document.body.appendChild(t); }
    t.innerHTML=html; t.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove('on'); },6500);
    var b=t.querySelector('[data-a]'); if(b) b.onclick=function(){ t.classList.remove('on'); goAct(b.dataset.a); }; }
  function remindAfter(id){
    var UN=g('UN'), LN=g('LN'), m=missingActs(UN,LN); if(!m.length || m.length===acts(UN,LN).length) return;
    var first=m[0];
    if(id==='dub_en' && m.indexOf('dub_zh')>=0) first='dub_zh'; else if(id==='dub_zh' && m.indexOf('dub_en')>=0) first='dub_en';
    toast('<b>Giỏi lắm! Con đã xong “'+esc(actLabel(id))+'”.</b><span>Con còn thiếu: '+esc(missText(UN,LN,3))+' để hoàn thiện công trình nhé!</span><button type="button" class="btn go" data-a="'+esc(first)+'">Làm “'+esc(actLabel(first))+'” ▶</button>');
  }

  /* ---------- fireworks: sound + sparks when a game is finished ---------- */
  function fwSound(){
    try{ var acf=g('ac'); var c=typeof acf==='function'?acf():null; if(!c) return; var t0=c.currentTime;
      function noise(d){ var b=c.createBuffer(1,Math.max(1,c.sampleRate*d|0),c.sampleRate), x=b.getChannelData(0); for(var i=0;i<x.length;i++) x[i]=Math.random()*2-1; var s=c.createBufferSource(); s.buffer=b; return s; }
      function env(gn,t,a,p,d){ gn.gain.setValueAtTime(.0001,t); gn.gain.exponentialRampToValueAtTime(p,t+a); gn.gain.exponentialRampToValueAtTime(.0001,t+a+d); }
      [0,.42,.8].forEach(function(dt,k){ var t=t0+dt;
        var o=c.createOscillator(), og=c.createGain(); o.type='sine'; o.frequency.setValueAtTime(500+k*120,t); o.frequency.exponentialRampToValueAtTime(1700+k*200,t+.42); env(og,t,.03,.05,.4); o.connect(og).connect(c.destination); o.start(t); o.stop(t+.46);
        var tb=t+.44, n=noise(.9), f=c.createBiquadFilter(), ng=c.createGain(); f.type='lowpass'; f.frequency.setValueAtTime(5200,tb); f.frequency.exponentialRampToValueAtTime(500,tb+.8); env(ng,tb,.006,.55,.8); n.connect(f).connect(ng).connect(c.destination); n.start(tb); n.stop(tb+.9);
        var bo=c.createOscillator(), bg=c.createGain(); bo.type='sine'; bo.frequency.setValueAtTime(140,tb); bo.frequency.exponentialRampToValueAtTime(45,tb+.3); env(bg,tb,.004,.45,.32); bo.connect(bg).connect(c.destination); bo.start(tb); bo.stop(tb+.36);
        for(var i=0;i<9;i++){ var tc=tb+.18+Math.random()*.75, cn=noise(.03), hf=c.createBiquadFilter(), cg=c.createGain(); hf.type='highpass'; hf.frequency.value=3000; env(cg,tc,.002,.22,.03); cn.connect(hf).connect(cg).connect(c.destination); cn.start(tc); cn.stop(tc+.04); }
      });
    }catch(e){}
  }
  function fwSparks(host){
    try{ var box=(host&&host.querySelector(':scope > .result'))||host||document.body; var cols=['#ffdf01','#ff6b6b','#6cc04a','#8fd3ff','#ffffff','#ffa53b'];
      [[22,30,0],[78,26,420],[50,14,800]].forEach(function(p){ setTimeout(function(){ for(var i=0;i<18;i++){ var s=document.createElement('i'); s.className='lc-spark';
        var a=i/18*Math.PI*2, r=60+Math.random()*50; s.style.left=p[0]+'%'; s.style.top=p[1]+'%'; s.style.background=cols[i%cols.length];
        s.style.setProperty('--dx',Math.round(Math.cos(a)*r)+'px'); s.style.setProperty('--dy',Math.round(Math.sin(a)*r)+'px'); box.appendChild(s); setTimeout(function(x){ return function(){ x.remove(); }; }(s),1300); } },p[2]+440); });
    }catch(e){}
  }

  /* ---------- background music: only while a game is being played ---------- */
  var LIVE={};
  function gamePanels(){ var GA=g('GAMEACTS')||[]; return GA.map(function(a){ return el('ap-'+a); }).filter(Boolean); }
  function panelOn(p){ var sp=p.closest('.secpanel'); return !p.hidden && sp && !sp.hidden; }
  function musicNow(){ return !!g('musicOn'); }
  function setMusic(on){ window.__lcv=!!on; gset('musicOn'); try{ var st=g('store'); if(st) st.set('canopy_music',!!on); }catch(e){} try{ var pm=g('paintMusic'); if(typeof pm==='function') pm(); }catch(e){} paintGMus(); sync(); }
  function sync(){ try{ var s=g('syncMusic'); if(typeof s==='function') s(); }catch(e){} }
  function paintGMus(){ var on=musicNow(); document.querySelectorAll('.lc-gmus').forEach(function(b){ b.setAttribute('aria-pressed',String(on)); b.innerHTML='<span aria-hidden="true">'+(on?'♪':'✕')+'</span><span>'+(on?'Nhạc: bật':'Nhạc: tắt')+'</span>'; b.title=on?'Tắt nhạc nền':'Bật nhạc nền'; }); }
  function addGMus(){
    gamePanels().forEach(function(p){ if(p.querySelector(':scope > .lc-gmus')) return; p.classList.add('lc-gp');
      var b=document.createElement('button'); b.type='button'; b.className='lc-gmus'; b.onclick=function(e){ e.stopPropagation(); setMusic(!musicNow()); }; p.appendChild(b); });
    paintGMus();
  }
  function setupMusic(){
    window.__lcv=function(){ if(!musicNow()) return false; return gamePanels().some(function(p){ return panelOn(p) && LIVE[p.id] && !p.querySelector('.result'); }); };
    gset('wantMusic');
    document.addEventListener('pointerdown',function(e){
      var p=e.target.closest&&e.target.closest('.panel'); if(!p || !/^ap-/.test(p.id)) return;
      if(gamePanels().indexOf(p)<0 || e.target.closest('.lc-gmus,.panel-h')) return;
      LIVE[p.id]=true; sync(); setTimeout(sync,350);
    },true);
    var pm=g('paintMusic'); if(typeof pm==='function' && !pm.__lc){ var w=function(){ var r=pm.apply(this,arguments); paintGMus(); return r; }; w.__lc=true; window.__lcv=w; gset('paintMusic'); }
    addGMus();
  }
  function onResult(host){
    var p=host&&host.closest&&host.closest('.panel'); if(p&&p.id) LIVE[p.id]=false;
    sync(); fwSound(); fwSparks(host);
  }

  /* ---------- dubbing / karaoke: EN | ZH tabs with flags, recorder for every unit ---------- */
  function setupDubTabs(){
    var sp=el('sec-dub'); if(!sp) return; var panel=sp.querySelector('.panel'), seg=sp.querySelector('.seg'), dub=sp.querySelector('.dub'); if(!panel||!seg||!dub) return;
    var tabs=el('lcLang');
    if(!tabs){ tabs=document.createElement('div'); tabs.id='lcLang'; tabs.className='lc-lang'; tabs.setAttribute('role','tablist'); tabs.setAttribute('aria-label','Chọn ngôn ngữ');
      dub.parentNode.insertBefore(tabs,dub); seg.classList.add('lc-hide');
      new MutationObserver(paintDubTabs).observe(seg,{attributes:true,subtree:true,attributeFilter:['aria-pressed']}); }
    paintDubTabs();
  }
  function paintDubTabs(){
    var tabs=el('lcLang'), seg=document.querySelector('#sec-dub .seg'); if(!tabs||!seg) return;
    var P=g('PROG')||{}, UN=g('UN'), LN=g('LN');
    tabs.innerHTML=['en','zh'].map(function(v){ var b=seg.querySelector('button[data-v="'+v+'"]'), on=b&&b.getAttribute('aria-pressed')==='true', done=!!P[pkey(UN,LN,'dub_'+v)];
      return '<button type="button" role="tab" data-v="'+v+'" aria-selected="'+on+'" class="lc-ltab '+v+(done?' done':'')+'">'+FLAG[v]+'<span class="t"><b>'+dubWord()+' - '+(v==='en'?'tiếng Anh':'tiếng Trung')+'</b><small>'+(v==='en'?'English':'中文')+' · '+(done?'✓ Đã xong':'Chưa xong')+'</small></span></button>'; }).join('');
    tabs.querySelectorAll('button').forEach(function(t){ t.onclick=function(){ var b=seg.querySelector('button[data-v="'+t.dataset.v+'"]'); if(b) b.click(); paintDubTabs(); }; });
    var tile=document.querySelector('#secTiles button[data-sec="dub"] .ds'); if(tile && !tile.querySelector('.lc-flag')) tile.insertAdjacentHTML('afterbegin',FLAG.en+FLAG.zh+' ');
  }
  function setupRec(){
    var REC=g('REC'); if(!REC || REC.__lc) return; REC.__lc=true;
    var setup=REC.setup;
    REC.setup=function(){ var r=setup.apply(this,arguments); var L=curL(), rec=el('rec');
      if(rec && L.dub && rec.hidden){ rec.hidden=false; if(!this.wired) this.wire(); this.stop(); this.clear();
        var m=el('recMsg'); if(m){ m.className='msg'; m.textContent=L.dub.kara?'Quay video con hát: bấm “Bật camera và quay”, bài hát chạy lại từ đầu, con nhìn chữ karaoke và hát theo.':'Quay video con lồng tiếng: bấm “Con tự lồng tiếng” để tắt tiếng video, rồi bấm “Bật camera và quay”.'; } }
      return r; };
    REC.saveFile=async function(){ if(!this.blob) return; var m=el('recMsg'), name='canopy-u'+g('UN')+'-bai'+g('LN')+'-'+new Date().toISOString().slice(0,10)+'.'+(this.ext||(this.blob.type&&this.blob.type.indexOf('mp4')>=0?'mp4':'webm'));
      var d=null; try{ d=window.claude&&window.claude.use?await window.claude.use('downloads'):null; }catch(e){}
      if(d){ try{ await d.save({filename:name,data:this.blob}); m.className='msg good'; m.textContent='Đã lưu video. Gửi cho cô qua nhóm lớp nhé!'; return; }catch(e){ if(e&&e.code==='declined'){ m.className='msg'; m.textContent='Con chưa lưu video. Muốn lưu thì bấm lại “Lưu video”.'; return; } } }
      try{ var a=document.createElement('a'); a.href=URL.createObjectURL(this.blob); a.download=name; document.body.appendChild(a); a.click(); a.remove(); m.className='msg good'; m.textContent='Đang lưu video về máy. Gửi cho cô qua nhóm lớp nhé!'; }
      catch(e){ m.className='msg'; m.textContent='Con bấm dấu ⋮ ở góc video để tải xuống nhé.'; } };
    var bar=el('recBar'), out=el('recOut'), view=el('recView'), live=el('recLive');
    if(bar && out && !el('recReplay')){ var rp=document.createElement('button'); rp.type='button'; rp.id='recReplay'; rp.className='btn blue'; rp.textContent='▶ Xem lại video';
      rp.onclick=function(){ try{ out.currentTime=0; var p=out.play(); if(p&&p.catch) p.catch(function(){}); out.scrollIntoView({behavior:'smooth',block:'center'}); }catch(e){} }; bar.insertBefore(rp,bar.firstChild);
      var ag=el('recAgain'); if(ag) ag.textContent='↺ Thử lại'; }
    if(view && live && !el('lcPipLine')){
      var line=document.createElement('div'); line.id='lcPipLine'; line.className='lc-pipline'; view.appendChild(line);
      var tick=0;
      var upd=function(){ var k=el('kara'), txt='';
        if(k && !k.hidden){ var cur=k.querySelector('.kl'); txt=cur?cur.innerText:''; }
        if(!txt){ var tr=document.querySelector('#script tr.now'); if(tr) txt=tr.innerText; }
        line.textContent=(txt||'').replace(/\s+/g,' ').trim(); };
      new MutationObserver(function(){ var on=!live.hidden; view.classList.toggle('lc-pip',on); clearInterval(tick); if(on){ upd(); tick=setInterval(upd,250); } else line.textContent=''; }).observe(live,{attributes:true,attributeFilter:['hidden']});
    }
  }

  /* ---------- football: "Sút tiếp" right behind Buffy ---------- */
  function setupKick(){ var nx=el('g2Next'), st=el('g2Stage'); if(nx && st && nx.parentNode!==st){ st.appendChild(nx); nx.classList.add('lc-kicknext'); } }

  /* ---------- hooks on the app's global functions ---------- */
  function wrap(name,before,after){
    var f=g(name); if(typeof f!=='function' || f.__lc) return;
    var w=function(){ var ctx=null; try{ if(before) ctx=before.apply(this,arguments); }catch(e){}
      var r=f.apply(this,arguments); try{ if(after) after.call(this,ctx,arguments); }catch(e){ console.warn('lc',name,e); } return r; };
    w.__lc=true; window.__lcv=w; gset(name);
  }
  function init(){
    buildShell(); if(!el('lcTop')) return; syncCity();
    var go=C.parseGo(location.hash);
    if(go && !C.site){ ls('lc_teacher',go.t?'1':'0'); var o=openSet(); if(o.indexOf(go.u)<0){ o.push(go.u); ls('lc_open',JSON.stringify(o)); } }
    wrap('paintLesson',function(){ LIVE={}; },function(){ decorateLesson(); wizardize(); addGMus(); setupDubTabs(); if(VIEW==='lesson'){ paintBar(); paintTop(); } });
    wrap('openSec',null,function(){ wizardize(); });
    wrap('markDone',function(id){ var u=g('UN'), n=g('LN'), P=g('PROG')||{}; return {u:u,n:n,was:lessonDone(u,n),had:!!P[pkey(u,n,id)]}; },
      function(ctx,args){ if(!ctx) return; refresh(); paintDubTabs(); if(!ctx.was && lessonDone(ctx.u,ctx.n)) setTimeout(function(){ celebrate(ctx.u,ctx.n); },700); else if(!ctx.was && !ctx.had) remindAfter(args&&args[0]); });
    wrap('resultCard',null,function(ctx,args){ onResult(args&&args[0]); });
    setupMusic(); setupRec(); setupKick(); setupDubTabs();
    var here=unitsHere();
    if(go && here.indexOf(go.u)>=0) switchUnit(go.u);
    var UN=g('UN');
    decorateLesson(); wizardize();
    if(!unitOpen(UN)) setView('lock');
    else if(go && go.u===UN && go.l && lessonOpen(UN,go.l)) openLesson(go.l);
    else setView('station');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
