/* Bộ bấm giờ kiểu speedcubing: giữ Space / chạm giữ → thả để chạy, bấm bất kỳ để dừng.
   Lưu mọi lượt giải (thời gian, phạt, xáo trộn, ngày giờ) trong localStorage của thiết bị. */
(function (root) {
  'use strict';
  const C = root.Cube, R = root.Render, BC = root.BigCube;
  const KEY = 'rubik-timer-v1', HOLD_MS = 300;
  const PUZ = { '3x3': { N: 3, len: 20 }, '4x4': { N: 4, len: 40 }, '5x5': { N: 5, len: 60 } };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  /* ---------- dữ liệu ---------- */
  const db = (() => { try { const o = JSON.parse(localStorage.getItem(KEY) || '{}'); return { solves: Array.isArray(o.solves) ? o.solves : [], insp: !!o.insp, pz: PUZ[o.pz] ? o.pz : '3x3' }; } catch (e) { return { solves: [], insp: false, pz: '3x3' }; } })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* bỏ qua */ } };

  /* ---------- xáo trộn (WCA notation, random-move) ---------- */
  const AX = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };
  function scramble(pz) {
    const { N, len } = PUZ[pz];
    const bases = ['U', 'D', 'R', 'L', 'F', 'B'];
    if (N === 4) bases.push('Uw', 'Rw', 'Fw');
    if (N >= 5) bases.push('Uw', 'Dw', 'Rw', 'Lw', 'Fw', 'Bw');
    const out = []; let run = []; // các nước liên tiếp cùng trục
    while (out.length < len) {
      const b = bases[Math.floor(Math.random() * bases.length)], ax = AX[b[0]];
      if (run.length && AX[run[0][0]] === ax) { if (run.includes(b)) continue; run.push(b); } else run = [b];
      out.push(b + ['', "'", '2'][Math.floor(Math.random() * 3)]);
    }
    return out.join(' ');
  }
  const stateOf = (pz, scr) => PUZ[pz].N === 3 ? C.applyAlg(C.solved(), scr) : (() => { const B = BC.make(PUZ[pz].N); return B.applyAlg(B.solved(), scr); })();

  /* ---------- thống kê ---------- */
  const val = s => s.p === -1 ? Infinity : s.t + (s.p || 0);
  const fmt = ms => {
    if (ms === Infinity) return 'DNF';
    if (ms == null || isNaN(ms)) return '–';
    const cs = Math.floor(ms / 10), m = Math.floor(cs / 6000), sec = (cs % 6000) / 100;
    return m ? m + ':' + sec.toFixed(2).padStart(5, '0') : sec.toFixed(2);
  };
  const fmtSolve = s => s.p === -1 ? 'DNF' + ' (' + fmt(s.t) + ')' : fmt(val(s)) + (s.p ? '+' : '');
  // trung bình kiểu WCA: bỏ 5% tốt nhất và tệ nhất (ao5, ao12: mỗi đầu 1 lượt)
  function avg(list) {
    const n = list.length; if (!n) return null;
    const trim = n <= 3 ? 0 : Math.ceil(n * 0.05), v = list.map(val).sort((a, b) => a - b).slice(trim, n - trim);
    if (v.some(x => x === Infinity)) return Infinity;
    return v.reduce((a, b) => a + b, 0) / v.length;
  }
  const aoAt = (list, i, n) => i + 1 >= n ? avg(list.slice(i + 1 - n, i + 1)) : null;
  function bestAo(list, n) { let b = null; for (let i = n - 1; i < list.length; i++) { const a = aoAt(list, i, n); if (a != null && (b == null || a < b)) b = a; } return b; }
  const two = n => String(n).padStart(2, '0');
  const fmtDate = d => { const x = new Date(d); return `${two(x.getDate())}/${two(x.getMonth() + 1)}/${x.getFullYear()} ${two(x.getHours())}:${two(x.getMinutes())}:${two(x.getSeconds())}`; };

  /* ---------- widget ---------- */
  let active = null; // chỉ một bộ bấm giờ hoạt động tại một thời điểm
  function mount(el, opts) {
    opts = opts || {};
    if (active) active.destroy();
    const full = !!opts.full;
    let scr = scramble(db.pz), phase = 'idle', t0 = 0, raf = 0, holdTimer = 0, inspT0 = 0, inspPen = 0, keyHeld = false, sel = null;
    const list = () => db.solves.filter(s => (s.z || '3x3') === db.pz);

    el.innerHTML = `<div class="tm ${full ? 'tm-full' : ''}">
      <div class="tm-head">
        <h2 class="tm-title">⏱ Bấm giờ</h2>
        <div class="tm-pz">${Object.keys(PUZ).map(k => `<button data-pz="${k}">${k.replace('x', '×')}</button>`).join('')}</div>
        <label class="tm-opt"><input type="checkbox" id="tminsp"> Quan sát 15s</label>
      </div>
      <div class="tm-scr"><code id="tmscr"></code><span class="tm-scrbtns"><button class="btn sm" id="tmnext" title="Xáo trộn khác">↻ Mới</button></span></div>
      <div class="tm-main">
        <div class="tm-pad" id="tmpad" tabindex="0" aria-label="Vùng bấm giờ">
          <div class="tm-time" id="tmtime">0.00</div>
          <div class="tm-hint" id="tmhint"></div>
          <div class="tm-last" id="tmlast"></div>
        </div>
        <div class="tm-preview" title="Khối sau khi xáo trộn (mặt trước và mặt sau)"><canvas id="tmcv1"></canvas><canvas id="tmcv2"></canvas></div>
      </div>
      <div class="tm-stats" id="tmstats"></div>
      <div class="tm-hist" id="tmhist"></div>
    </div>`;
    const $ = s => el.querySelector(s);
    const pad = $('#tmpad'), timeEl = $('#tmtime'), hint = $('#tmhint');
    $('#tminsp').checked = db.insp;
    $('#tminsp').onchange = e => { db.insp = e.target.checked; save(); setHint(); e.target.blur(); };
    const isTouch = matchMedia('(pointer: coarse)').matches;
    const setHint = () => { hint.textContent = phase !== 'idle' ? '' : (isTouch ? 'Chạm giữ vùng này, thả tay để bắt đầu' : 'Giữ phím Space rồi thả để bắt đầu · bấm phím bất kỳ để dừng') + (db.insp ? ' (có 15 giây quan sát)' : ''); };

    function drawScr() {
      $('#tmscr').textContent = scr;
      el.querySelectorAll('[data-pz]').forEach(b => b.classList.toggle('on', b.dataset.pz === db.pz));
      const st = stateOf(db.pz, scr), N = PUZ[db.pz].N, D = Math.PI / 180;
      [['#tmcv1', -38, 30], ['#tmcv2', 142, -30]].forEach(([id, yaw, pitch]) => {
        const ctx = R.setupCanvas($(id), 120, 110);
        R.drawCube(ctx, st, { cx: 60, cy: 56, scale: 110 * 0.2, persp: 9, yaw: yaw * D, pitch: pitch * D, N });
      });
    }
    function newScr() { scr = scramble(db.pz); drawScr(); }
    $('#tmnext').onclick = () => { if (phase === 'idle') newScr(); };
    el.querySelectorAll('[data-pz]').forEach(b => b.onclick = () => { if (phase !== 'idle') return; db.pz = b.dataset.pz; save(); sel = null; newScr(); drawStats(); });

    /* --- trạng thái bấm giờ --- */
    const setPhase = p => {
      phase = p; pad.dataset.ph = p;
      document.body.classList.toggle('timing', p === 'running' || p === 'inspect' || p === 'ihold' || p === 'iready');
      setHint();
    };
    function tick() {
      if (phase === 'running') timeEl.textContent = fmt(performance.now() - t0);
      else if (phase === 'inspect' || phase === 'ihold' || phase === 'iready') {
        const e = (performance.now() - inspT0) / 1000;
        timeEl.textContent = e < 15 ? String(Math.ceil(15 - e)) : e < 17 ? '+2' : 'DNF';
      } else return;
      raf = requestAnimationFrame(tick);
    }
    function press() { // bắt đầu giữ
      if (phase === 'running') return stop();
      if (phase === 'idle' || phase === 'inspect') {
        const insp = phase === 'inspect';
        if (!insp) timeEl.textContent = db.insp ? '15' : '0.00';
        setPhase(insp ? 'ihold' : 'hold');
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => { if (phase === 'hold') setPhase('ready'); else if (phase === 'ihold') setPhase('iready'); }, db.insp && !insp ? 0 : HOLD_MS);
      }
    }
    function release() { // thả tay
      clearTimeout(holdTimer);
      if (phase === 'ready') {
        if (db.insp) { inspT0 = performance.now(); setPhase('inspect'); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); return; }
        start(0);
      } else if (phase === 'iready') {
        const e = (performance.now() - inspT0) / 1000; start(e >= 17 ? -1 : e >= 15 ? 2000 : 0);
      } else if (phase === 'hold') { setPhase('idle'); }
      else if (phase === 'ihold') setPhase('inspect');
    }
    function start(pen) { inspPen = pen; t0 = performance.now(); setPhase('running'); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    function stop() {
      const t = Math.round(performance.now() - t0); cancelAnimationFrame(raf);
      const prevBest = Math.min(...list().map(val));
      const s = { t, p: inspPen, s: scr, d: Date.now(), z: db.pz };
      db.solves.push(s); save();
      setPhase('idle'); timeEl.textContent = fmtSolve(s);
      $('#tmlast').innerHTML = val(s) < prevBest && list().length > 1 ? '<span class="tm-pb">🎉 Kỷ lục mới!</span>' : '';
      sel = s; newScr(); drawStats();
    }
    function cancel() { clearTimeout(holdTimer); cancelAnimationFrame(raf); setPhase('idle'); timeEl.textContent = '0.00'; }

    // bàn phím
    const blocked = e => { const m = document.getElementById('modal'); return (m && !m.classList.contains('hidden')) || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName); };
    const onDown = e => {
      if (phase === 'running') { if (/^(Shift|Control|Alt|Meta)$/.test(e.key)) return; e.preventDefault(); keyHeld = true; stop(); return; }
      if (blocked(e)) return;
      if (e.key === 'Escape' && phase !== 'idle') { cancel(); return; }
      if (e.key !== ' ') return;
      e.preventDefault(); if (e.repeat || keyHeld) return;
      keyHeld = true; press();
    };
    const onUp = e => { if (!keyHeld) return; keyHeld = false; if (e.key === ' ') e.preventDefault(); release(); };
    // chạm / chuột: giữ trên vùng bấm giờ; khi đang chạy, chạm bất kỳ đâu để dừng
    const onPadDown = e => { if (e.button > 0) return; e.preventDefault(); if (phase === 'running') return stop(); try { pad.setPointerCapture(e.pointerId); } catch (x) { /* bỏ qua */ } press(); };
    const onPadUp = e => { e.preventDefault(); release(); };
    const onDocDown = e => { if (phase === 'running' && !pad.contains(e.target)) { e.preventDefault(); stop(); } };
    document.addEventListener('keydown', onDown); document.addEventListener('keyup', onUp);
    pad.addEventListener('pointerdown', onPadDown); pad.addEventListener('pointerup', onPadUp); pad.addEventListener('pointercancel', onPadUp);
    document.addEventListener('pointerdown', onDocDown, true);
    pad.addEventListener('contextmenu', e => e.preventDefault());

    /* --- thống kê + lịch sử --- */
    function drawStats() {
      const L = list(), n = L.length, last = L[n - 1];
      const row = (name, cur, best) => `<tr><th>${name}</th><td>${fmt(cur)}</td><td>${fmt(best)}</td></tr>`;
      const valid = L.filter(s => s.p !== -1);
      $('#tmstats').innerHTML = `<table><thead><tr><th></th><th>Hiện tại</th><th>Tốt nhất</th></tr></thead><tbody>
        ${row('Đơn', last ? val(last) : null, n ? Math.min(...L.map(val)) : null)}
        ${row('ao5', aoAt(L, n - 1, 5), bestAo(L, 5))}
        ${row('ao12', aoAt(L, n - 1, 12), bestAo(L, 12))}
        ${full ? row('ao50', aoAt(L, n - 1, 50), bestAo(L, 50)) + row('ao100', aoAt(L, n - 1, 100), bestAo(L, 100)) : ''}
        </tbody></table>
        <div class="tm-sum"><span>Số lượt: <b>${n}</b>${n - valid.length ? ` (${n - valid.length} DNF)` : ''}</span><span>Trung bình: <b>${fmt(valid.length ? valid.reduce((a, s) => a + val(s), 0) / valid.length : null)}</b></span></div>`;
      drawHist();
    }
    function drawHist() {
      const L = list(), show = full ? L.length : Math.min(L.length, 5);
      if (!L.length) { $('#tmhist').innerHTML = '<p class="tm-empty">Chưa có lượt giải nào cho khối ' + db.pz.replace('x', '×') + '. Kết quả sẽ được lưu kèm ngày giờ trên thiết bị này.</p>'; return; }
      const rows = [];
      for (let i = L.length - 1; i >= L.length - show; i--) {
        const s = L[i], a5 = aoAt(L, i, 5), on = s === sel;
        rows.push(`<tr class="${on ? 'on' : ''}" data-i="${db.solves.indexOf(s)}"><td class="n">${i + 1}</td><td class="v ${s.p === -1 ? 'dnf' : ''}">${fmtSolve(s)}</td><td>${fmt(a5)}</td><td class="d">${fmtDate(s.d)}</td></tr>` +
          (on ? `<tr class="tm-det"><td colspan="4"><div><code>${esc(s.s)}</code></div><div class="tm-acts">
            <button class="btn sm ${!s.p ? 'on' : ''}" data-pen="0">OK</button><button class="btn sm ${s.p === 2000 ? 'on' : ''}" data-pen="2000">+2</button><button class="btn sm ${s.p === -1 ? 'on' : ''}" data-pen="-1">DNF</button>
            <button class="btn sm" data-del>🗑 Xoá</button></div></td></tr>` : ''));
      }
      $('#tmhist').innerHTML = `<div class="tm-hhead"><b>Lịch sử ${db.pz.replace('x', '×')}</b>${full ? `<span><button class="btn sm" id="tmcsv">⬇ Xuất CSV</button> <button class="btn sm" id="tmclear">Xoá hết</button></span>` : L.length > show ? `<a href="#/timer">Xem tất cả ${L.length} lượt →</a>` : ''}</div>
        <table class="tm-tbl"><thead><tr><th>#</th><th>Thời gian</th><th>ao5</th><th>Ngày giờ</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
      $('#tmhist').onclick = e => {
        const pen = e.target.closest('[data-pen]'), del = e.target.closest('[data-del]'), tr = e.target.closest('tr[data-i]');
        if (pen && sel) { sel.p = +pen.dataset.pen; save(); if (sel === list()[list().length - 1]) timeEl.textContent = fmtSolve(sel); drawStats(); return; }
        if (del && sel) { if (confirm('Xoá lượt ' + fmtSolve(sel) + ' (' + fmtDate(sel.d) + ')?')) { db.solves.splice(db.solves.indexOf(sel), 1); save(); sel = null; drawStats(); } return; }
        if (e.target.id === 'tmclear') { if (confirm('Xoá toàn bộ ' + list().length + ' lượt giải ' + db.pz + '? Không thể hoàn tác.')) { db.solves = db.solves.filter(s => (s.z || '3x3') !== db.pz); save(); sel = null; drawStats(); } return; }
        if (e.target.id === 'tmcsv') return exportCSV();
        if (tr) { const s = db.solves[+tr.dataset.i]; sel = sel === s ? null : s; drawHist(); }
      };
    }
    function exportCSV() {
      const L = list(), lines = ['STT,Thời gian (giây),Phạt,Kết quả,Ngày giờ,Xáo trộn'];
      L.forEach((s, i) => lines.push([i + 1, (s.t / 1000).toFixed(2), s.p === -1 ? 'DNF' : s.p ? '+2' : '', fmtSolve(s), fmtDate(s.d), '"' + s.s + '"'].join(',')));
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' }));
      a.download = 'rubik-thanh-tich-' + db.pz + '.csv'; document.body.appendChild(a); a.click(); a.remove();
    }

    setPhase('idle'); drawScr(); drawStats();
    const L0 = list(); if (L0.length) timeEl.textContent = fmtSolve(L0[L0.length - 1]);
    const api = {
      destroy() {
        cancel(); document.body.classList.remove('timing');
        document.removeEventListener('keydown', onDown); document.removeEventListener('keyup', onUp);
        document.removeEventListener('pointerdown', onDocDown, true);
        if (active === api) active = null;
      }
    };
    active = api;
    return api;
  }

  root.Timer = { mount, scramble, avg, fmt, _db: db };
})(window);
