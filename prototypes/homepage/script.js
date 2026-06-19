// ════════════════ ICONS ════════════════
if (window.lucide) lucide.createIcons();

// ════════════════ FOOTER YEAR ════════════════
document.getElementById("footerYear").textContent = `© ${new Date().getFullYear()} Grimoire. All spells reserved.`;

// ════════════════ NAVBAR OPACITY ON SCROLL ════════════════
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

// ════════════════ SCROLL FADE-IN ════════════════
const fadeObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

// ════════════════ CHAOS ICON PHYSICS ════════════════
const chaosContainer = document.getElementById("chaosIcons");
if (chaosContainer) {
  const icons = Array.from(chaosContainer.querySelectorAll(".chaos-icon"));
  const bounds = { w: 0, h: 0 };
  const mouse = { x: -9999, y: -9999, active: false };
  const REPEL_RADIUS = 70;
  const REPEL_FORCE = 1.8;

  const state = icons.map((el, i) => {
    const w = 56;
    const h = 70;
    return {
      el,
      x: Math.random() * 0.8 * (bounds.w || 300),
      y: Math.random() * 0.8 * (bounds.h || 220),
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      w,
      h,
      rotPhase: Math.random() * Math.PI * 2,
      scalePhase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.4,
    };
  });

  function measure() {
    bounds.w = chaosContainer.clientWidth;
    bounds.h = chaosContainer.clientHeight;
  }
  measure();
  window.addEventListener("resize", measure);

  chaosContainer.addEventListener("mousemove", (e) => {
    const rect = chaosContainer.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  chaosContainer.addEventListener("mouseleave", () => {
    mouse.active = false;
  });

  let t = 0;
  function tick() {
    t += 0.02;
    for (const s of state) {
      // repel from mouse
      if (mouse.active) {
        const cx = s.x + s.w / 2;
        const cy = s.y + s.h / 2;
        const dx = cx - mouse.x;
        const dy = cy - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < REPEL_RADIUS) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_FORCE;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }
      }

      // drift + damping
      s.vx *= 0.96;
      s.vy *= 0.96;
      s.x += s.vx * s.speed;
      s.y += s.vy * s.speed;

      // bounce off walls
      const maxX = Math.max(bounds.w - s.w, 0);
      const maxY = Math.max(bounds.h - s.h, 0);
      if (s.x < 0) { s.x = 0; s.vx = Math.abs(s.vx); }
      if (s.x > maxX) { s.x = maxX; s.vx = -Math.abs(s.vx); }
      if (s.y < 0) { s.y = 0; s.vy = Math.abs(s.vy); }
      if (s.y > maxY) { s.y = maxY; s.vy = -Math.abs(s.vy); }

      const rot = Math.sin(t + s.rotPhase) * 8;
      const scale = 1 + Math.sin(t * 1.3 + s.scalePhase) * 0.08;
      s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${rot}deg) scale(${scale})`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ════════════════ PRICING TOGGLE ════════════════
const pricingToggle = document.getElementById("pricingToggle");
if (pricingToggle) {
  const labels = document.querySelectorAll(".toggle-label");
  const amounts = document.querySelectorAll(".price-amount[data-monthly]");
  const periods = document.querySelectorAll(".price-period[data-monthly]");

  pricingToggle.addEventListener("click", () => {
    const isYearly = !pricingToggle.classList.contains("on");
    pricingToggle.classList.toggle("on", isYearly);
    labels.forEach((label) => {
      label.classList.toggle("active", (label.dataset.period === "yearly") === isYearly);
    });
    amounts.forEach((el) => {
      el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
    });
    periods.forEach((el) => {
      el.textContent = isYearly ? el.dataset.yearly : el.dataset.monthly;
    });
  });
}
