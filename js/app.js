(function () {
  'use strict';
  const C = window.Cube, R = window.Render;
  const $ = s => document.querySelector(s);
  const view = $('#view');
  const D2R = Math.PI / 180;

  /* ---------- tiến độ (lưu trên trình duyệt) ---------- */
  const loadLearned = () => { try { return new Set(JSON.parse(localStorage.getItem('rubik-learned') || '[]')); } catch (e) { return new Set(); } };
  const learned = loadLearned();
  const saveLearned = () => { try { localStorage.setItem('rubik-learned', JSON.stringify([...learned])); } catch (e) { /* bỏ qua */ } updateNav(); };
  const toggleLearned = k => { learned.has(k) ? learned.delete(k) : learned.add(k); saveLearned(); };

  /* ---------- dữ liệu ---------- */
  const SHAPE_VN = { dot: 'Chấm', line: 'Đường thẳng', L: 'Chữ L', cross: 'Chữ thập', other: 'Khác' };
  const NICK = { 21: 'H', 22: 'Pi', 23: 'U', 24: 'T', 25: 'L', 26: 'Anti-Sune', 27: 'Sune' };
  const OLL_STAR = { 2: 'Chấm: làm cả 2 bước cạnh', 44: 'Bước cạnh (chữ L)', 45: 'Bước cạnh (đường thẳng)' };
  for (let i = 21; i <= 27; i++) OLL_STAR[i] = 'Bước góc';
  const PLL_STAR = { Aa: 'Bước góc', Ab: 'Bước góc', E: 'Bước góc', Ua: 'Bước cạnh', Ub: 'Bước cạnh', H: 'Bước cạnh', Z: 'Bước cạnh' };

  const LESSONS = window.BasicsData.LESSONS;

  /* ---------- F2L: xoay tình huống về phía trước-phải + phân nhóm theo cách nhận dạng ---------- */
  const F2L_GROUPS = [
    ['Cặp đã ghép sẵn', 'Góc và cạnh đã dính nhau đúng màu — chỉ cần đưa cả cặp vào rãnh. Học nhóm này đầu tiên.'],
    ['Góc trắng hướng lên', 'Ô trắng của góc nằm trên mặt trên — phải tách góc ra, ghép với cạnh rồi mới chèn.'],
    ['Góc & cạnh tách rời', 'Góc ở tầng trên (ô trắng hướng ngang), cạnh nằm chỗ khác trên tầng trên — ghép cặp rồi chèn.'],
    ['Kề nhau nhưng ghép sai', 'Góc và cạnh nằm sát nhau nhưng màu không khớp — cần tách ra và ghép lại.'],
    ['Góc đã ở trong rãnh', 'Góc nằm sẵn trong rãnh (có thể bị xoắn), cạnh ở tầng trên.'],
    ['Cạnh đã ở trong rãnh', 'Cạnh nằm sẵn trong rãnh, góc ở tầng trên.'],
    ['Cả hai trong rãnh (sai hướng)', 'Cả góc và cạnh đều ở trong rãnh nhưng sai hướng — các trường hợp khó nhất.']
  ];
  const isPair = s => s.home[0] === 1 && s.home[2] === 1 && s.home[1] <= 0;
  function mergeAUF(pre, alg) { // pre = số phần tư vòng U thêm vào đầu công thức
    const toks = C.tokens(alg), q = t => (t === 'U' ? 1 : t === 'U2' ? 2 : t === "U'" ? 3 : -1);
    let total = pre % 4;
    if (toks.length && q(toks[0]) >= 0) total = (total + q(toks.shift())) % 4;
    if (total) toks.unshift(['', 'U', 'U2', "U'"][total]);
    return toks.join(' ');
  }
  function f2lFeatures(st) {
    const cs = st.filter(s => isPair(s) && s.home[1] === -1), es = st.filter(s => isPair(s) && s.home[1] === 0);
    const cTop = cs[0].p[1] === 1, eTop = es[0].p[1] === 1;
    const white = cs.find(s => s.c === 'D');
    let group;
    if (!cTop && !eTop) group = 6;
    else if (!cTop) group = 4;
    else if (!eTop) group = 5;
    else if (white.n[1] === 1) group = 1;
    else {
      const cp = cs[0].p, ep = es[0].p;
      const adj = Math.abs(cp[0] - ep[0]) + Math.abs(cp[2] - ep[2]) === 1;
      if (!adj) group = 2;
      else {
        const match = es.every(e => { const c = cs.find(x => C.eq(x.n, e.n)); return !c || c.c === e.c; });
        group = match ? 0 : 3;
      }
    }
    return { group, whiteDir: white.n[1] === 1 ? 'lên trên' : 'sang ngang' };
  }
  function buildF2L() {
    const items = window.F2LData.map(d => {
      const base = C.caseState(d.alg);
      // chọn lần xoay U để cặp cần giải lộ rõ nhất từ góc nhìn trước-phải
      let best = null;
      for (let a = 0; a < 4; a++) {
        const st = C.applyAlg(C.clone(base), Array(a).fill('U').join(' '));
        const vis = st.filter(s => isPair(s) && (s.n[1] === 1 || s.n[2] === 1 || s.n[0] === 1)).length;
        const corner = st.find(s => isPair(s) && s.home[1] === -1);
        const sc = vis * 10 + (C.eq(corner.p, [1, 1, 1]) ? 3 : 0) - a * 0.1;
        if (!best || sc > best.sc) best = { a, sc };
      }
      const alg = mergeAUF((4 - best.a) % 4, d.alg);
      const f = f2lFeatures(C.caseState(alg));
      return { key: 'f2l-' + d.id, kind: 'f2l', alg, group: F2L_GROUPS[f.group][0], gi: f.group, tags: [], star: false, len: C.tokens(alg).length };
    });
    items.sort((a, b) => a.gi - b.gi || a.len - b.len);
    items.forEach((it, i) => { it.title = 'F2L ' + (i + 1); });
    return items;
  }
  const GROUP_DESC = Object.fromEntries(F2L_GROUPS);
  const SETS = {
    f2l: buildF2L(),
    oll: window.LLData.OLL.map(d => {
      const st = C.caseState(d.alg), info = C.ollInfo(st);
      const tags = [SHAPE_VN[info.shape]];
      if (NICK[d.id]) tags.push(NICK[d.id]);
      return { key: 'oll-' + d.id, kind: 'oll', num: d.id, title: 'OLL ' + d.id, alg: d.alg, group: SHAPE_VN[info.shape], tags, info, star: OLL_STAR[d.id] || false };
    }),
    pll: window.LLData.PLL.map(d => {
      const st = C.caseState(d.alg), info = C.pllInfo(st);
      return { key: 'pll-' + d.name, kind: 'pll', name: d.name, title: 'PLL ' + d.name, alg: d.alg, alts: d.alts || [], group: d.group, tags: d.alts && d.alts.length ? [d.group, (d.alts.length + 1) + ' công thức'] : [d.group], info, star: PLL_STAR[d.name] || false };
    })
  };
  /* ---------- Bộ mở rộng: COLL, ZBLL, Winter Variation ---------- */
  const ZB_SHAPE = { T: 'T', U: 'U', L: 'L', H: 'H', Pi: 'Pi', S: 'Sune', AS: 'Anti-Sune' };
  const ZB_OLL = { T: 24, U: 23, L: 25, H: 21, Pi: 22, S: 27, AS: 26 };
  const ZB_COLOR = { T: '#ffd500', U: '#ff7a1a', L: '#3ddc84', H: '#4aa8ff', Pi: '#c77dff', S: '#ff5d8f', AS: '#2dd4bf' };
  const ZB_COLL = {}; window.ZBLLData.forEach(d => { if (d.coll) ZB_COLL[d.shape + d.set] = d; });
  SETS.zbll = window.ZBLLData.map(d => ({
    key: 'zbll-' + d.id, kind: 'zbll', title: 'ZBLL ' + d.id, alg: d.alg, shape: d.shape, set: d.set, coll: d.coll, fb: d.fb, fbPre: d.fbPre,
    group: `${ZB_SHAPE[d.shape]} · nhóm góc ${d.set}`, chip: ZB_SHAPE[d.shape],
    tags: [ZB_SHAPE[d.shape], ...(d.coll ? ['COLL'] : ['Cạnh: ' + d.fb])], star: false
  }));
  SETS.coll = window.ZBLLData.filter(d => d.coll).map(d => ({
    key: 'coll-' + d.shape + d.set, kind: 'coll', title: `COLL ${d.shape}${d.set}`, alg: d.alg, shape: d.shape, set: d.set, zbll: d.id,
    group: ZB_SHAPE[d.shape], tags: [ZB_SHAPE[d.shape]], star: false
  }));
  const OCLL_KEYS = Object.entries(ZB_OLL).map(([sh, id]) => [C.ollKey(C.caseState(window.LLData.OLL.find(o => o.id === id).alg)), sh]);
  SETS.wv = window.WVData.map(d => {
    // nếu chỉ chèn cặp bằng R U R' thì mặt trên sẽ thành hình OCLL nào?
    let after = null;
    for (const a of ['', 'U', 'U2', "U'"]) {
      const s2 = C.applyAlg(C.caseState(d.alg), a + " R U R'");
      if (!C.isF2LIntact(s2)) continue;
      const i = C.ollInfo(s2); after = i.corners === 4 ? 'skip' : (OCLL_KEYS.find(([k]) => k === C.ollKey(s2)) || [])[1]; break;
    }
    const g = after === 'skip' ? 'Mặt trên sẽ vàng sẵn' : after ? `Nếu chèn thường sẽ ra ${ZB_SHAPE[after]}` : 'Khác';
    return { key: 'wv-' + d.id, kind: 'wv', title: d.id, alg: d.alg, wvAfter: after, group: g, tags: after && after !== 'skip' ? [ZB_SHAPE[after]] : [], star: false };
  });
  const PALETTE = ['#ffd500', '#ff7a1a', '#3ddc84', '#4aa8ff', '#c77dff', '#ff5d8f', '#2dd4bf', '#f4a261', '#9aa3b8'];
  for (const k in SETS) {
    const groups = [...new Set(SETS[k].map(i => i.group))];
    for (const it of SETS[k]) {
      it.gc = it.shape ? ZB_COLOR[it.shape] : PALETTE[groups.indexOf(it.group) % PALETTE.length];
      let st = C.caseState(it.alg); it.play = it.alg; it.pre = '';
      if (k === 'pll') { // xoay U (AUF) sao cho hình tình huống gọn nhất, giống sơ đồ chuẩn
        let best = 99, ba = 0, cur = C.clone(st);
        for (let a = 0; a < 4; a++) {
          const pp = C.pllPerm(cur), mv = pp.c.filter((v, i) => v !== i).length + pp.e.filter((v, i) => v !== i).length;
          if (mv < best) { best = mv; ba = a; }
          C.applyAlg(cur, 'U');
        }
        if (ba) { st = C.applyAlg(st, Array(ba).fill('U').join(' ')); it.pre = ['', "U'", 'U2', 'U'][ba]; it.play = it.pre + ' ' + it.alg; }
      }
      it.state = st;
      // công thức thay thế: tìm xoay U trước / sau (AUF) để giải đúng từ cùng trạng thái hiển thị
      if (it.alts && it.alts.length) it.variants = it.alts.map(alg => {
        for (const a of ['', 'U', 'U2', "U'"]) for (const c of ['', 'U', 'U2', "U'"]) {
          const S = C.applyAlg(C.clone(st), [a, alg, c].join(' '));
          if (S.every(s => C.eq(s.p, s.home) && C.eq(s.n, C.FACES[s.c]))) { const play = [a, alg, c].filter(Boolean).join(' '); return { alg, pre: a, post: c, play, setup: C.invertAlg(play) }; }
        }
        return null;
      }).filter(Boolean);
    }
  }
  // Trường hợp đặc biệt: hiện thêm trong từng mục, nhưng không tính vào tiến độ / bài kiểm tra
  const SPECIAL_G = '⚠️ Trường hợp đặc biệt';
  const SPECIAL_DESC = {
    f2l: 'Chèn trực tiếp vào 3 rãnh còn lại (không cần xoay khối), và khi góc/cạnh của cặp bị kẹt trong một rãnh khác.',
    oll: 'Mặt trên không giống OLL nào trong 57 trường hợp? Thường là do F2L bị sai ngầm (có công thức sửa) hoặc khối đã bị bung mảnh / vặn góc (phải sửa bằng tay). Mẹo: số cạnh vàng trên mặt trên luôn phải CHẴN (0, 2, 4).',
    pll: 'Tầng trên không giống PLL nào trong 21 trường hợp — ví dụ chỉ có đúng 2 cạnh hoặc 2 góc đổi chỗ? Kiểm tra F2L trước (có công thức sửa); nếu F2L đúng hết thì khối đã bị lắp sai (phải sửa bằng tay).'
  };
  const SPECIAL = {};
  for (const k of ['f2l', 'oll', 'pll']) SPECIAL[k] = window.SpecialData[k].map((d, i) => {
    const state = d.tamper ? C.tamper(C.solved(), d.tamper) : C.caseState(d.alg);
    const tags = d.impossible ? ['Khối bị lắp sai', 'Sửa bằng tay'] : d.tamper ? ['F2L sai ngầm', 'Có công thức sửa'] : ['Đặc biệt', ...(d.slot && d.slot !== 'FR' ? ['Rãnh ' + d.slot] : [])];
    return { key: `sp-${k}-${i}`, kind: k, title: d.title, alg: d.alg, play: d.alg, state, group: SPECIAL_G, gc: d.impossible ? '#ff4d4d' : '#ff5d8f', tags, star: false, special: true, desc: d.note, slot: d.slot,
      impossible: d.impossible, fixText: d.fixText, after: d.after, setup: d.setup, view3d: !!d.tamper && !d.impossible,
      info: k === 'oll' ? C.ollInfo(state) : k === 'pll' ? C.pllInfo(state) : undefined };
  });

  /* ---------- Khối lớn: 4×4 và 5×5 (phương pháp thu gọn) ---------- */
  const BCUBE = window.BigCube;
  const BIG_PAL = ['#4aa8ff', '#3ddc84', '#ffd500', '#c77dff', '#ff7a1a', '#2dd4bf', '#ff5d8f'];
  const BIG_GROUP_DESC = {
    'Ký hiệu lớp rộng & lớp trong': 'Trên khối lớn, ngoài R U F… còn có nước đi nhiều lớp (Rw, 3Rw) và nước đi lớp trong (2R, 3R). Bấm từng thẻ để xem lớp nào quay — lớp đang quay được tô màu đầy đủ, phần còn lại làm nhạt.',
    'Bước 1 · Tâm': 'Ghép 4 ô tâm mỗi mặt thành cùng một màu. Các công thức dưới đây chỉ hoán vị vòng 3 ô tâm (commutator), không đụng góc/cạnh — dùng khi gần xong và còn lẻ vài ô.',
    'Bước 2 · Cạnh': 'Ghép 2 cánh cạnh (wing) cùng cặp màu thành một cạnh. Mỗi công thức hoán vị vòng 3 cánh cạnh, không đụng tâm và góc — dùng cho các cạnh cuối cùng khó ghép.',
    'Bước 1a · Tâm chéo (X-center)': 'Tâm 5×5 có 9 ô mỗi mặt: 4 ô ở góc (X-center), 4 ô giữa cạnh (T-center) và 1 ô tâm cố định. Nhóm này hoán vị vòng 3 ô X-center — công thức giống hệt của 4×4.',
    'Bước 1b · Tâm chữ thập (T-center)': 'Hoán vị vòng 3 ô T-center (ô nằm giữa các cạnh của mặt, hình dấu cộng quanh tâm). Dùng lớp giữa <code>3U</code>… nên chỉ có ở 5×5.',
    'Bước 2a · Cạnh ngoài (wing)': 'Mỗi cạnh 5×5 gồm 3 mảnh: 2 cánh (wing) ở hai bên + 1 cạnh giữa. Nhóm này hoán vị vòng 3 cánh cạnh.',
    'Bước 2b · Cạnh giữa': 'Hoán vị vòng 3 cạnh giữa (mảnh ở chính giữa mỗi cạnh) bằng lớp giữa — cũng chính là bước "cạnh" của một khối 3×3.'
  };
  Object.assign(GROUP_DESC, BIG_GROUP_DESC);
  const bigStateOf = (N, d) => {
    const B = BCUBE.make(N);
    if (d.start && d.start.flip) return B.flipEdge(B.solved(), d.start.flip);
    return d.demo ? B.solved() : B.caseState(d.alg);
  };
  const META = {
    f2l: {
      name: 'F2L', full: 'First Two Layers', count: 41,
      intro: 'F2L giải cùng lúc 2 tầng đầu: ghép <b>1 góc + 1 cạnh</b> thành cặp rồi đưa vào <b>rãnh trước-phải</b>. Có đúng 41 trường hợp. Với rãnh khác, xoay cả khối (y, y2, y\') để đưa rãnh đó về vị trí trước-phải rồi dùng cùng công thức. <br><b>Cách đọc hình:</b> chỉ <b>cặp cần giải</b> có màu đầy đủ, mọi mảnh khác giữ màu thật nhưng được làm nhạt; rãnh đích là góc dưới-trước-phải. Ô nhỏ ở góc thẻ là hình nhìn từ trên xuống để thấy cả mặt sau. Các trường hợp được xếp theo nhóm nhận dạng, từ dễ đến khó.'
    },
    oll: {
      name: 'OLL', full: 'Orient Last Layer', count: 57,
      intro: 'OLL làm cho <b>toàn bộ mặt trên cùng màu vàng</b> (chưa cần đúng vị trí). Có 57 trường hợp. Sơ đồ: ô <b>vàng</b> là đã đúng hướng, ô <b>xám</b> là chưa; các vạch mỏng quanh viền là sticker ở cạnh bên. Nhận dạng theo hình dạng mẫu vàng trên mặt trên, xoay U cho đến khi giống sơ đồ rồi thực hiện công thức.'
    },
    pll: {
      name: 'PLL', full: 'Permute Last Layer', count: 21,
      intro: 'PLL <b>hoán vị</b> các mảnh tầng cuối (mặt trên đã vàng) để hoàn thành khối. Có 21 trường hợp. Sơ đồ hiện màu thật của mặt trên và các sticker bên cạnh. Mẹo nhận dạng: tìm <b>đèn pha</b> (2 góc cùng màu cạnh nhau) và <b>thanh</b> (3 ô cùng màu), rồi xoay U để khớp sơ đồ. Sau công thức có thể cần 1 lần xoay U (AUF).'
    },
    coll: {
      name: 'COLL', full: 'Corners of the Last Layer', count: 40,
      intro: 'Dùng khi tầng trên <b>đã có chữ thập vàng</b> (cạnh đã định hướng). COLL làm vàng mặt trên <b>và</b> đưa 4 góc về đúng chỗ trong 1 công thức, giữ nguyên thứ tự các cạnh — sau đó chỉ còn một PLL cạnh (Ua, Ub, H, Z) hoặc xong luôn. Có 40 trường hợp, chia theo 7 hình góc (giống OLL 21–27). Đây là bước đệm tốt nhất trước khi học ZBLL. Sơ đồ hiện màu thật để nhận dạng vị trí góc.'
    },
    zbll: {
      name: 'ZBLL', full: 'Zborowski–Bruchem Last Layer', count: 472,
      intro: 'Khi chữ thập vàng đã có, ZBLL giải <b>toàn bộ tầng trên trong 1 công thức</b> (thay cho OLL + PLL). Có 472 trường hợp, chia theo <b>hình góc</b> (T, U, L, H, Pi, Sune, Anti-Sune) → <b>nhóm góc</b> (cùng cách xếp góc, mỗi nhóm 12 ca, riêng H 10 ca) → cách xếp cạnh. Ca đầu tiên của mỗi nhóm là <b>COLL</b>. Cách học: thuộc COLL trước, rồi học dần từng nhóm. Ca nào chưa thuộc có thể giải 2 bước: COLL của nhóm + 1 PLL cạnh (ghi ở mỗi thẻ). Mọi công thức do máy tìm (≤16 nước, chỉ dùng R U F D) và đã kiểm chứng bằng mô phỏng.'
    },
    b4: { name: '4×4', full: 'Phương pháp thu gọn (Reduction) · tâm · cạnh · parity', count: 0,
      intro: 'Khối <b>4×4</b> không có tâm cố định: mỗi mặt có 4 ô tâm, và mỗi cạnh gồm <b>2 cánh</b> (wing). Cách giải phổ biến là <b>phương pháp thu gọn (reduction)</b> — biến 4×4 thành một khối 3×3 rồi giải như thường:<ol><li><b>Tâm:</b> ghép 4 ô tâm mỗi mặt thành một màu (đặt đúng sơ đồ: vàng ↔ trắng, xanh lá ↔ xanh dương, cam ↔ đỏ; vàng trên, xanh lá trước thì cam phải, đỏ trái).</li><li><b>Ghép cạnh:</b> ghép 2 cánh cùng cặp màu thành 1 cạnh (đủ 12 cạnh) mà không phá tâm đã làm.</li><li><b>Giải như 3×3:</b> coi mỗi cạnh ghép là một cạnh, 4 ô tâm là một tâm, dùng CFOP / từng tầng. Chỉ dùng nước mặt ngoài (R, U, F…).</li><li><b>Parity:</b> đôi khi gặp tình huống không thể có trên 3×3 — công thức nằm ở phần <b>Trường hợp đặc biệt</b> của mục <b>OLL</b> và <b>PLL</b> 4×4.</li></ol>Mục <b>Tâm</b> và <b>Ghép cạnh</b> có các công thức <b>commutator</b> (A B A\' B\') chỉ hoán vị vòng 3 mảnh — dùng cho các ô lẻ cuối cùng. Mục <b>F2L / OLL / PLL</b> là toàn bộ CFOP đã dịch sang ký hiệu 4×4 (<code>r</code> → <code>3Rw</code>, <code>M</code> → <code>2-3L</code>). Mọi công thức đã được kiểm chứng bằng mô phỏng khối 4×4. Bên dưới là các ký hiệu riêng của khối lớn.' },
    b5: { name: '5×5', full: 'Phương pháp thu gọn (Reduction) · tâm · cạnh', count: 0,
      intro: 'Khối <b>5×5</b> có tâm cố định (như 3×3), mỗi mặt có 9 ô tâm: 1 tâm cố định + 4 <b>T-center</b> (dấu cộng) + 4 <b>X-center</b> (4 góc). Mỗi cạnh gồm <b>3 mảnh</b>: 2 cánh (wing) + 1 cạnh giữa. Cách giải là <b>thu gọn về 3×3</b>:<ol><li><b>Tâm:</b> ghép X-center và T-center cho từng mặt (tâm cố định cho biết màu của mặt đó).</li><li><b>Ghép cạnh:</b> ghép cặp cánh + cạnh giữa thành cạnh hoàn chỉnh (đủ 12 cạnh).</li><li><b>Giải như 3×3.</b></li></ol>Khác 4×4, <b>5×5 không có parity</b> — nhờ có tâm cố định và cạnh giữa nên mọi tình huống ở bước 3 đều là tình huống 3×3 bình thường. Công thức tâm chéo và cánh cạnh của 4×4 dùng được nguyên cho 5×5 (nước <code>2U</code>, <code>2R</code> là lớp thứ 2); thêm các công thức dùng lớp giữa <code>3U</code>… cho T-center và cạnh giữa. Mục <b>F2L / OLL / PLL</b> là toàn bộ CFOP đã dịch sang ký hiệu 5×5 (<code>r</code> → <code>4Rw</code>, <code>M</code> → <code>2-4L</code>). Mọi công thức đã được kiểm chứng bằng mô phỏng khối 5×5. Bên dưới là các ký hiệu riêng của khối lớn.' },
    wv: {
      name: 'Winter Variation', full: 'WV — chèn cặp cuối + làm vàng mặt trên', count: 27,
      intro: 'Khi còn <b>cặp F2L cuối</b> đã ghép sẵn, sẵn sàng chèn bằng <code>R U R\'</code>, và tầng trên <b>đã có chữ thập vàng</b>: WV chèn cặp và làm vàng cả mặt trên trong <b>1 công thức</b>, bỏ qua bước OLL. Có 27 trường hợp, xếp theo hình mặt trên sẽ ra nếu chỉ chèn bình thường. <b>Cách đọc hình:</b> cặp trước-phải có màu đầy đủ, tầng trên chỉ hiện vàng / xám, phần đã giải bị làm nhạt.'
    }
  };

  /* ---------- tiện ích ---------- */
  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const el = (html) => { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; };
  const progress = kind => {
    const list = kind === 'learn' ? LESSONS : SETS[kind], n = list.filter(i => learned.has(i.key)).length;
    return { n, total: list.length, pct: list.length ? Math.round(n * 100 / list.length) : 0 };
  };

  /* ---------- Các loại khối (sổ đăng ký) ----------
     Mỗi loại khối là một mục chính trên thanh bên; bên trong là các mục con (CFOP + trường hợp đặc biệt riêng).
     Thêm khối mới, vd 6×6: sinh BigData[6] (tools/gen-big.js + tools/build-big.js) — bigPuzzle(6) tự dựng
     Tâm / Ghép cạnh / F2L / OLL / PLL (CFOP dịch tự động từ 3×3, kiểm chứng bằng tools/verify-big-cfop.js). */
  const BIG_INTRO = { 4: META.b4.intro, 5: META.b5.intro };
  delete META.b4; delete META.b5;
  function bigItem(N, d, groups) {
    const B = BCUBE.make(N), state = bigStateOf(N, d);
    let hlFn;
    if (d.demo) { const lay = B.parseAlg(d.alg)[0].lay; hlFn = s => lay(s.home); }
    else { const set = new Set(B.misplaced(state).map(s => s.home.join() + '|' + s.c)); hlFn = s => set.has(s.home.join() + '|' + s.c); }
    return { key: d.id, kind: 'big', big: true, N, title: d.title, alg: d.alg, play: d.alg, state, colorFn: s => (hlFn(s) ? C.FACE_COLORS[s.c] : R.MUTED[s.c]),
      group: d.special ? SPECIAL_G : d.group, gc: d.special ? '#ff5d8f' : BIG_PAL[Math.max(0, groups.indexOf(d.group)) % BIG_PAL.length],
      tags: d.tags || [], star: false, desc: d.desc, special: !!d.special, demo: !!d.demo, after: d.after, parity: d.kind === 'parity',
      setup: d.start ? (d.start.flip ? `(1 cặp cạnh ${d.start.flip} bị lật — tình huống này xuất hiện khi ghép cạnh, không tạo bằng xoay thường)` : undefined) : d.demo ? '' : undefined };
  }
  function bigPuzzle(N) {
    const id = N + 'x' + N, nm = N + '×' + N, B = BCUBE.make(N), data = window.BigData[N];
    const secOf = d => d.kind === 'notation' ? 'intro' : d.kind === 'parity' ? d.stage : /center/.test(d.kind) ? 'centers' : 'edges';
    const groups = [...new Set(data.filter(d => !d.special).map(d => d.group))];
    for (const sec of ['intro', 'centers', 'edges', 'f2l', 'oll', 'pll']) { SETS[id + '/' + sec] = []; SPECIAL[id + '/' + sec] = []; }
    for (const d of data) (d.special && d.kind !== 'notation' ? SPECIAL : SETS)[id + '/' + secOf(d)].push(bigItem(N, d, groups));
    // CFOP: dịch nguyên bộ 3×3 sang ký hiệu N×N (r → (N-1)Rw, M → 2-(N-1)L), trạng thái tính trên khối N×N
    for (const k of ['f2l', 'oll', 'pll']) SETS[id + '/' + k] = SETS[k].map(it => {
      const play = B.from3x3(it.play);
      return Object.assign({}, it, { key: id + '-' + it.key, N, tags: it.tags.filter(t => !/ công thức$/.test(t)), alg: B.from3x3(it.alg), play, pre: it.pre ? B.from3x3(it.pre) : '', state: B.caseState(play), state3: it.state });
    });
    const conv = `<code>r</code> → <code>${N - 1}Rw</code>, <code>M</code> → <code>2-${N - 1}L</code>`;
    const cfop = (k, txt) => ({ name: META[k].name, full: `${nm} · ${META[k].full}`, intro: `Sau khi thu gọn (tâm + ghép cạnh xong), ${nm} được giải như một khối 3×3 — đây là đủ ${SETS[k].length} trường hợp ${META[k].name}, công thức đã dịch sang ký hiệu ${nm} (${conv}; các nước mặt ngoài giữ nguyên). Mọi công thức đã kiểm chứng trên khối ${nm} mô phỏng: sau khi thu gọn, trạng thái khớp tuyệt đối với 3×3. ${txt}` });
    Object.assign(META, {
      [id + '/intro']: { name: 'Phương pháp & ký hiệu', full: nm + ' · phương pháp thu gọn (Reduction)', intro: BIG_INTRO[N] },
      [id + '/centers']: { name: 'Tâm', full: nm + ' · bước 1 của phương pháp thu gọn', intro: `Ghép các ô tâm mỗi mặt thành cùng một màu. Phần lớn làm bằng trực giác (đưa từng khối ô tâm lên bằng nước lớp trong như <code>2R</code>, <code>Uw</code>); các công thức dưới đây giúp sửa vài ô lẻ cuối cùng mà không phá phần đã làm. <b>Cách đọc hình:</b> chỉ các ô bị công thức tác động có màu đầy đủ.` },
      [id + '/edges']: { name: 'Ghép cạnh', full: nm + ' · bước 2 của phương pháp thu gọn', intro: `Ghép các mảnh cạnh cùng cặp màu thành 12 cạnh hoàn chỉnh. Cách thường dùng: đưa 2 mảnh cần ghép về cùng một hàng bằng lớp trong (vd <code>Uw</code>), ghép lại, rồi trả lớp trong về chỗ ("slice – flip – slice"). Khi còn vài cạnh cuối, dùng các công thức hoán vị vòng 3 cánh dưới đây — chúng không đụng tâm và góc.` },
      [id + '/f2l']: cfop('f2l', 'Cross làm bằng trực giác như 3×3.'),
      [id + '/oll']: cfop('oll', N % 2 ? '5×5 không có parity: mọi hình mặt trên đều là một trong 57 OLL.' : 'Nếu mặt trên có số cạnh vàng LẺ (1 hoặc 3) thì đó là <b>parity OLL</b> — xem phần Trường hợp đặc biệt ở cuối trang.'),
      [id + '/pll']: cfop('pll', N % 2 ? '5×5 không có parity: mọi tầng trên đều là một trong 21 PLL.' : 'Nếu chỉ có 2 cạnh đổi chỗ (không giống PLL nào) thì đó là <b>parity PLL</b> — xem phần Trường hợp đặc biệt ở cuối trang.')
    });
    SPECIAL_DESC[id + '/centers'] = 'Ca hoán vị vòng đặc biệt: hai trong ba ô tâm nằm trên cùng một mặt.';
    SPECIAL_DESC[id + '/edges'] = 'Ca hoán vị vòng đặc biệt: hai trong ba mảnh cạnh nằm trên cùng một cạnh.';
    SPECIAL_DESC[id + '/oll'] = 'Parity OLL — chỉ có trên 4×4: đúng 1 cạnh bị lật (số cạnh vàng lẻ). Không có OLL 3×3 nào giải được.';
    SPECIAL_DESC[id + '/pll'] = 'Parity PLL — chỉ có trên 4×4: chỉ 2 cạnh đổi chỗ. Không có PLL 3×3 nào giải được.';
    return { id, name: nm, N, icon: N === 4 ? '🟦' : '🟪', desc: N % 2 ? 'Thu gọn về 3×3 · tâm chéo + chữ thập · không parity' : 'Thu gọn về 3×3 · tâm · ghép cạnh · parity',
      sections: [['intro', 'Phương pháp', '📘'], ['centers', 'Tâm', '🎯'], ['edges', 'Ghép cạnh', '🔗'], ['f2l', 'F2L', '🧩'], ['oll', 'OLL', '🟨'], ['pll', 'PLL', '🔄']] };
  }
  const PUZZLES = [
    { id: '3x3', name: '3×3', N: 3, icon: '🧊', desc: 'CFOP đầy đủ + COLL, ZBLL, Winter Variation',
      sections: [['learn', 'Học từ đầu', '🎓'], ['notation', 'Ký hiệu', '📖'], ['f2l', 'F2L', '🧩'], ['oll', 'OLL', '🟨'], ['pll', 'PLL', '🔄'], ['coll', 'COLL', '🔶'], ['zbll', 'ZBLL', '🧠'], ['wv', 'Winter Variation', '❄️'], ['solve', 'Giải khối của bạn', '🛠️'], ['practice', 'Luyện tập', '🎯'], ['exam', 'Kiểm tra', '📝']] },
    ...Object.keys(window.BigData).map(Number).sort((a, b) => a - b).map(bigPuzzle)
  ];
  const setKeyOf = (pz, sec) => (pz.id === '3x3' ? sec : pz.id + '/' + sec);
  // tiến độ của cả một loại khối = tổng các mục có danh sách công thức
  const pzProgress = pz => {
    let n = 0, total = 0;
    for (const [sec] of pz.sections) { const k = pz.id === '3x3' && sec === 'learn' ? 'learn' : setKeyOf(pz, sec); if (k === 'learn' || SETS[k]) { const p = progress(k); n += p.n; total += p.total; } }
    return { n, total, pct: total ? Math.round(n * 100 / total) : 0 };
  };
  const viewMode = it => ({ zbll: 'pll', coll: 'pll', wv: 'oll' })[it.kind] || it.kind;
  const thumbHTML = it => it.big ? '<canvas></canvas>' : it.kind === 'f2l' || it.view3d || it.kind === 'wv' ? `<canvas></canvas><div class="mini" title="Nhìn từ trên xuống">${R.topViewSVG(it.state, viewMode(it), { slot: it.slot, N: it.N })}</div>` : it.kind === 'zbll' || it.kind === 'coll' ? R.topViewSVG(it.state, 'pll', { arrows: false }) : R.topViewSVG(it.state, it.kind, { arrows: it.kind === 'pll', N: it.N, state3: it.state3 });
  function fillThumb(root, it) {
    if (it.big) {
      const ctx = R.setupCanvas(root.querySelector('canvas'), 200, 165), d = Math.PI / 180;
      R.drawCube(ctx, it.state, { cx: 100, cy: 165 * 0.53, scale: 165 * 0.205, persp: 9, yaw: -38 * d, pitch: 30 * d, colorFn: it.colorFn, N: it.N });
    } else if (it.kind === 'f2l') R.renderF2LThumb(root.querySelector('canvas'), it.state, 200, 165, it.slot || 'FR', it.N);
    else if (it.view3d || it.kind === 'wv') {
      const ctx = R.setupCanvas(root.querySelector('canvas'), 200, 165), d = Math.PI / 180;
      R.drawCube(ctx, it.state, { cx: 100, cy: 165 * 0.53, scale: 165 * 0.205, persp: 9, yaw: -38 * d, pitch: 30 * d, colorFn: it.kind === 'wv' ? R.wvColor : undefined });
    }
  }

  /* ---------- router ---------- */
  let stopHero = null, notationPlayer = null, currentRoute = 'home', routeQuery, curPz = PUZZLES[0];
  try { curPz = PUZZLES.find(p => p.id === localStorage.getItem('rubik-puzzle')) || curPz; } catch (e) { /* bỏ qua */ }
  const lastSec = {};
  const SHORT = { wv: 'WV', learn: 'Học', notation: 'Ký hiệu', solve: 'Giải', practice: 'Luyện', exam: 'Kiểm tra', intro: 'Cách giải', centers: 'Tâm', edges: 'Cạnh' };
  const PAGES_3 = { learn: renderLearn, notation: renderNotation, practice: renderPractice, solve: renderSolve, exam: renderExam };
  function updateNav() {
    $('#pzsw').innerHTML = PUZZLES.map(p => `<a href="#/${p.id}/${lastSec[p.id] || p.sections[0][0]}" class="${p === curPz && currentRoute !== 'home' ? 'on' : p === curPz ? 'cur' : ''}" title="${esc(p.desc)}">${p.name}</a>`).join('');
    const link = (href, on, ic, t, short, key) => {
      const hasP = !!key, pr = hasP && progress(key);
      return `<a href="${href}" class="${on ? 'on' : ''}"><span class="ic">${ic}</span><span class="lb">${t}</span><span class="lbs">${short || t}</span>${hasP ? ` <small class="cnt" style="margin-left:auto;opacity:.7">${pr.n}/${pr.total}</small><span class="pg"><i style="width:${pr.pct}%"></i></span>` : ''}</a>`;
    };
    $('#tabs').innerHTML = link('#/home', currentRoute === 'home', '🏠', 'Trang chủ', 'Trang chủ') +
      `<div class="navh">${curPz.icon} Khối ${curPz.name}</div>` +
      curPz.sections.map(([sec, t, ic]) => {
        const k = curPz.id === '3x3' && sec === 'learn' ? 'learn' : setKeyOf(curPz, sec);
        return link(`#/${curPz.id}/${sec}`, currentRoute === curPz.id + '/' + sec, ic, t, SHORT[sec], k === 'learn' || (SETS[k] && SETS[k].length) ? k : null);
      }).join('');
    const on = $('#tabs a.on');
    if (on && matchMedia('(max-width: 700px)').matches) on.scrollIntoView({ inline: 'center', block: 'nearest' });
  }

  function route() {
    closeModal();
    if (stopHero) { stopHero(); stopHero = null; }
    const [path, qs] = (location.hash.replace(/^#\/?/, '') || 'home').split('?'); routeQuery = qs;
    let [a, b] = path.split('/'), pz = PUZZLES.find(p => p.id === a), sec = b;
    if (!pz) { // đường dẫn cũ: #/f2l, #/learn… thuộc 3×3; #/b4, #/b5 là 4×4, 5×5
      const old = { b4: '4x4', b5: '5x5' }[a];
      if (old) { pz = PUZZLES.find(p => p.id === old); sec = 'intro'; }
      else if (PUZZLES[0].sections.some(x => x[0] === a)) { pz = PUZZLES[0]; sec = a; }
    }
    if (pz && !pz.sections.some(x => x[0] === sec)) sec = pz.sections[0][0];
    if (!pz) { currentRoute = 'home'; }
    else {
      curPz = pz; lastSec[pz.id] = sec; currentRoute = pz.id + '/' + sec;
      try { localStorage.setItem('rubik-puzzle', pz.id); } catch (e) { /* bỏ qua */ }
    }
    updateNav();
    window.scrollTo(0, 0);
    if (!pz) return renderHome();
    if (pz.id === '3x3' && PAGES_3[sec]) return PAGES_3[sec]();
    renderSet(setKeyOf(pz, sec));
  }
  window.addEventListener('hashchange', route);

  /* ---------- Trang chủ ---------- */
  function renderHome() {
    const p = k => progress(k);
    view.innerHTML = `
      <section class="hero">
        <div>
          <h1>Học Rubik nâng cao — 3×3, 4×4, 5×5</h1>
          <p class="lead">Tất cả <b>41 F2L + 57 OLL + 21 PLL</b> của phương pháp CFOP cho <b>3×3</b>, cùng tâm, ghép cạnh, CFOP và parity cho <b>4×4, 5×5</b>. Mỗi trường hợp có <b>hình minh hoạ trực quan</b>, khối 3D xoay được và hoạt hình từng bước. Mọi công thức đều đã được kiểm chứng bằng mô phỏng khối Rubik.</p>
          <p><a class="btn pri" href="#/learn" style="text-decoration:none">🎓 Học từ đầu (người mới)</a> <a class="btn" href="#/notation" style="text-decoration:none">Ký hiệu</a> <a class="btn" href="#/practice" style="text-decoration:none">Luyện tập</a></p>
        </div>
        <canvas id="hero"></canvas>
      </section>
      <h2>Chọn loại khối</h2>
      <div class="pzcards">${PUZZLES.map(pz => { const pp = pzProgress(pz); return `<div class="pzcard">
        <a class="pzh" href="#/${pz.id}/${pz.sections[0][0]}"><span class="pzi">${pz.icon}</span><span><b>${pz.name}</b><small>${esc(pz.desc)}</small></span><span class="pzn">${pp.n}/${pp.total}</span></a>
        <div class="bar"><i style="width:${pp.pct}%"></i></div>
        <div class="pzl">${pz.sections.map(([sec, t, ic]) => `<a href="#/${pz.id}/${sec}">${ic} ${t}</a>`).join('')}</div></div>`; }).join('')}</div>
      <h2>3×3 — Bốn bước của CFOP</h2>
      <div class="steps">
        <div class="step"><span class="n">1</span><h3>Cross</h3><p>Làm dấu cộng trắng ở tầng dưới, các cạnh khớp màu tâm. Dựa vào trực giác, không cần công thức.</p></div>
        <a class="step" href="#/f2l"><span class="n">2</span><h3>F2L · ${p('f2l').n}/41</h3><p>Ghép cặp góc-cạnh, đưa vào rãnh. Hoàn thành 2 tầng đầu.</p><div class="bar"><i style="width:${p('f2l').pct}%"></i></div></a>
        <a class="step" href="#/oll"><span class="n">3</span><h3>OLL · ${p('oll').n}/57</h3><p>Làm mặt trên cùng màu vàng.</p><div class="bar"><i style="width:${p('oll').pct}%"></i></div></a>
        <a class="step" href="#/pll"><span class="n">4</span><h3>PLL · ${p('pll').n}/21</h3><p>Hoán vị tầng cuối để hoàn thành khối.</p><div class="bar"><i style="width:${p('pll').pct}%"></i></div></a>
      </div>
      <h2>3×3 nâng cao: bỏ bớt bước ở tầng cuối</h2>
      <div class="steps">
        <a class="step" href="#/wv"><span class="n">❄️</span><h3>Winter Variation · ${p('wv').n}/27</h3><p>Chèn cặp F2L cuối và làm vàng mặt trên cùng lúc — bỏ qua OLL.</p><div class="bar"><i style="width:${p('wv').pct}%"></i></div></a>
        <a class="step" href="#/coll"><span class="n">🔶</span><h3>COLL · ${p('coll').n}/40</h3><p>Đã có chữ thập vàng: xong cả 4 góc trong 1 công thức, chỉ còn PLL cạnh.</p><div class="bar"><i style="width:${p('coll').pct}%"></i></div></a>
        <a class="step" href="#/zbll"><span class="n">🧠</span><h3>ZBLL · ${p('zbll').n}/472</h3><p>Đã có chữ thập vàng: giải hết tầng trên trong 1 công thức (thay OLL + PLL).</p><div class="bar"><i style="width:${p('zbll').pct}%"></i></div></a>
      </div>
      <h2>Lộ trình học 3×3 gợi ý (từ dễ đến đầy đủ)</h2>
      <ol class="road">
        <li><b>Chưa biết gì?</b> Bắt đầu từ <a href="#/learn">Học từ đầu</a>: 10 bài từ làm quen khối đến tự giải xong khối 3×3.</li>
        <li><b>Ký hiệu</b> — nắm R, U, F, M, r... và dấu nháy/số 2. <a href="#/notation">Xem ngay</a></li>
        <li><b>F2L bằng trực giác</b> — học các trường hợp ngắn 3 bước đầu tiên (F2L 1–4), sau đó đến 6–7 bước. Hiểu "ghép cặp rồi đưa vào" quan trọng hơn học thuộc.</li>
        <li><b>2-look OLL</b> ⭐ — bước 1 làm chữ thập vàng (3 công thức: <a href="#/oll">OLL 2, 44, 45</a>), bước 2 làm vàng nốt các góc (7 công thức: <a href="#/oll">OLL 21–27</a>).</li>
        <li><b>2-look PLL</b> ⭐ — bước 1 hoán vị góc (<a href="#/pll">Aa, Ab, E</a>), bước 2 hoán vị cạnh (<a href="#/pll">Ua, Ub, H, Z</a>).</li>
        <li><b>F2L đầy đủ</b> — luyện đủ 41 trường hợp để giải F2L không dừng.</li>
        <li><b>PLL đầy đủ</b> — thêm 14 PLL còn lại (J, T, R, F, Y, V, N, G).</li>
        <li><b>OLL đầy đủ</b> — 57 trường hợp, học theo nhóm hình dạng (chấm, đường thẳng, chữ L, chữ thập).</li>
        <li><b>Tự kiểm tra</b> — làm các bài trong mục <a href="#/exam">Kiểm tra</a> để biết mình đã nắm chắc tới đâu.</li>
        <li><b>Lên 4×4 / 5×5</b> — khi đã giải 3×3 thành thạo: học <a href="#/4x4/intro">phương pháp thu gọn</a> (tâm → ghép cạnh → CFOP như 3×3), rồi parity OLL/PLL của 4×4.</li>
      </ol>
      <div class="note">Mẹo: bấm vào một thẻ để mở khối 3D và xem công thức chạy từng bước. Đánh dấu ✓ khi đã thuộc để theo dõi tiến độ — dữ liệu lưu ngay trong trình duyệt của bạn.</div>`;
    // khối xoay ở trang chủ
    const cv = $('#hero'), size = 320;
    const ctx = R.setupCanvas(cv, size, size);
    const st = SETS.oll.find(x => x.num === 27).state;
    let on = true, yaw = -35 * D2R;
    const loop = () => {
      if (!on) return;
      yaw += 0.008; ctx.clearRect(0, 0, size, size);
      R.drawCube(ctx, st, { cx: size / 2, cy: size / 2, scale: size * 0.175, persp: 9, yaw, pitch: 28 * D2R });
      requestAnimationFrame(loop);
    };
    loop(); stopHero = () => { on = false; };
  }

  /* ---------- Học từ đầu ---------- */
  function renderLearn() {
    const cur = Math.max(1, Math.min(LESSONS.length, parseInt(routeQuery, 10) || 1));
    const L = LESSONS[cur - 1];
    const doneN = LESSONS.filter(l => learned.has(l.key)).length;
    view.innerHTML = `
      <div class="sec-h"><div><h1>🎓 Học từ đầu</h1><p class="lead" style="margin:0">Từ lúc chưa biết gì đến khi tự giải xong khối 3×3 — 10 bài ngắn, có hình và hoạt hình.</p></div><span class="pill">Đã học ${doneN}/${LESSONS.length}</span></div>
      <div class="learn">
        <nav class="lessons">${LESSONS.map(l => `<a href="#/learn?${l.id}" class="${l.id === cur ? 'on' : ''} ${learned.has(l.key) ? 'done' : ''}"><span class="num">${learned.has(l.key) ? '✓' : l.id}</span><span><b>${esc(l.title)}</b><small>${esc(l.time)}</small></span></a>`).join('')}</nav>
        <article class="lesson">
          <div class="lhead"><span class="big-ic">${L.icon}</span><div><small>Bài ${L.id}/${LESSONS.length} · ${esc(L.time)}</small><h2 style="margin:0">${esc(L.title)}</h2></div></div>
          <div class="goal">🎯 <b>Mục tiêu:</b> ${esc(L.goal)}</div>
          ${L.special === 'anatomy' ? `<div class="anat"><div class="stage"><canvas id="acv"></canvas><div class="ctrls" id="amodes">
              <button class="btn pri" data-m="all">Tất cả</button><button class="btn" data-m="center">6 tâm</button><button class="btn" data-m="edge">12 cạnh</button><button class="btn" data-m="corner">8 góc</button></div>
              <div class="legend" id="adesc" style="text-align:center;max-width:340px"></div></div></div>` : ''}
          <div class="ltext">${L.html}</div>
          ${L.link ? `<p><a class="btn pri" style="text-decoration:none" href="${L.link[0]}">${esc(L.link[1])} →</a></p>` : ''}
          ${L.demos.length ? `<h3>Xem trực tiếp <small style="color:var(--muted);font-weight:400">— bấm để mở khối 3D và chạy từng bước</small></h3><div class="grid demos" id="demos"></div>` : ''}
          ${(window.SpecialData.basic[L.id] || []).length ? `<h3 class="sp-h">⚠️ Trường hợp đặc biệt <small style="color:var(--muted);font-weight:400">— những lúc bị "kẹt", cách xử lý</small></h3><div class="grid demos" id="spdemos"></div>` : ''}
          ${L.tips && L.tips.length ? `<div class="note">💡 ${L.tips.map(esc).join('<br>💡 ')}</div>` : ''}
          <div class="lnav">
            <button class="btn" ${cur === 1 ? 'disabled' : ''} data-go="${cur - 1}">‹ Bài trước</button>
            <button class="btn ${learned.has(L.key) ? 'ok' : ''}" id="ldone">${learned.has(L.key) ? '✓ Đã học xong bài này' : 'Đánh dấu đã học xong'}</button>
            <button class="btn pri" ${cur === LESSONS.length ? 'disabled' : ''} data-go="${cur + 1}">Bài tiếp theo ›</button>
          </div>
        </article>
      </div>`;
    // minh hoạ cấu tạo khối
    if (L.special === 'anatomy') {
      const P = new R.Player($('#acv'), { size: 340 });
      P.load(C.solved(), '');
      const DESC = {
        all: '26 mảnh: 6 tâm + 12 cạnh + 8 góc. Bấm để xem từng loại.',
        center: '6 tâm — 1 màu, KHÔNG đổi chỗ. Tâm chính là màu của mặt.',
        edge: '12 cạnh — 2 màu, nằm giữa hai tâm.',
        corner: '8 góc — 3 màu, nằm ở các đỉnh khối.'
      };
      const set = m => {
        P.colorFn = m === 'all' ? undefined : s => {
          const n = Math.abs(s.home[0]) + Math.abs(s.home[1]) + Math.abs(s.home[2]);
          return ({ center: 1, edge: 2, corner: 3 }[m] === n) ? C.FACE_COLORS[s.c] : '#3a3f4d';
        };
        P.draw(); $('#adesc').textContent = DESC[m];
        $('#amodes').querySelectorAll('button').forEach(b => b.classList.toggle('pri', b.dataset.m === m));
      };
      $('#amodes').onclick = e => { const b = e.target.closest('button'); if (b) set(b.dataset.m); };
      set('all');
    }
    // các ví dụ
    const items = L.demos.map((d, i) => {
      const state = d.scramble !== undefined ? C.applyAlg(C.solved(), d.scramble) : C.caseState(d.alg);
      return { key: `demo-${L.id}-${i}`, kind: 'basic', title: d.title, alg: d.alg, play: d.alg, state, setup: d.scramble, desc: d.note, tags: [`Bài ${L.id}`], star: false, group: L.title, gc: '#ffd500' };
    });
    const spItems = (window.SpecialData.basic[L.id] || []).map((d, i) => ({
      key: `spdemo-${L.id}-${i}`, kind: 'basic', title: d.title, alg: d.alg, play: d.alg,
      state: C.caseState(d.startFrom || d.alg), setup: d.startFrom ? C.invertAlg(d.startFrom) : undefined,
      desc: d.note, tags: [`Bài ${L.id}`, 'Đặc biệt'], star: false, group: L.title, gc: '#ff5d8f'
    }));
    const fillDemos = (grid, list) => grid && list.forEach(it => {
      const c = el(`<article class="card" style="--gc:${it.gc}"><div class="thumb"><canvas></canvas></div><div class="t"><b>${esc(it.title)}</b></div><div class="alg" style="color:var(--text)">${esc(it.alg.length > 70 ? it.alg.slice(0, 70) + '…' : it.alg)}</div></article>`);
      grid.appendChild(c); R.renderCubeThumb(c.querySelector('canvas'), it.state, 170, 150);
      c.onclick = () => openDetail(it, list);
    });
    fillDemos($('#demos'), items);
    fillDemos($('#spdemos'), spItems);
    view.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { location.hash = '#/learn?' + b.dataset.go; });
    $('#ldone').onclick = () => { toggleLearned(L.key); renderLearn(); };
  }

  /* ---------- Kiểm tra ---------- */
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n) => shuffle(arr).slice(0, n);
  const uniq = a => [...new Set(a)];
  // [câu hỏi, đáp án đúng, [đáp án sai], giải thích]
  const BASIC_QS = [
    ['Khối Rubik 3×3 có bao nhiêu mảnh cạnh?', '12', ['8', '6', '24'], 'Cạnh là mảnh 2 màu, nằm giữa 2 tâm: có 12 cạnh.'],
    ['Khối Rubik 3×3 có bao nhiêu mảnh góc?', '8', ['12', '6', '4'], 'Góc là mảnh 3 màu ở các đỉnh khối: có 8 góc.'],
    ['Loại mảnh nào KHÔNG bao giờ đổi chỗ so với nhau?', 'Tâm', ['Góc', 'Cạnh', 'Cả góc và cạnh'], '6 tâm luôn giữ nguyên vị trí tương đối — tâm quyết định màu của mặt.'],
    ['Theo sơ đồ màu chuẩn, màu nào đối diện màu trắng?', 'Vàng', ['Xanh lá', 'Đỏ', 'Cam'], 'Trắng ↔ vàng, xanh lá ↔ xanh dương, đỏ ↔ cam.'],
    ['Theo sơ đồ màu chuẩn, màu nào đối diện xanh lá?', 'Xanh dương', ['Vàng', 'Đỏ', 'Trắng'], 'Xanh lá ↔ xanh dương.'],
    ['Theo sơ đồ màu chuẩn, màu nào đối diện màu đỏ?', 'Cam', ['Vàng', 'Xanh dương', 'Trắng'], 'Đỏ ↔ cam.'],
    ["Ký hiệu R' nghĩa là gì?", 'Xoay mặt phải ngược chiều kim đồng hồ', ['Xoay mặt phải theo chiều kim đồng hồ', 'Xoay mặt phải 180°', 'Xoay 2 lớp bên phải'], "Dấu nháy ' = ngược chiều kim đồng hồ (khi nhìn thẳng vào mặt đó)."],
    ['Ký hiệu U2 nghĩa là gì?', 'Xoay mặt trên 180°', ['Xoay mặt dưới 180°', 'Xoay 2 lớp trên', 'Xoay cả khối theo hướng U'], 'Số 2 = quay 180° (hướng nào cũng như nhau).'],
    ['Chữ thường r nghĩa là gì?', 'Xoay cùng lúc 2 lớp bên phải', ['Xoay mặt phải ngược chiều', 'Xoay cả khối theo hướng R', 'Xoay lớp giữa'], 'Chữ thường = xoay 2 lớp (mặt đó + lớp giữa kế bên).'],
    ['Ký hiệu y nghĩa là gì?', 'Xoay cả khối theo hướng của U', ['Xoay mặt dưới', 'Xoay lớp giữa ngang', 'Xoay 2 lớp trên'], 'x, y, z là xoay cả khối (y theo hướng U).'],
    ['Bước đầu tiên của CFOP (và phương pháp từng tầng) là gì?', 'Làm chữ thập trắng (Cross)', ['Làm mặt vàng', 'Ghép cặp F2L', 'Hoán vị góc tầng cuối'], 'C trong CFOP là Cross — chữ thập.'],
    ['F2L là viết tắt của gì?', 'First Two Layers — giải 2 tầng đầu', ['Final Two Layers — 2 tầng cuối', 'First To Last', 'Face To Left'], 'F2L giải cùng lúc 2 tầng đầu bằng cách ghép cặp góc + cạnh.'],
    ['Mục đích của OLL là gì?', 'Làm toàn bộ mặt trên cùng màu', ['Hoán vị các mảnh tầng trên', 'Giải tầng giữa', 'Làm chữ thập trắng'], 'OLL = Orient Last Layer: định hướng để mặt trên cùng màu.'],
    ['Mục đích của PLL là gì?', 'Hoán vị các mảnh tầng cuối vào đúng chỗ', ['Làm mặt trên cùng màu', 'Ghép cặp góc-cạnh', 'Làm chữ thập trắng'], 'PLL = Permute Last Layer: đổi chỗ các mảnh tầng cuối.'],
    ['Có tất cả bao nhiêu trường hợp OLL?', '57', ['21', '41', '78'], 'OLL có 57 trường hợp (không tính trường hợp đã xong).'],
    ['Có tất cả bao nhiêu trường hợp PLL?', '21', ['57', '41', '13'], 'PLL có 21 trường hợp.'],
    ['Có tất cả bao nhiêu trường hợp F2L cơ bản (cho 1 rãnh)?', '41', ['21', '57', '24'], 'F2L có 41 trường hợp cho một rãnh.'],
    ["Ở bước góc trắng, ô trắng của góc hướng LÊN TRÊN thì lặp R U R' U' mấy lần?", '3 lần', ['1 lần', '5 lần', '2 lần'], 'Hướng sang phải: 1 lần · lên trên: 3 lần · ra trước: 5 lần.'],
    ["Ở bước góc trắng, ô trắng hướng RA TRƯỚC thì lặp R U R' U' mấy lần?", '5 lần', ['1 lần', '3 lần', '4 lần'], 'Hướng sang phải: 1 lần · lên trên: 3 lần · ra trước: 5 lần.'],
    ['Công thức làm chữ thập vàng (bước 4) là gì?', "F R U R' U' F'", ["R U R' U R U2 R'", "R U R' U'", "R' F R' B2 R F' R' B2 R2"], "F R U R' U' F' biến chấm → chữ L → đường thẳng → chữ thập."],
    ['Công thức Sune là gì?', "R U R' U R U2 R'", ["R U2 R' U' R U' R'", "F R U R' U' F'", "R U' R U R U R U' R' U' R2"], "Sune: R U R' U R U2 R' (ngược lại là Anti-Sune)."],
    ['"Đèn pha" (headlights) khi nhận dạng PLL là gì?', 'Hai góc cạnh nhau cùng màu trên một mặt bên', ['Hai cạnh đối diện cùng màu', 'Mặt trên toàn màu vàng', 'Một góc bị xoắn'], 'Đèn pha = 2 sticker góc cùng màu ở cùng một mặt bên.'],
    ['AUF là gì?', 'Xoay mặt trên (U) để căn chỉnh', ['Một công thức OLL', 'Xoay cả khối', 'Một kiểu ghép cặp F2L'], 'AUF = Adjust U Face: xoay U trước hoặc sau công thức để khớp.'],
    ['Trong F2L, cặp cần ghép gồm những mảnh nào?', '1 góc và 1 cạnh', ['2 cạnh', '2 góc', '1 tâm và 1 cạnh'], 'Mỗi rãnh F2L = 1 góc trắng + 1 cạnh tầng giữa.']
  ];
  const MOVE_POOL = ['R', "R'", 'R2', 'L', "L'", 'U', "U'", 'U2', 'D', "D'", 'F', "F'", 'F2', 'B', "B'", 'M', "M'", 'r', "r'", 'x', 'y', "y'"];
  function genBasic(n) {
    return sample(BASIC_QS, n).map(([q, a, w, ex]) => ({ prompt: q, vis: { type: 'icon', icon: '🧠' }, options: shuffle([a, ...w]), answer: a, explain: ex }));
  }
  function genNotation(n) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const m = MOVE_POOL[Math.floor(Math.random() * MOVE_POOL.length)];
      const f = m[0], suf = m.slice(1);
      const near = [f, f + "'", f + '2'].filter(x => x !== m);
      const other = shuffle(MOVE_POOL.filter(x => x[0] !== f && x.slice(1) === suf));
      const opts = uniq([m, ...shuffle(near).slice(0, 2), ...other]).slice(0, 4);
      const note = (NOTES.find(x => x[0] === m) || [m, ''])[1];
      out.push({ prompt: 'Khối vừa xoay theo nước đi nào?', vis: { type: 'move', alg: m }, options: shuffle(opts), answer: m, mono: true, explain: `${m}: ${note || 'xem trang Ký hiệu'}` });
    }
    return out;
  }
  const visOf = it => it.kind === 'f2l' ? { type: 'f2l', state: it.state } : { type: 'svg', html: R.topViewSVG(it.state, it.kind) };
  const sameGroupFirst = (it, list, key) => uniq([...shuffle(list.filter(x => x !== it && x.group === it.group)), ...shuffle(list.filter(x => x !== it))].map(key)).filter(k => k !== key(it));
  function genName(kind, n) {
    const list = SETS[kind];
    return sample(list, n).map(it => ({
      prompt: kind === 'pll' ? 'Đây là PLL nào?' : 'Đây là OLL số mấy?',
      vis: visOf(it), options: shuffle([it.title, ...sameGroupFirst(it, list, x => x.title).slice(0, 3)]), answer: it.title, item: it,
      explain: kind === 'pll' ? `${it.title}: ${it.info.text}` : `${it.title}: hình ${it.tags.join(', ')} — ${it.info.edges}/4 cạnh và ${it.info.corners}/4 góc đã vàng.`
    }));
  }
  function genF2LGroup(n) {
    const groups = F2L_GROUPS.map(g => g[0]);
    return sample(SETS.f2l, n).map(it => ({
      prompt: 'Tình huống F2L này thuộc nhóm nào?', vis: visOf(it),
      options: shuffle([it.group, ...sample(groups.filter(g => g !== it.group), 3)]), answer: it.group, item: it,
      explain: `${it.title} — ${it.group}: ${GROUP_DESC[it.group]}`
    }));
  }
  function genAlg(n) {
    const all = [...SETS.f2l, ...SETS.oll, ...SETS.pll];
    return sample(all, n).map(it => ({
      prompt: 'Công thức nào giải đúng tình huống này?' + (it.kind === 'pll' ? ' (bỏ qua bước xoay U)' : ''),
      vis: visOf(it), options: shuffle([it.alg, ...sameGroupFirst(it, SETS[it.kind], x => x.alg).slice(0, 3)]), answer: it.alg, mono: true, item: it,
      explain: `${it.title}: ${it.alg}`
    }));
  }
  const TESTS = [
    { id: 'basic', icon: '🧠', name: 'Kiến thức cơ bản', desc: 'Cấu tạo khối, màu sắc, ký hiệu, các bước CFOP.', n: 10, gen: () => genBasic(10) },
    { id: 'notation', icon: '🔤', name: 'Đọc ký hiệu', desc: 'Xem khối xoay rồi chọn đúng ký hiệu nước đi.', n: 10, gen: () => genNotation(10) },
    { id: 'pll', icon: '🔄', name: 'Nhận dạng PLL', desc: 'Nhìn sơ đồ tầng cuối, đoán tên PLL.', n: 10, gen: () => genName('pll', 10) },
    { id: 'oll', icon: '🟨', name: 'Nhận dạng OLL', desc: 'Nhìn hình mặt vàng, đoán số OLL (đáp án nhiễu cùng nhóm hình).', n: 10, gen: () => genName('oll', 10) },
    { id: 'f2l', icon: '🧩', name: 'Phân loại F2L', desc: 'Nhìn vị trí cặp góc-cạnh, chọn đúng nhóm F2L.', n: 10, gen: () => genF2LGroup(10) },
    { id: 'alg', icon: '⚙️', name: 'Chọn đúng công thức', desc: 'Tình huống F2L/OLL/PLL ngẫu nhiên — công thức nào đúng?', n: 10, gen: () => genAlg(10) },
    { id: 'mix', icon: '🏆', name: 'Bài tổng hợp', desc: '20 câu trộn tất cả các dạng — bài kiểm tra cuối khoá.', n: 20, gen: () => shuffle([...genBasic(4), ...genNotation(4), ...genName('pll', 3), ...genName('oll', 3), ...genF2LGroup(3), ...genAlg(3)]) }
  ];
  const loadBest = () => { try { return JSON.parse(localStorage.getItem('rubik-exam-best') || '{}'); } catch (e) { return {}; } };
  const saveBest = b => { try { localStorage.setItem('rubik-exam-best', JSON.stringify(b)); } catch (e) { /* bỏ qua */ } };
  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  function renderExam() {
    const best = loadBest();
    view.innerHTML = `
      <h1>📝 Kiểm tra</h1>
      <p class="lead">Tự kiểm tra xem mình đã nắm chắc tới đâu. Câu hỏi được tạo ngẫu nhiên mỗi lần làm, chấm điểm ngay, cuối bài có phần xem lại các câu sai. Phím tắt: <kbd>1</kbd>–<kbd>4</kbd> chọn đáp án, <kbd>Enter</kbd> sang câu tiếp.</p>
      <div class="tests">${TESTS.map(t => `
        <button class="test" data-t="${t.id}">
          <span class="ticon">${t.icon}</span>
          <b>${esc(t.name)}</b><small>${esc(t.desc)}</small>
          <span class="tmeta"><span>${t.n} câu</span>${best[t.id] !== undefined ? `<span class="best ${best[t.id] >= 80 ? 'good' : ''}">Cao nhất: ${best[t.id]}%</span>` : '<span class="best">Chưa làm</span>'}</span>
        </button>`).join('')}</div>`;
    view.querySelector('.tests').onclick = e => { const b = e.target.closest('.test'); if (b) runTest(TESTS.find(t => t.id === b.dataset.t)); };
  }

  function runTest(test) {
    const S = { qs: test.gen(), i: 0, score: 0, wrong: [], t0: Date.now(), answered: false, player: null };
    let timer = setInterval(() => { const el2 = $('#etime'); if (el2) el2.textContent = fmtTime(Math.round((Date.now() - S.t0) / 1000)); }, 1000);
    const onKey = e => {
      if (!modal.classList.contains('hidden') || e.target.tagName === 'INPUT') return;
      if (/^[1-4]$/.test(e.key) && !S.answered) { const b = view.querySelectorAll('.opt2')[+e.key - 1]; b && b.click(); }
      else if (e.key === 'Enter' && S.answered) { const n = $('#enext'); n && n.click(); }
    };
    document.addEventListener('keydown', onKey);
    stopHero = () => { clearInterval(timer); document.removeEventListener('keydown', onKey); };

    function visual(v, box, small) {
      if (v.type === 'svg') box.innerHTML = v.html;
      else if (v.type === 'icon') box.innerHTML = `<div class="qicon">${v.icon}</div>`;
      else if (v.type === 'f2l') {
        box.innerHTML = `<canvas></canvas><div class="mini">${R.topViewSVG(v.state, 'f2l')}</div>`;
        R.renderF2LThumb(box.querySelector('canvas'), v.state, small ? 120 : 300, small ? 100 : 250);
      } else if (v.type === 'move') {
        if (small) { box.innerHTML = `<div class="qicon mono">${esc(v.alg)}</div>`; return; }
        box.innerHTML = '<canvas></canvas><button class="btn" id="replay">↻ Xem lại</button>';
        const P = S.player = new R.Player(box.querySelector('canvas'), { size: 280 });
        P.load(C.solved(), v.alg); P.speed = 0.7;
        setTimeout(() => P.play(), 350);
        box.querySelector('#replay').onclick = () => { P.seek(0); P.play(); };
      }
    }

    function show() {
      const q = S.qs[S.i]; S.answered = false;
      view.innerHTML = `
        <div class="etop"><button class="btn" id="equit">✕ Thoát</button><b>${test.icon} ${esc(test.name)}</b>
          <span class="pill">Câu ${S.i + 1}/${S.qs.length}</span><span class="pill">✓ ${S.score}</span><span class="pill">⏱ <span id="etime">${fmtTime(Math.round((Date.now() - S.t0) / 1000))}</span></span></div>
        <div class="bar ebar"><i style="width:${S.i / S.qs.length * 100}%"></i></div>
        <div class="equiz">
          <div class="qvis ${q.vis.type}"></div>
          <div><h2 class="qprompt">${esc(q.prompt)}</h2>
            <div class="opts2">${q.options.map((o, k) => `<button class="opt2 ${q.mono ? 'mono' : ''}" data-o="${esc(o)}"><span class="k">${k + 1}</span><span>${esc(o)}</span></button>`).join('')}</div>
            <div id="efb"></div></div>
        </div>`;
      visual(q.vis, view.querySelector('.qvis'));
      $('#equit').onclick = () => { stopHero(); stopHero = null; renderExam(); };
      view.querySelector('.opts2').onclick = e => {
        const b = e.target.closest('.opt2'); if (!b || S.answered) return;
        S.answered = true;
        const ok = b.dataset.o === q.answer;
        if (ok) S.score++; else S.wrong.push({ q, picked: b.dataset.o });
        view.querySelectorAll('.opt2').forEach(x => { x.disabled = true; if (x.dataset.o === q.answer) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
        const last = S.i === S.qs.length - 1;
        $('#efb').innerHTML = `<div class="fb ${ok ? 'good' : 'badf'}"><b>${ok ? '✓ Chính xác!' : '✗ Chưa đúng — đáp án: ' + esc(q.answer)}</b><p>${esc(q.explain)}</p>
          <div class="ctrls" style="justify-content:flex-start">${q.item ? '<button class="btn" id="edemo">▶ Xem hoạt hình 3D</button>' : ''}<button class="btn pri" id="enext">${last ? 'Xem kết quả' : 'Câu tiếp theo →'}</button></div></div>`;
        if (q.item) $('#edemo').onclick = () => openDetail(q.item, [q.item]);
        $('#enext').onclick = () => { if (S.player) S.player.pause(); S.player = null; S.i++; S.i < S.qs.length ? show() : finish(); };
      };
    }

    function finish() {
      clearInterval(timer);
      const n = S.qs.length, pct = Math.round(S.score / n * 100), secs = Math.round((Date.now() - S.t0) / 1000);
      const best = loadBest(), isBest = best[test.id] === undefined || pct > best[test.id];
      if (isBest) { best[test.id] = pct; saveBest(best); }
      const grade = pct >= 90 ? ['Xuất sắc! 🏆', 'var(--ok)'] : pct >= 70 ? ['Tốt lắm! 👍', 'var(--ok)'] : pct >= 50 ? ['Khá — ôn thêm chút nữa', 'var(--accent)'] : ['Cần ôn lại 📚', 'var(--bad)'];
      const wrongItems = uniq(S.wrong.filter(w => w.q.item).map(w => w.q.item));
      view.innerHTML = `
        <div class="eres">
          <div class="ring" style="--p:${pct};--c:${grade[1]}"><div><b>${pct}%</b><small>${S.score}/${n} câu</small></div></div>
          <div>
            <h1 style="margin:0">${grade[0]}</h1>
            <p class="lead" style="margin:6px 0">${test.icon} ${esc(test.name)} · thời gian ${fmtTime(secs)}${isBest ? ' · <b style="color:var(--accent)">Kỷ lục mới!</b>' : ` · cao nhất: ${best[test.id]}%`}</p>
            <div class="ctrls" style="justify-content:flex-start">
              <button class="btn pri" id="eagain">↻ Làm lại</button><button class="btn" id="eback">Chọn bài khác</button>
              ${wrongItems.length ? `<button class="btn" id="eunlearn">Bỏ "đã thuộc" ${wrongItems.length} trường hợp làm sai</button>` : ''}
            </div>
          </div>
        </div>
        ${S.wrong.length ? `<h2>Xem lại các câu sai (${S.wrong.length})</h2><div class="review"></div>` : '<div class="note">Không sai câu nào — tuyệt vời! 🎉</div>'}`;
      const rv = view.querySelector('.review');
      if (rv) S.wrong.forEach(w => {
        const row = el(`<div class="rrow"><div class="rvis"></div><div><b>${esc(w.q.prompt)}</b>
          <p><span class="tag" style="color:var(--bad)">Bạn chọn: ${esc(w.picked)}</span> <span class="tag" style="color:var(--ok)">Đáp án: ${esc(w.q.answer)}</span></p>
          <p class="legend" style="max-width:none">${esc(w.q.explain)}</p>${w.q.item ? '<button class="btn">▶ Xem hoạt hình</button>' : ''}</div></div>`);
        rv.appendChild(row); visual(w.q.vis, row.querySelector('.rvis'), true);
        const b = row.querySelector('.btn'); if (b) b.onclick = () => openDetail(w.q.item, [w.q.item]);
      });
      $('#eagain').onclick = () => { stopHero(); runTest(test); };
      $('#eback').onclick = () => { stopHero(); stopHero = null; renderExam(); };
      const un = $('#eunlearn');
      if (un) un.onclick = () => { wrongItems.forEach(it => learned.delete(it.key)); saveLearned(); un.disabled = true; un.textContent = 'Đã bỏ đánh dấu — hãy ôn lại các trường hợp này'; };
    }
    show();
  }

  /* ---------- Ký hiệu ---------- */
  const NOTES = [
    ['R', 'Mặt phải, theo chiều kim đồng hồ (nhìn thẳng vào mặt đó)'], ["R'", 'Mặt phải, ngược chiều kim đồng hồ'], ['R2', 'Mặt phải xoay 180°'],
    ['L', 'Mặt trái, theo chiều kim đồng hồ'], ["L'", 'Mặt trái, ngược chiều'],
    ['U', 'Mặt trên, theo chiều kim đồng hồ'], ["U'", 'Mặt trên, ngược chiều'], ['U2', 'Mặt trên xoay 180°'],
    ['D', 'Mặt dưới'], ["D'", 'Mặt dưới, ngược chiều'], ['F', 'Mặt trước'], ["F'", 'Mặt trước, ngược chiều'], ['B', 'Mặt sau'],
    ['M', 'Lớp giữa (cùng chiều L)'], ["M'", 'Lớp giữa, ngược chiều'], ['M2', 'Lớp giữa 180°'],
    ['E', 'Lớp giữa ngang (cùng chiều D)'], ['S', 'Lớp giữa đứng (cùng chiều F)'],
    ['r', 'Xoay 2 lớp phải (R + M\')'], ["r'", '2 lớp phải, ngược chiều'], ['l', 'Xoay 2 lớp trái'], ['u', 'Xoay 2 lớp trên'], ['f', 'Xoay 2 lớp trước'], ['d', 'Xoay 2 lớp dưới'],
    ['x', 'Xoay cả khối theo hướng R'], ["x'", 'Xoay cả khối ngược hướng R'], ['y', 'Xoay cả khối theo hướng U'], ["y'", 'Xoay cả khối ngược hướng U'], ['z', 'Xoay cả khối theo hướng F']
  ];
  function renderNotation() {
    view.innerHTML = `
      <h1>Ký hiệu xoay</h1>
      <p class="lead">Mỗi chữ cái là một mặt (R phải, L trái, U trên, D dưới, F trước, B sau). Không có dấu = quay <b>90° theo chiều kim đồng hồ</b> khi nhìn thẳng vào mặt đó; dấu nháy <code>'</code> = ngược chiều; số <code>2</code> = quay 180°. Chữ thường (r, u, f...) là xoay <b>2 lớp</b>; x, y, z xoay cả khối.</p>
      <div class="detail" style="margin-top:16px">
        <div class="stage"><canvas id="ncv"></canvas>
          <div class="ctrls"><button class="btn" id="nreplay">↻ Chạy lại</button><button class="btn" id="nsolved">Khối đã giải</button></div>
          <div class="algbox" id="nalg"></div></div>
        <div>
          <div class="box"><b>Thử công thức của bạn</b>
            <div class="toolbar" style="margin:8px 0 0"><input id="ncustom" placeholder="Ví dụ: R U R' U'" value="R U R' U'" style="flex:1"><button class="btn pri" id="nrun">Chạy</button></div>
            <div id="nerr" style="color:var(--bad);font-size:13px;min-height:18px"></div></div>
          <h2 style="margin-top:20px">Bấm ký hiệu để xem khối xoay</h2>
          <div class="notation" id="nlist">${NOTES.map(([t, d]) => `<button data-t="${t}"><b>${esc(t)}</b><span>${esc(d)}</span></button>`).join('')}</div>
        </div>
      </div>`;
    const P = notationPlayer = new R.Player($('#ncv'), { size: 340 });
    const algbox = $('#nalg');
    P.onChange = () => { algbox.querySelectorAll('.mv').forEach((m, i) => { m.classList.toggle('cur', i === P.index - 1); }); };
    function run(alg, fresh = true) {
      try { C.parseAlg(alg); } catch (e) { $('#nerr').textContent = e.message; return; }
      $('#nerr').textContent = '';
      P.load(C.solved(), alg);
      algbox.innerHTML = C.tokens(alg).map((t, i) => `<span class="mv">${esc(t)}</span>`).join('');
      P.speed = 1; P.play();
    }
    $('#nlist').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      $('#nlist').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      $('#ncustom').value = b.dataset.t; run(b.dataset.t);
    });
    $('#nrun').onclick = () => run($('#ncustom').value);
    $('#ncustom').addEventListener('keydown', e => { if (e.key === 'Enter') run($('#ncustom').value); });
    $('#nreplay').onclick = () => { P.seek(0); P.play(); };
    $('#nsolved').onclick = () => { P.load(C.solved(), ''); algbox.innerHTML = ''; };
    run('R U R\' U\'');
  }

  /* ---------- Danh sách ---------- */
  function renderSet(kind) {
    const m = META[kind], list = SETS[kind].concat(SPECIAL[kind] || []);
    const groups = [...new Set(list.map(i => i.group))];
    const st = { q: '', g: 'Tất cả', star: false };
    view.innerHTML = `
      <div class="sec-h"><div><h1>${m.name} <small style="font-weight:400;color:var(--muted);font-size:18px">— ${m.full}</small></h1></div><span class="pill" id="prog"></span></div>
      <p class="lead">${m.intro}</p>
      <div class="toolbar"><input id="q" type="search" placeholder="Tìm theo tên hoặc công thức…">
        <span id="chips" style="display:flex;gap:6px;flex-wrap:wrap"></span></div>
      <div id="grid"></div>`;
    const base = kind.split('/').pop();
    const chips = ['Tất cả', ...(base === 'pll' || base === 'oll' ? ['⭐ 2-look'] : []), ...(kind === 'zbll' ? ['COLL (học trước)'] : []), ...new Set(list.map(i => i.chip || i.group))];
    $('#chips').innerHTML = chips.map(c => `<button class="chip" data-g="${esc(c)}">${esc(c)}</button>`).join('');
    const draw = () => {
      const items = list.filter(it => {
        if (st.star && !it.star) return false;
        if (st.g === 'COLL (học trước)') { if (!it.coll) return false; } else if (st.g !== 'Tất cả' && !st.star && (it.chip || it.group) !== st.g) return false;
        const hay = (it.title + ' ' + it.alg + ' ' + it.tags.join(' ')).toLowerCase();
        return hay.includes(st.q);
      });
      const grid = $('#grid');
      grid.innerHTML = '';
      // khi không lọc: chia thành từng mục có tiêu đề theo nhóm
      const sectioned = !st.q && !st.star && st.g === 'Tất cả';
      const target = {};
      if (sectioned) {
        for (const g of groups) {
          const n = items.filter(i => i.group === g).length;
          const sec = el(`<section class="gsec"><div class="gsec-h" style="--gc:${list.find(i => i.group === g).gc}"><h3>${esc(g)} <span>${n}</span></h3>${g === SPECIAL_G ? `<p>${esc(SPECIAL_DESC[kind])}</p>` : GROUP_DESC[g] ? `<p>${esc(GROUP_DESC[g])}</p>` : ''}</div><div class="grid"></div></section>`);
          grid.appendChild(sec); target[g] = sec.querySelector('.grid');
        }
      } else { const g = el('<div class="grid"></div>'); grid.appendChild(g); target.all = g; }
      for (const it of items) {
        const c = el(`<article class="card ${learned.has(it.key) ? 'done' : ''}" data-k="${it.key}" style="--gc:${it.gc}">
          <div class="thumb">${thumbHTML(it)}</div>
          <div class="t"><b>${esc(it.title)}</b><button class="tick ${learned.has(it.key) ? 'on' : ''}" title="Đã thuộc">✓</button></div>
          <div class="tags">${it.star ? '<span class="tag star">⭐ 2-look</span>' : ''}${it.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="alg">${it.alg ? esc(it.alg) : it.impossible ? '🚫 không có công thức — sửa bằng tay' : '— không cần công thức —'}</div></article>`);
        (sectioned ? target[it.group] : target.all).appendChild(c); fillThumb(c, it);
      }
      if (!items.length) grid.innerHTML = '<p class="lead">Không tìm thấy trường hợp phù hợp.</p>';
      $('#chips').querySelectorAll('.chip').forEach(b => b.classList.toggle('on', st.star ? b.dataset.g === '⭐ 2-look' : b.dataset.g === st.g));
      const p = progress(kind); $('#prog').textContent = `Đã thuộc ${p.n}/${p.total}`;
      draw.items = items;
    };
    $('#q').addEventListener('input', e => { st.q = e.target.value.trim().toLowerCase(); draw(); });
    $('#chips').addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      st.star = b.dataset.g === '⭐ 2-look'; st.g = st.star ? 'Tất cả' : b.dataset.g; draw();
    });
    $('#grid').addEventListener('click', e => {
      const card = e.target.closest('.card'); if (!card) return;
      const it = list.find(x => x.key === card.dataset.k);
      if (e.target.closest('.tick')) {
        toggleLearned(it.key);
        card.classList.toggle('done', learned.has(it.key));
        e.target.closest('.tick').classList.toggle('on', learned.has(it.key));
        const p = progress(kind); $('#prog').textContent = `Đã thuộc ${p.n}/${p.total}`;
        return;
      }
      openDetail(it, draw.items, () => draw());
    });
    draw();
  }

  /* ---------- Chi tiết (modal) ---------- */
  let player = null, modalCtx = null;
  const modal = $('#modal'), sheet = $('#sheet');
  function closeModal() {
    if (modal.classList.contains('hidden')) return;
    modal.classList.add('hidden'); player && player.pause(); player = null;
    const cb = modalCtx && modalCtx.onClose; modalCtx = null; cb && cb();
  }
  modal.addEventListener('mousedown', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (modal.classList.contains('hidden') || !player) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === ' ') { e.preventDefault(); player.toggle(); }
    else if (e.key === 'ArrowRight') player.next();
    else if (e.key === 'ArrowLeft') player.prev();
  });

  function describe(it) {
    if (it.big) {
      const L = [`<li>${it.demo ? '<b>Ký hiệu:</b> ' + it.desc : '<b>Tác dụng:</b> ' + esc(it.desc)}</li>`];
      if (it.parity) L.push(`<li><b>Sau công thức:</b> ${esc(it.after)} — làm tiếp như 3×3 bình thường.${it.alg.includes('x ') ? ' Công thức có nước <code>x</code> (xoay cả khối) ở giữa — nhớ giữ nguyên.' : ''}</li>`);
      if (!it.demo) L.push('<li><b>Cách đọc hình:</b> chỉ các mảnh bị công thức tác động có màu đầy đủ; mọi mảnh khác giữ đúng màu nhưng làm nhạt. Công thức là một phép hoán vị — áp dụng cho các mảnh đang ở đúng các vị trí như hình (xoay cả khối để đưa mảnh cần sửa về vị trí đó).</li>');
      L.push(`<li><b>Quy ước:</b> ${it.N === 4 ? '<code>2R</code> = lớp thứ 2 từ phải, <code>Rw</code> = 2 lớp ngoài.' : '<code>2R</code> = lớp thứ 2, <code>3R</code> = lớp giữa, <code>Rw</code> = 2 lớp ngoài, <code>3Rw</code> = 3 lớp ngoài.'}</li>`);
      return L.join('');
    }
    if (it.kind === 'basic') return `<li>${esc(it.desc)}</li>`;    if (it.special && it.impossible) return `<li><b>Dấu hiệu:</b> ${esc(it.desc)}</li><li><b>Cách sửa (bằng tay):</b> ${esc(it.fixText)}</li><li><b>Trước khi tháo:</b> kiểm tra kỹ 4 rãnh F2L — nếu có mảnh sai màu thì xem các thẻ "F2L sai ngầm" bên cạnh, vì khi đó vẫn giải được bằng công thức.</li>`;
    if (it.special && it.after) return `<li><b>Dấu hiệu:</b> ${esc(it.desc)}</li><li><b>Sau khi sửa:</b> F2L hoàn chỉnh, tầng trên là một trường hợp bình thường (${esc(it.after)}) — giải tiếp như thường lệ. Mặt trên trên khối thật của bạn có thể khác hình.</li><li><b>Cách dễ nhớ hơn:</b> lấy cặp bị sai ra tầng trên (vd <code>R U R'</code>) rồi giải lại như một trường hợp F2L.</li>`;
    if (it.special) return `<li><b>Trường hợp đặc biệt:</b> ${esc(it.desc)}</li>` + (it.kind === 'f2l' ? `<li><b>Cách đọc hình:</b> chỉ cặp của rãnh ${esc(it.slot || 'FR')} có màu đầy đủ; mọi mảnh khác giữ màu thật nhưng được làm nhạt.</li>` : '');
    if (it.kind === 'oll') {
      return [`<li><b>Hình dạng:</b> ${SHAPE_VN[it.info.shape]} — ${it.info.edges}/4 cạnh và ${it.info.corners}/4 góc đã vàng</li>`,
        `<li><b>Nhận dạng:</b> xoay U để mẫu vàng trên mặt trên giống sơ đồ (các vạch bên viền cho biết sticker vàng nằm ở cạnh bên), rồi chạy công thức.</li>`,
        it.star ? `<li><b>⭐ 2-look:</b> ${esc(it.star)}</li>` : ''].join('');
    }
    if (it.kind === 'pll') {
      const i = it.info;
      return [`<li><b>Hoán vị:</b> ${esc(i.corners)}; ${esc(i.edges)}</li>`,
        `<li><b>Nhận dạng:</b> ${i.lights ? `có ${i.lights} mặt có đèn pha (2 góc cùng màu)` : 'không có đèn pha'}${i.bars ? `, ${i.bars} mặt có thanh 3 ô cùng màu` : ''}. Xoay U để khớp sơ đồ.</li>`,
        it.star ? `<li><b>⭐ 2-look:</b> ${esc(it.star)}</li>` : '',
        `<li><b>Sau công thức:</b> có thể cần xoay U (AUF) để các mặt bên khớp màu tâm.</li>`].join('');
    }
    if (it.kind === 'basic') return `<li>${esc(it.desc)}</li>`;
    if (it.kind === 'zbll' || it.kind === 'coll') {
      const col = ZB_COLL[it.shape + it.set], sh = ZB_SHAPE[it.shape];
      return [`<li><b>Hình góc:</b> ${sh} — 4 góc có mẫu vàng giống OLL ${ZB_OLL[it.shape]} (${sh}); 4 cạnh đã vàng (chữ thập).</li>`,
        `<li><b>Nhóm góc ${it.set}:</b> cùng cách xếp màu các góc. Nhận dạng nhóm bằng màu 2 bên của các góc (đèn pha, màu đối nhau), rồi nhận dạng ca bằng các cạnh.</li>`,
        it.kind === 'coll' ? `<li><b>COLL:</b> công thức giữ nguyên thứ tự các cạnh. Nếu cạnh chưa đúng, sau công thức chỉ còn 1 PLL cạnh (Ua/Ub/H/Z). Đây cũng chính là <b>ZBLL ${esc(it.zbll)}</b>.</li>`
          : it.coll ? '<li><b>Đây là ca COLL của nhóm</b> — các cạnh đã đúng chỗ so với nhau. Học ca này trước.</li>'
          : `<li><b>Chưa thuộc? Giải 2 bước:</b> ${it.fbPre ? `xoay <code>${esc(it.fbPre)}</code>, ` : ''}làm COLL của nhóm <code>${esc(col.alg)}</code> → còn lại <b>PLL ${esc(it.fb)}</b>.</li>`,
        `<li><b>Mẹo nhận dạng:</b> xoay U để hình góc giống sơ đồ, rồi so màu các sticker bên cạnh với sơ đồ (nhìn 2 mặt trước và phải là đủ).</li>`].join('');
    }
    if (it.kind === 'wv') {
      return [`<li><b>Tình huống:</b> cặp góc–cạnh của rãnh trước-phải đã ghép sẵn ở tầng trên, sẵn sàng chèn bằng <code>R U R'</code>; tầng trên đã có chữ thập vàng.</li>`,
        it.wvAfter === 'skip' ? '<li><b>Ca dễ nhất:</b> chèn bình thường là mặt trên vàng hết.</li>' : `<li><b>Nếu chèn bình thường</b> bằng <code>R U R'</code> thì mặt trên thành <b>${ZB_SHAPE[it.wvAfter] || '?'}</b> (OLL ${ZB_OLL[it.wvAfter] || '?'}) và cần thêm 1 công thức nữa. WV gộp 2 bước làm 1.</li>`,
        `<li><b>Nhận dạng:</b> nhìn 3 góc tầng trên (không tính góc của cặp): mặt vàng của mỗi góc hướng lên, sang phải hay sang trái.</li>`].join('');
    }
    return [`<li><b>Nhóm:</b> ${esc(it.group)} — ${esc(GROUP_DESC[it.group] || '')}</li>`,
      `<li><b>Cách đọc hình:</b> chỉ <b>cặp cần giải</b> (1 góc + 1 cạnh) có màu đầy đủ; mọi mảnh khác giữ màu thật nhưng được làm nhạt. Rãnh đích là góc <b>dưới-trước-phải</b>.</li>`,
      `<li><b>Cách dùng:</b> xoay U để cặp nằm đúng như hình rồi chạy công thức. Với rãnh khác, xoay cả khối (y) cho rãnh đó về trước-phải.</li>`].join('');
  }

  function openDetail(it, list, onClose) {
    const base = it.base || it, idx = list.indexOf(base);
    const vars = base.N ? [] : base.variants || [], vi = it.vi || 0;
    modalCtx = { onClose };
    const hasGray = it.kind === 'f2l' || it.kind === 'wv' || it.big;
    const grayFn = it.big ? it.colorFn : it.kind === 'wv' ? R.wvColor : R.f2lColorFor(it.slot, it.N);
    const yawOf = () => it.big ? -35 : R.SLOT_YAW[it.slot || 'FR'];
    sheet.innerHTML = `
      <button class="x" aria-label="Đóng">✕</button>
      <div class="detail">
        <div class="stage">
          <canvas id="pcv"></canvas>
          <div class="ctrls">
            <button class="btn" data-a="reset" title="Về đầu">⏮</button>
            <button class="btn" data-a="prev" title="Lùi (←)">◀</button>
            <button class="btn pri" data-a="play" id="bplay" style="min-width:84px" ${it.play ? '' : 'disabled'}>▶ Chạy</button>
            <button class="btn" data-a="next" title="Tiến (→)">▶|</button>
            <select class="btn" id="spd"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.5">1.5×</option><option value="2.5">2.5×</option></select>
          </div>
          <div class="ctrls"><button class="btn" data-v="front">Nhìn trước</button><button class="btn" data-v="back">Nhìn sau</button><button class="btn" data-v="top">Nhìn từ trên</button>
            ${hasGray ? `<label class="chip" style="cursor:pointer"><input type="checkbox" id="gray" checked> ${it.kind === 'wv' ? 'chỉ hiện vàng / xám' : it.big ? 'làm nổi các mảnh liên quan' : 'làm nổi cặp cần giải'}</label>` : ''}</div>
          <div class="legend" id="stepinfo"></div>
        </div>
        <div>
          <div class="tags" style="margin-bottom:6px">${it.star ? '<span class="tag star">⭐ 2-look</span>' : ''}${it.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="sec-h"><h1 style="margin:0">${esc(it.title)}</h1>
            <div class="ctrls"><button class="btn" data-n="-1" ${idx <= 0 ? 'disabled' : ''}>‹ Trước</button><button class="btn" data-n="1" ${idx >= list.length - 1 ? 'disabled' : ''}>Sau ›</button></div></div>
          ${it.impossible ? `<div class="nofix"><b>🚫 Không có công thức nào giải được</b>Trạng thái này không thể xảy ra nếu chỉ xoay các mặt — khối đã bị bung mảnh hoặc vặn góc. Phải sửa bằng tay (xem bên dưới).</div>` : `
          <h2 style="margin-top:14px">${it.after && !it.big ? 'Công thức sửa F2L' : 'Công thức'} <small style="color:var(--muted);font-weight:400">(${C.tokens(it.play).length} bước — bấm một bước để nhảy tới)</small></h2>
          <div class="algbox" id="algbox">${C.tokens(it.play).map((t, i) => `<button class="mv" data-i="${i}">${esc(t)}</button>`).join('')}</div>`}
          ${vars.length ? `<div class="altsel" id="altsel"><span>Chọn công thức:</span><button class="chip ${vi === 0 ? 'on' : ''}" data-vi="0">Chính</button>${vars.map((v, i) => `<button class="chip ${vi === i + 1 ? 'on' : ''}" data-vi="${i + 1}" title="${esc(v.alg)}">Cách ${i + 2}</button>`).join('')}</div>` : ''}
          ${it.pre ? `<div class="hint-aufs">Bước "${esc(it.pre)}" đầu tiên chỉ là xoay U để căn mặt trên cho giống sơ đồ (AUF)${it.post ? `, bước "${esc(it.post)}" cuối cùng cũng là AUF` : ''}; công thức chính là phần còn lại.</div>` : it.post ? `<div class="hint-aufs">Bước "${esc(it.post)}" cuối cùng chỉ là xoay U để khớp màu các mặt bên (AUF).</div>` : ''}
          ${vars.length ? `<details class="altall"><summary>Tất cả ${vars.length + 1} công thức cho ${esc(base.title)}</summary><ol>${[{ alg: base.alg }, ...vars].map((v, i) => `<li${i === vi ? ' class="on"' : ''}><button class="linkbtn" data-vi="${i}"><code>${esc(v.alg)}</code></button> <small>${C.tokens(v.alg).filter(t => !/^[xyz]/.test(t)).length} nước</small></li>`).join('')}</ol></details>` : ''}
          <h2 style="margin:14px 0 6px;font-size:16px${it.impossible ? ';display:none' : ''}">Từng bước bằng hình</h2>
          <div class="film" id="film"${it.impossible ? ' hidden' : ''}></div>
          <ul class="kv">${describe(it)}${it.N && !it.big ? `<li><b>Trên khối ${it.N}×${it.N}:</b> chỉ dùng sau khi đã thu gọn (tâm + ghép cạnh xong). Công thức đã dịch từ 3×3: <code>r</code> → <code>${it.N - 1}Rw</code>, <code>M</code> → <code>2-${it.N - 1}L</code>; các nước mặt ngoài giữ nguyên.</li>` : ''}</ul>
          <div class="side side-info">
            ${it.kind === 'basic' || it.big ? '' : `<div>${R.topViewSVG(it.state, viewMode(it), { arrows: it.kind === 'pll', slot: it.slot, N: it.N, state3: it.state3 })}<div class="legend">Nhìn từ trên xuống${it.kind === 'pll' ? '<br>mũi tên: mảnh cần di chuyển tới' : it.kind === 'f2l' ? '<br>chỉ tô màu cặp cần giải' : ''}</div></div>`}
            ${it.impossible ? `<div class="legend"><b style="color:var(--text)">Tạo lại tình huống này:</b><br>không làm được bằng cách xoay — chỉ có thể tháo mảnh ra lắp lại (hoặc vặn góc).</div>` : `<div class="legend">
              <b style="color:var(--text)">Tạo lại tình huống này trên khối thật:</b><br>từ khối đã giải, thực hiện công thức đảo ngược<br>
              <code style="color:var(--accent)">${it.setup === '' ? '(không cần — bắt đầu từ khối đã giải)' : esc(it.setup ?? C.invertAlg(it.alg))}</code>
            </div>`}
          </div>
          <p style="margin-top:16px"><button class="btn ${learned.has(it.key) ? 'ok' : ''}" id="blearn">${learned.has(it.key) ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'}</button></p>
        </div>
      </div>`;
    modal.classList.remove('hidden');
    const canvas = $('#pcv');
    const bplay = $('#bplay');
    const mvs = [...sheet.querySelectorAll('.mv')];
    const frames = [];
    const upd = () => {
      if (!player) return;
      mvs.forEach((m, i) => { m.classList.toggle('done', i < player.index - 1); m.classList.toggle('cur', i === player.index - 1); });
      frames.forEach((f, i) => { f.classList.toggle('cur', i === player.index); f.classList.toggle('past', i < player.index); });
      bplay.textContent = player.playing ? '⏸ Dừng' : (player.index >= player.total ? '↻ Lại' : '▶ Chạy');
      if (!player.total) { $('#stepinfo').textContent = it.impossible ? 'Kéo để xoay xem khối từ mọi phía' : ''; bplay.textContent = '▶ Chạy'; return; }
      $('#stepinfo').textContent = `Bước ${player.index}/${player.total}` + (player.index === 0 ? ' — trạng thái ban đầu của tình huống' : player.index === player.total ? ' — hoàn thành!' : '');
    };
    player = new R.Player(canvas, { size: it.N ? 380 : 340, yaw: hasGray ? yawOf() : undefined, colorFn: hasGray ? grayFn : undefined, onChange: upd, engine: it.N ? BCUBE.make(it.N) : undefined, N: it.N });
    player.load(it.state, it.play);
    const P = player;
    const film = $('#film'), toks = C.tokens(it.play);
    P.states.forEach((s, i) => {
      const f = el(`<button class="fr" title="${i ? 'Sau bước ' + i : 'Trạng thái ban đầu'}"><canvas></canvas><span>${i ? esc(toks[i - 1]) : 'Đầu'}</span></button>`);
      film.appendChild(f); frames.push(f);
      R.renderCubeThumb(f.querySelector('canvas'), s, 70, 70, hasGray ? grayFn : undefined, hasGray ? yawOf() : -35, it.N);
      f.onclick = () => P.seek(i);
    });
    sheet.querySelector('.x').onclick = closeModal;
    sheet.querySelector('.stage').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.a === 'reset') P.seek(0);
      if (b.dataset.a === 'prev') P.prev();
      if (b.dataset.a === 'next') P.next();
      if (b.dataset.a === 'play') P.toggle();
      if (b.dataset.v) P.setView({ front: -35, back: 145, top: -35 }[b.dataset.v], b.dataset.v === 'top' ? 80 : 30);
    });
    $('#spd').onchange = e => { P.speed = +e.target.value; };
    if (hasGray) $('#gray').onchange = e => { P.colorFn = e.target.checked ? grayFn : undefined; P.draw(); };
    if ($('#algbox')) $('#algbox').addEventListener('click', e => { const b = e.target.closest('.mv'); if (b) P.seek(+b.dataset.i + 1); });
    sheet.querySelectorAll('[data-vi]').forEach(b => b.onclick = () => {
      const k = +b.dataset.vi; if (k === vi) return;
      const v = k ? Object.assign({}, base, vars[k - 1], { base, vi: k }) : base;
      const cb = modalCtx.onClose; player.pause(); openDetail(v, list, cb);
    });
    sheet.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
      const nxt = list[idx + +b.dataset.n]; if (!nxt) return;
      const cb = modalCtx.onClose; player.pause(); openDetail(nxt, list, cb);
    });
    if (hasGray) $('#gray').addEventListener('change', e => frames.forEach((f, i) => R.renderCubeThumb(f.querySelector('canvas'), P.states[i], 70, 70, e.target.checked ? grayFn : undefined, yawOf(), it.N)));
    $('#blearn').onclick = e => { toggleLearned(it.key); e.target.className = 'btn ' + (learned.has(it.key) ? 'ok' : ''); e.target.textContent = learned.has(it.key) ? '✓ Đã thuộc' : 'Đánh dấu đã thuộc'; };
    upd();
  }

  /* ---------- Luyện tập ---------- */
  /* ---------- Công cụ giải: nhập màu -> hướng dẫn từng bước ---------- */
  const SV_KEY = 'rubik-solver-input';
  const FACE_VN = { U: 'Trên', L: 'Trái', F: 'Trước', R: 'Phải', B: 'Sau', D: 'Dưới' };
  const STAGE_IC = { cross: '✚', f2l: '🧩', oll: '🟨', pll: '🔄' };
  function renderSolve() {
    const SVR = window.Solver, COLS = C.FACE_COLORS;
    let fl = null;
    try { fl = JSON.parse(localStorage.getItem(SV_KEY) || 'null'); } catch (e) { fl = null; }
    if (!fl) fl = SVR.toFacelets(C.solved());
    let pick = 'U', steps = null, P = null, stopAt = null, painting = false;
    const save = () => { try { localStorage.setItem(SV_KEY, JSON.stringify(fl)); } catch (e) { /* bỏ qua */ } };
    const POS = { U: [1, 4], L: [4, 1], F: [4, 4], R: [4, 7], B: [4, 10], D: [7, 4] };
    view.innerHTML = `
      <h1>Giải khối của bạn</h1>
      <p class="lead">Tô màu khối Rubik thật của bạn vào hình trải phẳng bên dưới, app sẽ kiểm tra và <b>hướng dẫn giải từng bước theo CFOP</b> (Cross → F2L → OLL → PLL), mỗi bước có hoạt hình và liên kết tới thẻ công thức tương ứng.</p>
      <div class="box sv-hold"><b>Cầm khối đúng hướng trước khi tô:</b> tâm <b style="color:${COLS.U}">vàng</b> hướng lên trên, tâm <b style="color:${COLS.F}">xanh lá</b> hướng về phía bạn (khi đó tâm đỏ ở trái, cam ở phải, xanh dương ở sau, trắng ở dưới). Giữ nguyên cách cầm này suốt lúc tô và lúc giải.
        <br>Mặt <b>Trên</b>: nghiêng khối nhìn từ trên xuống — hàng dưới cùng của ô vẽ là hàng giáp mặt Trước. Mặt <b>Dưới</b>: lật khối nhìn từ dưới lên — hàng trên cùng giáp mặt Trước. Các mặt bên: nhìn thẳng vào từng mặt.</div>
      <div class="sv">
        <div>
          <div class="sv-pal" id="svpal"></div>
          <div class="sv-net" id="svnet"></div>
          <div class="toolbar" style="margin-top:12px">
            <button class="btn" id="svsolved">Khối đã giải</button>
            <button class="btn" id="svclear">Xoá màu</button>
            <button class="btn" id="svrand">🎲 Xáo ngẫu nhiên</button>
          </div>
          <div class="toolbar"><input id="svscr" placeholder="Hoặc nhập công thức xáo trộn, vd: R U2 F' L D2 B" style="flex:1"><button class="btn" id="svapply">Áp dụng</button></div>
        </div>
        <div class="sv-prev"><canvas id="svcv"></canvas><div class="legend">Xem trước 3D — kéo để xoay</div>
          <button class="btn pri sv-go" id="svgo">🧠 Kiểm tra &amp; giải</button>
          <div id="sverr"></div></div>
      </div>
      <div id="svres"></div>`;
    const net = $('#svnet');
    for (const f of SVR.FACE_ORDER) for (let i = 0; i < 9; i++) {
      const r = POS[f][0] + Math.floor(i / 3), c = POS[f][1] + (i % 3);
      const b = document.createElement('button');
      b.className = 'sv-c' + (i === 4 ? ' ctr' : ''); b.dataset.k = f + i; b.style.gridRow = r; b.style.gridColumn = c;
      b.title = `Mặt ${FACE_VN[f]}${i === 4 ? ' (tâm — cố định)' : ''}`;
      if (i === 4) b.textContent = FACE_VN[f];
      net.appendChild(b);
    }
    const prev = new R.Player($('#svcv'), { size: 260, colorFn: s => (s.c ? COLS[s.c] : '#3a3f4b') });
    const prevState = () => { const st = C.solved(); for (const f of SVR.FACE_ORDER) for (let i = 0; i < 9; i++) { const p = SVR.cellPos(f, Math.floor(i / 3), i % 3); st.find(s => C.eq(s.p, p) && C.eq(s.n, C.FACES[f])).c = fl[f + i] || null; } return st; };
    function paint(bad = []) {
      net.querySelectorAll('.sv-c').forEach(b => {
        const c = fl[b.dataset.k]; b.style.background = c ? COLS[c] : ''; b.classList.toggle('empty', !c); b.classList.toggle('bad', bad.includes(b.dataset.k));
      });
      const cnt = {}; Object.values(fl).forEach(c => { if (c) cnt[c] = (cnt[c] || 0) + 1; });
      $('#svpal').innerHTML = Object.keys(SVR.COLOR_NAME).map(c => `<button class="sv-sw ${pick === c ? 'on' : ''}" data-c="${c}" style="--c:${COLS[c]}"><i></i>${SVR.COLOR_NAME[c]}<small class="${(cnt[c] || 0) === 9 ? 'ok' : (cnt[c] || 0) > 9 ? 'over' : ''}">${cnt[c] || 0}/9</small></button>`).join('');
      prev.load(prevState(), '');
    }
    const changed = () => { save(); paint(); $('#sverr').innerHTML = ''; $('#svres').innerHTML = ''; steps = null; };
    const setCell = k => { if (k[1] === '4' || fl[k] === pick) return; fl[k] = pick; save(); paint(); $('#svres').innerHTML = ''; };
    $('#svpal').addEventListener('click', e => { const b = e.target.closest('.sv-sw'); if (b) { pick = b.dataset.c; paint(); } });
    net.addEventListener('pointerdown', e => { const b = e.target.closest('.sv-c'); if (!b) return; painting = true; setCell(b.dataset.k); e.preventDefault(); });
    net.addEventListener('pointerover', e => { if (!painting) return; const b = e.target.closest('.sv-c'); if (b) setCell(b.dataset.k); });
    net.addEventListener('pointermove', e => { // cảm ứng: ngón tay kéo qua các ô
      if (!painting || e.pointerType === 'mouse') return;
      const t = document.elementFromPoint(e.clientX, e.clientY), b = t && t.closest('.sv-c');
      if (b && net.contains(b)) setCell(b.dataset.k);
    });
    const stopPaint = () => { painting = false; };
    document.addEventListener('pointerup', stopPaint);
    net.addEventListener('contextmenu', e => { const b = e.target.closest('.sv-c'); if (!b || b.dataset.k[1] === '4') return; e.preventDefault(); delete fl[b.dataset.k]; changed(); });
    $('#svsolved').onclick = () => { fl = SVR.toFacelets(C.solved()); changed(); };
    $('#svclear').onclick = () => { fl = {}; for (const f of SVR.FACE_ORDER) fl[f + 4] = f; changed(); };
    $('#svrand').onclick = () => {
      const M = ['U', 'D', 'R', 'L', 'F', 'B']; let s = [], last = '';
      while (s.length < 22) { const f = M[Math.floor(Math.random() * 6)]; if (f === last) continue; last = f; s.push(f + ['', "'", '2'][Math.floor(Math.random() * 3)]); }
      $('#svscr').value = s.join(' '); fl = SVR.toFacelets(C.applyAlg(C.solved(), s.join(' '))); changed();
    };
    const applyScr = () => {
      try { fl = SVR.toFacelets(C.applyAlg(C.solved(), $('#svscr').value)); changed(); }
      catch (e) { $('#sverr').innerHTML = `<div class="sv-msg bad">Công thức không hợp lệ: ${esc(e.message)}</div>`; }
    };
    $('#svapply').onclick = applyScr;
    $('#svscr').addEventListener('keydown', e => { if (e.key === 'Enter') applyScr(); });
    $('#svgo').onclick = () => {
      const r = SVR.fromFacelets(fl);
      if (r.errors) {
        paint(r.errors.flatMap(e => e.cells));
        $('#sverr').innerHTML = `<div class="sv-msg bad"><b>Chưa giải được — kiểm tra lại:</b><ul>${r.errors.map(e => `<li>${esc(e.msg)}</li>`).join('')}</ul></div>`;
        $('#svres').innerHTML = ''; return;
      }
      $('#sverr').innerHTML = '<div class="sv-msg">⏳ Đang tìm lời giải…</div>';
      setTimeout(() => {
        try { steps = SVR.solve(r.state); } catch (e) { $('#sverr').innerHTML = `<div class="sv-msg bad">${esc(e.message)}</div>`; return; }
        $('#sverr').innerHTML = '<div class="sv-msg ok">✓ Khối hợp lệ — lời giải ở bên dưới.</div>';
        showSteps(r.state);
        $('#svres').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 30);
    };

    function refItem(s) {
      const key = s.stage === 'f2l' ? 'f2l-' + s.f2lId : s.stage === 'oll' && s.ollId ? 'oll-' + s.ollId : s.stage === 'pll' && s.pllName ? 'pll-' + s.pllName : null;
      if (!key) return null;
      const kind = s.stage; return SETS[kind].find(i => i.key === key);
    }
    function showSteps(start) {
      const all = steps.map(s => s.alg).filter(Boolean).join(' ');
      const starts = []; let n = 0; steps.forEach(s => { starts.push(n); n += C.tokens(s.alg).length; });
      const total = n;
      $('#svres').innerHTML = `
        <div class="sec-h" style="margin-top:26px"><h2 style="margin:0">Lời giải: ${total} nước, ${steps.length} bước</h2></div>
        <div class="detail sv-out">
          <div class="stage" style="position:sticky;top:12px;align-self:start">
            <canvas id="svp"></canvas>
            <div class="ctrls">
              <button class="btn" data-a="reset" title="Về đầu">⏮</button>
              <button class="btn" data-a="prev" title="Lùi">◀</button>
              <button class="btn pri" data-a="play" id="svplay" style="min-width:110px">▶ Chạy bước</button>
              <button class="btn" data-a="next" title="Tiến">▶|</button>
              <select class="btn" id="svspd"><option value="0.6">0.6×</option><option value="1" selected>1×</option><option value="1.6">1.6×</option><option value="2.5">2.5×</option></select>
            </div>
            <div class="legend" id="svinfo"></div>
          </div>
          <ol class="sv-steps" id="svsteps">${steps.map((s, k) => {
            const it = refItem(s);
            return `<li class="sv-step" data-k="${k}">
              <div class="sv-sh"><span class="sv-ic">${STAGE_IC[s.stage]}</span><b>Bước ${k + 1}. ${esc(s.title)}</b><canvas class="sv-th"></canvas></div>
              <p>${s.desc}</p>
              ${s.alg ? `<div class="algbox">${C.tokens(s.alg).map((t, i) => `<button class="mv" data-i="${starts[k] + i}">${esc(t)}</button>`).join('')}</div>` : ''}
              ${it ? `<button class="btn sv-ref" data-ref="${it.key}">Xem thẻ ${esc(it.title)} ›</button>` : ''}
            </li>`;
          }).join('')}</ol>
        </div>`;
      steps.forEach((s, k) => {
        const cv = $('#svsteps').querySelectorAll('.sv-th')[k];
        if (s.stage === 'f2l') R.renderCubeThumb(cv, s.before, 56, 56, R.f2lColorFor(s.slot), R.SLOT_YAW[s.slot]);
        else R.renderCubeThumb(cv, s.before, 56, 56);
      });
      const stepAt = i => { let k = 0; starts.forEach((st, j) => { if (i >= st && C.tokens(steps[j].alg).length) k = j; }); return k; };
      const mvs = [...$('#svsteps').querySelectorAll('.mv')], lis = [...$('#svsteps').querySelectorAll('.sv-step')];
      const upd = () => {
        if (!P) return;
        if (stopAt !== null && P.playing && P.index >= stopAt) { stopAt = null; P.pause(); return; }
        const cur = Math.min(stepAt(P.index), steps.length - 1);
        const k = P.index >= total ? steps.length - 1 : stepAt(P.index);
        mvs.forEach((m, i) => { m.classList.toggle('done', i < P.index - 1); m.classList.toggle('cur', i === P.index - 1); });
        lis.forEach((l, j) => { l.classList.toggle('on', j === k); l.classList.toggle('past', starts[j] + C.tokens(steps[j].alg).length <= P.index && j !== k); });
        $('#svplay').textContent = P.playing ? '⏸ Dừng' : P.index >= total ? '↻ Xem lại' : '▶ Chạy bước';
        $('#svinfo').textContent = P.index >= total ? 'Hoàn thành — khối đã được giải! 🎉' : `Nước ${P.index}/${total} · đang ở bước ${cur + 1}: ${steps[cur].title}`;
      };
      P = new R.Player($('#svp'), { size: 330, onChange: upd });
      P.load(start, all);
      const playStep = () => {
        if (P.playing) { P.pause(); return; }
        if (P.index >= total) { P.seek(0); }
        const k = stepAt(P.index); stopAt = starts[k] + C.tokens(steps[k].alg).length;
        if (stopAt <= P.index) stopAt = null;
        P.play();
      };
      $('#svspd').onchange = e => { P.speed = +e.target.value; };
      document.querySelector('.sv-out .stage').addEventListener('click', e => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.a === 'reset') P.seek(0);
        if (b.dataset.a === 'prev') P.prev();
        if (b.dataset.a === 'next') P.next();
        if (b.dataset.a === 'play') playStep();
      });
      $('#svsteps').addEventListener('click', e => {
        const ref = e.target.closest('.sv-ref');
        if (ref) { const it = [...SETS.f2l, ...SETS.oll, ...SETS.pll].find(i => i.key === ref.dataset.ref); openDetail(it, SETS[it.kind], () => {}); return; }
        const mv = e.target.closest('.mv'); if (mv) { stopAt = null; P.seek(+mv.dataset.i + 1); return; }
        const li = e.target.closest('.sv-step'); if (li) { stopAt = null; P.seek(starts[+li.dataset.k]); }
      });
      upd();
    }
    paint();
    stopHero = () => { document.removeEventListener('pointerup', stopPaint); };
  }

  function renderPractice() {
    const st = { kinds: { f2l: true, oll: true, pll: true }, onlyNew: false, quiz: false, cur: null, shown: false };
    view.innerHTML = `
      <h1>Luyện tập</h1>
      <p class="lead">Nhìn hình, thử nhớ công thức rồi bấm "Xem đáp án". Chế độ trắc nghiệm (OLL/PLL) giúp luyện nhận dạng tên trường hợp.</p>
      <div class="toolbar" id="ptools"></div>
      <div class="drill"><div class="big" id="pbig"></div><div id="pside"></div></div>`;
    const tools = $('#ptools');
    const renderTools = () => {
      tools.innerHTML = ['f2l', 'oll', 'pll'].map(k => `<button class="chip ${st.kinds[k] ? 'on' : ''}" data-k="${k}">${META[k].name}</button>`).join('') +
        `<button class="chip ${st.onlyNew ? 'on' : ''}" data-o="new">Chỉ phần chưa thuộc</button><button class="chip ${st.quiz ? 'on' : ''}" data-o="quiz">Trắc nghiệm tên (OLL/PLL)</button>`;
    };
    tools.addEventListener('click', e => {
      const b = e.target.closest('.chip'); if (!b) return;
      if (b.dataset.k) st.kinds[b.dataset.k] = !st.kinds[b.dataset.k];
      if (b.dataset.o === 'new') st.onlyNew = !st.onlyNew;
      if (b.dataset.o === 'quiz') st.quiz = !st.quiz;
      renderTools(); next();
    });
    function pool() {
      let l = []; for (const k in st.kinds) if (st.kinds[k]) l = l.concat(SETS[k]);
      if (st.onlyNew) l = l.filter(i => !learned.has(i.key));
      if (st.quiz) l = l.filter(i => i.kind !== 'f2l');
      return l;
    }
    function next() {
      const l = pool(), big = $('#pbig'), side = $('#pside');
      st.shown = false;
      if (!l.length) { big.innerHTML = ''; side.innerHTML = '<div class="box">Không còn trường hợp nào trong bộ lọc này 🎉 — hãy bỏ bớt bộ lọc.</div>'; return; }
      let it; do { it = l[Math.floor(Math.random() * l.length)]; } while (l.length > 1 && it === st.cur);
      st.cur = it;
      if (it.kind === 'f2l') {
        big.innerHTML = '<canvas></canvas>';
        const cv = big.querySelector('canvas'); R.renderF2LThumb(cv, it.state, 300, 170);
      } else big.innerHTML = R.topViewSVG(it.state, it.kind);
      if (st.quiz) {
        const others = SETS[it.kind].filter(x => x !== it).sort(() => Math.random() - .5).slice(0, 3);
        const opts = [it, ...others].sort(() => Math.random() - .5);
        side.innerHTML = `<h2 style="margin-top:0">Đây là trường hợp nào?</h2><div class="opts">${opts.map(o => `<button class="btn" data-k="${o.key}">${esc(o.title)}</button>`).join('')}</div><div id="pres"></div>`;
        side.querySelector('.opts').onclick = e => {
          const b = e.target.closest('button'); if (!b || st.shown) return; st.shown = true;
          const good = b.dataset.k === it.key;
          side.querySelectorAll('.opts button').forEach(x => { if (x.dataset.k === it.key) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); });
          reveal(good);
        };
      } else {
        side.innerHTML = `<h2 style="margin-top:0">${it.kind === 'f2l' ? 'Hãy nhớ công thức cho tình huống này' : 'Đây là ' + esc(it.title) + '?'}</h2>
          <p class="lead">${it.kind === 'f2l' ? 'Cặp góc-cạnh đang ở thế như hình.' : 'Thử nhớ tên và công thức.'}</p><button class="btn pri" id="pshow">Xem đáp án</button><div id="pres"></div>`;
        $('#pshow').onclick = () => { st.shown = true; $('#pshow').classList.add('hidden'); reveal(); };
      }
    }
    function reveal(good) {
      const it = st.cur, res = $('#pres');
      if (it.kind === 'pll') $('#pbig').innerHTML = R.topViewSVG(it.state, 'pll', { arrows: true });
      res.innerHTML = `${good === undefined ? '' : `<p style="font-weight:700;color:${good ? 'var(--ok)' : 'var(--bad)'}">${good ? 'Chính xác!' : 'Chưa đúng — đáp án là ' + esc(it.title)}</p>`}
        <div class="box"><b>${esc(it.title)}</b>${it.tags.length ? ' · <span style="color:var(--muted)">' + esc(it.tags.join(', ')) + '</span>' : ''}
        <div class="algbox">${C.tokens(it.alg).map(t => `<span class="mv">${esc(t)}</span>`).join('')}</div>
        <button class="btn" id="pdemo">▶ Xem hoạt hình 3D</button></div>
        <div class="ctrls" style="justify-content:flex-start;margin-top:12px"><button class="btn ok" id="pyes">Đã nhớ ✓</button><button class="btn bad" id="pno">Chưa nhớ</button><button class="btn" id="pskip">Câu khác →</button></div>`;
      $('#pdemo').onclick = () => openDetail(it, [it]);
      $('#pyes').onclick = () => { learned.add(it.key); saveLearned(); next(); };
      $('#pno').onclick = () => { learned.delete(it.key); saveLearned(); next(); };
      $('#pskip').onclick = next;
    }
    renderTools(); next();
  }

  route();
})();
