// 3D agent graph for the hero. Nodes light up as the portfolio agent works.
import * as THREE from '../vendor/three.module.min.js';

const canvas = document.getElementById('graph3d');
const labelLayer = document.getElementById('graph-labels');
const host = canvas.parentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const NODES = [
  { key: 'planner', color: 0xc7a6ff },
  { key: 'memory', color: 0x7fd8ff },
  { key: 'retriever', color: 0x8fa2ff },
  { key: 'tools', color: 0xffb36b },
  { key: 'llm', color: 0xf5b841 },
  { key: 'critic', color: 0x9ff0c4 },
];

function fallback() {
  host.insertAdjacentHTML('beforeend', `
    <svg viewBox="0 0 400 360" style="width:100%;height:100%" aria-hidden="true">
      <g stroke="#26305f" stroke-width="1.5">${NODES.map((n, i) => {
        const a = (i / NODES.length) * Math.PI * 2; const x = 200 + 140 * Math.cos(a); const y = 180 + 120 * Math.sin(a);
        return `<line x1="200" y1="180" x2="${x}" y2="${y}"/>`; }).join('')}</g>
      <circle cx="200" cy="180" r="26" fill="#f5b841"/>
      ${NODES.map((n, i) => {
        const a = (i / NODES.length) * Math.PI * 2; const x = 200 + 140 * Math.cos(a); const y = 180 + 120 * Math.sin(a);
        return `<circle cx="${x}" cy="${y}" r="12" fill="#${n.color.toString(16)}"/><text x="${x}" y="${y + 30}" fill="#a3acd0" font-size="13" text-anchor="middle" font-family="monospace">${n.key}</text>`; }).join('')}
    </svg>`);
  canvas.remove();
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
} catch (e) {
  fallback();
}

