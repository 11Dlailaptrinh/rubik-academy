/* Mô hình khối Rubik 3x3: mỗi sticker có vị trí p, pháp tuyến n, màu c (mặt gốc) và home (vị trí khối gốc). */
(function (root) {
  'use strict';
  const FACES = { U: [0, 1, 0], D: [0, -1, 0], F: [0, 0, 1], B: [0, 0, -1], R: [1, 0, 0], L: [-1, 0, 0] };
  // Vàng trên, trắng dưới, xanh lá trước, cam phải, đỏ trái (sơ đồ chuẩn khi nhìn mặt vàng lên trên)
  const FACE_COLORS = { U: '#ffd500', D: '#f2f2f2', F: '#13a24f', B: '#1e5fd6', R: '#ff7a1a', L: '#d62839' };
  const eq = (a, b) => a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  // xoay v quanh trục k, t phần tư vòng THEO CHIỀU KIM ĐỒNG HỒ khi nhìn từ phía k ra
  function rot90(v, k, t) {
    let r = v;
    for (let i = 0; i < t; i++) {
      const c = cross(k, r), d = dot(k, r);
      r = [0, 1, 2].map(j => -c[j] + k[j] * d + 0);
    }
    return r;
  }

  function solved() {
    const st = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      const p = [x, y, z];
      for (const f of 'UDFBRL') {
        const n = FACES[f];
        if (dot(p, n) === 1) st.push({ p: p.slice(), n: n.slice(), c: f, home: p.slice() });
      }
    }
    return st;
  }
  const clone = st => st.map(s => ({ p: s.p.slice(), n: s.n.slice(), c: s.c, home: s.home }));

  const SPEC = {
    R: { k: [1, 0, 0], lay: p => p[0] === 1 }, L: { k: [-1, 0, 0], lay: p => p[0] === -1 },
    U: { k: [0, 1, 0], lay: p => p[1] === 1 }, D: { k: [0, -1, 0], lay: p => p[1] === -1 },
    F: { k: [0, 0, 1], lay: p => p[2] === 1 }, B: { k: [0, 0, -1], lay: p => p[2] === -1 },
    r: { k: [1, 0, 0], lay: p => p[0] >= 0 }, l: { k: [-1, 0, 0], lay: p => p[0] <= 0 },
    u: { k: [0, 1, 0], lay: p => p[1] >= 0 }, d: { k: [0, -1, 0], lay: p => p[1] <= 0 },
    f: { k: [0, 0, 1], lay: p => p[2] >= 0 }, b: { k: [0, 0, -1], lay: p => p[2] <= 0 },
    M: { k: [-1, 0, 0], lay: p => p[0] === 0 }, E: { k: [0, -1, 0], lay: p => p[1] === 0 },
    S: { k: [0, 0, 1], lay: p => p[2] === 0 },
    x: { k: [1, 0, 0], lay: () => true }, y: { k: [0, 1, 0], lay: () => true }, z: { k: [0, 0, 1], lay: () => true }
  };

  function parseMove(t) {
    const m = /^([RLUDFB]w|[RLUDFBrludfbMESxyz])(2'|2|')?$/.exec(t);
    if (!m) throw new Error('Ký hiệu không hợp lệ: ' + t);
    let base = m[1];
    if (base.length === 2) base = base[0].toLowerCase();
    const suf = m[2] || '';
    const q = suf === '' ? 1 : suf === "'" ? -1 : 2;
    return { name: t, base, q, k: SPEC[base].k, lay: SPEC[base].lay };
  }
  const tokens = s => s.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
  const parseAlg = s => tokens(s).map(parseMove);

  function applyMove(st, mv) {
    const t = ((mv.q % 4) + 4) % 4;
    for (const s of st) if (mv.lay(s.p)) { s.p = rot90(s.p, mv.k, t); s.n = rot90(s.n, mv.k, t); }
    return st;
  }
  function applyAlg(st, alg) {
    for (const mv of (typeof alg === 'string' ? parseAlg(alg) : alg)) applyMove(st, mv);
    return st;
  }
  function invertToken(t) {
    if (t.endsWith('2')) return t.replace("'", '');
    return t.endsWith("'") ? t.slice(0, -1) : t + "'";
  }
  const invertAlg = s => tokens(s).reverse().map(invertToken).join(' ');
  const caseState = alg => applyAlg(solved(), invertAlg(alg));

  /* ---------- Phân tích ---------- */
  const isTopCorner = s => Math.abs(s.p[0]) + Math.abs(s.p[2]) === 2;
  function ollInfo(st) {
    const top = st.filter(s => s.n[1] === 1 && s.p[1] === 1);
    const edges = top.filter(s => Math.abs(s.p[0]) + Math.abs(s.p[2]) === 1);
    const corners = top.filter(isTopCorner);
    const eo = edges.filter(s => s.c === 'U');
    const co = corners.filter(s => s.c === 'U');
    let shape = 'dot';
    if (eo.length === 4) shape = 'cross';
    else if (eo.length === 2) shape = eo[0].p[0] + eo[1].p[0] === 0 && eo[0].p[2] + eo[1].p[2] === 0 ? 'line' : 'L';
    else if (eo.length !== 0) shape = 'other';
    return { edges: eo.length, corners: co.length, shape };
  }

  const CORNER_SLOTS = [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]];
  const EDGE_SLOTS = [[0, 1, 1], [-1, 1, 0], [0, 1, -1], [1, 1, 0]];
  const slotIdx = (list, p) => list.findIndex(q => eq(q, p));
  function pllPerm(st) {
    const c = [0, 0, 0, 0], e = [0, 0, 0, 0];
    for (const s of st) {
      if (s.home[1] !== 1) continue;
      const w = Math.abs(s.home[0]) + Math.abs(s.home[2]);
      if (w === 2) c[slotIdx(CORNER_SLOTS, s.home)] = slotIdx(CORNER_SLOTS, s.p);
      else if (w === 1) e[slotIdx(EDGE_SLOTS, s.home)] = slotIdx(EDGE_SLOTS, s.p);
    }
    return { c, e };
  }
  function cycles(perm) {
    const seen = [], out = [];
    for (let i = 0; i < perm.length; i++) {
      if (seen[i] || perm[i] === i) continue;
      const cyc = []; let j = i;
      while (!seen[j]) { seen[j] = true; cyc.push(j); j = perm[j]; }
      out.push(cyc);
    }
    return out;
  }
  // khoá chuẩn hoá theo AUF trước/sau
  function pllKey(st) {
    const { c, e } = pllPerm(st);
    let best = null;
    for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
      const q = p => p.map((_, i) => (p[(i + b) % 4] + a) % 4).join('');
      const k = q(c) + '-' + q(e);
      if (best === null || k < best) best = k;
    }
    return best;
  }
  function pllInfo(st0) {
    // bỏ qua AUF: chọn lần xoay U khiến ít mảnh sai chỗ nhất
    let st = st0, bestMoved = 99, cur = clone(st0);
    for (let a = 0; a < 4; a++) {
      const pp = pllPerm(cur);
      const moved = pp.c.filter((v, i) => v !== i).length + pp.e.filter((v, i) => v !== i).length;
      if (moved < bestMoved) { bestMoved = moved; st = clone(cur); }
      applyAlg(cur, 'U');
    }
    const { c, e } = pllPerm(st);
    const cc = cycles(c), ec = cycles(e);
    let corners, edges;
    if (!cc.length) corners = 'Góc: đã đúng chỗ';
    else if (cc.length === 1 && cc[0].length === 2) corners = (cc[0][1] - cc[0][0] + 4) % 4 === 2 ? 'Góc: hoán đổi 2 góc chéo nhau' : 'Góc: hoán đổi 2 góc kề nhau';
    else if (cc.length === 1) corners = 'Góc: xoay vòng 3 góc';
    else corners = 'Góc: hoán đổi 2 cặp góc';
    if (!ec.length) edges = 'Cạnh: đã đúng chỗ';
    else if (ec.length === 1 && ec[0].length === 2) edges = (ec[0][1] - ec[0][0] + 4) % 4 === 2 ? 'Cạnh: hoán đổi 2 cạnh đối diện' : 'Cạnh: hoán đổi 2 cạnh kề nhau';
    else if (ec.length === 1) edges = 'Cạnh: xoay vòng 3 cạnh';
    else {
      const opp = ec.every(x => (x[1] - x[0] + 4) % 4 === 2);
      edges = opp ? 'Cạnh: hoán đổi 2 cặp cạnh đối diện (H)' : 'Cạnh: hoán đổi 2 cặp cạnh kề nhau';
    }
    // đèn pha / thanh
    let lights = 0, bars = 0;
    for (const f of 'FRBL') {
      const row = st.filter(s => eq(s.n, FACES[f]) && s.p[1] === 1);
      const cs = row.filter(isTopCorner), ed = row.find(s => !isTopCorner(s));
      if (cs[0].c === cs[1].c) { lights++; if (ed.c === cs[0].c) bars++; }
    }
    return { corners, edges, lights, bars, text: corners + ' · ' + edges };
  }

  function isF2LIntact(st) {
    return st.every(s => s.home[1] > 0 || (eq(s.p, s.home) && eq(s.n, FACES[s.c])));
  }
  function ollKey(st) { // khoá hình dạng OLL, chuẩn hoá theo xoay U
    let best = null; let cur = clone(st);
    for (let a = 0; a < 4; a++) {
      const k = cur.filter(s => s.p[1] === 1).map(s => (s.c === 'U' ? '1' : '0') + s.p.join('') + s.n.join(''))
        .sort().join(',');
      if (best === null || k < best) best = k;
      applyAlg(cur, 'U');
    }
    return best;
  }

  /* "Can thiệp bằng tay" vào khối (lật cạnh, vặn góc, đổi chỗ 2 mảnh cùng tầng) — dùng để mô tả
     các tình huống xảy ra khi mảnh bị bung / lắp lại, hoặc F2L bị đặt sai.
     ops: [['flip', pos]] | [['twist', pos, ±1]] | [['swap', posA, posB]] */
  function tamper(st0, ops) {
    const st = clone(st0);
    const at = p => st.filter(s => eq(s.p, p));
    const move = (list, from, to) => { // đổi màu của các sticker trong list theo ánh xạ pháp tuyến
      const snap = list.map(s => ({ n: s.n, c: s.c, home: s.home }));
      for (const o of snap) { const t = list.find(s => eq(s.n, to(o.n))); t.c = o.c; t.home = o.home; }
    };
    for (const [op, a, b] of ops || []) {
      if (op === 'flip') { const [x, y] = at(a); [x.c, y.c, x.home, y.home] = [y.c, x.c, y.home, x.home]; }
      else if (op === 'twist') {
        const cyc = n => n[0] ? [0, a[1], 0] : n[1] ? [0, 0, a[2]] : [a[0], 0, 0];
        const back = n => n[0] ? [0, 0, a[2]] : n[1] ? [a[0], 0, 0] : [0, a[1], 0];
        move(at(a), null, b === -1 ? back : cyc);
      } else if (op === 'swap') {
        const Y = [0, 1, 0]; let t = 1;
        while (t < 4 && !eq(rot90(a, Y, t), b)) t++;
        if (t === 4 || a[1] !== b[1]) throw new Error('swap: 2 mảnh phải cùng tầng');
        const A = at(a), B = at(b);
        const sa = A.map(s => ({ n: rot90(s.n, Y, t), c: s.c, home: s.home }));
        const sb = B.map(s => ({ n: rot90(s.n, Y, 4 - t), c: s.c, home: s.home }));
        for (const o of sa) { const q = B.find(s => eq(s.n, o.n)); q.c = o.c; q.home = o.home; }
        for (const o of sb) { const q = A.find(s => eq(s.n, o.n)); q.c = o.c; q.home = o.home; }
      }
    }
    return st;
  }

  const api = { tamper, FACES, FACE_COLORS, rot90, solved, clone, parseAlg, parseMove, applyMove, applyAlg, invertAlg, invertToken, tokens,
    caseState, pllPerm, CORNER_SLOTS, EDGE_SLOTS, ollInfo, pllInfo, pllKey, isF2LIntact, ollKey, dot, cross, eq, SPEC };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Cube = api;
})(typeof window !== 'undefined' ? window : globalThis);
