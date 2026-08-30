/* ============================================================
   FITZONE — script.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen();
  initThemeToggle();
  initAccentColor();
  initMobileNav();
  initActiveNav();
  initScrollReveal();
  initCounters();
  initFAQ();
  initTestimonialSlider();
  initContactForm();
  initChatbot();
  initBackgroundFX();
});

/* ============================================================
   SPLASH SCREEN
   ============================================================ */
function initSplashScreen(){
  const splash = document.getElementById('splashScreen');
  if(!splash) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.style.overflow = 'hidden';

  const minDuration = reduceMotion ? 300 : 1500;
  const start = performance.now();

  function hideSplash(){
    const elapsed = performance.now() - start;
    const wait = Math.max(minDuration - elapsed, 0);
    setTimeout(() => {
      splash.classList.add('splash-hide');
      document.body.style.overflow = '';
      setTimeout(() => splash.remove(), 650);
    }, wait);
  }

  if(document.readyState === 'complete'){
    hideSplash();
  } else {
    window.addEventListener('load', hideSplash);
    // Safety net in case 'load' is delayed by slow external assets
    setTimeout(hideSplash, 4000);
  }
}

/* ============================================================
   THEME TOGGLE (Light default, Dark persists until switched back)
   ============================================================ */
function initThemeToggle(){
  const root = document.documentElement;
  const STORAGE_KEY = 'fitzone-theme';
  const toggles = [
    document.getElementById('themeToggle'),
    document.getElementById('themeToggleMobile')
  ].filter(Boolean);

  function isDark(){
    return root.getAttribute('data-theme') === 'dark';
  }

  function syncToggles(){
    const dark = isDark();
    toggles.forEach(btn => btn.setAttribute('aria-pressed', String(dark)));
  }

  function applyTheme(theme){
    if(theme === 'dark'){
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEY, theme);
    syncToggles();
  }

  function toggleTheme(){
    applyTheme(isDark() ? 'light' : 'dark');
  }

  // Reflect whatever the inline head script already applied on load
  syncToggles();

  toggles.forEach(btn => btn.addEventListener('click', toggleTheme));
}

/* ============================================================
   ACCENT COLOR PICKER (Settings popover)
   ============================================================ */
function initAccentColor(){
  const root = document.documentElement;
  const STORAGE_KEY = 'fitzone-accent';

  const settingsToggle = document.getElementById('settingsToggle');
  const settingsPopover = document.getElementById('settingsPopover');
  const swatches = document.querySelectorAll('.color-swatch');
  if(!settingsToggle || !settingsPopover) return;

  function hexToRgb(hex){
    const clean = hex.replace('#','');
    return {
      r: parseInt(clean.substring(0,2), 16),
      g: parseInt(clean.substring(2,4), 16),
      b: parseInt(clean.substring(4,6), 16)
    };
  }

  function darken(hex, factor){
    const { r, g, b } = hexToRgb(hex);
    const dr = Math.max(0, Math.round(r * factor));
    const dg = Math.max(0, Math.round(g * factor));
    const db = Math.max(0, Math.round(b * factor));
    return '#' + [dr, dg, db].map(c => c.toString(16).padStart(2, '0')).join('');
  }

  function applyAccent(hex, save){
    const { r, g, b } = hexToRgb(hex);
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-dim', darken(hex, 0.78));
    root.style.setProperty('--accent-glow', `rgba(${r},${g},${b},0.4)`);
    root.style.setProperty('--accent-soft', `rgba(${r},${g},${b},0.12)`);

    swatches.forEach(sw => sw.classList.toggle('active', sw.dataset.color.toLowerCase() === hex.toLowerCase()));

    if(save) localStorage.setItem(STORAGE_KEY, hex);

    // Keep the mouse-follow particle background in sync with the new accent
    if(typeof window.__fitzoneSyncAccent === 'function') window.__fitzoneSyncAccent();
  }

  // Reflect whatever the inline head script already applied on load
  const saved = localStorage.getItem(STORAGE_KEY);
  if(saved) applyAccent(saved, false);

  function openPopover(){
    settingsPopover.classList.add('open');
    settingsToggle.classList.add('active');
    settingsToggle.setAttribute('aria-expanded', 'true');
  }
  function closePopover(){
    settingsPopover.classList.remove('open');
    settingsToggle.classList.remove('active');
    settingsToggle.setAttribute('aria-expanded', 'false');
  }

  settingsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPopover.classList.contains('open') ? closePopover() : openPopover();
  });

  document.addEventListener('click', (e) => {
    if(!settingsPopover.contains(e.target) && e.target !== settingsToggle){
      closePopover();
    }
  });

  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape') closePopover();
  });

  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      applyAccent(swatch.dataset.color, true);
    });
  });
}

/* ============================================================
   MOBILE SIDEBAR NAV
   ============================================================ */