if (renderer) init();

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,.55)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function init() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.1, 9.4);
  camera.lookAt(0, 0, 0);

  const world = new THREE.Group();
  world.rotation.x = 0.5;
  scene.add(world);
  const glow = glowTexture();

  // Core: the agent itself
  const core = new THREE.Group();
  const coreWire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.05, 1)),
    new THREE.LineBasicMaterial({ color: 0xf5b841, transparent: true, opacity: 0.55 })
  );
  const coreInner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.55, 2),
    new THREE.MeshBasicMaterial({ color: 0xf5b841, transparent: true, opacity: 0.9 })
  );
  const coreHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: 0xf5b841, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  coreHalo.scale.setScalar(3.6);
  core.add(coreHalo, coreWire, coreInner);
  world.add(core);

  // Satellite nodes on a tilted, slightly wavy ring
  const nodes = NODES.map((n, i) => {
    const a = (i / NODES.length) * Math.PI * 2 - Math.PI / 2;
    const pos = new THREE.Vector3(3.0 * Math.cos(a), 0.55 * Math.sin(a * 2), 3.0 * Math.sin(a));
    const g = new THREE.Group();
    g.position.copy(pos);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 16), new THREE.MeshBasicMaterial({ color: n.color }));
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: n.color, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(1.3);
    g.add(halo, ball);
    world.add(g);
    const label = document.createElement('span');
    label.className = 'g-label';
    label.textContent = n.key;
    labelLayer.appendChild(label);
    return { ...n, group: g, ball, halo, label, pulse: 0 };
  });
  const coreLabel = document.createElement('span');
  coreLabel.className = 'g-label core';
  coreLabel.textContent = 'agent';
  labelLayer.appendChild(coreLabel);

  // Edges: spokes to the core plus the workflow ring
  const edges = [];
  nodes.forEach((n, i) => {
    edges.push({ a: core.position, b: n.group.position, color: n.color });
    edges.push({ a: n.group.position, b: nodes[(i + 1) % nodes.length].group.position, color: n.color });
  });
  const linePos = [];
  edges.forEach((e) => linePos.push(e.a.x, e.a.y, e.a.z, e.b.x, e.b.y, e.b.z));
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  world.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: 0x3a4785, transparent: true, opacity: 0.7 })));

  // Particles flowing along edges (idle) plus bursts when a node activates
  const IDLE_PER_EDGE = 2;
  const BURST_MAX = 60;
  const idle = [];
  edges.forEach((e, ei) => {
    for (let k = 0; k < IDLE_PER_EDGE; k++) idle.push({ e, t: Math.random(), speed: 0.08 + Math.random() * 0.06, dir: ei % 2 ? 1 : -1 });
  });
  const bursts = [];
  const capacity = idle.length + BURST_MAX;
  const pPos = new Float32Array(capacity * 3);
  const pCol = new Float32Array(capacity * 3);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
  const points = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.16, map: glow, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  world.add(points);

  // Faint star field for depth
  const starPos = [];
  for (let i = 0; i < 260; i++) {
    const r = 9 + Math.random() * 8, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    starPos.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th) - 4);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x8fa2ff, size: 0.05, transparent: true, opacity: 0.55 })));

  // Agent events -> visual pulses
  let lastNode = null;
  let corePulse = 0;
  const tmpCol = new THREE.Color();
  window.addEventListener('agent:node', ({ detail }) => {
    const target = nodes.find((n) => n.key === detail.node);
    nodes.forEach((n) => n.label.classList.toggle('active', n === target));
    coreLabel.classList.toggle('active', detail.node === 'agent');
    const fromPos = lastNode ? lastNode.group.position : core.position;
    const toPos = target ? target.group.position : core.position;
    const color = target ? target.color : 0xf5b841;
    for (let i = 0; i < 14; i++) {
      if (bursts.length >= BURST_MAX) bursts.shift();
      bursts.push({ a: fromPos, b: toPos, t: -i * 0.06, speed: 1.6, color });
    }
    if (target) target.pulse = 1; else corePulse = 1;
    lastNode = target || null;
    if (reduced) render(0);
  });
  window.addEventListener('agent:done', () => {
    setTimeout(() => {
      nodes.forEach((n) => n.label.classList.remove('active'));
      coreLabel.classList.remove('active');
      lastNode = null;
    }, 2500);
  });

  // Pointer parallax
  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (e) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = w / h < 1.1 ? 9.4 : 8.2;
    camera.updateProjectionMatrix();
    render(0);
  }
  new ResizeObserver(resize).observe(host);

  const v = new THREE.Vector3();
  function placeLabel(el, obj, dy) {
    obj.getWorldPosition(v);
    v.y += dy;
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * host.clientWidth;
    const y = (-v.y * 0.5 + 0.5) * host.clientHeight;
    el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    el.style.zIndex = String(Math.round((1 - v.z) * 1000));
  }

  const clock = new THREE.Clock();
  let spin = 0;
  function render(dt) {
    spin += dt * 0.12;
    world.rotation.y = spin + pointer.x * 0.35;
    world.rotation.x = 0.5 + pointer.y * 0.12;
    core.rotation.y += dt * 0.4;
    core.rotation.z += dt * 0.15;

    corePulse = Math.max(0, corePulse - dt * 1.2);
    const cs = 1 + corePulse * 0.35 + Math.sin(clock.elapsedTime * 2) * 0.03;
    core.scale.setScalar(cs);
    nodes.forEach((n) => {
      n.pulse = Math.max(0, n.pulse - dt * 0.9);
      n.ball.scale.setScalar(1 + n.pulse * 0.5);
      n.halo.scale.setScalar(1.3 + n.pulse * 1.1);
      n.halo.material.opacity = 0.35 + n.pulse * 0.55;
    });

    let i = 0;
    idle.forEach((p) => {
      p.t = (p.t + dt * p.speed * p.dir + 1) % 1;
      v.lerpVectors(p.e.a, p.e.b, p.t);
      pPos.set([v.x, v.y, v.z], i * 3);
      tmpCol.setHex(p.e.color).multiplyScalar(0.55);
      pCol.set([tmpCol.r, tmpCol.g, tmpCol.b], i * 3);
      i++;
    });
    for (let b = bursts.length - 1; b >= 0; b--) {
      bursts[b].t += dt * bursts[b].speed;
      if (bursts[b].t > 1) bursts.splice(b, 1);
    }
    bursts.forEach((p) => {
      const t = Math.max(0, p.t);
      v.lerpVectors(p.a, p.b, t);
      pPos.set([v.x, v.y, v.z], i * 3);
      tmpCol.setHex(p.color);
      const k = p.t < 0 ? 0 : 1.4;
      pCol.set([tmpCol.r * k, tmpCol.g * k, tmpCol.b * k], i * 3);
      i++;
    });
    for (; i < capacity; i++) { pPos.set([0, -999, 0], i * 3); }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
    nodes.forEach((n) => placeLabel(n.label, n.group, -0.42));
    placeLabel(coreLabel, core, -1.45);
  }

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 }).observe(host);

  function loop() {
    const dt = Math.min(clock.getDelta(), 0.05);
    if (visible && !document.hidden) render(dt);
    requestAnimationFrame(loop);
  }
  resize();
  if (reduced) {
    render(0);
    // Still animate pulses briefly so agent activity is visible, without constant motion.
    window.addEventListener('agent:node', () => {
      let n = 0;
      const tick = () => { render(0.03); if (++n < 40) requestAnimationFrame(tick); };
      tick();
    });
  } else {
    loop();
  }
}
