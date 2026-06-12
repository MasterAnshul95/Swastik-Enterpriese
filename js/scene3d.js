/* ============================================================
   scene3d.js — Three.js "metal core".
   A reflective hex bolt + nut + washer floating in space, lit with
   forge-amber + cool steel light, reacting to scroll & cursor.
   Loaded via import map (see each HTML <head>). Fails silently if
   WebGL / three are unavailable so the site still works.
   ============================================================ */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const prefersReduced =
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function makeBolt() {
  const group = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({
    color: 0xc2c6cf,
    metalness: 1.0,
    roughness: 0.26,
    envMapIntensity: 1.35,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x2a2e36,
    metalness: 0.9,
    roughness: 0.5,
  });

  // hex head
  const head = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.62, 6), steel);
  head.position.y = 1.35;
  head.rotation.y = Math.PI / 6;
  group.add(head);

  // bevel ring under head
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 1.02, 0.16, 32), steel);
  collar.position.y = 1.0;
  group.add(collar);

  // shaft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 2.1, 40), steel);
  shaft.position.y = -0.15;
  group.add(shaft);

  // threads (stacked rings)
  const threadGeo = new THREE.TorusGeometry(0.47, 0.055, 10, 40);
  for (let i = 0; i < 16; i++) {
    const ring = new THREE.Mesh(threadGeo, steel);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.95 + i * 0.12;
    ring.rotation.z = i * 0.5; // slight helix feel
    group.add(ring);
  }

  // tip socket
  const socket = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 6), dark);
  socket.position.y = 1.67;
  socket.rotation.y = Math.PI / 6;
  group.add(socket);

  group.scale.setScalar(1);
  return group;
}

function hexNut() {
  // hexagon prism with a round hole
  const shape = new THREE.Shape();
  const R = 0.85;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
  }
  shape.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, 0.42, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.42, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
  geo.center();
  const mat = new THREE.MeshStandardMaterial({ color: 0xb8bcc6, metalness: 1.0, roughness: 0.33, envMapIntensity: 1.2 });
  return new THREE.Mesh(geo, mat);
}

function washer() {
  const geo = new THREE.TorusGeometry(0.7, 0.16, 16, 48);
  geo.scale(1, 1, 0.45);
  const mat = new THREE.MeshStandardMaterial({ color: 0xd0d4dc, metalness: 1.0, roughness: 0.22, envMapIntensity: 1.4 });
  return new THREE.Mesh(geo, mat);
}

export function initScene3d(opts = {}) {
  const canvas = document.getElementById("bg3d");
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch (e) {
    return null; // no WebGL
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  // realistic reflections from a generated room environment
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // lights — forge amber key + cool steel rim
  const key = new THREE.PointLight(0xffa552, 90, 60);
  key.position.set(6, 5, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x6aa9ff, 60, 60);
  rim.position.set(-7, -3, 4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x404552, 0.6));

  // build hardware
  const core = new THREE.Group();
  const bolt = makeBolt();
  core.add(bolt);
  scene.add(core);

  const nut = hexNut();
  nut.position.set(3.1, 1.7, -1.5);
  nut.scale.setScalar(0.85);
  scene.add(nut);

  const wash = washer();
  wash.position.set(-3.2, -1.6, -1.2);
  wash.scale.setScalar(0.9);
  scene.add(wash);

  // layout per page (center hero vs. parked accent)
  const mode = opts.mode || "center";
  if (mode === "center") {
    core.position.set(0, 0, 0);
    core.scale.setScalar(1.15);
  } else {
    core.position.set(3.4, 0.4, -1);
    core.scale.setScalar(0.78);
    nut.position.set(-3.6, 2.2, -2);
    wash.visible = false;
  }

  // pointer parallax
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("mousemove", onMove);

  let scrollProgress = 0;
  const getScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    return h > 0 ? window.scrollY / h : 0;
  };

  const clock = new THREE.Clock();
  let raf;
  function tick() {
    raf = requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    scrollProgress = getScroll();

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    // bolt: gentle idle spin + soft scroll rotation + cursor tilt
    bolt.rotation.y = t * 0.2 + scrollProgress * Math.PI * 1.4 + pointer.x * 0.5;
    bolt.rotation.x = -0.15 + pointer.y * 0.35 + Math.sin(t * 0.4) * 0.05;
    bolt.rotation.z = scrollProgress * Math.PI * 0.25;
    const driftY = Math.sin(t * 0.6) * 0.12;
    if (mode === "center") {
      core.position.x = scrollProgress * 3.2;   // drift right & out of the content column
      core.position.y = driftY - scrollProgress * 1.2;
    } else {
      core.position.y = 0.4 + driftY;
    }

    nut.rotation.x = t * 0.3;
    nut.rotation.z = -t * 0.2 + scrollProgress * 1.2;
    nut.position.y += Math.sin(t * 0.8) * 0.0015;

    wash.rotation.y = t * 0.45 + scrollProgress * 1.6;
    wash.rotation.x = 0.5 + Math.cos(t * 0.5) * 0.2;

    // gentle camera parallax
    camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.04;
    camera.position.y += (-pointer.y * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  if (prefersReduced) {
    renderer.render(scene, camera); // single static frame
  } else {
    tick();
  }

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  };
  window.addEventListener("resize", onResize);

  requestAnimationFrame(() => canvas.classList.add("ready"));

  return {
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    },
  };
}