function initMobileNav(){
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger');
  const closeBtn = document.getElementById('sidebarClose');
  const overlay = document.getElementById('mobileOverlay');
  const navLinks = document.querySelectorAll('.nav-link');

  function openMenu(){
    sidebar.classList.add('open');
    overlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded','true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeMenu() : openMenu();
  });
  closeBtn?.addEventListener('click', closeMenu);
  overlay?.addEventListener('click', closeMenu);
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  window.addEventListener('resize', () => {
    if(window.innerWidth > 860) closeMenu();
  });
}

/* ============================================================
   ACTIVE NAV ON SCROLL
   ============================================================ */
function initActiveNav(){
  const sections = document.querySelectorAll('main section[id], .hero[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal(){
  const items = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

/* ============================================================
   ANIMATED COUNTERS
   ============================================================ */
function initCounters(){
  const counters = document.querySelectorAll('.num[data-count]');

  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '+';
    const duration = 1600;
    const start = performance.now();

    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString() + (progress === 1 ? suffix : (value > 0 ? suffix : ''));
      if(progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString() + suffix;
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
function initFAQ(){
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-question').setAttribute('aria-expanded','false');
      });

      if(!isOpen){
        item.classList.add('open');
        question.setAttribute('aria-expanded','true');
      }
    });
  });
}

/* ============================================================
   TESTIMONIAL SLIDER
   ============================================================ */
function initTestimonialSlider(){
  const track = document.getElementById('testimonialTrack');
  const dotsWrap = document.getElementById('testimonialDots');
  if(!track) return;

  const slides = track.children;
  let index = 0;
  let timer;

  for(let i = 0; i < slides.length; i++){
    const dot = document.createElement('button');
    if(i === 0) dot.classList.add('active');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  }

  function goTo(i){
    index = i;
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dotsWrap.children].forEach((d, di) => d.classList.toggle('active', di === index));
  }

  function next(){ goTo((index + 1) % slides.length); }

  function startAuto(){ timer = setInterval(next, 5500); }
  function stopAuto(){ clearInterval(timer); }

  startAuto();
  track.parentElement.addEventListener('mouseenter', stopAuto);
  track.parentElement.addEventListener('mouseleave', startAuto);
}

/* ============================================================
   CONTACT FORM VALIDATION
   ============================================================ */
function initContactForm(){
  const form = document.getElementById('contactForm');
  if(!form) return;
  const successMsg = document.getElementById('formSuccess');

  const validators = {
    fullName: (v) => v.trim().length >= 2 ? '' : 'Please enter your full name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address.',
    phone: (v) => /^[\d\s()+-]{7,}$/.test(v) ? '' : 'Please enter a valid phone number.',
    goal: (v) => v ? '' : 'Please select a goal.',
    message: (v) => v.trim().length >= 10 ? '' : 'Please enter at least 10 characters.'
  };

  function setError(field, message){
    const group = document.getElementById(field).closest('.form-group');
    const errorEl = document.getElementById('err-' + field);
    if(message){
      group.classList.add('invalid');
      errorEl.textContent = message;
    } else {
      group.classList.remove('invalid');
      errorEl.textContent = '';
    }
  }

  Object.keys(validators).forEach(field => {
    const el = document.getElementById(field);
    el.addEventListener('blur', () => setError(field, validators[field](el.value)));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    Object.keys(validators).forEach(field => {
      const el = document.getElementById(field);
      const msg = validators[field](el.value);
      setError(field, msg);
      if(msg) valid = false;
    });

    if(valid){
      successMsg.classList.add('show');
      form.reset();
      setTimeout(() => successMsg.classList.remove('show'), 5000);
    } else {
      successMsg.classList.remove('show');
      form.querySelector('.invalid input, .invalid select, .invalid textarea')?.focus();
    }
  });
}

/* ============================================================
   AI CHATBOT (simulated)
   ============================================================ */
