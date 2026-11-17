const L5C=(()=>{
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BASES = ['have','play','go','listen','watch','read','eat','drink','sleep','get','wake','brush','wash','take','do',
  'make','cook','help','walk','run','ride','swim','sing','dance','draw','paint','write','study','learn','visit','meet',
  'talk','chat','call','clean','tidy','feed','sit','stay','relax','rest','come','leave','catch','drive','fly','skip',
  'jump','climb','kick','throw','use','look','see','say','tell','open','close','put','wear','dress','shower','bath',
  'practise','practice','work','ski','skate','cycle','fish','shop','bake','hug','kiss','pray','love','like','enjoy','hear'];
const ING_SPECIAL = {swim:'swimming',run:'running',shop:'shopping',skip:'skipping',get:'getting',sit:'sitting',put:'putting',
  chat:'chatting',dance:'dancing',ride:'riding',write:'writing',make:'making',bake:'baking',take:'taking',come:'coming',
  leave:'leaving',skate:'skating',cycle:'cycling',use:'using',close:'closing',wake:'waking',drive:'driving',have:'having',
  ski:'skiing',see:'seeing',practise:'practising',practice:'practicing',dress:'dressing'};
const S_SPECIAL = {have:'has',go:'goes',do:'does',watch:'watches',brush:'brushes',wash:'washes',catch:'catches',
  fly:'flies',study:'studies',tidy:'tidies',kiss:'kisses',relax:'relaxes',fish:'fishes',dress:'dresses'};
const PAST = {had:'have',went:'go',played:'play',watched:'watch',listened:'listen',ate:'eat',drank:'drink',slept:'sleep',
  got:'get',woke:'wake',did:'do',made:'make',came:'come',left:'leave',saw:'see',took:'take',ran:'run',
  swam:'swim',sang:'sing',drew:'draw',wrote:'write',rode:'ride'};
const ingOf = b => ING_SPECIAL[b] || b + 'ing';
const sOf = b => S_SPECIAL[b] || b + 's';
const GER = {}, THIRD = {};
BASES.forEach(b => { GER[ingOf(b)] = b; THIRD[sOf(b)] = b; });

const MEALS = ['breakfast','lunch','dinner','supper','tea','snack','snacks'];
const SCREEN = ['tv','television','cartoons','films','movies','videos','youtube'];
const BOOKS = ['books','book','stories','story','comics','comic','magazines'];
const THE_PLACES = ['park','zoo','library','beach','pool','market','cinema','supermarket'];
const tvWord = x => x === 'tv' ? 'TV' : x;

const DICT_WORDS = (`
i you he she it we they me my your his her our their a an the and or but with in on at to of for from by about up down
out into over after before then very really too also much many lot lots some all every more not don't do does
morning afternoon evening night day today weekend week time early late o'clock clock
breakfast lunch dinner supper tea snack snacks food rice noodles bread milk water juice fruit apple eggs soup
lessons lesson class classes school homework english maths math science art music pe teacher teachers classmates
bed sleep home house friend friends friend's family mum mom dad mother father sister brother grandma grandpa grandma's grandpa's
baby parents kids children cousin cousins
park playground garden zoo library beach pool sea river market shop shops supermarket cinema church kindergarten street
radio television tv cartoons films movies videos youtube phone tablet computer games game football tennis basketball
badminton volleyball chess cards toys dolls lego ball balls bike bicycle kite guitar piano drums violin
books book stories story comics comic magazines newspaper pictures picture photos
teeth face hands hair shower bath clothes uniform shoes pyjamas dog dogs cat cats pet pets fish birds flowers
bus car train taxi foot yes no good fun nice happy big small new old favourite favorite
roblox minecraft pokemon karate judo yoga ballet slime anime magic tricks puzzles puzzle origami swings slide
one two three four five six seven eight nine ten eleven twelve half past quarter first second hour hours minutes
film movie video cartoon song songs photo game letter email magazine sandwich horse scooter skateboard about outside upstairs downstairs
trip walk walks rest together alone early late again quickly fast straight around across along past near
`).trim().split(/\s+/).concat(BASES, BASES.map(ingOf), BASES.map(sOf), Object.keys(PAST));
const DICT = new Set(DICT_WORDS);

/* Levenshtein with edit steps, so we can show exactly which letters are wrong */
function editOps(a, b){
  const m = a.length, n = b.length, d = Array.from({length:m+1}, () => new Array(n+1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i-1][j] + 1, d[i][j-1] + 1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
  const ops = []; let i = m, j = n;
  while (i > 0 || j > 0){
    if (i > 0 && j > 0 && d[i][j] === d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1)){
      ops.unshift({ t: a[i-1] === b[j-1] ? 'ok' : 'sub' }); i--; j--;
    } else if (i > 0 && d[i][j] === d[i-1][j] + 1){ ops.unshift({ t:'del' }); i--; }
    else { ops.unshift({ t:'ins' }); j--; }
  }
  return { dist: d[m][n], ops };
}
/* Key words of this unit: we also catch 2-letter mistakes in these (brekfst, televison...) */
const CORE = ['breakfast','dinner','lunch','lessons','school','television','radio','friend\'s','house','homework',
  'watch','listen','football','park','stories','playing','morning','afternoon','evening','night','bed','have','play'];
function closest(x){
  const search = (list, max) => {
    let best = null, bd = 99;
    for (const d of list){
      if (Math.abs(d.length - x.length) > max) continue;
      const dd = editOps(x, d).dist;
      if (dd < bd){ bd = dd; best = d; }
    }
    return bd <= max ? best : null;
  };
  return search(DICT_WORDS, x.length >= 7 ? 2 : 1) || (x.length >= 5 ? search(CORE, 2) : null);
}

/* marks: bad = change word i, extra = take word i out, gap = empty box before word i (i === length → end),
   strip = {i, n}: last n letters of word i are crossed out, spell = {i, ops} */
const OK = { ok:true };
const R = (msg, hint, marks) => ({ ok:false, msg, hint, marks: marks || {} });
const MSG = {
  empty:  '✏️ Write here!',
  gap:    '🧩 A little word is missing!',
  verb:   '🧩 A word is missing!',
  extra:  '✂️ Take out the red word!',
  change: '🔄 Change the red word!',
  more:   '🤔 Tell me more!',
  again:  '👀 It’s already there!'
};

/* stem is "I" or "I don't" */
function checkBase(stem, raw){
  const text = raw.trim();
  if (!text) return R(MSG.empty, null, {});
  const orig = text.replace(/[’‘]/g, "'").replace(/[^A-Za-z' -]+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const w = orig.map(x => x.toLowerCase());
  if (!w.length) return R(MSG.empty, null, {});
  const neg = stem !== 'I';
  const fixedOk = arr => checkBase(stem, arr.join(' ')).ok;

  // 1. "I" / "I don't" typed again
  if (w[0] === 'i' && (!neg || w[1] === "don't")) return R(MSG.again, orig.slice(neg ? 2 : 1).join(' ') || '…', { extra: neg ? [0,1] : [0] });
  if (neg && w[0] === "don't") return R(MSG.again, orig.slice(1).join(' ') || '…', { extra:[0] });

  // 2. Spelling → mark the wrong letters
  for (let i = 0; i < w.length; i++){
    const x = w[i];
    if (x.length < 4 || DICT.has(x) || DICT.has(x.replace(/'s$/, ''))) continue;
    if (i > 0 && /^[A-Z]/.test(orig[i]) && orig[i].slice(1) === orig[i].slice(1).toLowerCase()) continue; // names
    const best = closest(x);
    if (best){
      const { ops } = editOps(x, best);
      const onlyMissing = ops.every(o => o.t === 'ok' || o.t === 'ins');
      return R(onlyMissing ? '🔍 A letter is missing!' : '🔍 Check the red letters!', best, { spell:{ i, ops } });
    }
  }

  // 3. Verb form: I play / I don't play
  const w0 = w[0];
  const withBase = b => { const a = [b].concat(w.slice(1)); return fixedOk(a) ? a.join(' ') : b; };
  if (w0 === 'to' && BASES.includes(w[1])) return R(MSG.extra, fixedOk(w.slice(1)) ? w.slice(1).join(' ') : w[1], { extra:[0] });
  if (GER[w0]){
    const b = GER[w0];
    return w0 === b + 'ing' ? R('✂️ Take out -ing!', withBase(b), { strip:{ i:0, n:3 } })
                            : R(MSG.change, withBase(b), { bad:[0] });
  }
  if (THIRD[w0] && !BASES.includes(w0)){
    const b = THIRD[w0];
    if (w0 === b + 's')  return R('✂️ Take out the red letter!', withBase(b), { strip:{ i:0, n:1 } });
    if (w0 === b + 'es') return R('✂️ Take out the red letters!', withBase(b), { strip:{ i:0, n:2 } });
    return R(MSG.change, withBase(b), { bad:[0] });
  }
  if (PAST[w0]) return R(MSG.change, withBase(PAST[w0]), { bad:[0] });
  if (MEALS.includes(w0) || w0 === 'lessons') return R(MSG.verb, `have ${w.join(' ')}`, { gap:0 });
  if (w0 === 'school' || w0 === 'bed') return R(MSG.verb, `go to ${w.join(' ')}`, { gap:0 });
  if (SCREEN.includes(w0)) return R(MSG.verb, `watch ${w.join(' ')}`, { gap:0 });
  if (w0 === 'radio') return R(MSG.verb, 'listen to the radio', { gap:0 });

  const v = BASES.includes(w0) ? w0 : null;
  const STOP = ['and','or','with','after','before','every','when','because','but','then'];
  let end = w.length;
  for (let k = 1; k < w.length; k++) if (STOP.includes(w[k])){ end = k; break; }
  const idxOf = list => { for (let k = 1; k < end; k++) if (list.includes(w[k])) return k; return -1; };
  const f0 = w[1], f1 = w[2], f2 = w[3];

  // 4. Collocations
  if (v && w.length === 1 && ['have','go','listen','watch','do','make','take','brush','wash','get','visit','ride','play'].includes(v))
    return R(MSG.more, v === 'have' ? 'have breakfast' : v === 'go' ? 'go to school' : v === 'listen' ? 'listen to the radio' :
             v === 'watch' ? 'watch television' : v === 'do' ? 'do my homework' : v === 'play' ? 'play in the park' : `${v} …`, { gap:1 });

  if (v === 'go'){
    if (MEALS.includes(f0) || f0 === 'lessons') return R(MSG.change, `have ${f0}`, { bad:[0] });
    if (f0 === 'to' && f1 === 'home') return R(MSG.extra, 'go home', { extra:[1] });
    if (f0 === 'to' && f1 === 'the' && ['bed','school'].includes(f2)) return R(MSG.extra, `go to ${f2}`, { extra:[2] });
    if (['school','bed','kindergarten','class'].includes(f0)) return R(MSG.gap, `go to ${w.slice(1).join(' ')}`, { gap:1 });
    if (THE_PLACES.includes(f0)) return R(MSG.gap, `go to the ${w.slice(1).join(' ')}`, { gap:1 });
    if (f0 === 'to' && THE_PLACES.includes(f1)) return R(MSG.gap, `go to the ${w.slice(2).join(' ')}`, { gap:2 });
    if (f0 === 'to' && ['friend','friends','friend\'s','house'].includes(f1)) return R(MSG.gap, `go to my ${w.slice(2).join(' ')}`, { gap:2 });
    if (idxOf(SCREEN) > -1) return R(MSG.change, `watch ${tvWord(w[idxOf(SCREEN)])}`, { bad:[0] });
  }
  if (v === 'have' || v === 'eat'){
    if (['school','bed','park'].includes(f0)) return R(MSG.change, `go to ${f0 === 'park' ? 'the park' : f0}`, { bad:[0] });
    if (f0 === 'to' && ['school','bed','the','my'].includes(f1)) return R(MSG.change, `go ${w.slice(1).join(' ')}`, { bad:[0] });
    if ((f0 === 'the' || f0 === 'a') && MEALS.includes(f1)) return R(MSG.extra, `${v} ${f1}`, { extra:[1] });
  }
  if (['take','do','play','go','drink'].includes(v) && MEALS.includes(f0)) return R(MSG.change, `have ${f0}`, { bad:[0] });
  if (v === 'make' && (f0 === 'homework' || (f0 === 'my' && f1 === 'homework'))) return R(MSG.change, 'do my homework', { bad:[0] });
  if (v === 'do' && f0 === 'homework') return R(MSG.gap, 'do my homework', { gap:1 });
  if (v === 'play'){
    if (f0 === 'in' && f1 === 'park') return R(MSG.gap, 'play in the park', { gap:2 });
    if (f0 === 'park') return R(MSG.gap, 'play in the park', { gap:1 });
    if (['guitar','piano','drums','violin'].includes(f0)) return R(MSG.gap, `play the ${f0}`, { gap:1 });
    if (f0 === 'the' && ['football','tennis','basketball','badminton','volleyball','chess','games'].includes(f1)) return R(MSG.extra, `play ${f1}`, { extra:[1] });
    if (idxOf(SCREEN) > -1) return R(MSG.change, `watch ${tvWord(w[idxOf(SCREEN)])}`, { bad:[0] });
    if (idxOf(['radio']) > -1) return R(MSG.change, 'listen to the radio', { bad:[0] });
  }
  if (v === 'listen'){
    if (f0 !== 'to' && LISTENABLE.includes(f0)) return R(MSG.gap, w.slice(1).includes('radio') ? 'listen to the radio' : `listen to ${w.slice(1).join(' ')}`, { gap:1 });
    if (f1 === 'radio') return R(MSG.gap, 'listen to the radio', { gap:2 });
  }
  if (v === 'hear' && idxOf(['radio','music']) > -1) return R(MSG.change, 'listen to the radio', { bad:[0] });
  if ((v === 'see' || v === 'look') && idxOf(SCREEN) > -1) return R(MSG.change, `watch ${tvWord(w[idxOf(SCREEN)])}`, { bad:[0] });
  if (v === 'watch'){
    if (f0 === 'the' && ['television','tv'].includes(f1)) return R(MSG.extra, `watch ${tvWord(f1)}`, { extra:[1] });
    if (idxOf(BOOKS) > -1) return R(MSG.change, `read ${w[idxOf(BOOKS)]}`, { bad:[0] });
    if (idxOf(['radio']) > -1) return R(MSG.change, 'listen to the radio', { bad:[0] });
  }
  if (v === 'read' && idxOf(SCREEN) > -1) return R(MSG.change, `watch ${tvWord(w[idxOf(SCREEN)])}`, { bad:[0] });
  if ((v === 'brush' || v === 'wash') && ['teeth','face','hands','hair'].includes(f0)) return R(MSG.gap, `${v} my ${f0}`, { gap:1 });

  return generalColloc(w, 0, v, end, b => b) || OK;
}
/* ---------- General collocation check ----------
   For each key noun, only some verbs are OK (breakfast → have/eat, radio → listen to, TV → watch,
   "to my friend's house / to school" → go/walk/ride...). Used after the special rules above. */
const MOTION = ['go','walk','run','ride','drive','come','get','cycle','fly','travel','hurry','return','skate','jog','swim','move'];
const LISTENABLE = ['radio','music','songs','song','stories','story','podcasts','teacher','mum','mom','dad','birds','the','my','audiobooks','rain'];
const TO_OK = MOTION.concat(['listen','talk','speak','write','say','reply','dance','sing','belong','look','wave','read']);
const PLACE_NOUNS = ['school','bed','home','house','park','zoo','library','beach','pool','market','cinema','supermarket',
  'kindergarten','class','church','playground','garden','shop','shops','museum','farm','cafe','restaurant','hospital'];
const PLACE_NO_PREP_OK = ['visit','leave','clean','tidy','like','love','enjoy','draw','paint','make','build','decorate'];
const HOME_OK = MOTION.concat(['stay','arrive','leave','like','love','clean','tidy']);
const DETS = ['the','my','a','an','his','her','our','their','your','friend\'s','grandma\'s','grandpa\'s','friends\'','big',
  'new','old','little','best','friend','favourite','favorite','aunt\'s','uncle\'s','cousin\'s'];
const CATS = [
  { nouns:['breakfast','lunch','dinner','supper','snack','snacks'], ok:['have','eat','cook','make','skip','prepare','finish','like','love','enjoy','help'], sug:'have' },
  { nouns:['lessons','lesson','classes'], ok:['have','take','like','love','enjoy','study','attend','skip','finish','go'], sug:'have' },
  { nouns:['homework'], ok:['do','finish','start','check','help','like','love','hate'], sug:'do' },
  { nouns:['radio','podcasts'], ok:['listen','like','love','enjoy'], sug:'listen', to:true },
  { nouns:['music'], ok:['listen','play','make','write','like','love','enjoy','dance','learn','study','sing'], sug:'listen', to:true },
  { nouns:['songs','song'], ok:['sing','listen','write','play','learn','like','love','enjoy','make'], sug:'sing' },
  { nouns:['tv','television','youtube'], ok:['watch','like','love','enjoy'], sug:'watch' },
  { nouns:['cartoons','cartoon','films','film','movies','movie','videos','video'], ok:['watch','make','draw','like','love','enjoy'], sug:'watch' },
  { nouns:['books','book','magazines','magazine','newspaper'], ok:['read','write','buy','like','love','enjoy','look','make'], sug:'read' },
  { nouns:['stories','story'], ok:['read','write','tell','listen','make','like','love','enjoy'], sug:'read' },
  { nouns:['comics','comic'], ok:['read','draw','write','make','buy','like','love','enjoy','look'], sug:'read' },
  { nouns:['football','soccer','tennis','basketball','badminton','volleyball','baseball','hockey','cricket','rugby','golf'],
    ok:['play','watch','practise','practice','like','love','enjoy','learn','win'], sug:'play' },
  { nouns:['chess','cards','games','game','puzzles','hide'], ok:['play','like','love','enjoy','learn','win','make','buy','do'], sug:'play' },
  { nouns:['fishing','swimming','cycling','skating','shopping','camping','hiking','skiing','climbing','sailing','surfing','jogging','diving'],
    ok:['go','like','love','enjoy'], sug:'go' },
  { nouns:['guitar','piano','violin','drums','drum','recorder','flute','keyboard','ukulele','trumpet','cello'],
    ok:['play','practise','practice','learn','like','love','enjoy','listen'], sug:'play', the:true },
  { nouns:['teeth','face','hands','hair'], ok:['brush','wash','clean','comb','dry','cut'], sug:'brush' },
  { nouns:['shower','bath'], ok:['have','take','like','love','enjoy'], sug:'have' },
  { nouns:['bike','bikes','bicycle','bicycles','horse','horses','scooter','scooters','skateboard'], ok:['ride','clean','fix','like','love','enjoy','feed','draw','buy'], sug:'ride' },
  { nouns:['kite','kites'], ok:['fly','make','draw','like','love','enjoy','buy'], sug:'fly' },
  { nouns:['pictures','picture','photos','photo','paintings'], ok:['draw','paint','take','make','colour','color','look','like','love','enjoy'], sug:'draw' }
];

/* w = words, vi = index of verb, v = verb (base form), end = end of the verb's words, form = how to write a verb in the hint */
function generalColloc(w, vi, v, end, form){
  if (!v) return null;
  const f = w[vi + 1];
  const tail = w.slice(vi + 1).join(' ');
  const PREPS = ['to','with','in','at','on','about','for','of','from','into'];
  // --- What may come straight after some verbs ---
  if (v === 'go' && f){
    const GO_NEXT = ['to','home','out','outside','back','up','down','away','there','here','for','on','by','with','and',
      'inside','upstairs','downstairs','abroad','shopping','together','alone','early','late','every','after','before','first',
      'in','into','around','across','along','over','past','near','straight','quickly','fast','by','again'];
    if (!GO_NEXT.includes(f) && !/ing$/.test(f)){
      if (f === 'sleep') return R(MSG.gap, `${form('go')} to ${tail}`, { gap: vi + 1 });
      if (BASES.includes(f)) return R(MSG.gap, `${form('go')} and ${tail}`, { gap: vi + 1 });
      const tp = ['park','zoo','library','beach','pool','market','cinema','supermarket','playground'];
      return R(MSG.gap, `${form('go')} to ${tp.includes(f) ? 'the ' : ''}${tail}`, { gap: vi + 1 });
    }
  }
  if (v === 'sleep' && f && ['bed','my','the'].includes(f) && w.slice(vi + 1, end).includes('bed'))
    return R(MSG.gap, `${form('sleep')} in ${tail}`, { gap: vi + 1 });
  if (v === 'look' && f && !['at','after','for','like','out','up','around','through','into','forward','happy','sad','good','nice','great','cool','fun','funny','tired','well'].includes(f))
    return R(MSG.gap, `${form('look')} at ${tail}`, { gap: vi + 1 });
  if (v === 'talk' && f && ['my','his','her','the','friends','friend','mum','mom','dad','sister','brother','teacher','grandma','grandpa','family','cousin','cousins'].includes(f))
    return R(MSG.gap, `${form('talk')} to ${tail}`, { gap: vi + 1 });
  if (v === 'watch' && f === 'at') return R(MSG.extra, `${form('watch')} ${w.slice(vi + 2).join(' ')}`, { extra:[vi + 1] });
  if (v === 'play' && f){
    const MATES = ['friends','friend','sister','sisters','brother','brothers','cousin','cousins','mum','mom','dad','dog','dogs',
      'cat','cats','pet','pets','toys','toy','dolls','doll','lego','classmates','family','grandma','grandpa','baby'];
    const g = ['my','his','her','our','the','some'].includes(f) ? w[vi + 2] : f;
    if (MATES.includes(g)) return R(MSG.gap, `${form('play')} with ${tail}`, { gap: vi + 1 });
  }
  // Places: "to + place" needs a verb of moving (go, walk, ride...)
  for (let k = vi + 1; k < end; k++){
    const noun = w[k];
    if (!PLACE_NOUNS.includes(noun)) continue;
    if (noun === 'house' && !['friend\'s','grandma\'s','grandpa\'s','my','his','her','your','friends\'','aunt\'s','uncle\'s','cousin\'s'].includes(w[k-1]) && w[k-1] !== 'the') continue;
    let j = k - 1;
    while (j > vi && DETS.includes(w[j])) j--;
    const prep = j > vi ? w[j] : null;
    if (prep === 'to'){
      if (!MOTION.includes(v)) return R(MSG.change, `${form('go')} ${w.slice(j).join(' ')}`, { bad:[vi] });
    } else if (!prep){
      if (noun === 'home' ? !HOME_OK.includes(v) : !PLACE_NO_PREP_OK.includes(v) && !MOTION.includes(v))
        return R(MSG.change, `${form('go')} ${noun === 'home' ? '' : 'to '}${w.slice(vi + 1).join(' ')}`.replace(/\s+/g, ' ').trim(), { bad:[vi] });
      if (MOTION.includes(v) && noun !== 'home')
        return R(MSG.gap, `${form(v)} to ${w.slice(vi + 1).join(' ')}`, { gap: vi + 1 });
    }
    break;
  }
  // Key nouns
  for (let k = vi + 1; k < end; k++){
    if (!CATS.some(c => c.nouns.includes(w[k]))) continue;
    if (['station','park','centre','center','shop','shops','pool','stop','office','hall'].includes(w[k + 1])) continue; // bus station, car park…
    if (['about','of','for'].includes(w[k - 1])) break;   // talk about football, a story of…
    // compound nouns: the last noun is the real object ("video games", "football stories")
    while (k + 1 < end && CATS.some(c => c.nouns.includes(w[k + 1]))) k++;
    const cat = CATS.find(c => c.nouns.includes(w[k]));
    if (!cat.ok.includes(v)){
      let tail = w.slice(vi + 1);
      if (cat.to && tail[0] !== 'to') tail = ['to'].concat(tail);
      if (!cat.to && tail[0] === 'to') tail = tail.slice(1);
      if (cat.nouns.includes('radio') && w[k] === 'radio' && w[k-1] !== 'the') tail = tail.map(x => x === 'radio' ? 'the radio' : x);
      return R(MSG.change, `${form(cat.sug)} ${tail.join(' ')}`.replace(/\s+/g, ' ').trim(), { bad:[vi] });
    }
    break;   // only check the first key noun (the object of the verb)
  }
  // "to" right after a verb that does not take "to"  (watch to…, play to…)
  if (w[vi + 1] === 'to' && !TO_OK.includes(v) && !BASES.includes(w[vi + 2]) && !(typeof GER !== 'undefined' && GER[w[vi + 2]]))
    return R(MSG.change, null, { bad:[vi] });
  // Singular things need "a" / "my" (read a book, have a shower, walk my dog)
  const SING = ['book','bike','bicycle','kite','story','comic','picture','song','game','horse','scooter','sandwich','shower','bus','train','taxi','present','gift','drink','band','cake','doctor',
    'bath','film','movie','video','cartoon','photo','magazine','newspaper','letter','dog','cat','skateboard'];
  for (let k = vi + 1; k < end; k++){
    if (!SING.includes(w[k])) continue;
    if (['station','park','centre','center','shop','shops','pool','stop','office','hall'].includes(w[k + 1])) continue;
    if (k + 1 < end && (SING.includes(w[k + 1]) || CATS.some(c => c.nouns.includes(w[k + 1])))) continue; // video games, story books
    const prev = w[k - 1];
    if (k - 1 === vi || PREPS.includes(prev)){
      const det = ['dog','cat','bike','bicycle'].includes(w[k]) ? 'my' : 'a';
      return R(MSG.gap, `${form(v)} ${w.slice(vi + 1, k).concat([det], w.slice(k)).join(' ')}`.replace(/\s+/g, ' ').trim(), { gap: k });
    }
    break;
  }
  return null;
}



/* ---------- Unit 5 extensions: places in town + past simple ---------- */
(function extendBase(){
  const NEW_BASES = ['buy','meet','give','find','bring','wait','win','lose','spend','wear','throw','fall','send','choose',
    'carry','think','know','begin','teach','stand','feel','keep','grow','see','visit','stay','shop','go','cry','try','stop','plan','hug'];
  NEW_BASES.forEach(b => { if (!BASES.includes(b)) BASES.push(b); });
  const ING_MORE = { win:'winning', stop:'stopping', plan:'planning', hug:'hugging', begin:'beginning' };
  Object.assign(ING_SPECIAL, ING_MORE);
  BASES.forEach(b => { GER[ingOf(b)] = b; THIRD[sOf(b)] = b; });
  THIRD['tries'] = 'try'; THIRD['cries'] = 'cry';
  ['catch','take','bring','carry'].forEach(v => { if (!MOTION.includes(v)) MOTION.push(v); });
  CATS.forEach(cat => { if (cat.nouns.includes('films')) ['see','go'].forEach(v => { if (!cat.ok.includes(v)) cat.ok.push(v); }); });
  PLACE_NOUNS.push('station','centre','center','circus','funfair','hospital','square','cafe','café','museum','restaurant',
    'stop','bank','bakery','bookshop','office','town','city','work','theatre','stadium');
  THE_PLACES.push('playground','circus','hospital','funfair','square','cafe','museum','restaurant','bank','bakery','bookshop','theatre','stadium');
  CATS.push(
    { nouns:['bus','train','taxi','tram'], ok:['catch','take','get','miss','wait','ride','drive','see','like','love'], sug:'catch' },
    { nouns:['present','presents','gift','gifts'], ok:['buy','get','give','make','open','wrap','send','choose','find','want','like','love'], sug:'buy' },
    { nouns:['drink','drinks','juice','milk','water','lemonade','tea','coffee'], ok:['have','buy','get','make','drink','want','like','love'], sug:'have' },
    { nouns:['band','concert'], ok:['listen','see','watch','play','join','like','love','enjoy','hear','go'], sug:'listen', to:true },
    { nouns:['animals','animal','lions','elephants','monkeys','penguins','giraffes','clowns','acrobats'], ok:['see','watch','feed','draw','look','like','love','visit','help','take','paint'], sug:'see' },
    { nouns:['food','fruit','vegetables','bread','clothes','shoes','toys','ice','cream','sweets','comics'], ok:['buy','eat','have','cook','make','get','want','like','love','choose','find','read','draw','sell','wear','try'], sug:'buy' },
    { nouns:['doctor','nurse','dentist'], ok:['see','visit','call','help','meet','like','love','ask'], sug:'see' }
  );
})();

const EXTRA_WORDS = `
yesterday today tomorrow last saturday sunday monday tuesday wednesday thursday friday weekend first then after that later
station centre center circus funfair hospital square supermarket market town city cinema museum zoo library playground
cafe café restaurant bakery bookshop bank post office stop car park toy shop shops sports shopping swimming pool theatre stadium
bus train taxi tram band concert present presents gift gifts drink drinks juice lemonade coffee clowns acrobats
animals animal lions elephants monkeys penguins giraffes food fruit vegetables clothes shoes ice cream sweets doctor nurse dentist
ride rides rollercoaster wheel big granny grandparents uncle aunt cousin cousins neighbour neighbours
we us our mum's dad's was were went had ate drank saw bought caught did made took read rode swam sang drew wrote came got met ran
slept sat flew gave found told said heard left woke won lost spent fed threw wore built brought thought knew began taught stood grew fell felt kept sent
visited stayed played watched listened cooked danced walked helped cleaned jumped climbed painted studied shopped tidied waited talked
called fished skated cycled baked washed brushed opened carried tried cried stopped planned hugged enjoyed liked loved learned learnt
cake cakes cookies biscuits pasta sandwiches burger chocolate candy medicine money dress shirt hat bag swings slide seesaw wheel rollercoaster balloon balloons ducks boat boats sand hill grandparents room kitchen tablet phone email match matches game games picnic picnics party film films pizza burger chips lunch dinner breakfast some many lot nice great fun wonderful beautiful delicious yummy happy sad tired new favourite
`.trim().split(/\s+/);
EXTRA_WORDS.forEach(x => { if (!DICT.has(x)){ DICT.add(x); DICT_WORDS.push(x); } });

/* Past simple forms */
const IRREG = { go:'went', have:'had', eat:'ate', drink:'drank', see:'saw', buy:'bought', catch:'caught', do:'did', make:'made',
  take:'took', read:'read', ride:'rode', swim:'swam', sing:'sang', draw:'drew', write:'wrote', come:'came', get:'got', meet:'met',
  run:'ran', sleep:'slept', sit:'sat', fly:'flew', give:'gave', find:'found', tell:'told', say:'said', hear:'heard', leave:'left',
  wake:'woke', win:'won', lose:'lost', spend:'spent', feed:'fed', put:'put', cut:'cut', throw:'threw', wear:'wore', build:'built',
  bring:'brought', think:'thought', know:'knew', begin:'began', teach:'taught', stand:'stood', grow:'grew', fall:'fell',
  feel:'felt', keep:'kept', send:'sent', learn:'learned', choose:'chose' };
function regPast(b){
  if (/e$/.test(b)) return b + 'd';
  if (/[^aeiou]y$/.test(b)) return b.slice(0, -1) + 'ied';
  if (['stop','shop','skip','jog','plan','chat','hug','hop','drop','clap'].includes(b)) return b + b.slice(-1) + 'ed';
  return b + 'ed';
}
const pastOf = b => IRREG[b] || regPast(b);
const PAST_TO_BASE = {};
BASES.forEach(b => { PAST_TO_BASE[pastOf(b)] = b; });
Object.entries(IRREG).forEach(([b, p]) => { PAST_TO_BASE[p] = b; });
/* "goed", "buyed", "eated"... → the right past form */
const WRONG_PAST = {};
Object.entries(IRREG).forEach(([b, p]) => {
  if (p === regPast(b)) return;
  WRONG_PAST[regPast(b)] = p;
  WRONG_PAST[b + 'ed'] = p;
  WRONG_PAST[b.replace(/e$/, '') + 'ed'] = p;
});
Object.assign(WRONG_PAST, { flied:'flew', flyed:'flew', buyed:'bought', catched:'caught', teached:'taught', thinked:'thought',
  bringed:'brought', swimmed:'swam', runned:'ran', sitted:'sat', getted:'got', winned:'won', maked:'made', taked:'took',
  seed:'saw', seen:'saw', gone:'went', eaten:'ate', drunk:'drank', done:'did', written:'wrote', taken:'took', swum:'swam', sung:'sang' });
delete WRONG_PAST['readed']; WRONG_PAST['readed'] = 'read';
delete WRONG_PAST['learned'];
Object.keys(WRONG_PAST).forEach(k => { if (PAST_TO_BASE[k] && k !== 'seed') delete WRONG_PAST[k]; });
BASES.forEach(b => [b, ingOf(b), sOf(b), pastOf(b)].forEach(x => { if (!DICT.has(x)){ DICT.add(x); DICT_WORDS.push(x); } }));
CORE.push('station','centre','supermarket','playground','hospital','funfair','circus','market','square','library','shopping',
  'present','yesterday','morning','afternoon','evening','bought','caught','went','visited','watched','played');

/* Places that need "the" after "to" */
const THE_START = ['park','zoo','library','beach','pool','market','cinema','supermarket','playground','circus','funfair',
  'square','cafe','café','museum','restaurant','bank','shop','bakery','bookshop','theatre','stadium','station',
  'sports','shopping','bus','train','car','toy','post','swimming','ice'];
const NO_THE = ['school','bed','home','work','church','town','hospital'];   // "go to school", "go to town", "go to hospital" (UK)
const COMPOUND_HEAD = { sports:['centre','center','hall'], shopping:['centre','center','mall'], bus:['station','stop'], train:['station'],
  car:['park'], toy:['shop','shops'], post:['office'], swimming:['pool'], ice:['cream'] };
const DETS5 = ['the','my','a','an','his','her','our','their','your','this','that','some','grandma\'s','grandpa\'s','friend\'s','mum\'s','dad\'s'];

function shiftMarks(m, off){
  const o = {};
  if (m.gap !== undefined) o.gap = m.gap + off;
  if (m.ing !== undefined) o.ing = m.ing + off;
  ['bad','extra'].forEach(k => { if (m[k]) o[k] = m[k].map(i => i + off); });
  if (m.strip) o.strip = { i: m.strip.i + off, n: m.strip.n };
  if (m.spell) o.spell = { i: m.spell.i + off, ops: m.spell.ops };
  return o;
}
const words5 = raw => raw.trim().replace(/[’‘]/g, "'").replace(/[^A-Za-z'é -]+/g, ' ').trim().split(/\s+/).filter(Boolean);

/* The same word twice in a row: "to to", "the the", "went went" */
function dupCheck(w){
  for (let i = 1; i < w.length; i++){
    if (w[i] === w[i - 1] && !['very','ha','bye'].includes(w[i]))
      return R(MSG.extra, w.slice(0, i).concat(w.slice(i + 1)).join(' '), { extra:[i] });
  }
  return null;
}
function spellCheck5(w, orig, from){
  for (let i = from || 0; i < w.length; i++){
    const x = w[i];
    if (WRONG_PAST[x]) return R('🔍 Check the red word!', WRONG_PAST[x], { bad:[i] });
    if (x.length < 4 || DICT.has(x) || DICT.has(x.replace(/'s$/, ''))) continue;
    if (i > 0 && /^[A-Z]/.test(orig[i]) && orig[i].slice(1) === orig[i].slice(1).toLowerCase()) continue;
    const best = closest(x);
    if (best){
      const { ops } = editOps(x, best);
      const onlyMissing = ops.every(o => o.t === 'ok' || o.t === 'ins');
      return R(onlyMissing ? '🔍 A letter is missing!' : '🔍 Check the red letters!', best, { spell:{ i, ops } });
    }
  }
  return null;
}
/* "to" + place: needs "the" (the park, the bus station), no "the" before school/home/bed; not "to home" */
function placeAfterTo(w, t, orig){
  const x = w[t + 1];
  if (!x) return null;
  if (x === 'home') return R(MSG.extra, `${w.slice(0, t).concat(w.slice(t + 1)).join(' ')}`.trim() || 'home', { extra:[t] });
  if (x === 'the' && ['home','bed','school','work'].includes(w[t + 2])) return R(MSG.extra, w.slice(0, t + 1).concat(w.slice(t + 2)).join(' '), { extra:[t + 1] });
  if (DETS5.includes(x) || !THE_START.includes(x)) return null;
  if (COMPOUND_HEAD[x] && !COMPOUND_HEAD[x].includes(w[t + 2])){
    if (x === 'swimming') return R(MSG.extra, w.slice(0, t).concat(w.slice(t + 1)).join(' '), { extra:[t] });  // went to swimming
    return null;
  }
  return R(MSG.gap, w.slice(0, t + 1).concat(['the'], w.slice(t + 1)).join(' '), { gap: t + 1 });
}

/* Blank 1: "Yesterday, in the morning, I went to …" → a place */
function checkPlace(raw){
  const orig = words5(raw), w = orig.map(x => x.toLowerCase());
  if (!w.length) return R('✏️ Write a place here!', 'the park', {});
  { const d = dupCheck(w); if (d) return d; }
  if (w[0] === 'to') return R(MSG.again, orig.slice(1).join(' ') || 'the park', { extra:[0] });
  if (w.length > 1 && w[w.length - 1] === 'to') return R(MSG.again, orig.slice(0, -1).join(' '), { extra:[w.length - 1] });
  const sp = spellCheck5(w, orig); if (sp) return sp;
  if (w[0] === 'home') return R('📍 Write a place, like “the park”!', 'the park', { bad:[0] });
  if (['work','school','town','bed','church','hospital','sleep'].includes(w[0])) return OK;
  const r0 = placeAfterTo(['to'].concat(w), 0, orig);
  if (r0 && r0.marks.gap !== undefined) return R(r0.msg, r0.hint.replace(/^to\s*/, ''), shiftMarks(r0.marks, -1));
  if (BASES.includes(w[0]) || GER[w[0]] || PAST_TO_BASE[w[0]])
    return R('📍 Write a place, like “the park”!', 'the park', { bad:[0] });
  const r = placeAfterTo(['to'].concat(w), 0, orig);
  if (r){ const m = shiftMarks(r.marks, -1); return R(r.msg, r.hint.replace(/^to\s*/, ''), m); }
  return OK;
}
/* Blank 2: "… to …" → what you did there (base verb) */
function checkPurpose(raw){
  const orig = words5(raw), w = orig.map(x => x.toLowerCase());
  if (!w.length) return R('✏️ What did you do there?', 'play football', {});
  { const d = dupCheck(w); if (d) return d; }
  if (WRONG_PAST[w[0]] || PAST_TO_BASE[w[0]] && !BASES.includes(w[0])){
    const b = PAST_TO_BASE[WRONG_PAST[w[0]]] || PAST_TO_BASE[w[0]];
    return R(MSG.change, [b].concat(w.slice(1)).join(' '), { bad:[0] });
  }
  const sp = spellCheck5(w, orig); if (sp) return sp;
  return checkBase('I', raw);
}

/* Blanks 3 & 4: "In the afternoon, …" / "In the evening, …" → a whole past sentence */
const SUBJ_WORDS = ['i','we','my','mum','mom','dad','and','family','friend','friends','brother','sister','grandma','grandpa',
  'parents','me','our','cousin','cousins','uncle','aunt','best','little','big','class','teacher','he','she','they'];
const PREFIX = ['yesterday','then','after','that','first','later','next','finally','so','at','about','around',"o'clock",'lunch','school',
  'one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','half','past','quarter'];
const AMBIG = ['read','put','cut','hit','let','set'];      // same in present and past
function checkClause(raw){
  const orig = words5(raw), w = orig.map(x => x.toLowerCase());
  if (!w.length) return R('✏️ Write here!', 'I went to the park', {});
  { const d = dupCheck(w); if (d) return d; }
  if (w[0] === 'in' && w[1] === 'the' && ['afternoon','evening','morning'].includes(w[2]))
    return R(MSG.again, orig.slice(3).join(' ') || 'I went to the park', { extra:[0,1,2] });

  // wrong past forms first (goed, buyed…), then spelling
  const sp = spellCheck5(w, orig); if (sp) return sp;

  let s = 0;
  while (s < w.length && PREFIX.includes(w[s])) s++;
  // find the verb
  let vi = -1;
  for (let k = s; k < w.length; k++){
    const x = w[k];
    if (['was','were','am','is','are'].includes(x) || PAST_TO_BASE[x] || BASES.includes(x) || GER[x] || THIRD[x]){ vi = k; break; }
    if (!SUBJ_WORDS.includes(x) && !/^[A-Z]/.test(orig[k])) break;
  }
  if (vi === -1){
    return R('🧩 What did you do? Write a verb!', `I went to ${w.slice(s).join(' ')}`.trim(), { gap: s });
  }
  if (vi === s) return R('🧩 Who? A word is missing!', `I ${w.slice(s).join(' ')}`, { gap: s });
  const v = w[vi];
  const subj = w.slice(s, vi);
  if (['am','is','are'].includes(v)) return R('🕒 It was yesterday! Change the red word!', `${subj.join(' ')} ${subj.length === 1 && subj[0] !== 'i' ? 'were' : 'was'} ${w.slice(vi + 1).join(' ')}`.trim(), { bad:[vi] });
  if (v === 'was' || v === 'were'){
    if (v === 'were' && subj.length === 1 && subj[0] === 'i') return R(MSG.change, `I was ${w.slice(vi + 1).join(' ')}`, { bad:[vi] });
    if (v === 'was' && subj.length === 1 && subj[0] === 'we') return R(MSG.change, `we were ${w.slice(vi + 1).join(' ')}`, { bad:[vi] });
    return OK;
  }
  let base;
  if (PAST_TO_BASE[v] && (!BASES.includes(v) || AMBIG.includes(v))) base = PAST_TO_BASE[v];
  else {
    const b = GER[v] || THIRD[v] || v;
    return R('🕒 It was yesterday! Change the red word!', `${subj.join(' ')} ${pastOf(b)} ${w.slice(vi + 1).join(' ')}`.trim(), { bad:[vi] });
  }

  // "went to + place" needs "the" / no "to home"
  if (w[vi + 1] === 'to'){
    const r = placeAfterTo(w, vi + 1, orig);
    if (r){
      const hint = r.hint.split(' ').map((x, i) => i === vi ? v : x).join(' ');
      return R(r.msg, hint, r.marks);
    }
  }
  // split "… to + verb" (went to the park to play football)
  let p = -1;
  for (let k = vi + 2; k < w.length; k++){
    if (w[k] === 'to' && (BASES.includes(w[k + 1]) || PAST_TO_BASE[w[k + 1]] || GER[w[k + 1]] || THIRD[w[k + 1]])){ p = k; break; }
  }
  const mainEnd = p === -1 ? w.length : p;
  const main = [base].concat(w.slice(vi + 1, mainEnd));
  const r1 = checkBase('I', main.join(' '));
  if (!r1.ok){
    let hint = null;
    if (r1.hint){
      const hw = r1.hint.split(' ');
      if (BASES.includes(hw[0])) hw[0] = pastOf(hw[0]);
      hint = `${subj.join(' ')} ${hw.join(' ')}`;
    }
    return R(r1.msg, hint, shiftMarks(r1.marks, vi));
  }
  if (p !== -1){
    const tail = w.slice(p + 1);
    const r2 = checkPurpose(tail.join(' '));
    if (!r2.ok) return R(r2.msg, r2.hint ? `… to ${r2.hint}` : null, shiftMarks(r2.marks, p + 1));
  }
  // later verbs: "… and go home" → went
  for (let k = vi + 1; k < w.length; k++){
    const prevIsLink = ['and','then'].includes(w[k - 1]) || (w[k - 1] === 'i' && ['and','then'].includes(w[k - 2]));
    if (!prevIsLink) continue;
    const x = w[k];
    if (AMBIG.includes(x) || PAST_TO_BASE[x] && !BASES.includes(x)) continue;
    const b = BASES.includes(x) ? x : GER[x] || THIRD[x];
    if (b) return R('🕒 It was yesterday! Change the red word!', `… ${pastOf(b)} ${w.slice(k + 1).join(' ')}`.trim(), { bad:[k] });
  }
  // "I went to the park." → ask what they did there
  const IDEAS = { park:'play football', supermarket:'buy some food', library:'read books', cinema:'watch a film', zoo:'see the animals',
    circus:'see the clowns', funfair:'ride the big wheel', playground:'play on the swings', hospital:'see the doctor', market:'buy some fruit',
    shopping:'buy some clothes', bus:'catch a bus', train:'catch a train', sports:'play tennis', swimming:'swim', school:'study English',
    cafe:'have a drink', café:'have a drink', toy:'buy a present', square:'meet my friends', car:'park the car', town:'go shopping',
    house:'play games', beach:'swim in the sea', museum:'see old things', restaurant:'have dinner', pool:'swim', work:'help my dad' };
  if (base === 'go' && w[vi + 1] === 'to' && p === -1 && !['bed','sleep'].includes(w[vi + 2])){
    const didMore = w.some((x, k) => k > vi && ['and','then'].includes(w[k - 1] === 'i' ? w[k - 2] : w[k - 1]) && (PAST_TO_BASE[x] || x === 'was'));
    if (!didMore){
      let idea = 'play with my friends';
      for (let k = vi + 2; k < w.length; k++){ if (IDEAS[w[k]]){ idea = IDEAS[w[k]]; break; } }
      return R('🤔 What did you do there? Add “to …”!', `${w.join(' ')} to ${idea}`, { gap: w.length });
    }
  }
  return OK;
}


/* ---------- 4. Let's talk: form ---------- */
return {checkPlace,checkPurpose,checkClause,words5,OK};
})();
