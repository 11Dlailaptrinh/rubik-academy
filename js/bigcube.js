/* Mô hình khối Rubik N×N (4×4, 5×5…). Mỗi sticker: p (toạ độ ô con, số nguyên: 2i-(N-1)), n (pháp tuyến), c (màu gốc), home.
   Ký hiệu hỗ trợ: R L U D F B (mặt ngoài), Rw / 3Rw (lớp rộng), 2R / 2-3R (lớp trong), r l u d f b (= Rw…), M E S (lớp giữa),
   x y z (xoay cả khối). Hậu tố: ' hoặc 2. */
(function (root) {
  'use strict';
  const C = root.Cube || (typeof require !== 'undefined' ? require('./cube.js') : null);
  const FACES = C.FACES, rot90 = C.rot90;

  function make(N) {
    const lo = -(N - 1);
    const coords = []; for (let i = 0; i < N; i++) coords.push(2 * i - (N - 1));

    function solved() {
      const st = [];
      for (const x of coords) for (const y of coords) for (const z of coords) {
        const p = [x, y, z];
        for (const f of 'UDFBRL') {
          const n = FACES[f];
          if (p[0] * n[0] + p[1] * n[1] + p[2] * n[2] === N - 1) st.push({ p: p.slice(), n: n.slice(), c: f, home: p.slice() });
        }
      }
      return st;
    }
    const clone = st => st.map(s => ({ p: s.p.slice(), n: s.n.slice(), c: s.c, home: s.home }));

    // trục + dấu: depth(p) = số lớp tính từ mặt đó (0 = ngoài cùng)
    const AX = {
      R: { k: [1, 0, 0], d: p => (N - 1 - p[0]) / 2 }, L: { k: [-1, 0, 0], d: p => (p[0] + N - 1) / 2 },
      U: { k: [0, 1, 0], d: p => (N - 1 - p[1]) / 2 }, D: { k: [0, -1, 0], d: p => (p[1] + N - 1) / 2 },
      F: { k: [0, 0, 1], d: p => (N - 1 - p[2]) / 2 }, B: { k: [0, 0, -1], d: p => (p[2] + N - 1) / 2 }
    };
    const mid = (N - 1) / 2;
    function parseMove(t) {
      let m = /^(\d+)(?:-(\d+))?([RLUDFB])(w?)(2'|2|')?$/.exec(t);
      let a, b, f, suf;
      if (m) { // 2R, 3Rw, 2-3R, 2-3Rw
        const lo_ = +m[1], hi = m[2] ? +m[2] : null;
        f = m[3]; suf = m[5] || '';
        if (m[4] === 'w' && hi === null) { a = 1; b = lo_; } else if (hi !== null) { a = lo_; b = hi; } else { a = lo_; b = lo_; }
      } else {
        m = /^([RLUDFB])(w?)(2'|2|')?$/.exec(t);
        if (m) { f = m[1]; suf = m[3] || ''; a = 1; b = m[2] ? 2 : 1; }
        else {
          m = /^([rludfb])(2'|2|')?$/.exec(t);
          if (m) { f = m[1].toUpperCase(); suf = m[2] || ''; a = 1; b = 2; }
          else {
            m = /^([MES])(2'|2|')?$/.exec(t);
            if (m) { // lớp giữa (chỉ khi N lẻ); M theo chiều L, E theo chiều D, S theo chiều F
              if (N % 2 === 0) throw new Error('Ký hiệu ' + t + ' chỉ dùng cho khối lẻ');
              const base = { M: 'L', E: 'D', S: 'F' }[m[1]]; f = base; suf = m[2] || ''; a = b = (N + 1) / 2;
            } else {
              m = /^([xyz])(2'|2|')?$/.exec(t);
              if (!m) throw new Error('Ký hiệu không hợp lệ: ' + t);
              const k = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] }[m[1]], s = m[2] || '';
              return { name: t, base: m[1], q: s === '' ? 1 : s === "'" ? -1 : 2, k, lay: () => true };
            }
          }
        }
      }
      if (a < 1 || b > N || a > b) throw new Error('Lớp không hợp lệ: ' + t);
      const ax = AX[f];
      return { name: t, base: f, q: suf === '' ? 1 : suf === "'" ? -1 : 2, k: ax.k, lay: p => { const d = ax.d(p) + 1; return d >= a && d <= b; } };
    }
    const tokens = s => s.replace(/[()]/g, ' ').split(/\s+/).filter(Boolean);
    const parseAlg = s => tokens(s).map(parseMove);
    function applyMove(st, mv) {
      const t = ((mv.q % 4) + 4) % 4;
      for (const s of st) if (mv.lay(s.p)) { s.p = rot90(s.p, mv.k, t); s.n = rot90(s.n, mv.k, t); }
      return st;
    }
    function applyAlg(st, alg) { for (const mv of (typeof alg === 'string' ? parseAlg(alg) : alg)) applyMove(st, mv); return st; }
    const invertAlg = s => tokens(s).reverse().map(C.invertToken).join(' ');
    const caseState = alg => applyAlg(solved(), invertAlg(alg));

    /* ---- phân loại mảnh ---- */
    const ext = Math.abs(lo);
    const kind = p => { // 'corner' | 'wing' | 'mid-edge' | 'xcenter' | 'tcenter' | 'center' | 'fixed'
      const e = p.filter(v => Math.abs(v) === ext).length;
      if (e === 3) return 'corner';
      if (e === 2) return p.filter(v => v === 0).length ? 'mid-edge' : 'wing';
      if (e === 1) {
        const o = p.filter(v => Math.abs(v) !== ext);
        if (o[0] === 0 && o[1] === 0) return 'fixed';
        if (o[0] === 0 || o[1] === 0) return 'tcenter';
        return Math.abs(o[0]) === Math.abs(o[1]) ? 'xcenter' : 'center';
      }
      return 'inner';
    };
    const isHome = s => C.eq(s.p, s.home) && C.eq(s.n, FACES[s.c]);
    // các sticker sai chỗ, nhóm theo loại mảnh
    function diff(st) {
      const out = {}; let total = 0;
      for (const s of st) {
        if (s.home.every((v, i) => v === s.p[i]) && C.eq(s.n, FACES[s.c])) continue;
        // sticker "tại chỗ" theo màu: so với vị trí hiện tại là mặt có màu s.c?
        const k = kind(s.p); out[k] = (out[k] || 0) + 1; total++;
      }
      return { total, by: out };
    }
    // sticker nằm sai màu so với mặt hiện tại (so với tâm cố định cho khối lẻ / so với màu mặt chuẩn)
    function misplaced(st) { return st.filter(s => !(C.eq(s.p, s.home) && C.eq(s.n, FACES[s.c]))); }

    // lật một cạnh (đổi màu 2 sticker của MỖI cánh cạnh) tại cạnh có tên như 'UF', 'FR'… — mô tả "parity OLL"
    function flipEdge(st0, name) {
      const st = clone(st0), want = name.split('');
      const fo = n => n[0] === 1 ? 'R' : n[0] === -1 ? 'L' : n[1] === 1 ? 'U' : n[1] === -1 ? 'D' : n[2] === 1 ? 'F' : 'B';
      const byCubie = {};
      for (const s of st) { const k = s.p.join(); (byCubie[k] = byCubie[k] || []).push(s); }
      for (const k in byCubie) {
        const l = byCubie[k]; if (l.length !== 2 || kind(l[0].p) !== 'wing') continue;
        const fs_ = l.map(s => fo(s.n)); if (!want.every(f => fs_.includes(f))) continue;
        [l[0].c, l[1].c, l[0].home, l[1].home] = [l[1].c, l[0].c, l[1].home, l[0].home];
      }
      return st;
    }

    /* Dịch công thức 3×3 sang khối N×N đã thu gọn: mặt ngoài giữ nguyên; r (2 lớp của 3×3) = mọi lớp trừ mặt đối diện
       (4×4: 3Rw, 5×5: 4Rw); M/E/S (lớp giữa của 3×3) = mọi lớp trong (4×4: 2-3L, 5×5: 2-4L). */
    function from3x3(alg) {
      if (!alg) return alg;
      return tokens(alg).map(t => {
        let m = /^([rludfb])(2'|2|')?$/.exec(t) || /^([RLUDFB])w(2'|2|')?$/.exec(t);
        if (m) return (N - 1) + m[1].toUpperCase() + 'w' + (m[2] || '');
        m = /^([MES])(2'|2|')?$/.exec(t);
        if (m) return '2-' + (N - 1) + { M: 'L', E: 'D', S: 'F' }[m[1]] + (m[2] || '');
        return t;
      }).join(' ');
    }
    // thu gọn về 3×3: trả về trạng thái kiểu cube.js (toạ độ -1..1) nếu mọi mảnh ghép khớp màu, ngược lại null
    function reduce3(st) {
      const ext = N - 1, sg = v => (Math.abs(v) === ext ? Math.sign(v) : 0), g = new Map();
      for (const s of st) { const p = s.p.map(sg), k = p.join() + '|' + s.n.join(); (g.get(k) || g.set(k, { p, n: s.n.slice(), cs: new Set() }).get(k)).cs.add(s.c); }
      const out = [];
      for (const x of g.values()) { if (x.cs.size !== 1) return null; out.push({ p: x.p, n: x.n, c: [...x.cs][0] }); }
      const cub = new Map(); for (const s of out) { const k = s.p.join(); (cub.get(k) || cub.set(k, []).get(k)).push(s); }
      for (const l of cub.values()) { const h = [0, 0, 0]; for (const s of l) FACES[s.c].forEach((v, i) => { h[i] += v; }); for (const s of l) s.home = h.slice(); }
      return out;
    }

    return { N, coords, flipEdge, from3x3, reduce3, solved, clone, parseMove, parseAlg, tokens, applyMove, applyAlg, invertAlg, invertToken: C.invertToken, caseState, kind, diff, misplaced, isHome, FACES, FACE_COLORS: C.FACE_COLORS, eq: C.eq };
  }
  const cache = {};
  const api = { make: N => cache[N] || (cache[N] = make(N)) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BigCube = api;
})(typeof window !== 'undefined' ? window : globalThis);