function initChatbot(){
  const toggle = document.getElementById('chatbotToggle');
  const closeBtn = document.getElementById('chatbotClose');
  const win = document.getElementById('chatbotWindow');
  const messages = document.getElementById('chatbotMessages');
  const form = document.getElementById('chatbotForm');
  const input = document.getElementById('chatbotInput');
  const suggestions = document.getElementById('chatbotSuggestions');
  if(!toggle) return;

  const responses = {
    timings: "We're open Monday–Saturday from 6:00 AM to 11:00 PM, and Sunday from 8:00 AM to 8:00 PM.",
    membership: 'We offer Basic ($29/mo), Pro ($59/mo) and Elite ($99/mo) memberships. The Pro plan is our most popular option, including group classes and nutrition guidance.',
    personal: 'Yes! Our certified trainers provide one-on-one personal training based on your fitness goals — available with our Pro and Elite plans.',
    workout: "For best results, mix strength training 3–4x a week with mobility and cardio work. Book a free assessment and one of our coaches will build a plan around your goals.",
    contact: 'You can reach us at +1 234 567 890, email hello@yourgym.com, or visit us at 123 Fitness Avenue. Want me to open the contact form?',
    default: "Great question! For detailed help, our team can assist directly — feel free to use the contact form below, or ask me about memberships, training, or gym timings."
  };

  const suggestionMap = {
    'Membership Plans': responses.membership,
    'Personal Training': responses.personal,
    'Gym Timings': responses.timings,
    'Workout Advice': responses.workout,
    'Contact Gym': responses.contact
  };

  function openChat(){
    win.classList.add('open');
    toggle.classList.add('hidden');
    input.focus({ preventScroll: true });
  }
  function closeChat(){
    win.classList.remove('open');
    toggle.classList.remove('hidden');
  }

  toggle.addEventListener('click', openChat);
  closeBtn.addEventListener('click', closeChat);

  function addMessage(text, sender){
    const msg = document.createElement('div');
    msg.className = `msg msg-${sender}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping(){
    const typing = document.createElement('div');
    typing.className = 'msg-typing';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }
  function hideTyping(){
    document.getElementById('typingIndicator')?.remove();
  }

  function getResponse(text){
    const t = text.toLowerCase();
    if(t.includes('time') || t.includes('hour') || t.includes('open')) return responses.timings;
    if(t.includes('member') || t.includes('plan') || t.includes('price') || t.includes('cost')) return responses.membership;
    if(t.includes('personal') || t.includes('trainer') || t.includes('coach')) return responses.personal;
    if(t.includes('workout') || t.includes('advice') || t.includes('exercise') || t.includes('routine')) return responses.workout;
    if(t.includes('contact') || t.includes('phone') || t.includes('email') || t.includes('address') || t.includes('location')) return responses.contact;
    return responses.default;
  }

  function botReply(text){
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(getResponse(text), 'bot');
    }, 700 + Math.random() * 500);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMessage(text, 'user');
    input.value = '';
    botReply(text);
  });

  suggestions.addEventListener('click', (e) => {
    const chip = e.target.closest('.suggestion-chip');
    if(!chip) return;
    const label = chip.textContent.trim();
    addMessage(label, 'user');
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage(suggestionMap[label] || responses.default, 'bot');
    }, 700);
  });
}

/* ============================================================
   BACKGROUND FX — mouse-following glow + reactive particles
   ============================================================ */
function initBackgroundFX(){
  const canvas = document.getElementById('fx-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width, height, dpr;
  let mouse = { x: -9999, y: -9999, active: false };
  let particles = [];
  let accentRGB = getAccentRGB();

  function getAccentRGB(){
    // Reads the live --accent CSS variable so it always matches the
    // active theme's default OR the person's custom picked color.
    const hex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
    if(/^#([0-9a-f]{6})$/i.test(hex)){
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      return `${r},${g},${b}`;
    }
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return isDark ? '57,255,140' : '16,165,88';
  }

  // Keep particle color in sync with the active theme and any custom accent
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.addEventListener('click', () => { accentRGB = getAccentRGB(); });
  });
  window.__fitzoneSyncAccent = () => { accentRGB = getAccentRGB(); };

  function resize(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
  }

  function initParticles(){
    const count = Math.min(Math.floor((width * height) / 22000), isTouch ? 40 : 90);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      baseX: 0,
      baseY: 0,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.6 + 0.6,
      alpha: Math.random() * 0.4 + 0.15
    }));
    particles.forEach(p => { p.baseX = p.x; p.baseY = p.y; });
  }

  function draw(){
    ctx.clearRect(0, 0, width, height);

    // Mouse glow
    if(mouse.active && !isTouch){
      const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 260);
      glow.addColorStop(0, `rgba(${accentRGB},0.10)`);
      glow.addColorStop(1, `rgba(${accentRGB},0)`);
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    particles.forEach(p => {
      // ambient drift
      p.x += p.vx;
      p.y += p.vy;

      if(p.x < 0 || p.x > width) p.vx *= -1;
      if(p.y < 0 || p.y > height) p.vy *= -1;

      // mouse reaction
      if(mouse.active && !isTouch){
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 140){
          const force = (140 - dist) / 140;
          p.x -= (dx / dist) * force * 1.4;
          p.y -= (dy / dist) * force * 1.4;
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentRGB},${p.alpha})`;
      ctx.fill();
    });

    // connective lines near cursor
    if(mouse.active && !isTouch){
      particles.forEach(p => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if(dist < 130){
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `rgba(${accentRGB},${0.12 * (1 - dist / 130)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);

  if(!isTouch){
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    });
    window.addEventListener('mouseleave', () => { mouse.active = false; });
  }

  resize();

  if(!reduceMotion){
    requestAnimationFrame(draw);
  } else {
    // Static single render for reduced-motion users
    draw_static();
  }

  function draw_static(){
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${accentRGB},${p.alpha})`;
      ctx.fill();
    });
  }
}