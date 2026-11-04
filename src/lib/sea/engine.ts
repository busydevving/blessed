/* eslint-disable */
// @ts-nocheck: ported 1:1 from the standalone preview; untyped params are intentional.
// The congregation: praying hands, coins, votive candles and halos circling the launch card, drawn as
// glyph cells. Ported from the standalone preview; loosely typed on purpose (see the class index signature).

/* ═══════════════════════════ the congregation (glyph-cell sea) ═══════════════════════════
 * Every offering (praying hands, coins, votive candles, halos) is painted as ordinary vector shapes into a
 * small offscreen canvas, SS×SS px per character cell. Each frame that canvas is read back and the visible
 * canvas redraws it as tinted square cells with a mono glyph on top: coverage ≥ 0.42 is a solid cell,
 * ≥ 0.16 a mid glyph, ≥ 0.04 an edge glyph. Deep offerings go to a back canvas that CSS blurs.
 * World units: y runs 0..1 (canvas height), x runs 0..A (A = width / height).
 */
const SS = 3, TAU = Math.PI * 2;
const ORBIT_DIR = -1;   // counter-clockwise on screen
const ORBIT_W = 0.07;   // rad/s
const CELL = 12;
const FULL = [':', ';', '+', '=', 'x', 'X', '%', '#', '8', '@'];
const MID = [':', ';', '+', '*', '.'];
const EDGE = ["'", ',', '.', '`', '·'];
const PUFF = ['·', '.', '+', '*'];
const ASH = ['·', "'", '.', '·', ','];
const ACCENTS = ['#FFB547', '#8B7CFF', '#FF5C7A', '#5BE3A6'];
const clamp = (v: number, a: number, b: number) => v < a ? a : v > b ? b : v;
const hash = (x: number, y: number, z: number) => { let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(z, 2147483647); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function mulberry32(a: number){ return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* 🙏 geometry from Twemoji (CC-BY 4.0), in its 36-unit box, recoloured. Left and right hands separate so they can part. */
let GEO: any = null;
/** Built on first paint: Path2D only exists in the browser. */
function geo(){
  if (GEO) return GEO;
  const HAND_L = { sleeve: new Path2D('M6 22c3 0 6.688 7.094 7 10 .421 3.915-2 4-2 4H0V26s3.438-4 6-4z'), cuff: [8.426, 28.489, 1.638, 5.848, -30],
  back: new Path2D('M16.061.011c-1.266-.127-2.333.864-2.333 2.103 0 .78-.184 10.319-.184 10.319L17.895 18l.062-15.765c0-1.106-.795-2.114-1.896-2.224z'),
  palm: new Path2D('M17.125 4.323c0-1.099-.852-1.989-1.903-1.989-1.051 0-1.903.891-1.903 1.989 0 0-.535 5.942-1.192 9.37-.878 1.866-1.369 4.682-1.261 6.248-.054.398-5.625 5.006-5.625 5.006C5.522 26.76 7.5 31.102 10 33.106l3.521-2.924c2.885-.404 4.458-3.331 4.458-4.264 0-2.984-.854-21.595-.854-21.595z'), pivot: [8, 32] };
  const HAND_R = { sleeve: new Path2D('M30 22c-3 0-6.688 7.094-7 10-.421 3.915 2 4 2 4h11V26s-3.438-4-6-4z'), cuff: [27.574, 28.489, 5.848, 1.638, -60],
  back: new Path2D('M20.086 0c1.181 0 2.138.957 2.138 2.138 0 .789.668 10.824.668 10.824L17.948 18V2.138C17.948.957 18.905 0 20.086 0z'),
  palm: new Path2D('M18.875 4.323c0-1.099.852-1.989 1.903-1.989 1.051 0 1.903.891 1.903 1.989 0 0 .535 5.942 1.192 9.37.878 1.866 1.369 4.682 1.261 6.248.054.398 5.625 5.006 5.625 5.006-.281 1.813-2.259 6.155-4.759 8.159l-3.521-2.924c-2.885-.404-4.458-3.331-4.458-4.264 0-2.984.854-21.595.854-21.595z'), pivot: [28, 32] };
  const SEAM = new Path2D('M17.958 25.823c-.414 0-.75-.336-.75-.75V2.792c0-.414.336-.75.75-.75s.75.336.75.75v22.282c.001.413-.335.749-.75.749z');
  GEO = { HAND_L, HAND_R, SEAM };
  return GEO;
}

/* Palettes per kind: the glyph cells take their colour from what's painted underneath. */
const PAL: any = {
  hands: { sleeve: '#5A4BD1', cuff: '#2E2580', back: '#C79A52', palm: '#F0D49A', seam: '#B88A45' },
  coin:  { face: '#FFB547', rim: '#A8661A', shine: '#FFE2A8', mark: '#7A4710' },
  candle:{ wax: '#E9E2D2', wax2: '#BDB4A2', wick: '#2a2220', flame: '#FF8A3D', core: '#FFE08A', glow: '#FFB547' },
  halo:  { ring: '#FFD48A', ring2: '#C98A2E' },
};

/* Who sits in the ring. Order = order round the ring (big and small alternate). Depth ≥ 0.6 goes to the
 * blurred back layer and the outer lanes. L is the offering's height in world units. */
const CAST: any[] = [
  { kind: 'hands',  L: 0.20, depth: 0.10, lane: 0.30 },
  { kind: 'coin',   L: 0.07, depth: 0.20, lane: 0.10 },
  { kind: 'candle', L: 0.10, depth: 0.30, lane: 0.45 },
  { kind: 'halo',   L: 0.09, depth: 0.15, lane: 0.20 },
  { kind: 'hands',  L: 0.30, depth: 0.78, lane: 1.00 },
  { kind: 'coin',   L: 0.06, depth: 0.35, lane: 0.50 },
  { kind: 'coin',   L: 0.05, depth: 0.12, lane: 0.05 },
  { kind: 'candle', L: 0.12, depth: 0.18, lane: 0.25 },
  { kind: 'hands',  L: 0.15, depth: 0.25, lane: 0.40 },
  { kind: 'halo',   L: 0.12, depth: 0.66, lane: 0.85 },
  { kind: 'coin',   L: 0.08, depth: 0.22, lane: 0.30 },
  { kind: 'candle', L: 0.09, depth: 0.70, lane: 0.90 },
  { kind: 'hands',  L: 0.13, depth: 0.14, lane: 0.15 },
];
/* Half-width each kind occupies, in multiples of L (for slot spacing and the keep-out). */
const WIDTH: Record<string, number> = { hands: 0.55, coin: 0.5, candle: 0.32, halo: 0.55 };

export class Congregation {
  [key: string]: any;
  constructor(front: HTMLCanvasElement, back: HTMLCanvasElement){
    this.front = front; this.fctx = front.getContext('2d');
    this.back = back; this.bctx = back.getContext('2d');
    this.acc = document.createElement('canvas'); this.actx = this.acc.getContext('2d', { willReadFrequently: true });
    this.scratch = document.createElement('canvas'); this.sctx = this.scratch.getContext('2d');
    this.rng = mulberry32(777);
    this.A = 1.6; this.time = 0; this.orbit = 0; this.laneScale = 1; this.kick = 0; this.attnUntil = -1;
    this.focus = { x: 0.5, y: 0.52 }; this.box = { w: 0.22, h: 0.17 };
    this.pointer = null; this.ripples = []; this.ash = []; this.paused = false; this.cast = false; this.colorCache = new Map();
    this.slow = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.items = CAST.map((c) => ({ ...c, R: WIDTH[c.kind] * c.L * 1.1 + c.L * 0.08, seed: this.rng() * 100, x: 0, y: 0, dx: 0, dy: 0, vx: 0, vy: 0, slot: 0, boost: 1, spin: this.rng() * TAU }));
  }
  get attentive(){ return this.time < this.attnUntil; }
  get roomy(){ return this.A > 0.8; }
  get fc(){ return { x: this.focus.x * this.A, y: this.focus.y }; }

  laneRadii(lane, seed){
    const half = this.A / 2, bw = this.box.w * this.A, bh = this.box.h;
    const rxIn = this.roomy ? bw * 1.2 + 0.1 : clamp(half - 0.08, 0.12, 0.42);
    const ryIn = this.roomy ? bh * 1.2 + 0.1 : 0.32;
    const rxOut = Math.max(rxIn + 0.1, half + 0.05), ryOut = Math.max(ryIn + 0.12, 0.45);
    const k = this.laneScale * (1 + 0.035 * Math.sin(this.time * 0.23 + seed));
    return [(rxIn + (rxOut - rxIn) * lane) * k, (ryIn + (ryOut - ryIn) * lane) * k];
  }
  /* Rounded-rect distance from the centre block grown by r: < 1 means inside. */
  boxQ(x, y, r){
    const { x: cx, y: cy } = this.fc;
    const kx = this.box.w * this.A + r + 0.03, ky = this.box.h + r + 0.03;
    return Math.pow(((x - cx) / kx) ** 4 + ((y - cy) / ky) ** 4, 0.25);
  }
  /* Slots round the ring in proportion to each offering's width, so big ones never sit nose to tail. */
  assignSlots(){
    const total = this.items.reduce((s, it) => s + it.R * 2 + 0.03, 0);
    let acc = 0;
    for (const it of this.items){ const D = it.R * 2 + 0.03; it.slot = (-ORBIT_DIR * TAU * (acc + D / 2)) / total; acc += D; }
    for (const it of this.items){ const p = this.target(it); it.x = p[0]; it.y = p[1]; }
  }
  target(it){
    const { x: cx, y: cy } = this.fc;
    const [rx, ry] = this.laneRadii(it.lane, it.seed);
    const a = it.slot + this.orbit;
    let x = cx + Math.cos(a) * rx, y = cy + Math.sin(a) * ry + Math.sin(this.time * 0.8 + it.seed) * 0.008;
    // Hard keep-out: never sit on the centre block. Push outward along the ray from the centre until clear.
    if (this.roomy){
      for (let i = 0; i < 12 && this.boxQ(x, y, it.R) < 1; i++){ x = cx + (x - cx) * 1.06; y = cy + (y - cy) * 1.06; }
    }
    return [x, y];
  }
  resize(w, h, dpr){
    if (w < 2 || h < 2) return;
    this.devW = Math.round(w * dpr); this.devH = Math.round(h * dpr);
    for (const c of [this.front, this.back]){ c.width = this.devW; c.height = this.devH; }
    this.rows = clamp(Math.round(h / CELL), 24, 120); this.cols = Math.max(1, Math.round((w / h) * this.rows));
    this.A = w / h; this.K = this.rows * SS; this.W = this.cols * SS;
    this.acc.width = this.scratch.width = this.W; this.acc.height = this.scratch.height = this.K;
    this.ex = new Float32Array(this.cols + 1); this.ey = new Float32Array(this.rows + 1);
    for (let i = 0; i <= this.cols; i++) this.ex[i] = Math.round(i * this.devW / this.cols);
    for (let i = 0; i <= this.rows; i++) this.ey[i] = Math.round(i * this.devH / this.rows);
    if (!this.cast){
      this.cast = true; this.assignSlots();
      for (let i = 0; i < Math.round(26 * this.A); i++) this.ash.push({ x: this.rng() * this.A, y: this.rng(), vy: 0.006 + this.rng() * 0.01, seed: this.rng() * 100 });
    }
    for (const f of this.ash) if (f.x > this.A) f.x = this.rng() * this.A;
    this.frame();
  }
  start(){
    if (this.raf) return;
    const loop = (now) => { const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 1 / 60; this.last = now;
      if (!this.paused && this.cast) this.step(dt * (this.slow ? 0.5 : 1)); if (!this.paused || this.dirty) this.frame(); this.raf = requestAnimationFrame(loop); };
    this.raf = requestAnimationFrame(loop);
  }
  setPaused(p){ this.paused = p; this.dirty = true; }
  setFocus(fx, fy, hw, hh){ this.focus = { x: fx, y: fy }; this.box = { w: hw, h: hh }; }
  setPointer(fx, fy){ const x = fx * this.A, y = fy; const lp = this.lastRip; this.pointer = { x, y };
    if (!lp || Math.hypot(x - lp.x, y - lp.y) > 0.1){ this.lastRip = { x, y }; if (lp && !this.paused) this.ripple(x, y, 0.3, 1, 0.15); } }
  clearPointer(){ this.pointer = null; this.lastRip = null; }
  /* Someone is naming a meme: the ring draws in and quickens. */
  nudge(){ this.attnUntil = this.time + 2.4; }
  /* A launch: a ring of light breaks from the card and the congregation flares outward, then settles. */
  bless(){ const { x, y } = this.fc; this.ripple(x, y, 1.3, 2.6, 0.38); this.ripple(x, y, 0.8, 2.6, 0.24); this.attnUntil = -1; this.kick = 1;
    for (const it of this.items){ it.boost = 2 - it.depth; it.part = 1; } }
  ripple(x, y, s, life, speed){ this.ripples.push({ x, y, born: this.time, life, speed, s }); if (this.ripples.length > 14) this.ripples.shift(); }

  step(dt){
    this.time += dt; const t = this.time, att = this.attentive;
    this.orbit += ORBIT_DIR * ORBIT_W * dt * (att ? 1.35 : 1);
    this.kick *= Math.exp(-dt / 1.3);
    this.laneScale += ((att ? 0.88 : 1) + this.kick * 0.9 - this.laneScale) * Math.min(1, dt * 1.4);
    for (const it of this.items){
      const [tx, ty] = this.target(it);
      // A hand in the water: shallow offerings drift out of the pointer's way and spring back.
      let px = 0, py = 0;
      if (this.pointer && it.depth < 0.6){
        const dx = it.x - this.pointer.x, dy = it.y - this.pointer.y, d = Math.hypot(dx, dy), reach = 0.13 + it.R * 0.7;
        if (d < reach && d > 1e-4){ const w = (1 - d / reach) ** 2; px = dx / d * w * 0.12; py = dy / d * w * 0.12; }
      }
      it.dx += (px - it.dx) * Math.min(1, dt * 4); it.dy += (py - it.dy) * Math.min(1, dt * 4);
      const k = Math.min(1, dt * 2.6 * it.boost);
      const nx = it.x + (tx + it.dx - it.x) * k, ny = it.y + (ty + it.dy - it.y) * k;
      it.vx = (nx - it.x) / Math.max(dt, 1e-4); it.vy = (ny - it.y) / Math.max(dt, 1e-4);
      it.x = nx; it.y = ny;
      it.boost = 1 + (it.boost - 1) * Math.exp(-dt * 0.8);
      it.part = (it.part || 0) * Math.exp(-dt * 0.9);
      it.spin += dt * (1.1 + it.seed % 1) * (it.boost > 1.2 ? 2 : 1);
    }
    this.separate();
    this.ripples = this.ripples.filter((r) => t - r.born < r.life);
    for (const f of this.ash){ f.y -= f.vy * dt; f.x += Math.sin(t * 0.3 + f.seed) * 0.004 * dt; if (f.y < -0.02){ f.y = 1.02; f.x = this.rng() * this.A; } }
  }
  /* The hard floor: no two offerings on the same layer overlap. Bigger ones give way less. */
  separate(){
    const its = this.items;
    for (let i = 0; i < its.length; i++) for (let j = i + 1; j < its.length; j++){
      const a = its[i], b = its[j];
      if ((a.depth >= 0.6) !== (b.depth >= 0.6)) continue;
      const min = a.R + b.R + 0.012, dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy);
      if (d >= min) continue;
      const ux = d > 1e-6 ? dx / d : 1, uy = d > 1e-6 ? dy / d : 0, over = (min - d) * 0.5, wa = b.R / (a.R + b.R);
      a.x -= ux * over * wa; a.y -= uy * over * wa; b.x += ux * over * (1 - wa); b.y += uy * over * (1 - wa);
    }
  }

  paint(ctx, it){
    const K = this.K, t = this.time, s = (it.L * K);
    const lean = clamp(it.vx * 0.9, -0.22, 0.22) + Math.sin(t * 0.6 + it.seed) * 0.05;
    ctx.save(); ctx.translate(it.x * K, it.y * K); ctx.rotate(lean);
    if (it.kind === 'hands'){
      const { HAND_L, HAND_R, SEAM } = geo();
      // Hands fold, then now and then part a little and fold again (and part wide after a launch).
      const breathe = Math.pow(Math.max(0, Math.sin(t * 0.42 + it.seed)), 8);
      const p = Math.max(breathe * 0.7, (it.part || 0) * 1.6);
      const u = s / 36; ctx.scale(u, u); ctx.translate(-18, -18);
      for (const [H, sgn] of [[HAND_L, -1], [HAND_R, 1]]){
        ctx.save(); ctx.translate(H.pivot[0], H.pivot[1]); ctx.rotate(sgn * p * 0.28); ctx.translate(-H.pivot[0] + sgn * p * 2.2, -H.pivot[1]);
        ctx.fillStyle = PAL.hands.sleeve; ctx.fill(H.sleeve);
        ctx.fillStyle = PAL.hands.cuff; ctx.beginPath(); ctx.ellipse(H.cuff[0], H.cuff[1], H.cuff[2], H.cuff[3], H.cuff[4] * Math.PI / 180, 0, TAU); ctx.fill();
        ctx.fillStyle = PAL.hands.back; ctx.fill(H.back);
        ctx.fillStyle = PAL.hands.palm; ctx.fill(H.palm);
        if (sgn > 0){ ctx.fillStyle = PAL.hands.seam; ctx.fill(SEAM); }
        ctx.restore();
      }
    } else if (it.kind === 'coin'){
      // A spinning coin: the face narrows as it turns edge-on, rim and shine ride along.
      const r = s / 2, c = Math.cos(it.spin), w = Math.max(0.08, Math.abs(c)) * r;
      ctx.fillStyle = PAL.coin.rim; ctx.beginPath(); ctx.ellipse(0, 0, w + r * 0.06, r, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = PAL.coin.face; ctx.beginPath(); ctx.ellipse(0, 0, w * 0.86, r * 0.86, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = PAL.coin.mark; ctx.globalAlpha = Math.abs(c);
      ctx.fillRect(-w * 0.12, -r * 0.42, w * 0.24, r * 0.84); ctx.fillRect(-w * 0.42, -r * 0.12, w * 0.84, r * 0.24);
      ctx.globalAlpha = 0.8; ctx.fillStyle = PAL.coin.shine; ctx.beginPath(); ctx.ellipse(-w * 0.35, -r * 0.4, w * 0.18, r * 0.12, -0.6, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1;
    } else if (it.kind === 'candle'){
      // A votive candle: wax body, a wick, and a flame that flickers on its own clock.
      const w = s * 0.32, h = s * 0.62, top = -s * 0.1;
      const fl = 1 + Math.sin(t * 9 + it.seed) * 0.08 + Math.sin(t * 13.7 + it.seed * 2) * 0.06;
      ctx.globalAlpha = 0.18; ctx.fillStyle = PAL.candle.glow; ctx.beginPath(); ctx.arc(0, top - s * 0.14, s * 0.3 * fl, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = PAL.candle.wax; ctx.fillRect(-w / 2, top, w, h);
      ctx.fillStyle = PAL.candle.wax2; ctx.fillRect(w * 0.12, top, w * 0.38, h);
      ctx.beginPath(); ctx.ellipse(0, top, w / 2, w * 0.16, 0, 0, TAU); ctx.fillStyle = '#F6F1E6'; ctx.fill();
      ctx.fillStyle = PAL.candle.wick; ctx.fillRect(-s * 0.01, top - s * 0.06, s * 0.02, s * 0.06);
      const fx = Math.sin(t * 3.1 + it.seed) * s * 0.015, fh = s * 0.26 * fl;
      ctx.fillStyle = PAL.candle.flame; ctx.beginPath(); ctx.moveTo(fx, top - s * 0.05 - fh);
      ctx.bezierCurveTo(s * 0.1, top - s * 0.12, s * 0.07, top - s * 0.02, 0, top - s * 0.02);
      ctx.bezierCurveTo(-s * 0.07, top - s * 0.02, -s * 0.1, top - s * 0.12, fx, top - s * 0.05 - fh); ctx.fill();
      ctx.fillStyle = PAL.candle.core; ctx.beginPath(); ctx.ellipse(0, top - s * 0.08, s * 0.03, s * 0.06 * fl, 0, 0, TAU); ctx.fill();
    } else if (it.kind === 'halo'){
      // A halo: a ring seen at an angle, tilting slowly.
      const rx = s / 2, ry = s * (0.16 + 0.06 * Math.sin(t * 0.7 + it.seed));
      ctx.lineWidth = s * 0.11; ctx.strokeStyle = PAL.halo.ring2; ctx.beginPath(); ctx.ellipse(0, s * 0.02, rx, ry, 0, 0, TAU); ctx.stroke();
      ctx.lineWidth = s * 0.07; ctx.strokeStyle = PAL.halo.ring; ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }

  rgba(r, g, b, a){
    const ab = Math.round(clamp(a, 0, 1) * 20), key = ((r >> 2) << 18) | ((g >> 2) << 12) | ((b >> 2) << 6) | ab;
    let s = this.colorCache.get(key);
    if (!s){ s = `rgba(${(r >> 2) << 2},${(g >> 2) << 2},${(b >> 2) << 2},${ab / 20})`; if (this.colorCache.size > 6000) this.colorCache.clear(); this.colorCache.set(key, s); }
    return s;
  }
  frame(){
    this.dirty = false; if (!this.cast) return;
    this.layer(this.bctx, this.items.filter((i) => i.depth >= 0.6), false);
    this.layer(this.fctx, this.items.filter((i) => i.depth < 0.6), true);
  }
  layer(ctx, items, top){
    const { actx, sctx, K, W, cols, rows, ex, ey } = this, t = this.time;
    ctx.clearRect(0, 0, this.devW, this.devH);
    const cell = this.devH / rows;
    if (top){
      ctx.strokeStyle = 'rgba(214,206,255,0.04)'; ctx.lineWidth = 1; ctx.beginPath();
      for (let i = 1; i < cols; i++){ ctx.moveTo(ex[i] + 0.5, 0); ctx.lineTo(ex[i] + 0.5, this.devH); }
      for (let i = 1; i < rows; i++){ ctx.moveTo(0, ey[i] + 0.5); ctx.lineTo(this.devW, ey[i] + 0.5); }
      ctx.stroke();
    }
    ctx.font = `500 ${Math.max(6, Math.round(cell * 0.62))}px ${this.fontFamily || '"Martian Mono"'}, ui-monospace, monospace`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const gap = Math.max(1, Math.round(cell * 0.07));
    // Embers from the candles: sparse amber flecks rising through open water.
    if (top) for (const f of this.ash){
      const gx = Math.floor(f.x * rows), gy = Math.floor(f.y * rows);
      if (gx < 0 || gy < 0 || gx >= cols || gy >= rows) continue;
      ctx.fillStyle = this.rgba(255, 190, 110, 0.32 * (0.45 + 0.55 * Math.sin(t * 1.7 + f.seed * 3)));
      ctx.fillText(ASH[Math.floor(f.seed) % ASH.length], (ex[gx] + ex[gx + 1]) / 2, (ey[gy] + ey[gy + 1]) / 2);
    }
    if (!items.length && !(top && this.ripples.length)) return;
    actx.clearRect(0, 0, W, K);
    for (const it of [...items].sort((a, b) => b.depth - a.depth)){
      sctx.clearRect(0, 0, W, K); this.paint(sctx, it);
      actx.globalAlpha = 1 - it.depth * 0.3; actx.drawImage(this.scratch, 0, 0);
    }
    actx.globalAlpha = 1;
    const px = actx.getImageData(0, 0, W, K).data, tick = t / 0.22;
    for (let gy = 0; gy < rows; gy++){
      const y = ey[gy], h = ey[gy + 1] - y;
      for (let gx = 0; gx < cols; gx++){
        let sa = 0, sr = 0, sg = 0, sb = 0;
        for (let oy = 0; oy < SS; oy++){ let p = ((gy * SS + oy) * W + gx * SS) * 4;
          for (let ox = 0; ox < SS; ox++, p += 4){ const a = px[p + 3]; if (!a) continue; sa += a; sr += px[p] * a; sg += px[p + 1] * a; sb += px[p + 2] * a; } }
        const cov = sa / (255 * SS * SS), x = ex[gx], w = ex[gx + 1] - x, cx = x + w / 2, cy = y + h / 2;
        if (cov < 0.04){
          if (top && this.ripples.length){
            const wx = (gx + 0.5) / rows, wy = (gy + 0.5) / rows; let rip = 0;
            for (const r of this.ripples){ const age = t - r.born, band = 0.018 + age * 0.012, d = Math.abs(Math.hypot(wx - r.x, wy - r.y) - age * r.speed); if (d < band) rip += (1 - d / band) * (1 - age / r.life) * r.s; }
            if (rip > 0.12){ ctx.fillStyle = this.rgba(255, 200, 120, Math.min(0.8, rip * 0.75)); ctx.fillText(PUFF[Math.min(3, Math.floor(rip * 3))], cx, cy); }
          }
          continue;
        }
        const r = sr / sa, g = sg / sa, b = sb / sa, lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        const jit = hash(gx, gy, Math.floor(tick + hash(gy, gx, 7) * 3));
        if (cov >= 0.42){
          const a = 0.6 + 0.4 * clamp((cov - 0.42) / 0.4, 0, 1);
          ctx.fillStyle = this.rgba(r * 0.82, g * 0.82, b * 0.82, a); ctx.fillRect(x + gap, y + gap, w - gap * 2, h - gap * 2);
          const level = clamp(Math.floor(Math.pow(1 - lum, 0.7) * FULL.length + (jit - 0.5) * 4), 0, FULL.length - 1);
          if (jit > 0.982) ctx.fillStyle = ACCENTS[Math.floor(jit * 1000) % ACCENTS.length];
          else if (lum < 0.55) ctx.fillStyle = this.rgba(r + (255 - r) * 0.7, g + (255 - g) * 0.7, b + (255 - b) * 0.7, a);
          else ctx.fillStyle = this.rgba(r * 0.26, g * 0.24, b * 0.3, a);
          ctx.fillText(FULL[level], cx, cy);
        } else if (cov >= 0.16){
          ctx.fillStyle = this.rgba(r, g, b, cov * 0.5); ctx.fillRect(x + gap, y + gap, w - gap * 2, h - gap * 2);
          ctx.fillStyle = this.rgba(r + (255 - r) * 0.45, g + (255 - g) * 0.45, b + (255 - b) * 0.45, 0.55 + cov);
          ctx.fillText(MID[Math.floor(jit * MID.length)], cx, cy);
        } else {
          ctx.fillStyle = this.rgba(r + (255 - r) * 0.5, g + (255 - g) * 0.5, b + (255 - b) * 0.5, 0.35 + cov * 2.5);
          ctx.fillText(EDGE[Math.floor(jit * EDGE.length)], cx, cy);
        }
      }
    }
  }
}

