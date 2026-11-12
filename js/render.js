/* Vẽ khối Rubik 3D (canvas, chiếu trực giao) và sơ đồ nhìn từ trên (SVG). */
(function (root) {
  'use strict';
  const C = root.Cube;
  const NS = [[0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0]];
  const GRAY = '#4b5160', BODY = '#14161b';
  const tangents = n => n[0] !== 0 ? [[0, 1, 0], [0, 0, 1]] : n[1] !== 0 ? [[1, 0, 0], [0, 0, 1]] : [[1, 0, 0], [0, 1, 0]];

  /* ---- ma trận xoay 3x3 (hàng ưu tiên) ---- */
  function matFromYP(yaw, pitch) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return [cy, 0, sy, sp * sy, cp, -sp * cy, -cp * sy, sp, cp * cy];
  }
  const matMul = (A, B) => {
    const r = new Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j];
    return r;
  };
  const rotX = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, -s, 0, s, c]; };
  const rotY = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 1, 0, -s, 0, c]; };
  function orthonormal(M) {
    let a = M.slice(0, 3), b = M.slice(3, 6);
    const n = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return v.map(x => x / l); };
    a = n(a);
    const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    b = n([b[0] - d * a[0], b[1] - d * a[1], b[2] - d * a[2]]);
    const c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    return [...a, ...b, ...c];
  }

  // sticker bo góc, dựng trong mặt phẳng của mặt (để phối cảnh làm méo đúng như thật, không dùng viền dày)
  const STICKER = (() => {
    const h = 0.43, r = 0.1, out = [];
    [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sa, sb], ci) => {
      for (let k = 0; k <= 4; k++) {
        const t = ci * Math.PI / 2 + k * Math.PI / 8;
        out.push([sa * (h - r) + r * Math.cos(t), sb * (h - r) + r * Math.sin(t)]);
      }
    });
    return out;
  })();

  const STICKER_BIG = (() => {
    const h = 0.44, r = 0.08, out = [];
    [[1, 1], [-1, 1], [-1, -1], [1, -1]].forEach(([sa, sb], ci) => {
      for (let k = 0; k <= 4; k++) {
        const t = ci * Math.PI / 2 + k * Math.PI / 8;
        out.push([sa * (h - r) + r * Math.cos(t), sb * (h - r) + r * Math.sin(t)]);
      }
    });
    return out;
  })();

  /* o: {cx, cy, scale, yaw, pitch | mat, persp, colorFn, N, anim:{k, lay, angle}} */
  function drawCube(ctx, state, o) {
    const map = new Map();
    for (const s of state) map.set(s.p.join(',') + '|' + s.n.join(','), s);
    const M = o.mat || matFromYP(o.yaw, o.pitch);
    const view = v => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
    const arot = (v, k, a) => {
      const c = Math.cos(a), s = Math.sin(a), cr = C.cross(k, v), d = C.dot(k, v);
      return [0, 1, 2].map(i => v[i] * c + cr[i] * s + k[i] * d * (1 - c));
    };
    const D = o.persp || 0; // khoảng cách camera (đơn vị = 1 khối con); 0 = chiếu song song
    const units = [];
    // lưới ô con: khối 3×3 dùng toạ độ -1..1; khối N×N dùng toạ độ 2i-(N-1) và thu nhỏ để bề ngang vẫn = 3
    const NN = o.N || 3, cs = [], kk = NN === 3 ? 1 : 3 / (2 * NN), uu = NN === 3 ? 1 : 3 / NN, stk0 = NN === 3 ? STICKER : STICKER_BIG;
    for (let i = 0; i < NN; i++) cs.push(NN === 3 ? i - 1 : 2 * i - (NN - 1));
    for (const x of cs) for (const y of cs) for (const z of cs) {
      const p = [x, y, z];
      const moving = o.anim && o.anim.lay(p);
      for (const n of NS) {
        const st = map.get(p.join(',') + '|' + n.join(','));
        const ctr = [x * kk + n[0] * uu / 2, y * kk + n[1] * uu / 2, z * kk + n[2] * uu / 2];
        const [t1, t2] = tangents(n);
        const at = ([a, b]) => [0, 1, 2].map(i => ctr[i] + uu * (a * t1[i] + b * t2[i]));
        let body = [[-.5, -.5], [.5, -.5], [.5, .5], [-.5, .5]].map(at);
        let stk = st ? stk0.map(at) : null;
        let c2 = ctr, n2 = n;
        if (moving) {
          const rr = q => arot(q, o.anim.k, o.anim.angle);
          body = body.map(rr); if (stk) stk = stk.map(rr); c2 = rr(ctr); n2 = rr(n);
        }
        const vc = view(c2), vn = view(n2);
        // ẩn mặt quay lưng về camera
        const facing = D ? vn[0] * -vc[0] + vn[1] * -vc[1] + vn[2] * (D - vc[2]) : vn[2];
        if (facing <= 1e-3) continue;
        const depth = D ? -((vc[0] ** 2) + (vc[1] ** 2) + (D - vc[2]) ** 2) : vc[2];
        units.push({ depth, body: body.map(view), stk: stk && stk.map(view), st });
      }
    }
    units.sort((a, b) => a.depth - b.depth);
    const proj = v => { const f = D ? D / (D - v[2]) : 1; return [o.cx + v[0] * o.scale * f, o.cy - v[1] * o.scale * f]; };
    const poly = pts => { ctx.beginPath(); pts.forEach((v, i) => { const [X, Y] = proj(v); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath(); };
    ctx.lineJoin = 'round';
    for (const u of units) {
      poly(u.body);
      ctx.fillStyle = BODY; ctx.strokeStyle = BODY; ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
      if (!u.stk) continue;
      poly(u.stk);
      ctx.fillStyle = o.colorFn ? o.colorFn(u.st) : C.FACE_COLORS[u.st.c];
      ctx.fill();
    }
  }

  function setupCanvas(canvas, w, h) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return ctx;
  }
  const grayLL = s => (s.home[1] === 1 ? GRAY : C.FACE_COLORS[s.c]);
  const D2R = Math.PI / 180;
  // F2L: chỉ cặp cần giải có màu đầy đủ; phần đã giải làm mờ; tầng cuối xám; tâm giữ màu để định hướng
  const mix = (hex, to, k) => {
    const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
    const ch = sh => Math.round(((a >> sh) & 255) * (1 - k) + ((b >> sh) & 255) * k);
    return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1);
  };
  const MUTED = Object.fromEntries(Object.entries(C.FACE_COLORS).map(([f, c]) => [f, mix(c, '#1a1e28', 0.62)]));
  const isPairS = s => s.home[0] === 1 && s.home[2] === 1 && s.home[1] <= 0;
  const isCenter = s => Math.abs(s.home[0]) + Math.abs(s.home[1]) + Math.abs(s.home[2]) === 1;
  const SLOT_XZ = { FR: [1, 1], FL: [-1, 1], BR: [1, -1], BL: [-1, -1] };
  // N×N: quy toạ độ gốc của mảnh về -1/0/1 như 3×3 (lớp trong → 0)
  const sg3 = N => { const e = N && N !== 3 ? N - 1 : 1; return v => (Math.abs(v) === e ? Math.sign(v) : 0); };
  const pairOf = (slot, N) => { const [x, z] = SLOT_XZ[slot || 'FR'], g = sg3(N); return s => g(s.home[0]) === x && g(s.home[2]) === z && g(s.home[1]) <= 0; };
  // chỉ 2 mảnh của cặp cần giải có màu đầy đủ; mọi thứ khác giữ đúng màu nhưng làm nhạt
  const f2lColorFor = (slot, N) => { const ip = pairOf(slot, N); return s => ip(s) ? C.FACE_COLORS[s.c] : MUTED[s.c]; };
  const f2lColor = f2lColorFor('FR');
  // WV: cặp trước-phải màu đầy đủ, tầng trên chỉ phân biệt vàng / không vàng, phần còn lại nhạt
  const wvColor = s => pairOf('FR')(s) ? C.FACE_COLORS[s.c] : s.home[1] === 1 ? (s.c === 'U' ? C.FACE_COLORS.U : GRAY) : MUTED[s.c];
  // góc nhìn đẹp nhất cho từng rãnh
  const SLOT_YAW = { FR: -38, FL: 38, BR: -142, BL: 142 };
  // Thẻ F2L: một góc nhìn lớn hướng vào rãnh đích, có phối cảnh
  function renderF2LThumb(canvas, state, w = 200, h = 165, slot = 'FR', N) {
    const ctx = setupCanvas(canvas, w, h);
    drawCube(ctx, state, { cx: w / 2, cy: h * 0.53, scale: h * 0.205, persp: 9, yaw: SLOT_YAW[slot] * D2R, pitch: 30 * D2R, colorFn: f2lColorFor(slot, N), N });
  }
  function renderCubeThumb(canvas, state, w = 120, h = 120, colorFn, yawDeg = -35, N) {
    const ctx = setupCanvas(canvas, w, h);
    drawCube(ctx, state, { cx: w / 2, cy: h / 2 + 2, scale: h * 0.31, yaw: yawDeg * D2R, pitch: 30 * D2R, colorFn, N });
  }

  /* ---------- Sơ đồ nhìn từ trên ---------- */
  function topViewSVG(state, mode, opts) { // mode: 'oll' (vàng/xám) | 'pll' (màu thật)
    const N = (opts && opts.N) || 3, ext = N === 3 ? 1 : N - 1, ix = v => (N === 3 ? v + 1 : (v + N - 1) / 2);
    const gap = N === 3 ? 2 : N === 4 ? 1.6 : 1.3, t = 8, g = 2, gw = 3 * 19 + 2 * 2, s = (gw - (N - 1) * gap) / N;
    const margin = 4, gx = margin + t + g, gy = gx, total = gw + 2 * (margin + t + g);
    const colorOf = st => mode === 'oll' ? (st.c === 'U' ? '#ffd500' : '#3b4152')
      : mode === 'f2l' ? (pairOf(opts && opts.slot, N)(st) ? C.FACE_COLORS[st.c] : MUTED[st.c]) : C.FACE_COLORS[st.c];
    let out = `<svg viewBox="0 0 ${total} ${total}" xmlns="http://www.w3.org/2000/svg" role="img">`;
    const rect = (x, y, w, h, col) => out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="${col}"/>`;
    for (const st of state) {
      if (st.p[1] !== ext) continue;
      const col = colorOf(st), cx = ix(st.p[0]), cz = ix(st.p[2]);
      if (st.n[1] === 1) rect(gx + cx * (s + gap), gy + cz * (s + gap), s, s, col);
      else if (st.n[2] === 1) rect(gx + cx * (s + gap), gy + gw + g, s, t, col);
      else if (st.n[2] === -1) rect(gx + cx * (s + gap), gy - g - t, s, t, col);
      else if (st.n[0] === 1) rect(gx + gw + g, gy + cz * (s + gap), t, s, col);
      else if (st.n[0] === -1) rect(gx - g - t, gy + cz * (s + gap), t, s, col);
    }
    if (opts && opts.arrows) {
      const { c, e } = C.pllPerm(opts.state3 || state); // khối lớn: hoán vị lấy từ trạng thái 3×3 tương ứng
      const k3 = (N - 1) / 2;
      const mid = (slots, i) => [gx + (slots[i][0] + 1) * k3 * (s + gap) + s / 2, gy + (slots[i][2] + 1) * k3 * (s + gap) + s / 2];
      const uid = 'ah' + Math.random().toString(36).slice(2, 7);
      out += `<defs><marker id="${uid}" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#fff"/></marker></defs>`;
      const draw = (perm, slots, col) => {
        const done = new Set();
        perm.forEach((cur, home) => {
          if (cur === home || done.has(home)) return;
          const A = mid(slots, cur), B = mid(slots, home);
          const two = perm[home] === cur; if (two) done.add(cur);
          const dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy), k = 5 / L;
          const x1 = A[0] + dx * k, y1 = A[1] + dy * k, x2 = B[0] - dx * k, y2 = B[1] - dy * k;
          const ms = `marker-end="url(#${uid})"${two ? ` marker-start="url(#${uid})"` : ''}`;
          out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#0b0e14" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
          out += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="2.2" stroke-linecap="round" ${ms}/>`;
        });
      };
      draw(c, C.CORNER_SLOTS, '#fff'); draw(e, C.EDGE_SLOTS, '#fff');
    }
    return out + '</svg>';
  }

  /* ---------- Trình phát có hoạt hình ---------- */
  class Player {
    constructor(canvas, opts) {
      this.canvas = canvas; this.size = opts.size || 340;
      this.defYaw = opts.yaw ?? -35; this.defPitch = opts.pitch ?? 30;
      this.mat = matFromYP(this.defYaw * D2R, this.defPitch * D2R); this.zoom = 1; this.inertia = null;
      this.colorFn = opts.colorFn; this.onChange = opts.onChange || (() => {});
      this.E = opts.engine || C; this.N = opts.N;
      this.speed = 1; this.playing = false; this.anim = null;
      this.ctx = setupCanvas(canvas, this.size, this.size);
      this.bindDrag();
    }
    load(startState, alg) {
      this.moves = this.E.parseAlg(alg);
      this.states = [startState];
      for (const mv of this.moves) { const n = this.E.clone(this.states[this.states.length - 1]); this.E.applyMove(n, mv); this.states.push(n); }
      this.index = 0; this.anim = null; this.playing = false; this.draw(); this.onChange();
    }
    get total() { return this.moves.length; }
    draw() {
      const ctx = this.ctx, S = this.size;
      ctx.clearRect(0, 0, S, S);
      let state = this.states[this.index], anim = null;
      if (this.anim) {
        const mv = this.moves[this.anim.i];
        state = this.states[this.anim.i];
        const e = this.anim.t, ease = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
        const full = -mv.q * (Math.PI / 2); // chiều kim đồng hồ = góc âm quanh trục
        anim = { k: mv.k, lay: mv.lay, angle: full * (this.anim.dir > 0 ? ease : 1 - ease) };
      }
      drawCube(ctx, state, { cx: S / 2, cy: S / 2, scale: S * 0.172 * this.zoom, persp: 9, mat: this.mat, colorFn: this.colorFn, anim, N: this.N });
    }
    // chuyển động i (tiến dir=1: từ trạng thái i; lùi dir=-1: từ trạng thái i+1 về i)
    _start(i, dir) {
      this.anim = { i, dir, t: 0, t0: performance.now(), dur: (this.moves[i].q === 2 || this.moves[i].q === -2 ? 620 : 420) / this.speed };
      const tick = now => {
        if (!this.anim) return;
        this.anim.t = Math.min(1, (now - this.anim.t0) / this.anim.dur);
        if (this.anim.t >= 1) {
          this.index = dir > 0 ? i + 1 : i; this.anim = null; this.draw(); this.onChange();
          if (this.playing) this._continue(); return;
        }
        this.draw(); requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    _continue() {
      if (this.index >= this.total) { this.playing = false; this.onChange(); return; }
      setTimeout(() => { if (this.playing && !this.anim) this._start(this.index, 1); }, 90 / this.speed);
    }
    play() {
      if (this.anim || !this.total) return;
      if (this.index >= this.total) this.seek(0);
      this.playing = true; this.onChange(); this._start(this.index, 1);
    }
    pause() { this.playing = false; this.onChange(); }
    toggle() { this.playing ? this.pause() : this.play(); }
    next() { this.playing = false; if (!this.anim && this.index < this.total) this._start(this.index, 1); this.onChange(); }
    prev() { this.playing = false; if (!this.anim && this.index > 0) this._start(this.index - 1, -1); this.onChange(); }
    seek(i) { this.playing = false; this.anim = null; this.index = Math.max(0, Math.min(this.total, i)); this.draw(); this.onChange(); }
    setView(yawDeg, pitchDeg) {
      this.stopInertia(); this.mat = matFromYP(yawDeg * D2R, pitchDeg * D2R); this.draw();
    }
    resetView() { this.zoom = 1; this.setView(this.defYaw, this.defPitch); }
    stopInertia() { if (this.inertia) { cancelAnimationFrame(this.inertia); this.inertia = null; } }
    // xoay "trackball": khối bám theo con trỏ, quay quanh trục màn hình, không bị khoá ở đỉnh/đáy
    spin(dx, dy) {
      const k = 1 / (this.size * 0.172 * this.zoom * 1.7); // rad / px
      this.mat = orthonormal(matMul(matMul(rotX(dy * k), rotY(dx * k)), this.mat));
    }
    bindDrag() {
      let drag = null;
      const c = this.canvas;
      c.style.touchAction = 'none'; c.style.cursor = 'grab';
      c.title = 'Kéo để xoay · cuộn để phóng to/thu nhỏ · nháy đúp để về góc nhìn mặc định';
      c.addEventListener('pointerdown', e => {
        this.stopInertia();
        drag = { x: e.clientX, y: e.clientY, t: performance.now(), vx: 0, vy: 0 };
        c.setPointerCapture(e.pointerId); c.style.cursor = 'grabbing';
      });
      c.addEventListener('pointermove', e => {
        if (!drag) return;
        const now = performance.now(), dt = Math.max(1, now - drag.t);
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        this.spin(dx, dy);
        drag.vx = 0.8 * drag.vx + 0.2 * (dx / dt * 16); drag.vy = 0.8 * drag.vy + 0.2 * (dy / dt * 16);
        drag.x = e.clientX; drag.y = e.clientY; drag.t = now; this.draw();
      });
      const end = () => {
        if (!drag) return;
        let { vx, vy } = drag; const idle = performance.now() - drag.t; drag = null; c.style.cursor = 'grab';
        if (idle > 80 || Math.hypot(vx, vy) < 0.6) return; // dừng tay trước khi thả → không trượt
        const tick = () => {
          vx *= 0.94; vy *= 0.94;
          if (Math.hypot(vx, vy) < 0.05) { this.inertia = null; return; }
          this.spin(vx, vy); this.draw(); this.inertia = requestAnimationFrame(tick);
        };
        this.inertia = requestAnimationFrame(tick);
      };
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
      c.addEventListener('dblclick', () => this.resetView());
      c.addEventListener('wheel', e => {
        e.preventDefault();
        this.zoom = Math.max(0.65, Math.min(1.3,this.zoom * (e.deltaY < 0 ? 1.08 : 1 / 1.08))); this.draw();
      }, { passive: false });
    }
  }

  root.Render = { MUTED, drawCube, renderF2LThumb, renderCubeThumb, topViewSVG, Player, grayLL, f2lColor, f2lColorFor, wvColor, SLOT_YAW, setupCanvas };
})(window);
