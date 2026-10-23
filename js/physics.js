/* ============================================================
   physics.js — the hero "counter". Product tokens drop in, pile
   up, can be flicked around with the cursor and tapped to add to
   the quote list. Matter.js drives the bodies; the tokens stay
   real <button>s (accessible, crisp text) moved with transforms.
   Without Matter.js or with reduced motion they sit in a row.
   ============================================================ */

export function initPhysics() {
  const hero = document.querySelector("[data-hero]");
  const shelf = hero?.querySelector("[data-shelf]");
  const M = window.Matter;
  if (!shelf || !M || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const { Engine, Bodies, Body, Composite, Constraint, Sleeping } = M;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const narrow = innerWidth < 700;
  const tokens = [...shelf.querySelectorAll(".token")].filter((el, i) => !narrow || i < 9);
  if (!tokens.length) return;

  shelf.classList.add("is-physics");
  if (!fine) shelf.querySelector(".shelf__hint")?.replaceChildren(shelf.querySelector(".shelf__hint").dataset.touch);

  const engine = Engine.create({ gravity: { x: 0, y: 1.15 }, enableSleeping: true });
  const world = engine.world;
  let W = hero.clientWidth;
  let H = hero.clientHeight;
  let walls = [];

  const makeWalls = () => {
    Composite.remove(world, walls);
    const t = 400;
    walls = [
      Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true, friction: 0.6 }),
      Bodies.rectangle(-t / 2, 0, t, H * 6, { isStatic: true }),
      Bodies.rectangle(W + t / 2, 0, t, H * 6, { isStatic: true }),
    ];
    Composite.add(world, walls);
  };
  makeWalls();

  const bodies = tokens.map((el, i) => {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = W * (0.06 + Math.random() * 0.88);
    const y = -h - i * (narrow ? 90 : 55) - Math.random() * 120;
    const b = Bodies.rectangle(x, y, w, h, {
      chamfer: { radius: h / 2 - 1 },
      restitution: 0.32,
      friction: 0.3,
      frictionAir: 0.014,
      density: 0.0018,
      angle: (Math.random() - 0.5) * 0.8,
    });
    b.el = el;
    b.w = w;
    b.h = h;
    el.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px)`;
    return b;
  });
  Composite.add(world, bodies);

  const local = (e) => {
    const r = hero.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  /* Drag & throw (mouse / pen). Touch keeps native scrolling; taps still add. */
  let drag = null;
  bodies.forEach((b) => {
    const el = b.el;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return;
      const pt = local(e);
      Sleeping.set(b, false);
      drag = { b, start: pt, moved: false, c: Constraint.create({ pointA: pt, bodyB: b, pointB: { x: pt.x - b.position.x, y: pt.y - b.position.y }, stiffness: 0.18, damping: 0.08, length: 0 }) };
      Composite.add(world, drag.c);
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-grabbed");
    });
    el.addEventListener("pointermove", (e) => {
      if (!drag || drag.b !== b) return;
      const pt = local(e);
      drag.c.pointA = pt;
      if (Math.hypot(pt.x - drag.start.x, pt.y - drag.start.y) > 6) drag.moved = true;
    });
    const end = () => {
      if (!drag || drag.b !== b) return;
      Composite.remove(world, drag.c);
      el.classList.remove("is-grabbed");
      if (drag.moved) {
        el.dataset.dragged = "1";
        setTimeout(() => delete el.dataset.dragged, 60);
      }
      drag = null;
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    // A tap makes the token hop.
    el.addEventListener("click", () => {
      if (el.dataset.dragged) return;
      Sleeping.set(b, false);
      Body.setVelocity(b, { x: (Math.random() - 0.5) * 6, y: -11 });
      Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.25);
    });
  });

  /* The cursor nudges tokens it passes over. */
  let pointer = null;
  if (fine) {
    hero.addEventListener("pointermove", (e) => { pointer = local(e); });
    hero.addEventListener("pointerleave", () => { pointer = null; });
  }

  let running = false;
  let last = 0;
  const step = (now) => {
    if (!running) return;
    const dt = Math.min(32, now - (last || now));
    last = now;
    if (pointer && !drag) {
      for (const b of bodies) {
        const dx = b.position.x - pointer.x;
        const dy = b.position.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 90 && d > 1) {
          Sleeping.set(b, false);
          Body.applyForce(b, b.position, { x: (dx / d) * 0.0026 * b.mass, y: (dy / d) * 0.0034 * b.mass - 0.001 * b.mass });
        }
      }
    }
    Engine.update(engine, dt || 16.7);
    for (const b of bodies) {
      // Anything flung out of bounds comes back from the top.
      if (b.position.y > H + 200 || b.position.x < -200 || b.position.x > W + 200) {
        Body.setPosition(b, { x: W * (0.2 + Math.random() * 0.6), y: -80 });
        Body.setVelocity(b, { x: 0, y: 0 });
      }
      b.el.style.transform = `translate(${(b.position.x - b.w / 2).toFixed(1)}px, ${(b.position.y - b.h / 2).toFixed(1)}px) rotate(${b.angle.toFixed(3)}rad)`;
    }
    requestAnimationFrame(step);
  };
  const start = () => { if (!running) { running = true; last = 0; requestAnimationFrame(step); } };
  const stop = () => { running = false; };

  new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop())).observe(hero);
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  let rt;
  addEventListener("resize", () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      W = hero.clientWidth;
      H = hero.clientHeight;
      makeWalls();
      bodies.forEach((b) => { Sleeping.set(b, false); if (b.position.x > W - 20) Body.setPosition(b, { x: W - b.w, y: b.position.y - 40 }); });
    }, 150);
  });
}
