/* Xếp nhóm (grp) — drag words onto the group whose character / character part they share. 8-bit look.
   Words are built from the red pictograph flashcards (thẻ chữ tượng hình) used in "Luyện chữ Hán".
   One engine, five pixel-art boards: windows (U3), carts (U5), bookcase (U6), pens (U9), hoops (U10).
   Used by the Lingo Cub station pages (replaces "Nhìn hình chọn pinyin" in Lesson 2) and by the CES demo. */
(function(){
'use strict';

/* word: [zh, pinyin, group key, char that carries the part (part groups only), extra note] */
var CFG = {
  '3-2': { theme:'windows', name:'Xếp nhóm: 早 · 午 · 晚', win:'Cả ngày đã vào đúng ô cửa!', cheer:'Con nhìn ra 早, 午, 晚 rất giỏi!',
    intro:'Mỗi ô cửa sổ có một chữ. Kéo thẻ thả vào ô cửa sổ có chữ giống nhau nhé!',
    bins:[ {k:'早',sub:'buổi sáng',ic:'dawn'}, {k:'午',sub:'buổi trưa',ic:'sun'}, {k:'晚',sub:'buổi tối',ic:'moon'} ],
    words:[ ['早上','zǎoshang','早'],['吃早饭','chī zǎofàn','早'],['中午','zhōngwǔ','午'],['吃午饭','chī wǔfàn','午'],['晚上','wǎnshang','晚'],['吃晚饭','chī wǎnfàn','晚'] ] },
  '5-2': { theme:'carts', name:'Xếp nhóm: 园 · 店 · 家 · 学', win:'Xe đẩy nào cũng đầy rồi!', cheer:'Con nhận ra 园, 店, 家, 学 rất nhanh!',
    intro:'Mỗi xe đẩy có một chữ. Kéo thẻ thả vào xe đẩy có chữ giống nhau nhé!',
    bins:[ {k:'园',sub:'có cây, có thú',ic:'park'}, {k:'店',sub:'bán hàng, nấu ăn',ic:'shop'}, {k:'家',sub:'nhà',ic:'house'}, {k:'学',sub:'học',ic:'book'} ],
    words:[ ['公园','gōngyuán','园'],['动物园','dòngwùyuán','园'],['商店','shāngdiàn','店'],['饭店','fàndiàn','店'],
            ['家','jiā','家'],['回家','huíjiā','家'],['学校','xuéxiào','学'],['去上学','qù shàngxué','学'] ] },
  '6-2': { theme:'shelf', name:'Xếp nhóm: 师 · 医 · 学', win:'Tủ sách gọn gàng rồi!', cheer:'Con nhớ 师, 医, 学 rất giỏi!',
    intro:'Mỗi tủ sách có một chữ. Kéo cuốn sách thả vào tủ có chữ giống nhau nhé!',
    bins:[ {k:'师',sub:'người làm nghề giỏi',ic:'board'}, {k:'医',sub:'chữa bệnh',ic:'cross'}, {k:'学',sub:'học',ic:'book'} ],
    words:[ ['老师','lǎoshī','师'],['厨师','chúshī','师'],['医生','yīshēng','医'],['牙医','yáyī','医'],['学生','xuésheng','学'],['学校','xuéxiào','学'],['去上学','qù shàngxué','学'] ] },
  '9-2': { theme:'pens', name:'Xếp nhóm: 胖 · 瘦 · 老', win:'Các bạn đã về đúng chuồng!', cheer:'Con nhận ra 胖, 瘦 và 老 rất giỏi!',
    intro:'Mỗi chuồng có một chữ. Kéo thẻ thả vào chuồng có chữ giống nhau nhé!',
    bins:[ {k:'胖',sub:'béo',ic:'fat'}, {k:'瘦',sub:'gầy',ic:'thin'}, {k:'老',sub:'già',ic:'old'} ],
    words:[ ['胖','pàng','胖'],['很胖','hěn pàng','胖'],['不胖','bú pàng','胖'],
            ['瘦','shòu','瘦'],['很瘦','hěn shòu','瘦'],['不瘦','bú shòu','瘦'],
            ['老','lǎo','老'],['很老','hěn lǎo','老'],['不老','bù lǎo','老'] ] },
  '10-2': { theme:'hoops', name:'Xếp nhóm: 艹 · 氵 · 天', win:'Bóng nào cũng vào rổ!', cheer:'Con nhìn ra 艹, 氵 và 天 rất giỏi!',
    intro:'Mỗi rổ có một chữ hoặc một phần chữ. Kéo quả bóng thả vào rổ đúng nhé!',
    bins:[ {k:'艹',sub:'cây cỏ',where:'trên đầu',ic:'grass'}, {k:'氵',sub:'có nước',where:'bên trái',ic:'drop'}, {k:'天',sub:'trời, ngày',ic:'sky'} ],
    words:[ ['花','huā','艹','花'],['草','cǎo','艹','草'],['河','hé','氵','河'],['洗脸','xǐliǎn','氵','洗',' Rửa mặt cần nước!'],['漂亮','piàoliang','氵','漂'],
            ['天空','tiānkōng','天'],['今天','jīntiān','天'],['明天','míngtiān','天'] ] }
};
/* folder that holds each character's red flashcard (img/<code>_red.webp); 园 has no flashcard and is drawn as a red character */
var CARDDIR={"早":"u1to4","上":"u1to4","吃":"u1to4","饭":"u1to4","中":"u1to4","午":"u1to4","晚":"u1to4","公":"u5","动":"u5","物":"u5","商":"u5","店":"u5","家":"u5","回":"u5","学":"u5","校":"u5","去":"u5","老":"u6","师":"u6","厨":"u6","医":"u6","生":"u6","牙":"u6","猪":"u9","猴":"u8","子":"u9","鸡":"u9","鸭":"u9","虎":"u8","花":"u10","草":"u10","河":"u10","洗":"u1to4","脸":"u1to4","漂":"u9","胖":"u9","瘦":"u9","亮":"u10","天":"u10","空":"u10","今":"u1to4","明":"u1to4"};
var EXP={"早": ["zǎo", "sáng sớm", "日 (mặt trời) mọc trên đường chân trời."], "上": ["shàng", "trên; lên", "Nét ngắn nằm trên nét ngang: ở phía trên."], "吃": ["chī", "ăn", "Có 口 (miệng) bên trái: ăn bằng miệng."], "饭": ["fàn", "cơm, bữa ăn", "Có 饣 (bộ đồ ăn) bên trái."], "中": ["zhōng", "giữa", "Nét dọc xuyên giữa ô 口: ở chính giữa."], "午": ["wǔ", "buổi trưa", "Giữa ngày, mặt trời lên cao nhất."], "晚": ["wǎn", "buổi tối", "Có 日 (mặt trời) bên trái: nói về thời gian trong ngày."], "公": ["gōng", "chung, công cộng", "公园 là khu vườn chung cho mọi người."], "园": ["yuán", "vườn", "Hàng rào 囗 bao quanh: một khu vườn."], "动": ["dòng", "động, cử động", "Có 力 (sức lực): có sức thì cử động."], "物": ["wù", "vật, con vật", "Có 牜 (bộ bò) bên trái: con vật."], "商": ["shāng", "buôn bán", "商店 là nơi buôn bán hàng hóa."], "店": ["diàn", "cửa hàng", "Có 广 (mái che) bên ngoài: một cửa hàng có mái."], "家": ["jiā", "nhà, gia đình", "宀 (mái nhà) che 豕 (con lợn): ngày xưa nhà nào cũng nuôi lợn."], "回": ["huí", "trở về", "Hình vòng xoáy quay vào trong, rồi quay về."], "学": ["xué", "học", "Có 子 (đứa trẻ) ở dưới: trẻ em đi học."], "校": ["xiào", "trường", "Có 木 (cây) bên trái."], "去": ["qù", "đi", "去 là đi tới một nơi nào đó."], "老": ["lǎo", "già", "Hình ông cụ lưng còng chống gậy."], "师": ["shī", "thầy, người giỏi nghề", "老师 là thầy cô; 厨师 là đầu bếp."], "厨": ["chú", "nhà bếp", "厨师 là người nấu ăn trong bếp."], "医": ["yī", "chữa bệnh", "医生 và 牙医 đều là người chữa bệnh."], "生": ["shēng", "sinh ra; sống", "Hình mầm cây nhú lên khỏi mặt đất."], "牙": ["yá", "răng", "Hình hai chiếc răng cắn vào nhau."], "猪": ["zhū", "con lợn", "Có 犭 (bộ thú) bên trái."], "猴": ["hóu", "con khỉ", "Có 犭 (bộ thú) bên trái."], "子": ["zi", "con; hậu tố", "Hình em bé dang tay; hay đứng cuối từ như 猴子, 鸭子."], "鸡": ["jī", "con gà", "Có 鸟 (chim) bên phải."], "鸭": ["yā", "con vịt", "Có 鸟 (chim) bên phải."], "花": ["huā", "hoa", "Có 艹 (cây cỏ) trên đầu."], "草": ["cǎo", "cỏ", "Có 艹 (cây cỏ) trên đầu."], "河": ["hé", "sông", "Có 氵 (nước) bên trái."], "洗": ["xǐ", "rửa", "Có 氵 (nước) bên trái: rửa cần nước."], "脸": ["liǎn", "khuôn mặt", "Có 月 (bộ phận cơ thể) bên trái."], "漂": ["piào", "nổi nhẹ trên nước", "Có 氵 (nước) bên trái: vật nhẹ thì nổi trên nước."], "亮": ["liàng", "sáng", "Sáng lấp lánh; ghép với 漂 thành 漂亮."], "天": ["tiān", "trời; ngày", "大 (người dang tay) có nét ngang trên đầu: bầu trời trên đầu người."], "空": ["kōng", "trống; bầu trời", "Có 穴 (cái hang) ở trên: trống rỗng."], "今": ["jīn", "nay, hôm nay", "今天 là hôm nay."], "明": ["míng", "sáng; ngày mai", "日 (mặt trời) và 月 (mặt trăng) cùng chiếu: sáng."], "胖": ["pàng", "béo", "Có 月 (cơ thể, thịt) bên trái: người đầy đặn."], "瘦": ["shòu", "gầy", "Có 疒 (bộ bệnh) bên ngoài: người gầy yếu."], "很": ["hěn", "rất", "Đứng trước từ chỉ tính chất: 很胖 = rất béo."], "不": ["bù", "không", "Đứng trước từ để nói “không”: 不胖 = không béo."]};
var WX={"早上": ["buổi sáng", "Mặt trời 早 vừa nhô lên và đang ở trên cao 上 → đó là buổi sáng."], "吃早饭": ["ăn bữa sáng", "ăn 吃 + sáng 早 + cơm 饭: ăn cơm vào buổi sáng = ăn sáng."], "中午": ["buổi trưa", "中 là giữa, 午 là trưa: lúc mặt trời ở giữa bầu trời → buổi trưa."], "吃午饭": ["ăn bữa trưa", "ăn 吃 + trưa 午 + cơm 饭: ăn cơm vào buổi trưa = ăn trưa."], "晚上": ["buổi tối", "Chữ 晚 có 日 (mặt trời) bên trái: mặt trời đã đi ngủ, trời tối → buổi tối."], "吃晚饭": ["ăn bữa tối", "ăn 吃 + tối 晚 + cơm 饭: ăn cơm vào buổi tối = ăn tối."], "公园": ["công viên", "公 là chung, 园 là vườn: khu vườn chung của mọi người = công viên."], "动物园": ["vườn thú", "Vườn 园 có nhiều con vật 物 hay cử động 动 → vườn thú."], "商店": ["cửa hàng", "商 là buôn bán, 店 là cửa hàng: nơi người ta bán hàng."], "饭店": ["nhà hàng", "Cửa hàng 店 bán cơm 饭 → nhà hàng."], "回家": ["về nhà", "回 là quay về, 家 là nhà: quay về nhà."], "学校": ["trường học", "学 là học, 校 là trường: nơi các bạn đến để học → trường học."], "去上学": ["đi học", "去 là đi, 上学 là lên lớp học: đi lên lớp học = đi học."], "老师": ["thầy cô giáo", "老 là người lớn, nhiều kinh nghiệm; 师 là thầy: người thầy giàu kinh nghiệm → thầy cô giáo."], "厨师": ["đầu bếp", "厨 là bếp, 师 là người giỏi nghề: người giỏi việc bếp núc → đầu bếp."], "医生": ["bác sĩ", "医 là chữa bệnh, 生 ở đây là người: người chữa bệnh → bác sĩ."], "牙医": ["nha sĩ", "牙 là răng, 医 là chữa bệnh: người chữa răng → nha sĩ."], "学生": ["học sinh", "学 là học, 生 ở đây là người: người đi học → học sinh."], "很胖": ["rất béo", "很 là rất + 胖 là béo → rất béo."], "不胖": ["không béo", "不 là không + 胖 là béo → không béo."], "很瘦": ["rất gầy", "很 là rất + 瘦 là gầy → rất gầy."], "不瘦": ["không gầy", "不 là không + 瘦 là gầy → không gầy."], "很老": ["rất già", "很 là rất + 老 là già → rất già."], "不老": ["không già", "不 là không + 老 là già → không già."], "洗脸": ["rửa mặt", "洗 là rửa (có 氵 nước), 脸 là khuôn mặt (có 月 chỉ cơ thể): dùng nước rửa mặt."], "漂亮": ["xinh đẹp", "漂 là nổi nhẹ trên nước (氵), 亮 là sáng. Mẹo nhớ: hình dung chiếc lá nhẹ nhàng nổi trên mặt nước, sáng lấp lánh (亮). Thật xinh đẹp!"], "天空": ["bầu trời", "天 là trời, 空 là khoảng trống rộng: khoảng trống rộng lớn trên đầu → bầu trời."], "今天": ["hôm nay", "今 là nay, 天 là ngày: ngày nay → hôm nay."], "明天": ["ngày mai", "明 là sáng, 天 là ngày: ngày sáng sắp tới → ngày mai."]};
var CI={"早": "dawn", "上": "up", "吃": "eat", "饭": "rice", "中": "mid", "午": "sun", "晚": "moon", "公": "people", "园": "park", "动": "run", "物": "paw", "商": "coins", "店": "shop", "家": "house", "回": "back", "学": "book", "校": "school", "去": "right", "老": "old", "师": "board", "厨": "pot", "医": "cross", "生": "sprout", "牙": "tooth", "猪": "pig", "猴": "monkey", "子": "child", "鸡": "chick", "鸭": "duck", "花": "flower", "草": "grass", "河": "river", "洗": "drop", "脸": "face", "漂": "leaf", "亮": "sparkle", "天": "sky", "空": "cloud", "今": "clock", "明": "sunmoon", "胖": "fat", "瘦": "thin", "很": "very", "不": "no"},WI={"早上": "dawn", "吃早饭": "rice", "吃午饭": "rice", "吃晚饭": "rice", "中午": "sun", "晚上": "moon", "公园": "park", "动物园": "paw", "饭店": "shop", "学校": "school", "去上学": "school", "老师": "board", "厨师": "pot", "医生": "cross", "牙医": "tooth", "学生": "book", "洗脸": "face", "漂亮": "sparkle", "天空": "cloud", "今天": "clock", "明天": "sunmoon"};
var NOCARD=['园','很','不'];

var THEME = {
  windows:{ verb:'ô cửa sổ', thing:'thẻ',       W:48, H:34, land:'pop' },
  carts:  { verb:'xe đẩy',   thing:'thẻ',       W:48, H:36, land:'drop' },
  shelf:  { verb:'tủ sách',  thing:'cuốn sách', W:40, H:40, land:'slide' },
  pens:   { verb:'chuồng',   thing:'bạn thú',   W:48, H:32, land:'hop' },
  hoops:  { verb:'rổ',       thing:'quả bóng',  W:48, H:44, land:'drop' }
};

/* ---------- 8-bit icons (12×12 pixel maps) ---------- */
var PAL={k:'#0e1526',r:'#c8322b',y:'#ffcd3c',o:'#ff8a3c',w:'#ffffff',b:'#2e95c2',l:'#8fd3ff',g:'#3f8f3a',G:'#6cc04a',n:'#8a5a34',p:'#ffc58f',d:'#1f2a44',c:'#fff3b0',x:'#c9ced8',m:'#ff9fbf'};
var ICON={
  dawn:['............','............','....yyyy....','..yyyyyyyy..','.yyyyyyyyyy.','.yyyyyyyyyy.','oooooooooooo','pppppppppppp','oooooooooooo','pppppppppppp','oooooooooooo','pppppppppppp'],
  sun:['.....yy.....','.y...yy...y.','..y......y..','....yyyy....','...yyyyyy...','yy.yyyyyy.yy','yy.yyyyyy.yy','...yyyyyy...','....yyyy....','..y......y..','.y...yy...y.','.....yy.....'],
  moon:['dddddddddddd','dwdddddddcdd','ddddccccdddd','dddcccdddddd','ddcccddddddd','ddcccddddwdd','ddcccddddddd','ddcccddddddd','dddcccdddddd','ddddccccdddd','dwdddddddddd','dddddddddddd'],
  park:['rrrrrrrrrrrr','rrrrrrrrrrrr','nn........nn','nn...GG...nn','nn..GGGG..nn','nn.GGGGGG.nn','nn.GGgGGG.nn','nn..GGGG..nn','nn...nn...nn','nn...nn...nn','nn...nn...nn','nn...nn...nn'],
  shop:['rrwwrrwwrrww','rrwwrrwwrrww','.rr..rr..rr.','oooooooooooo','oooooooooooo','ollllooonnoo','ollllooonnoo','ollllooonnoo','oooooooonnoo','oooooooonnoo','oooooooonnoo','oooooooonnoo'],
  house:['.....rr.....','....rrrr....','...rrrrrr...','..rrrrrrrr..','.rrrrrrrrrr.','rrrrrrrrrrrr','.oooooooooo.','.olloooonno.','.olloooonno.','.oooooooonno','.oooooooonno','.oooooooonno'],
  book:['............','.bbbbb.bbbbb','.bwwww.wwwwb','.bwkkw.wkkwb','.bwwww.wwwwb','.bwkkw.wkkwb','.bwwww.wwwwb','.bwkkw.wkkwb','.bwwww.wwwwb','.bbbbbbbbbbb','......b.....','............'],
  board:['nnnnnnnnnnnn','nggggggggggn','ngwwwwgggggn','nggggggggggn','ngwwwwwwwggn','nggggggggggn','ngwwwggggggn','nggggggggggn','nnnnnnnnnnnn','...n....n...','..n......n..','.n........n.'],
  cross:['kkkkkkkkkkkk','kwwwwwwwwwwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwrrrrrrrrwk','kwrrrrrrrrwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwwwwrrwwwwk','kwwwwwwwwwwk','kkkkkkkkkkkk'],
  paw:['............','.nn......nn.','.nn......nn.','............','nn..nnnn..nn','nn.nnnnnn.nn','...nnnnnn...','..nnnnnnnn..','..nnnnnnnn..','..nnnnnnnn..','...nnnnnn...','............'],
  bird:['............','....bbbb....','...bbbbbb...','...bwkbbbo..','..bbbbbbboo.','bbbbbbbbb...','.bbblbbbb...','..bblllbb...','...bbbbb....','....bbb.....','....o..o....','...oo..oo...'],
  fat:['............','...nnnnnn...','..nnnnnnnn..','..nkpppknn..','..npppppnn..','.nnppnnppnn.','nnnnnnnnnnnn','nnnnnnnnnnnn','nnnnnnnnnnnn','.nnnnnnnnnn.','..nn....nn..','..kk....kk..'],
  thin:['....nnnn....','...nnnnnn...','...nkppkn...','...npppn....','....pppp....','....nnnn....','....nnnn....','....nnnn....','....nnnn....','....n..n....','....n..n....','...kk..kk...'],
  old:['...xxxxxx...','..xxxxxxxx..','.xxppppppxx.','.xppppppppx.','.pkkppppkkp.','.pppppppppp.','.ppppnnpppp.','.pwwwwwwwwp.','..wwwwwwww..','...wwwwww...','....wwww....','............'],
  grass:['............','.G....G...G.','.G...GG..GG.','.GG..G...G..','..GG.G.G.G..','G..GGG.GGG.G','GG.GGGGGGGGG','.GGGGGGGGGG.','gggggggggggg','gggggggggggg','nnnnnnnnnnnn','nnnnnnnnnnnn'],
  drop:['.....b......','.....b......','....bbb.....','....bbb.....','...bbbbb....','...blbbb....','..bblbbbb...','..bblbbbbb..','..bbbbbbbb..','...bbbbbb...','....bbbb....','............'],
  sky:['llllllllllll','llllllllllll','llllwwwlllll','lllwwwwwllll','llwwwwwwwwll','lwwwwwwwwwwl','llllllllllll','llllllllyyll','lllllllyyyyl','llllllllyyll','llllllllllll','llllllllllll'],
  up:[".....yy.....", "....yyyy....", "...yyyyyy...", "..yyyyyyyy..", ".yyyyyyyyyy.", "....yyyy....", "....yyyy....", "....yyyy....", "....yyyy....", "....yyyy....", "............", "kkkkkkkkkkkk"],
  right:["............", ".....y......", ".....yy.....", ".....yyy....", "yyyyyyyyyy..", "yyyyyyyyyyy.", "yyyyyyyyyy..", ".....yyy....", ".....yy.....", ".....y......", "............", "............"],
  back:["............", "......b.....", ".....bb.....", "....bbb.....", "..bbbbbbbbbb", ".bbbbbbbbbbb", "..bbbbbbbbbb", "....bbb.....", ".....bb.....", "......b.....", "............", "............"],
  eat:["............", ".rrrrrrrrrr.", "rrrrrrrrrrrr", "rwwwwwwwwwwr", "rkkkkkkkkkkr", "rkkkkrrkkkkr", "rkkkrrrrkkkr", ".rkkkrrkkkr.", "..rkkkkkkr..", "...rrrrrr...", "............", "............"],
  rice:["....x..x....", "...x..x..x..", "............", "wwwwwwwwwwww", "wwwwwwwwwwww", "rrrrrrrrrrrr", "rrrrrrrrrrrr", ".rrrrrrrrrr.", "..rrrrrrrr..", "...rrrrrr...", "...nnnnnn...", "............"],
  mid:["kkkkkkkkkkkk", "k..........k", "k....rr....k", "k...rrrr...k", "k..rrrrrr..k", "k..rrrrrr..k", "k..rrrrrr..k", "k..rrrrrr..k", "k...rrrr...k", "k....rr....k", "k..........k", "kkkkkkkkkkkk"],
  people:["..pp....pp..", ".pppp..pppp.", ".pppp..pppp.", "..pp....pp..", ".rrrr..bbbb.", "rrrrrr.bbbbb", "rrrrrr.bbbbb", ".rrrr..bbbb.", ".rr.rr.bb.bb", ".rr.rr.bb.bb", ".kk.kk.kk.kk", "............"],
  run:["....pp......", "...pppp.....", "...pppp.....", "....pp..b...", "..bbbbbbb...", ".b.bbbb.....", "...bbbb.....", "...bb.bb....", "..bb...bb...", "..b.....bb..", ".kk......kk.", "............"],
  coins:["............", "...yyyyyy...", "..yyooooyy..", ".yyooyyooyy.", ".yooyyyyooy.", ".yoyyooyyoy.", ".yoyyooyyoy.", ".yooyyyyooy.", ".yyooyyooyy.", "..yyooooyy..", "...yyyyyy...", "............"],
  school:[".......rr...", ".......r....", "..rrrrrrrr..", ".rrrrrrrrrr.", ".wwwwwwwwww.", ".wbbwwwwbbw.", ".wbbwwwwbbw.", ".wwwwnnwwww.", ".wbbwwnnwbbw", ".wwwwnnwwww.", ".wwwwnnwwww.", "kkkkkkkkkkkk"],
  pot:["..x..x..x...", "...x..x..x..", "............", ".kkkkkkkkkk.", "kddddddddddk", "kddddddddddk", "kddddddddddk", ".kddddddddk.", "..kddddddk..", "............", "..kk....kk..", "............"],
  sprout:["............", "...GG..GG...", "..GGGGGGGG..", "..GGGGGGGG..", "...GGGGGG...", ".....GG.....", ".....GG.....", ".....GG.....", "nnnnnnnnnnnn", "nnnnnnnnnnnn", "nnnnnnnnnnnn", "............"],
  tooth:["..xxxxxxxx..", ".wwwwwwwwww.", "wwwwwwwwwwww", "wwwwwwwwwwww", "wwwwwwwwwwww", "wwwwwwwwwwww", ".wwwwwwwwww.", ".www....www.", ".ww......ww.", ".ww......ww.", ".xx......xx.", "............"],
  pig:[".mm......mm.", "mmmm....mmmm", "mmmmmmmmmmmm", "mmkmmmmmmkmm", "mmmmmmmmmmmm", "mmmmooooommm", "mmmmokokommm", "mmmmooooommm", ".mmmmmmmmmm.", "..mm....mm..", "..kk....kk..", "............"],
  monkey:[".nn......nn.", "nnnnnnnnnnnn", "nnnnnnnnnnnn", "nnppppppppnn", "nnpkppppkpnn", "nnppppppppnn", "nnppkkkkppnn", ".nnppppppnn.", "..nnnnnnnn..", "............", "............", "............"],
  child:["...kkkkkk...", "..kkkkkkkk..", "..kppppppk..", "..kpkppkpk..", "..kppppppk..", "...kprrpk...", "....pppp....", "..bbbbbbbb..", ".bbbbbbbbbb.", ".bb.bbbb.bb.", "....bbbb....", "....kk..kk.."],
  chick:["....yyyy....", "...yyyyyy...", "...yykyyyoo.", "...yyyyyooo.", "..yyyyyyyy..", ".yyyyyyyyyy.", ".yyyyyyyyyy.", "..yyyyyyyy..", "...yyyyyy...", "....o..o....", "...oo..oo...", "............"],
  duck:["............", "....wwww....", "...wwwwwwoo.", "...wkwwwwoo.", "...wwwwww...", "..wwwwwww...", ".wwwwwwwww..", ".wwwwwwwwww.", "..wwwwwwww..", "bbbbbbbbbbbb", "blbbblbbblbb", "bbbbbbbbbbbb"],
  flower:["...rr..rr...", "..rrrrrrrr..", "..rryyyyrr..", "..rryyyyrr..", "..rrrrrrrr..", "...rr..rr...", ".....GG.....", "..GG.GG.....", "..GGGGG.....", ".....GG.....", ".....GG.....", ".....GG....."],
  river:["GGGGGGGGGGGG", "GGGGGGGGGGGG", "bbbbbbbbbbbb", "bwwbbbbwwbbb", "bbbbwwbbbbww", "bbbbbbbbbbbb", "bwwbbbbwwbbb", "bbbbwwbbbbww", "bbbbbbbbbbbb", "GGGGGGGGGGGG", "GGGGGGGGGGGG", "............"],
  face:[".pppppppppp.", "pppppppppppp", "ppkkppppkkpp", "ppkkppppkkpp", "pppppppppppp", "pmmpppppppmm", "pppprrrrpppp", "pppppppppppp", ".pppppppppp.", "..pppppppp..", "............", "............"],
  leaf:["............", ".......GG...", ".....GGGGG..", "...GGGGGGGG.", "..GGGgGGGG..", ".GGGGgGGG...", "..GGGGGG....", "...GGGG.....", "bbbbbbbbbbbb", "blbbblbbblbb", "bbbbbbbbbbbb", "bbbbbbbbbbbb"],
  sparkle:["............", ".....ww.....", ".....yy.....", "....yyyy....", "...yyyyyy...", "wyyyyyyyyyyw", "wyyyyyyyyyyw", "...yyyyyy...", "....yyyy....", ".....yy.....", ".....ww.....", "............"],
  cloud:["llllllllllll", "llllwwwwllll", "llwwwwwwwwll", "lwwwwwwwwwwl", "wwwwwwwwwwww", "wwwwwwwwwwww", "lwwwwwwwwwwl", "llllllllllll", "llllllllllll", "llllllllllll", "llllllllllll", "llllllllllll"],
  clock:["...kkkkkk...", "..kwwwwwwk..", ".kwwwkwwwwk.", "kwwwwkwwwwwk", "kwwwwkwwwwwk", "kwwwwkkkkwwk", "kwwwwwwwwwwk", "kwwwwwwwwwwk", ".kwwwwwwwwk.", "..kwwwwwwk..", "...kkkkkk...", "............"],
  sunmoon:["............", "..yyy..cc...", ".yyyyy.cc...", ".yyyyy.ccc..", ".yyyyy.ccc..", "..yyy..cc...", "............", "............", "............", "............", "............", "............"],
  very:["............", "............", "..........rr", "..........rr", ".....rr...rr", ".....rr...rr", "..rr.rr...rr", "..rr.rr...rr", "..rr.rr...rr", "..rr.rr...rr", "kkkkkkkkkkkk", "............"],
  no:["rr........rr", "rrr......rrr", ".rrr....rrr.", "..rrr..rrr..", "...rrrrrr...", "....rrrr....", "....rrrr....", "...rrrrrr...", "..rrr..rrr..", ".rrr....rrr.", "rrr......rrr", "rr........rr"],
  spk:['............','.....k......','....kk...k..','...kkk....k.','kkkkkk..k.k.','kkkkkk...k.k','kkkkkk...k.k','kkkkkk..k.k.','...kkk....k.','....kk...k..','.....k......','............']
};
function pix(name,size){ var m=ICON[name]||[], o='';
  m.forEach(function(row,y){ var x=0; while(x<row.length){ var ch=row[x], s=x; while(x<row.length&&row[x]===ch) x++; if(ch!=='.') o+='<rect x="'+s+'" y="'+y+'" width="'+(x-s)+'" height="1" fill="'+PAL[ch]+'"/>'; } });
  return '<svg class="grp-px" viewBox="0 0 12 12" width="'+size+'" height="'+size+'" shape-rendering="crispEdges" aria-hidden="true">'+o+'</svg>'; }

/* ---------- 8-bit boards (pixel scenes behind each group) ---------- */
function R(x,y,w,h,c){ return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c+'"/>'; }
function disc(cx,cy,r,c,y0,y1){ var o=''; for(var dy=-r;dy<=r;dy++){ var y=cy+dy; if(y0!=null&&(y<y0||y>y1)) continue; var hw=Math.round(Math.sqrt(r*r-dy*dy)); o+=R(cx-hw,y,hw*2+1,1,c); } return o; }
var SCENE={
  windows:function(v){ var o=R(0,0,48,34,'#8a5a34')+R(0,0,48,1,'#b07a45')+R(0,0,1,34,'#b07a45')+R(47,0,1,34,'#5a3a1f');
    if(v==='dawn') o+=R(3,3,42,8,'#ffd27a')+R(3,11,42,8,'#ffb070')+R(3,19,42,9,'#ff8a5c')+disc(13,28,7,'#ff5a3c',3,27)+R(32,7,2,1,'#5a3a1f')+R(34,8,1,1,'#5a3a1f')+R(35,7,2,1,'#5a3a1f')+R(38,10,2,1,'#5a3a1f')+R(40,11,1,1,'#5a3a1f')+R(41,10,2,1,'#5a3a1f');
    else if(v==='sun') o+=R(3,3,42,13,'#5fb8ff')+R(3,16,42,12,'#8fd3ff')+disc(35,9,4,'#ffd23f')+R(35,3,1,1,'#ffd23f')+R(41,9,1,1,'#ffd23f')+R(29,9,1,1,'#ffd23f')+R(35,15,1,1,'#ffd23f')+R(7,20,10,2,'#ffffff')+R(9,18,6,2,'#ffffff')+R(8,22,8,1,'#d8eeff')+R(27,22,8,2,'#ffffff')+R(29,21,4,1,'#ffffff');
    else o+=R(3,3,42,13,'#141c33')+R(3,16,42,12,'#1f2a44')+disc(35,10,5,'#fff3b0')+disc(33,9,4,'#141c33')+R(8,6,1,1,'#fff')+R(14,12,1,1,'#fff')+R(21,5,1,1,'#fff')+R(27,21,1,1,'#fff')+R(10,23,1,1,'#fff')+R(41,22,1,1,'#fff')+R(17,19,1,1,'#ffd23f');
    return o+R(2,2,44,1,'#5a3a1f')+R(2,28,44,1,'#5a3a1f')+R(2,2,1,27,'#5a3a1f')+R(45,2,1,27,'#5a3a1f')+R(23,3,2,25,'#5a3a1f')+R(3,15,42,2,'#5a3a1f')+R(0,29,48,5,'#b07a45')+R(0,29,48,1,'#d9a066')+R(0,33,48,1,'#5a3a1f'); },
  carts:function(){ var o=R(0,0,48,36,'#f3e6c4')+R(0,31,48,5,'#d9c49a'), ink='#0e1526';
    for(var y=7;y<=22;y++){ var l=5+Math.floor((y-7)/4), r=41-Math.floor((y-7)/4); o+=R(l,y,r-l,1,(y-7)%4===3?'#9aa3b5':'#dff0ff'); for(var x=l+4;x<r;x+=5) o+=R(x,y,1,1,'#9aa3b5'); o+=R(l-1,y,1,1,ink)+R(r,y,1,1,ink); }
    return o+R(3,5,40,2,ink)+R(7,23,32,2,ink)+R(10,25,2,4,ink)+R(35,25,2,4,ink)+R(8,28,31,1,'#9aa3b5')+disc(11,31,3,ink)+disc(11,31,1,'#9aa3b5')+disc(36,31,3,ink)+disc(36,31,1,'#9aa3b5')+R(43,2,1,5,ink)+R(43,2,4,1,ink)+R(44,1,3,1,'#c8322b'); },
  shelf:function(){ var o=R(0,0,40,40,'#4a2f17')+R(0,0,40,1,'#6b4423')+R(3,3,34,24,'#7a4f2a');
    for(var x=3;x<37;x+=6) o+=R(x,3,1,24,'#5a3a1f'); [[6,8],[12,17],[19,6],[25,20],[31,11],[8,22],[28,5]].forEach(function(p){ o+=R(p[0],p[1],2,1,'#8a5a34'); });
    return o+R(3,27,34,3,'#a26b3a')+R(3,27,34,1,'#c98b4f')+R(3,30,34,7,'#8a5a34')+R(3,30,34,1,'#5a3a1f')+R(3,36,34,1,'#5a3a1f')+R(19,33,3,1,'#ffcd3c')+R(0,37,40,3,'#3e2713'); },
  pens:function(){ var o=R(0,0,48,10,'#8fd3ff')+R(6,3,7,2,'#fff')+R(8,2,3,1,'#fff')+R(32,5,8,2,'#fff')+R(34,4,4,1,'#fff')+R(0,10,48,22,'#6cc04a')+R(0,10,48,1,'#86d45e');
    [[3,22],[11,27],[20,24],[29,28],[38,23],[44,29],[7,30],[24,30],[16,21],[41,19]].forEach(function(p){ o+=R(p[0],p[1],1,2,'#3f8f3a')+R(p[0]+1,p[1]-1,1,3,'#3f8f3a'); });
    o+=R(0,11,48,1,'#8a5a34')+R(0,15,48,1,'#8a5a34');
    for(var x=1;x<48;x+=5) o+=R(x,9,3,9,'#c98b4f')+R(x+1,8,1,1,'#c98b4f')+R(x+2,9,1,9,'#8a5a34');
    return o+R(0,18,48,1,'#5a9e3c'); },
  hoops:function(){ var o=R(0,0,48,30,'#f3e6c4');
    for(var y=3;y<30;y+=4){ o+=R(0,y,48,1,'#e6d3a6'); for(var x=(y%8===3?2:6);x<48;x+=8) o+=R(x,y-3,1,3,'#e6d3a6'); }
    o+=R(23,18,2,12,'#9aa3b5')+R(8,1,32,17,'#0e1526')+R(9,2,30,15,'#ffffff')+R(18,8,12,9,'#c8322b')+R(19,9,10,7,'#ffffff');
    o+=R(14,17,20,2,'#e8622c')+R(14,19,20,1,'#0e1526');
    for(var y2=20;y2<27;y2++){ var l=15+Math.floor((y2-20)/2), r=33-Math.floor((y2-20)/2); for(var x2=l;x2<r;x2++) if((x2+y2)%2===0) o+=R(x2,y2,1,1,'#ffffff'); }
    o+=R(0,30,48,14,'#c9a46e');
    for(var y3=32;y3<44;y3+=3) o+=R(0,y3,48,1,'#b08850');
    return o+R(0,30,48,1,'#8a6a3c')+R(0,34,48,1,'#ffffff'); }
};
function scene(theme,v){ var t=THEME[theme]; return '<svg class="grp-scene" viewBox="0 0 '+t.W+' '+t.H+'" preserveAspectRatio="none" shape-rendering="crispEdges" aria-hidden="true">'+SCENE[theme](v)+'</svg>'; }

var CSS = [
'.grp{--g-ink:var(--ink,#0e1526);--g-hi:var(--sun,var(--yel,#ffcd3c));--g-paper:var(--paper,#fff);--g-cream:#f3e6c4;--g-red:#c8322b;--g-okd:var(--ok-d,#2e7d32);--g-mute:var(--mute,#4a5068);--g-px:var(--f-px,"Press Start 2P",ui-monospace,monospace);display:flex;flex-direction:column;gap:16px;color:var(--g-ink)}',
'.grp .zh{font-family:"Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif;font-weight:700}',
'.grp-px{display:block;flex:none}',
/* instruction row: pixel buddy + speech box */
'.grp-top{display:flex;align-items:center;gap:12px}',
'.grp-ava{flex:none;width:72px;height:auto}',
'.grp-box{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:10px 12px;background:var(--g-paper);border:4px solid var(--g-ink)}',
'.grp-spk{flex:none;display:grid;place-items:center;width:46px;height:46px;padding:0;background:var(--g-hi);border:4px solid var(--g-ink);cursor:pointer}',
'.grp-msg{margin:0;flex:1;min-width:0;font-weight:700;font-size:clamp(14px,2.2vw,18px);line-height:1.4}',
'.grp-msg.good{color:var(--g-okd)}.grp-msg.bad{color:var(--g-red)}',
'.grp-msg i{font-style:normal;font-weight:600;color:var(--g-mute)}',
'.grp-count{flex:none;padding:6px 8px;background:var(--g-ink);color:var(--g-hi);font-family:var(--g-px);font-size:11px;line-height:1}',
'@media (max-width:520px){.grp-ava{width:52px}.grp-spk{width:40px;height:40px}}',
/* groups */
'.grp-bins{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));gap:14px}',
'.grp-bins.n4{grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr))}',
'@media (max-width:620px){.grp-bins,.grp-bins.n4{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}}',
'.grp-bin{position:relative;display:flex;flex-direction:column;gap:0;padding:0;border:4px solid var(--g-ink);background:var(--g-cream);color:var(--g-ink);font:inherit;text-align:left;cursor:pointer;box-shadow:6px 6px 0 var(--g-ink)}',
'.grp-bin:focus-visible,.grp-card:focus-visible,.grp-spk:focus-visible{outline:4px solid var(--g-hi);outline-offset:3px}',
'.grp-bin.ready,.grp-bin.over{box-shadow:6px 6px 0 var(--g-hi);outline:4px solid var(--g-hi);outline-offset:0}',
'.grp-bin.over{transform:translate(-2px,-4px)}',
'.grp-lab{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:8px 10px;border-bottom:4px solid var(--g-ink);background:var(--g-cream)}',
'.grp-lab b{font-size:clamp(28px,4.6vw,40px);line-height:1}',
'.grp-sub{flex:1 1 100%;font-size:12px;font-weight:700;color:var(--g-mute);line-height:1.3}',
'.grp-body{position:relative;display:block;width:100%;overflow:hidden}',
'.grp-scene{position:absolute;inset:0;width:100%;height:100%;display:block}',
'.grp-pile{position:absolute;display:flex;flex-wrap:wrap;align-content:flex-start;justify-content:center;gap:6px;padding:4px}',
/* where each scene leaves room for the cards */
'.t-windows .grp-body{aspect-ratio:48/34}.t-windows .grp-pile{left:8%;right:8%;top:10%;bottom:20%}',
'.t-carts .grp-body{aspect-ratio:48/36}.t-carts .grp-pile{left:13%;right:17%;top:20%;bottom:39%;align-content:center}',
'.t-shelf .grp-body{aspect-ratio:40/40}.t-shelf .grp-pile{left:9%;right:9%;top:8%;bottom:33%;align-content:flex-end;align-items:flex-end;gap:3px}',
'.t-pens .grp-body{aspect-ratio:48/32}.t-pens .grp-pile{left:3%;right:3%;top:58%;bottom:3%;align-content:center}',
'.t-hoops .grp-body{aspect-ratio:48/44}.t-hoops .grp-pile{left:3%;right:3%;top:70%;bottom:2%;align-content:center}',
/* flashcard tiles */
'.grp-tiles{display:flex;gap:4px}',
'.grp-tile{display:grid;place-items:center;width:var(--t,70px);height:var(--t,70px);background:#fff;border:2px dashed #e6d7b8;overflow:hidden}',
'.grp-tile img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none}',
'.grp-tile.txt b{font-family:"Ma Shan Zheng","Noto Sans SC",serif;color:var(--g-red);font-size:calc(var(--t,70px)*.72);line-height:1}',
'.grp-tile.hl{border:4px solid var(--g-red);animation:grpBob .5s steps(2) 3}',
'@keyframes grpBob{50%{transform:translateY(-6px)}}',
'.grp-chip{display:inline-flex;padding:2px;background:var(--g-paper);border:3px solid var(--g-ink);--t:30px}',
'.grp-chip .grp-tile{border:1px solid #eee2c6}',
'.t-shelf .grp-chip{--t:24px;padding:4px 2px;border-bottom:0}.t-shelf .grp-chip .grp-tiles{flex-direction:column;gap:2px}',
'.t-shelf .grp-chip:nth-child(3n+1){background:#ffd76a}.t-shelf .grp-chip:nth-child(3n+2){background:#8fd3ff}.t-shelf .grp-chip:nth-child(3n){background:#ff9a8a}',
'.t-hoops .grp-chip{background:#ff8a3c}',
'@media (max-width:620px){.grp-chip{--t:22px}.t-shelf .grp-chip{--t:18px}}',
'.grp-chip.land-pop{animation:grpPop .3s steps(3)}@keyframes grpPop{from{transform:scale(.3)}}',
'.grp-chip.land-drop{animation:grpDrop .35s steps(4)}@keyframes grpDrop{from{transform:translateY(-60px)}}',
'.grp-chip.land-slide{animation:grpSlide .3s steps(4)}@keyframes grpSlide{from{transform:translateX(-30px)}}',
'.grp-chip.land-hop{animation:grpHop .5s steps(5)}@keyframes grpHop{0%{transform:translateY(-30px)}40%{transform:translateY(0)}70%{transform:translateY(-10px)}}',
'.grp-exp{margin:10px 0;padding:10px 12px;background:#fff8d6;border:4px solid var(--g-ink);box-shadow:5px 5px 0 var(--g-ink);animation:grpIn .25s steps(3)}',
'.grp-exh{font-weight:800;font-size:14px;margin-bottom:6px}.grp-exh i{font-style:normal;color:var(--g-mute);font-weight:600}',
'.grp-exr{display:flex;align-items:center;gap:12px;width:100%;margin:4px 0;padding:6px 8px;border:3px solid var(--g-ink);background:#fff;color:var(--g-ink);font:inherit;font-size:14px;line-height:1.4;text-align:left;cursor:pointer}',
'.grp-exr>b{font-size:34px;line-height:1;min-width:1.2em;text-align:center;color:var(--g-red)}.grp-exr i{font-style:normal;font-weight:800}',
'.grp-link{margin:2px 0 8px;padding:8px 10px;background:#e6f6d8;border:3px solid var(--g-ink)}.grp-link p{margin:6px 0 0;font-size:14px;line-height:1.5}',
'.grp-eq{display:flex;flex-wrap:wrap;align-items:baseline;gap:8px;font-weight:800}.grp-eq .zh{font-size:28px;color:var(--g-red)}.grp-eq em{font-style:normal;color:var(--g-mute)}.grp-eq b{margin-left:4px;font-size:16px}',
'.grp-eqc{display:inline-flex;flex-direction:column;align-items:center;gap:2px;line-height:1}.grp-eqc .grp-px{border:3px solid var(--g-ink);background:#9fd3f0;padding:2px;box-sizing:content-box}',
'.grp-exr .grp-px{flex:none;border:3px solid var(--g-ink);background:#9fd3f0;padding:2px;box-sizing:content-box}',
/* tray */
'.grp-trayh{margin:0;font-weight:800;font-size:15px}',
'.grp-tray{display:flex;flex-wrap:wrap;gap:14px;min-height:96px}',
'.grp-card{display:inline-flex;align-items:stretch;border:4px solid var(--g-ink);background:var(--g-paper);box-shadow:6px 6px 0 var(--g-ink);cursor:grab;user-select:none;-webkit-user-select:none;touch-action:none;animation:grpIn .25s steps(3)}',
'@keyframes grpIn{from{transform:translateY(12px);opacity:0}}',
'.grp-card .grp-tiles{padding:8px}',
'.grp-card .grp-say{display:grid;place-items:center;width:52px;border:0;border-left:4px solid var(--g-ink);background:var(--g-hi);color:var(--g-ink);cursor:pointer;padding:0;touch-action:manipulation}',
'.grp-card[aria-pressed="true"]{background:var(--g-hi);transform:translate(3px,3px);box-shadow:3px 3px 0 var(--g-ink)}',
'.grp-card[aria-pressed="true"] .grp-say{background:#fff}',
'.grp-card.lifted{opacity:.3;box-shadow:none}',
'.grp-ghost{position:fixed;z-index:95;margin:0;pointer-events:none;cursor:grabbing;box-shadow:10px 10px 0 rgba(14,21,38,.45);animation:none}',
'.t-pens .grp-card{border-color:#6b4a2b;box-shadow:6px 6px 0 #6b4a2b;background:#fff6e0}.t-pens .grp-card .grp-say{border-left-color:#6b4a2b}',
'.t-hoops .grp-card{background:#ff8a3c}.t-hoops .grp-card .grp-tile{border-color:#ffd0a8}',
'.t-shelf .grp-card{border-left-width:16px}',
'.t-shelf .grp-card:nth-child(3n+1){border-left-color:#e0a800}.t-shelf .grp-card:nth-child(3n+2){border-left-color:#2e95c2}.t-shelf .grp-card:nth-child(3n){border-left-color:#c8322b}',
'@media (max-width:520px){.grp-card{--t:52px}.grp-card .grp-tiles{padding:6px}.grp-card .grp-say{width:42px}}',
'.grp-bin.shake,.grp-tray.shake{animation:grpShake .4s steps(4)}',
'@keyframes grpShake{25%{transform:translateX(-6px)}50%{transform:translateX(6px)}75%{transform:translateX(-4px)}}',
'.grp-bin.hit{animation:grpHit .4s steps(2)}@keyframes grpHit{50%{transform:translateY(-6px)}}',
'@media (prefers-reduced-motion:reduce){.grp *{animation:none!important}}',
/* celebration (CES demo) */
'.grp-conf{position:absolute;top:-14px;z-index:40;pointer-events:none;animation:grpConf 2s steps(12) forwards}@keyframes grpConf{to{transform:translate(var(--sway),var(--fall))}}',
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

function binHTML(b,theme){
  var sub=isPart(b)?'Có '+b.k+' '+b.where+' · '+b.sub:'Có chữ '+b.k+' · '+b.sub;
  return '<button type="button" class="grp-bin" data-k="'+esc(b.k)+'" aria-label="'+esc('Nhóm '+b.k+': '+sub)+'">'+
    '<span class="grp-lab">'+pix(b.ic,36)+'<b class="zh">'+esc(b.k)+'</b><span class="grp-sub">'+cj(sub)+'</span></span>'+
    '<span class="grp-body">'+scene(theme,b.ic)+'<span class="grp-pile"></span></span></button>';
}

/* host: element to fill · cfg: one CFG entry
   ad: {say(zh), sayVi(text), ding(), buzz(), done(N), img(char)->url|null, avatar:url} */
function mount(host,cfg,ad){
  injectCSS();
  var th=THEME[cfg.theme];
  var words=shuffle(cfg.words.map(function(w,i){ return {i:i,zh:w[0],py:w[1],bin:w[2],ch:w[3]||'',extra:w[4]||'',tries:0,done:false}; }));
  var N=words.length, placed=0, sel=null, busy=false, SHOW=4, hint=cfg.intro, eatClick=false;
  host.innerHTML='<div class="grp t-'+cfg.theme+'"><div class="grp-top">'+(ad.avatar?'<img class="grp-ava" src="'+esc(ad.avatar)+'" alt="">':'')+
    '<div class="grp-box"><button type="button" class="grp-spk" aria-label="Nghe hướng dẫn">'+pix('spk',26)+'</button><p class="grp-msg" role="status" aria-live="polite"></p><span class="grp-count">0/'+N+'</span></div></div>'+
    '<div class="grp-exp" hidden></div><div class="grp-bins n'+cfg.bins.length+'">'+cfg.bins.map(function(b){ return binHTML(b,cfg.theme); }).join('')+'</div>'+
    '<p class="grp-trayh">Kéo '+esc(th.thing)+' thả vào '+esc(th.verb)+' đúng</p><div class="grp-tray"></div></div>';
  var root=host.firstChild, msg=root.querySelector('.grp-msg'), tray=root.querySelector('.grp-tray'), count=root.querySelector('.grp-count'), exp=root.querySelector('.grp-exp');
  function say(t,cls,plain){ msg.className='grp-msg'+(cls?' '+cls:''); msg.innerHTML=t; hint=plain||msg.textContent; }
  say(esc(cfg.intro),'',cfg.intro);
  root.querySelector('.grp-spk').onclick=function(){ if(ad.sayVi) ad.sayVi(hint); };
  function tiles(w,hl){ return '<span class="grp-tiles">'+w.zh.split('').map(function(c){ var u=NOCARD.indexOf(c)<0&&ad.img?ad.img(c):null;
    return '<span class="grp-tile'+(u?'':' txt')+(hl&&c===hl?' hl':'')+'" data-c="'+esc(c)+'">'+(u?'<img src="'+esc(u)+'" alt="" draggable="false">':'<b>'+esc(c)+'</b>')+'</span>'; }).join('')+'</span>'; }
  function cardHTML(k){ var w=words[k]; return '<div class="grp-card" role="button" tabindex="0" aria-pressed="false" aria-label="'+esc(w.zh)+'" data-k="'+k+'">'+tiles(w)+'<button type="button" class="grp-say" aria-label="Nghe '+esc(w.zh)+'">'+pix('spk',24)+'</button></div>'; }
  function binOf(k){ return cfg.bins.filter(function(b){ return b.k===k; })[0]; }
  function clearSel(){ sel=null; tray.querySelectorAll('.grp-card').forEach(function(c){ c.setAttribute('aria-pressed','false'); }); root.querySelectorAll('.grp-bin').forEach(function(b){ b.classList.remove('ready'); }); }
  function pick(card){ if(busy) return; tray.querySelectorAll('.grp-card').forEach(function(c){ c.setAttribute('aria-pressed',String(c===card)); });
    sel=card; root.querySelectorAll('.grp-bin').forEach(function(b){ b.classList.add('ready'); }); var w=words[+card.dataset.k]; ad.say(w.zh);
    say('Con chọn <b class="zh">'+esc(w.zh)+'</b>. Kéo thả, hoặc chạm vào '+esc(th.verb)+' của nó nhé!','', 'Chạm vào '+th.verb+' của nó nhé!'); }
  function why(w){ var b=binOf(w.bin), word='<b class="zh">'+esc(w.zh)+'</b> <i>'+esc(w.py)+'</i>';
    if(isPart(b)) return word+': chữ <b class="zh">'+esc(w.ch)+'</b> có '+cj(b.k)+' '+b.where+'.'+esc(w.extra);
    return word+' có chữ '+cj(b.k)+'.'; }
  function explain(w){ var h='<div class="grp-exh"><b class="zh">'+esc(w.zh)+'</b> <i>'+esc(w.py)+'</i> · Giải thích chữ</div>';
    var lk=WX[w.zh]; if(lk){ var cs=w.zh.split('');
      var wi=WI[w.zh]||CI[cs[cs.length-1]];
      h+='<div class="grp-link"><div class="grp-eq">'+cs.map(function(c){ return '<span class="grp-eqc">'+(CI[c]?pix(CI[c],44):'')+'<span class="zh">'+esc(c)+'</span></span>'; }).join('<em>+</em>')+'<em>=</em><span class="grp-eqc">'+(wi?pix(wi,44):'')+'<span class="zh">'+esc(w.zh)+'</span></span><b>'+esc(lk[0])+'</b></div><p>'+cj(lk[1])+'</p></div>'; }
    w.zh.split('').forEach(function(c){ var e=EXP[c]; if(!e) return;
      h+='<button type="button" class="grp-exr" data-c="'+esc(c)+'" aria-label="Nghe '+esc(c)+'">'+(CI[c]?pix(CI[c],48):'')+'<b class="zh">'+esc(c)+'</b><span><i>'+esc(e[0])+'</i> · '+esc(e[1])+'<br>'+cj(e[2])+'</span></button>'; });
    exp.innerHTML=h; exp.hidden=false;
    exp.querySelectorAll('.grp-exr').forEach(function(r){ r.onclick=function(){ ad.say(r.dataset.c); }; }); }
  /* returns true when the word belongs to this group */
  function judge(card,bin){
    var w=words[+card.dataset.k];
    if(bin.dataset.k===w.bin){
      busy=true; ad.ding(); ad.say(w.zh);
      var chip=document.createElement('span'); chip.className='grp-chip land-'+th.land; chip.title=w.zh+' · '+w.py; chip.setAttribute('aria-label',w.zh); chip.innerHTML=tiles(w);
      bin.querySelector('.grp-pile').appendChild(chip); card.remove(); w.done=true; clearSel(); placed++;
      count.textContent=placed+'/'+N; bin.classList.remove('hit'); void bin.offsetWidth; bin.classList.add('hit');
      say('Đúng rồi! '+why(w),'good'); explain(w); refill(); busy=false;
      if(placed>=N) setTimeout(function(){ ad.done(N); },2600);
      return true;
    }
    w.tries++; ad.buzz(); bin.classList.remove('shake'); void bin.offsetWidth; bin.classList.add('shake');
    if(w.tries<2){ say('<b class="zh">'+esc(w.zh)+'</b> chưa hợp '+esc(th.verb)+' này. Con nhìn kỹ từng chữ đỏ nhé!','bad'); return false; }
    var b=binOf(w.bin), hl=isPart(b)?w.ch:w.bin;
    card.querySelector('.grp-tiles').outerHTML=tiles(w,hl);
    say(isPart(b)?'Gợi ý: nhìn '+b.where+' của chữ đang nhảy nhé!':'Gợi ý: nhìn chữ đang nhảy nhé!','bad');
    return false;
  }
  /* drag and drop (pointer events: mouse, pen and touch); a tap without moving selects instead */
  function binAt(x,y){ var el=document.elementFromPoint(x,y), b=el&&el.closest?el.closest('.grp-bin'):null; return b&&root.contains(b)?b:null; }
  function drag(card,e){
    if(busy||(e.button!=null&&e.button>0)||e.target.closest('.grp-say')) return;
    var sx=e.clientX, sy=e.clientY, r=card.getBoundingClientRect(), ghost=null, over=null, id=e.pointerId;
    try{ card.setPointerCapture(id); }catch(err){}
    function move(ev){ if(ev.pointerId!==id) return; var dx=ev.clientX-sx, dy=ev.clientY-sy;
      if(!ghost){ if(Math.abs(dx)+Math.abs(dy)<8) return;
        clearSel(); ghost=card.cloneNode(true); ghost.classList.add('grp-ghost'); ghost.removeAttribute('tabindex');
        ghost.style.left=r.left+'px'; ghost.style.top=r.top+'px'; ghost.style.width=r.width+'px'; ghost.style.height=r.height+'px';
        root.appendChild(ghost); card.classList.add('lifted'); ad.say(words[+card.dataset.k].zh); }
      ghost.style.transform='translate('+dx+'px,'+dy+'px) rotate(-3deg)';
      var b=binAt(ev.clientX,ev.clientY); if(b!==over){ if(over) over.classList.remove('over'); over=b; if(over) over.classList.add('over'); }
      ev.preventDefault(); }
    function end(ev){ if(ev.pointerId!==id) return;
      card.removeEventListener('pointermove',move); card.removeEventListener('pointerup',end); card.removeEventListener('pointercancel',end);
      if(!ghost) return;
      eatClick=true; setTimeout(function(){ eatClick=false; },0);
      if(over) over.classList.remove('over');
      var ok=ev.type==='pointerup'&&over?judge(card,over):false;
      if(ok){ ghost.remove(); return; }
      var t=ghost.style.transform;
      if(reduce()||!ghost.animate){ ghost.remove(); card.classList.remove('lifted'); return; }
      ghost.animate([{transform:t},{transform:'translate(0,0) rotate(0)'}],{duration:260,easing:'steps(6)'}).onfinish=function(){ ghost.remove(); card.classList.remove('lifted'); }; }
    card.addEventListener('pointermove',move); card.addEventListener('pointerup',end); card.addEventListener('pointercancel',end);
  }
  function wire(card){
    card.addEventListener('pointerdown',function(e){ drag(card,e); });
    card.addEventListener('click',function(e){ if(eatClick) return; if(e.target.closest('.grp-say')){ e.stopPropagation(); ad.say(words[+card.dataset.k].zh); return; } pick(card); });
    card.addEventListener('keydown',function(e){ if(e.target===card&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); pick(card); } });
    card.addEventListener('dragstart',function(e){ e.preventDefault(); });
  }
  function refill(){ var shown=[].map.call(tray.querySelectorAll('.grp-card'),function(c){ return +c.dataset.k; });
    for(var k=0;k<N&&shown.length<SHOW;k++){ if(!words[k].done&&shown.indexOf(k)<0){ tray.insertAdjacentHTML('beforeend',cardHTML(k)); wire(tray.lastElementChild); shown.push(k); } } }
  refill();
  root.querySelectorAll('.grp-bin').forEach(function(bin){ bin.onclick=function(){
    if(busy) return;
    if(!sel){ say('Con kéo một '+esc(th.thing)+' ở dưới thả vào đây nhé!'); tray.classList.remove('shake'); void tray.offsetWidth; tray.classList.add('shake'); return; }
    judge(sel,bin);
  }; });
}

/* small celebration for pages that have no fireworks of their own (CES demo) */
function celebrate(host){
  try{ var au=new Audio('sfx/confetti.mp3'); au.volume=.85; var pr=au.play(); if(pr&&pr.catch) pr.catch(function(){}); }catch(e){}
  if(reduce()) return;
  var cols=['#ffdf01','#ff6b6b','#6cc04a','#8fd3ff','#ffffff','#ffa53b','#c77dff'];
  for(var i=0;i<46;i++){ (function(i){ setTimeout(function(){ var s=document.createElement('i'), sz=i%3===0?12:8; s.className='grp-conf';
    s.style.left=Math.round(Math.random()*96)+'%'; s.style.width=s.style.height=sz+'px'; s.style.background=cols[i%cols.length];
    s.style.setProperty('--fall',(220+Math.random()*160|0)+'px'); s.style.setProperty('--sway',((Math.random()*60|0)-30)+'px'); s.style.animationDuration=(1.4+Math.random())+'s';
    host.appendChild(s); setTimeout(function(){ s.remove(); },2600); },Math.random()*900); })(i); }
}
window.GRPKit={pix:pix,CFG:CFG,mount:mount,celebrate:celebrate,css:injectCSS,cardDir:CARDDIR,noCard:NOCARD};

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
function cardSrc(c){ return CARDDIR[c]?'../'+CARDDIR[c]+'/img/'+c.codePointAt(0)+'_red.webp':null; }
function start(){ var cfg=CFG[UN+'-'+LN]; if(!cfg) return; G.started=true; P.querySelectorAll('.result').forEach(function(r){ r.remove(); }); head();
  mount(host,cfg,{ img:cardSrc, avatar:'../img/c_'+(BUDDY[LN-1]||'bunny')+'.webp',
    say:function(t){ try{ say(t,'zh'); }catch(e){} }, sayVi:function(t){ try{ say(t,'vi'); }catch(e){} },
    ding:function(){ try{ ding(); }catch(e){} }, buzz:function(){ try{ buzz(); }catch(e){} },
    done:function(N){ try{ markDone('grp'); }catch(e){} resultCard(P,cfg.win,0,'Chúc mừng con đã hoàn thành '+N+'/'+N+' câu! '+cfg.cheer,start); } }); }
document.addEventListener('click',function(e){ var b=e.target.closest&&e.target.closest('.act[data-act="grp"]'); if(b && !G.started) setTimeout(start,0); });
var _pl=paintLesson; paintLesson=function(){ G.started=false; host.innerHTML=''; var r=_pl.apply(this,arguments); head(); return r; };
head();
})();
