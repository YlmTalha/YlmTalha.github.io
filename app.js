const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Sticky header and mobile navigation
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 24);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

// Scroll progress bar
const scrollProgressBar = document.querySelector('.scroll-progress span');
const updateScrollProgress = () => {
  if (!scrollProgressBar) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
};
updateScrollProgress();
window.addEventListener('scroll', updateScrollProgress, { passive: true });
window.addEventListener('resize', updateScrollProgress, { passive: true });

let lastFocusedElement = null;

function closeMenu({ restoreFocus = false } = {}) {
  menuButton?.setAttribute('aria-expanded', 'false');
  navigation?.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (restoreFocus && lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
}

menuButton?.addEventListener('click', () => {
  const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
  if (willOpen) lastFocusedElement = document.activeElement;
  menuButton.setAttribute('aria-expanded', String(willOpen));
  navigation?.classList.toggle('open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
  if (willOpen) {
    requestAnimationFrame(() => navigation?.querySelector('a')?.focus({ preventScroll: true }));
  } else {
    menuButton.focus({ preventScroll: true });
  }
});

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu({ restoreFocus: true });
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 860 && navigation?.classList.contains('open')) closeMenu();
}, { passive: true });

// Open document links explicitly in a new tab.
document.querySelectorAll('a[target="_blank"][href$=".pdf"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.open(link.href, '_blank', 'noopener');
  });
});

// Reveal sections progressively
const revealItems = document.querySelectorAll('.reveal');
if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const siblings = [...(entry.target.parentElement?.children || [])].filter((item) => item.classList?.contains('reveal'));
      const itemIndex = Math.max(0, siblings.indexOf(entry.target));
      entry.target.style.transitionDelay = `${Math.min(itemIndex * 65, 260)}ms`;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
  revealItems.forEach((item) => revealObserver.observe(item));
}

// Active navigation item
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`));
  }, { rootMargin: '-25% 0px -60%', threshold: [0, .2, .5] });
  sections.forEach((section) => sectionObserver.observe(section));
}

// Soft pointer lighting on desktop
const pointerGlow = document.querySelector('.pointer-glow');
if (pointerGlow && !prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
  let targetX = innerWidth / 2;
  let targetY = innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
  }, { passive: true });
  const followPointer = () => {
    currentX += (targetX - currentX) * .09;
    currentY += (targetY - currentY) * .09;
    pointerGlow.style.transform = `translate(${currentX - 225}px, ${currentY - 225}px)`;
    requestAnimationFrame(followPointer);
  };
  followPointer();
}

// Project image lightbox
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('figcaption');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    lightboxImage.src = trigger.querySelector('img')?.currentSrc || trigger.dataset.lightbox || '';
    const caption = trigger.dataset.caption || trigger.querySelector('img')?.alt || 'Proje görseli';
    lightboxImage.alt = caption;
    lightboxCaption.textContent = caption;
    lightbox.showModal();
  });
});

lightboxClose?.addEventListener('click', () => lightbox?.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

// Lightweight signal field behind the hero
const canvas = document.querySelector('#signal-canvas');
if (canvas instanceof HTMLCanvasElement && !prefersReducedMotion) {
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let animationFrame = 0;
  const traces = [
    { color: 'rgba(200,255,74,.42)', amplitude: .055, frequency: 2.2, speed: .00075, offset: .38 },
    { color: 'rgba(88,230,220,.30)', amplitude: .085, frequency: 1.35, speed: -.00048, offset: .55 },
    { color: 'rgba(255,107,53,.24)', amplitude: .042, frequency: 4.1, speed: .00095, offset: .68 }
  ];

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function signalValue(progress, time, trace) {
    const base = Math.sin(progress * Math.PI * 2 * trace.frequency + time * trace.speed);
    const detail = Math.sin(progress * Math.PI * 17.5 - time * trace.speed * 2.4) * .16;
    const pulsePosition = (time * .000025 + trace.frequency * .13) % 1;
    const distance = Math.min(Math.abs(progress - pulsePosition), 1 - Math.abs(progress - pulsePosition));
    const pulse = Math.exp(-Math.pow(distance * 42, 2)) * Math.sin(progress * 160);
    return base + detail + pulse * .9;
  }

  function draw(time = 0) {
    if (!context) return;
    context.clearRect(0, 0, width, height);
    traces.forEach((trace) => {
      context.beginPath();
      context.strokeStyle = trace.color;
      context.lineWidth = 1;
      for (let x = 0; x <= width; x += 4) {
        const progress = x / width;
        const y = height * trace.offset + signalValue(progress, time, trace) * height * trace.amplitude;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    });
    animationFrame = requestAnimationFrame(draw);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });
  animationFrame = requestAnimationFrame(draw);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(animationFrame);
    if (!document.hidden) animationFrame = requestAnimationFrame(draw);
  });
}
