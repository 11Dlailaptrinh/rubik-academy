/* Bộ giải CFOP từng bước cho khối do người dùng nhập màu.
   Cross: tìm ngắn nhất (meet-in-the-middle). F2L / OLL / PLL: dùng đúng các công thức trong app,
   nên mỗi bước đều trỏ được về thẻ tương ứng để người học xem lại. */
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const C = isNode ? require('./cube.js') : root.Cube;
  const LL = () => (isNode ? require('./data-last-layer.js') : root.LLData);
  const F2L = () => root.F2LData;

  const FACE_ORDER = ['U', 'L', 'F', 'R', 'B', 'D'];
  const COLOR_NAME = { U: 'vàng', D: 'trắng', F: 'xanh lá', B: 'xanh dương', R: 'cam', L: 'đỏ' };
  // vị trí sticker (hàng r, cột c của 1 mặt trên hình trải phẳng) -> toạ độ mảnh
  function cellPos(f, r, c) {
    switch (f) {
      case 'F': return [c - 1, 1 - r, 1];
      case 'R': return [1, 1 - r, 1 - c];
      case 'B': return [1 - c, 1 - r, -1];
      case 'L': return [-1, 1 - r, c - 1];
      case 'U': return [c - 1, 1, r - 1];
      case 'D': return [c - 1, -1, 1 - r];
    }
  }
  const cellKey = (f, i) => f + i;
  const stickerAt = (st, f, i) => { const p = cellPos(f, Math.floor(i / 3), i % 3), n = C.FACES[f]; return st.find(s => C.eq(s.p, p) && C.eq(s.n, n)); };
  function toFacelets(st) { const o = {}; for (const f of FACE_ORDER) for (let i = 0; i < 9; i++) o[cellKey(f, i)] = stickerAt(st, f, i).c; return o; }

  const S0 = C.solved();
  const posKey = p => p.join(',');
  const PIECES = [...new Set(S0.filter(s => Math.abs(s.p[0]) + Math.abs(s.p[1]) + Math.abs(s.p[2]) >= 2).map(s => posKey(s.p)))].map(k => k.split(',').map(Number));
  const colorsAt = (st, p) => st.filter(s => C.eq(s.p, p)).map(s => s.c);
  const setKey = cs => cs.slice().sort().join('');
  const HOME_BY_SET = new Map(PIECES.map(p => [setKey(colorsAt(S0, p)), p]));
  const isCorner = p => Math.abs(p[0]) + Math.abs(p[1]) + Math.abs(p[2]) === 3;

  /* Dựng trạng thái từ màu nhập vào + kiểm tra hợp lệ. Trả về { state } hoặc { errors:[{msg, cells}] } */
  function fromFacelets(fl) {
    const errors = [];
    const st = C.solved();
    const blank = [];
    for (const f of FACE_ORDER) for (let i = 0; i < 9; i++) {
      const c = fl[cellKey(f, i)];
      if (!c) blank.push(cellKey(f, i)); else stickerAt(st, f, i).c = c;
    }
    if (blank.length) return { errors: [{ msg: `Còn ${blank.length} ô chưa tô màu.`, cells: blank }] };
    const cnt = {}; for (const f of FACE_ORDER) for (let i = 0; i < 9; i++) cnt[fl[cellKey(f, i)]] = (cnt[fl[cellKey(f, i)]] || 0) + 1;
    const badCnt = Object.keys(COLOR_NAME).filter(c => cnt[c] !== 9);
    if (badCnt.length) errors.push({ msg: 'Mỗi màu phải có đúng 9 ô: ' + badCnt.map(c => `${COLOR_NAME[c]} đang có ${cnt[c] || 0}`).join(', ') + '.', cells: [] });
    const cellsOf = p => { const out = []; for (const f of FACE_ORDER) for (let i = 0; i < 9; i++) if (C.eq(cellPos(f, Math.floor(i / 3), i % 3), p)) out.push(cellKey(f, i)); return out; };
    const used = new Map();
    for (const p of PIECES) {
      const home = HOME_BY_SET.get(setKey(colorsAt(st, p)));
      if (!home || isCorner(home) !== isCorner(p)) { errors.push({ msg: `Mảnh có màu ${colorsAt(st, p).map(c => COLOR_NAME[c]).join('–')} không tồn tại trên khối Rubik.`, cells: cellsOf(p) }); continue; }
      const k = posKey(home);
      if (used.has(k)) { errors.push({ msg: `Mảnh ${colorsAt(S0, home).map(c => COLOR_NAME[c]).join('–')} xuất hiện 2 lần.`, cells: cellsOf(p).concat(cellsOf(used.get(k))) }); continue; }
      used.set(k, p);
      st.filter(s => C.eq(s.p, p)).forEach(s => { s.home = home; });
    }
    // kiểm tra 6 tâm đúng hệ màu chuẩn (người dùng cầm vàng trên, xanh lá trước)
    if (errors.length) return { errors };
    const inv = invariants(st);
    if (inv.twist) errors.push({ msg: 'Tổng độ xoắn của các góc không hợp lệ — có thể bạn nhập nhầm màu của 1 góc, hoặc 1 góc trên khối thật đã bị vặn.', cells: [] });
    if (inv.flip) errors.push({ msg: 'Có số lẻ cạnh bị lật — có thể bạn nhập nhầm 2 màu của 1 cạnh, hoặc 1 cạnh trên khối thật đã bị lắp ngược.', cells: [] });
    if (inv.parity) errors.push({ msg: 'Hoán vị không hợp lệ (như thể 2 mảnh bị đổi chỗ) — kiểm tra lại các ô đã nhập, hoặc khối thật đã bị tháo ra lắp sai.', cells: [] });
    return errors.length ? { errors } : { state: st };
  }
  function parityOf(perm) { let par = 0; const seen = []; for (let i = 0; i < perm.length; i++) { if (seen[i]) continue; let j = i, L = 0; while (!seen[j]) { seen[j] = true; j = perm[j]; L++; } par += L - 1; } return par % 2; }
  function invariants(st) {
    let tw = 0, fl = 0; const cp = [], ep = [];
    const corners = PIECES.filter(isCorner), edges = PIECES.filter(p => !isCorner(p));
    for (const p of corners) {
      const ss = st.filter(s => C.eq(s.p, p)), ud = ss.find(s => s.c === 'U' || s.c === 'D');
      const ny = [0, p[1], 0];
      tw += C.eq(ud.n, ny) ? 0 : C.dot(C.cross(ny, ud.n), p) > 0 ? 1 : 2;
      cp.push(corners.findIndex(q => C.eq(q, ss[0].home)));
    }
    for (const p of edges) {
      const ss = st.filter(s => C.eq(s.p, p));
      const prim = ss.find(s => s.c === 'U' || s.c === 'D') || ss.find(s => s.c === 'F' || s.c === 'B');
      const slotN = p[1] !== 0 ? [0, p[1], 0] : [0, 0, p[2]];
      if (!C.eq(prim.n, slotN)) fl++;
      ep.push(edges.findIndex(q => C.eq(q, ss[0].home)));
    }
    return { twist: tw % 3 !== 0, flip: fl % 2 !== 0, parity: parityOf(cp) !== parityOf(ep) };
  }

  /* ---------- công cụ tìm kiếm ---------- */
  const keyPN = (p, n) => p.join(',') + '|' + n.join(',');
  const slotOf = new Map(S0.map((s, i) => [keyPN(s.p, s.n), i]));
  const PERM = {};
  const permFor = m => PERM[m] || (PERM[m] = C.applyAlg(C.solved(), m).map(s => slotOf.get(keyPN(s.p, s.n))));
  const FACES6 = ['U', 'R', 'F', 'L', 'D', 'B'];
  const ALL18 = FACES6.flatMap(f => [f, f + "'", f + '2']);
  const hash = pos => String.fromCharCode.apply(null, pos);
  function mitm(start, goal, moves, side) {
    const bfs = from => {
      const levels = [new Map([[hash(from), { pos: from, path: [] }]])], seen = new Set([hash(from)]);
      for (let d = 1; d <= side; d++) {
        const nx = new Map();
        for (const { pos, path } of levels[d - 1].values()) for (const m of moves) {
          if (path.length && path[path.length - 1][0] === m[0]) continue;
          const P = permFor(m), np = pos.map(i => P[i]), h = hash(np);
          if (seen.has(h)) continue; seen.add(h); nx.set(h, { pos: np, path: path.concat(m) });
        }
        levels.push(nx);
      }
      return levels;
    };
    const F = bfs(start), B = bfs(goal);
    for (let L = 0; L <= 2 * side; L++) {
      for (let f = Math.max(0, L - side); f <= Math.min(L, side); f++) for (const [h, n] of F[f]) {
        const b = B[L - f].get(h); if (!b) continue;
        const alg = n.path.concat(b.path.slice().reverse().map(C.invertToken));
        if (alg.some((t, i) => i && t[0] === alg[i - 1][0])) continue;
        return alg.join(' ');
      }
    }
    return null;
  }

  const atHome = s => C.eq(s.p, s.home) && C.eq(s.n, C.FACES[s.c]);
  const CROSS = [[0, -1, 1], [0, -1, -1], [1, -1, 0], [-1, -1, 0]];
  const SLOTS = { FR: [1, 1], FL: [-1, 1], BR: [1, -1], BL: [-1, -1] };
  const SLOT_VN = { FR: 'trước-phải', FL: 'trước-trái', BR: 'sau-phải', BL: 'sau-trái' };
  const crossOK = S => S.filter(s => CROSS.some(h => C.eq(h, s.home))).every(atHome);
  const slotOK = (S, k) => { const [x, z] = SLOTS[k]; return S.filter(s => s.home[0] === x && s.home[2] === z && s.home[1] <= 0).every(atHome); };
  const solvedSlots = S => Object.keys(SLOTS).filter(k => slotOK(S, k));
  const apply = (S, alg) => C.applyAlg(C.clone(S), alg);
  const len = a => C.tokens(a).length;
  const AUF = ['', 'U', "U'", 'U2'];

  // ánh xạ công thức của rãnh trước-phải sang rãnh khác (tương đương xoay cả khối y / y2 / y', nhưng không cần xoay)
  const ROTS = ['', 'y', 'y2', "y'"];
  const REMAP = {};
  for (const r of ROTS) {
    REMAP[r] = {};
    for (const f of FACES6) {
      const target = apply(S0, r + ' ' + f + ' ' + C.invertAlg(r));
      REMAP[r][f] = FACES6.find(g => apply(S0, g).every((s, i) => C.eq(s.p, target[i].p) && C.eq(s.n, target[i].n)));
    }
  }
  const remap = (alg, r) => C.tokens(alg).map(t => REMAP[r][t[0]] + t.slice(1)).join(' ');
  const SLOT_OF_ROT = {}; // rãnh mà công thức FR được chuyển tới
  for (const r of ROTS) { const S = apply(S0, remap("R U R'", r)); SLOT_OF_ROT[r] = Object.keys(SLOTS).find(k => !slotOK(S, k)); }

  // gộp các nước cùng mặt liền nhau (vd "U U'" -> bỏ, "U2 U" -> "U'")
  function simplify(alg) {
    const q = t => (t.endsWith('2') ? 2 : t.endsWith("'") ? 3 : 1);
    const out = [];
    for (const t of C.tokens(alg)) {
      const last = out[out.length - 1];
      if (last && last[0] === t[0] && /^[RLUDFB]/.test(t) && last.length <= 2 && t.length <= 2) {
        const s = (q(last) + q(t)) % 4; out.pop();
        if (s) out.push(t[0] + ['', '', '2', "'"][s]);
      } else out.push(t);
    }
    return out.join(' ');
  }

  function solveCross(S) {
    if (crossOK(S)) return '';
    const ids = S0.map((s, i) => i).filter(i => CROSS.some(h => C.eq(h, S0[i].home)));
    // vị trí hiện tại của các sticker cạnh trắng
    const start = ids.map(i => { const t = S.find(s => C.eq(s.home, S0[i].home) && s.c === S0[i].c); return slotOf.get(keyPN(t.p, t.n)); });
    return mitm(start, ids, ALL18, 4);
  }

  function f2lCandidates(S, done) {
    const res = [];
    for (const r of ROTS) {
      const slot = SLOT_OF_ROT[r]; if (done.includes(slot)) continue;
      for (const a of AUF) for (const d of F2L()) {
        const alg = simplify(a + ' ' + remap(d.alg, r));
        const T = apply(S, alg);
        if (crossOK(T) && done.every(k => slotOK(T, k)) && slotOK(T, slot)) res.push({ alg, slot, id: d.id, rot: r, T });
      }
    }
    return res;
  }
  function solveF2LStep(S) {
    const done = solvedSlots(S);
    let best = null;
    const consider = (pre, cands) => { for (const c of cands) { const total = len(pre) + len(c.alg); if (!best || total < best.total) best = { ...c, pre, total }; } };
    consider('', f2lCandidates(S, done));
    if (best) return best;
    const EXTRACT = ["R U R'", "R U' R'"];
    const extractions = [];
    for (const r of ROTS) if (!done.includes(SLOT_OF_ROT[r])) for (const e of EXTRACT) extractions.push(remap(e, r));
    for (const e of extractions) consider(e, f2lCandidates(apply(S, e), done));
    if (best) return best;
    for (const e1 of extractions) for (const e2 of extractions) { const e = e1 + ' ' + e2; const T = apply(S, e); if (crossOK(T) && done.every(k => slotOK(T, k))) consider(e, f2lCandidates(T, done)); }
    return best;
  }

  /* ---------- giải toàn bộ, trả về các bước có giải thích ---------- */
  function solve(state) {
    let S = C.clone(state);
    const steps = [];
    const push = (stage, title, alg, info) => { steps.push({ stage, title, alg, before: S, ...info }); S = apply(S, alg); };

    const cross = solveCross(S);
    if (cross === null) throw new Error('Không tìm được lời giải cho dấu cộng.');
    push('cross', 'Dấu cộng trắng (Cross)', cross, { desc: cross ? `Đưa 4 cạnh trắng xuống mặt dưới, mỗi cạnh khớp màu tâm bên cạnh. Lời giải ngắn nhất: ${len(cross)} nước.` : 'Dấu cộng trắng đã có sẵn — bỏ qua.' });

    for (let n = 1; n <= 4; n++) {
      if (solvedSlots(S).length === 4) break;
      const b = solveF2LStep(S);
      if (!b) throw new Error('Không giải được F2L (trạng thái lạ).');
      const pairName = (() => { const [x, z] = SLOTS[b.slot]; return S0.filter(s => s.home[0] === x && s.home[2] === z && s.home[1] === 0).map(s => COLOR_NAME[s.c]).join('–'); })();
      const alg = simplify(b.pre + ' ' + b.alg);
      push('f2l', `F2L cặp ${solvedSlots(S).length + 1}: rãnh ${SLOT_VN[b.slot]}`, alg, {
        slot: b.slot, f2lId: b.id, extract: b.pre,
        desc: (b.pre ? `Mảnh của cặp đang kẹt trong rãnh khác — trước hết lấy ra bằng <code>${b.pre}</code>. ` : '') +
          `Ghép góc trắng với cạnh ${pairName} rồi chèn vào rãnh ${SLOT_VN[b.slot]}.` +
          (b.rot ? ` Đây là công thức của rãnh trước-phải được "chuyển" sang rãnh này (tương đương cầm khối xoay <code>${b.rot}</code> rồi làm công thức gốc).` : '')
      });
      if (solvedSlots(S).length === 4) break;
    }
    if (solvedSlots(S).length < 4 || !crossOK(S)) throw new Error('F2L chưa hoàn tất.');

    // OLL
    const yellowTop = T => { const i = C.ollInfo(T); return i.edges + i.corners === 8; };
    if (yellowTop(S)) push('oll', 'OLL: mặt trên đã vàng sẵn', '', { desc: 'May mắn — mặt trên đã vàng hết (OLL skip).' });
    else {
      let best = null;
      for (const a of AUF) for (const o of LL().OLL) { const alg = simplify(a + ' ' + o.alg); const T = apply(S, alg); if (yellowTop(T) && C.isF2LIntact(T) && (!best || len(alg) < len(best.alg))) best = { alg, id: o.id, a }; }
      if (!best) throw new Error('Không nhận ra trường hợp OLL — trạng thái không hợp lệ.');
      push('oll', `OLL ${best.id}`, best.alg, { ollId: best.id, desc: (best.a ? `Xoay <code>${best.a}</code> để mặt trên giống sơ đồ OLL ${best.id}, rồi` : 'Mặt trên đang giống sơ đồ OLL ' + best.id + ' —') + ' làm công thức để cả mặt trên thành màu vàng.' });
    }
    // PLL
    const done = T => T.every(atHome);
    if (!done(S)) {
      let best = null;
      for (const a of AUF) for (const p of [{ name: '', alg: '' }].concat(LL().PLL)) for (const b of AUF) {
        const alg = simplify([a, p.alg, b].join(' ')); if (!alg && !p.name) continue;
        if (done(apply(S, alg)) && (!best || len(alg) < len(best.alg))) best = { alg, name: p.name, a, b };
      }
      if (!best) throw new Error('Không nhận ra trường hợp PLL — trạng thái không hợp lệ.');
      if (best.name) push('pll', `PLL ${best.name}`, best.alg, { pllName: best.name, desc: `${best.a ? `Xoay <code>${best.a}</code> để tầng trên khớp sơ đồ PLL ${best.name}, rồi làm` : `Tầng trên đang là PLL ${best.name} — làm`} công thức để đưa các mảnh về đúng chỗ.${best.b ? ` Cuối cùng xoay <code>${best.b}</code> cho các mặt bên khớp màu tâm (AUF).` : ''}` });
      else push('pll', 'PLL: chỉ cần xoay mặt trên', best.alg, { desc: 'Các mảnh tầng trên đã đúng chỗ so với nhau — chỉ cần xoay mặt trên cho khớp màu (PLL skip).' });
    } else push('pll', 'PLL: đã xong', '', { desc: 'Khối đã được giải xong sau OLL!' });

    if (!done(S)) throw new Error('Lời giải không đưa khối về trạng thái đã giải.');
    return steps;
  }

  const api = { FACE_ORDER, COLOR_NAME, cellPos, fromFacelets, toFacelets, solve, invariants, simplify };
  if (isNode) module.exports = api; else root.Solver = api;
})(typeof window !== 'undefined' ? window : globalThis);
