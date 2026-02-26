/* =============================================
   CABBY TOURS — main.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ─── HEADER SCROLL ──────────────────────────
  const header = document.getElementById('site-header');

  function handleScroll() {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();


  // ─── HAMBURGER MENU ─────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mainNav   = document.getElementById('main-nav');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', mainNav.classList.contains('open'));
  });

  // Close nav when a link is clicked
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mainNav.classList.remove('open');
    });
  });

  // Close nav when clicking outside
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) {
      hamburger.classList.remove('open');
      mainNav.classList.remove('open');
    }
  });


  // ─── CAROUSEL ───────────────────────────────
  const track       = document.getElementById('carousel-track');
  const slides      = document.querySelectorAll('.slide');
  const dots        = document.querySelectorAll('.dot');
  const prevBtn     = document.getElementById('prev-btn');
  const nextBtn     = document.getElementById('next-btn');
  const progressBar = document.getElementById('progress-bar');

  let currentIndex  = 0;
  const totalSlides = slides.length;
  const autoDelay   = 6000; // ms per slide
  let autoTimer     = null;

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    dots[currentIndex].classList.remove('active');

    currentIndex = (index + totalSlides) % totalSlides;

    slides[currentIndex].classList.add('active');
    dots[currentIndex].classList.add('active');

    track.style.transform = `translateX(-${currentIndex * (100 / totalSlides)}%)`;

    startProgress();
  }

  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide()  { goToSlide(currentIndex - 1); }

  function startAutoPlay() {
    clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, autoDelay);
  }

  function startProgress() {
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth; // force reflow
    progressBar.style.transition = `width ${autoDelay}ms linear`;
    progressBar.style.width = '100%';
  }

  nextBtn.addEventListener('click', () => { nextSlide(); startAutoPlay(); });
  prevBtn.addEventListener('click', () => { prevSlide(); startAutoPlay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goToSlide(parseInt(dot.dataset.index));
      startAutoPlay();
    });
  });

  // Touch / swipe support
  let touchStartX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
      startAutoPlay();
    }
  }, { passive: true });

  // Pause on hover
  const carouselEl = document.querySelector('.carousel');
  carouselEl.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carouselEl.addEventListener('mouseleave', startAutoPlay);

  // Init carousel
  goToSlide(0);
  startAutoPlay();


  // ─── LANGUAGE SWITCHER ──────────────────────
  const langSwitcher  = document.getElementById('lang-switcher');
  const langToggle    = document.getElementById('lang-toggle');
  const currentLangEl = document.getElementById('current-lang');
  const langOptions   = document.querySelectorAll('.lang-option');

  langToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    langSwitcher.classList.toggle('open');
  });

  langOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Update active state
      langOptions.forEach(o => o.classList.remove('active'));
      option.classList.add('active');

      // Update button label
      currentLangEl.textContent = option.dataset.label;

      // Close dropdown
      langSwitcher.classList.remove('open');

      // ✅ Apply translations to the page
      applyTranslations(option.dataset.lang);
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!langSwitcher.contains(e.target)) {
      langSwitcher.classList.remove('open');
    }
  });

  // ✅ Restore saved language on page load
  const savedLang = localStorage.getItem('cabby-lang') || 'en';
  if (savedLang !== 'en') {
    const savedOption = document.querySelector(`.lang-option[data-lang="${savedLang}"]`);
    if (savedOption) {
      langOptions.forEach(o => o.classList.remove('active'));
      savedOption.classList.add('active');
      currentLangEl.textContent = savedOption.dataset.label;
      applyTranslations(savedLang);
    }
  }

  // ─── SCROLL REVEAL ──────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.reveal === 'right' ? 150 : 0;
        setTimeout(() => el.classList.add('revealed'), delay);
        revealObserver.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('[data-reveal]').forEach(el => {
    revealObserver.observe(el);
  });


  // ─── HEADER: ensure transparent on fresh load ──
  if (window.scrollY === 0) {
    header.classList.remove('scrolled');
  }

});


// ─── APPLY TRANSLATIONS ─────────────────────
// Called whenever a language is selected.
// Reads data-i18n attributes and swaps text from translations.js

function applyTranslations(lang) {
  const t = translations[lang] || translations['en'];

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      // innerHTML supports <br>, <em>, <strong> in translation strings
      el.innerHTML = t[key];
    }
  });

  document.documentElement.lang = lang;
  localStorage.setItem('cabby-lang', lang);
}