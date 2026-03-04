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


// ─── TOURS TAB SWITCHER ─────────────────────
const toursTabs  = document.querySelectorAll('.tours-tab');
const toursPanels = document.querySelectorAll('.tours-panel');

toursTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab
    toursTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show matching panel
    const target = tab.dataset.tab;
    toursPanels.forEach(panel => {
      panel.classList.remove('active');
    });
    const activePanel = document.getElementById(`panel-${target}`);
    activePanel.classList.add('active');

    // Re-trigger scroll reveal for newly visible cards
    activePanel.querySelectorAll('[data-reveal]').forEach(el => {
      if (!el.classList.contains('revealed')) {
        revealObserver.observe(el);
      }
    });
  });
});


// ─── TESTIMONIALS CAROUSEL ───────────────────
const testiTrack  = document.getElementById('testi-track');
const testiDotsEl = document.getElementById('testi-dots');
const testiPrev   = document.getElementById('testi-prev');
const testiNext   = document.getElementById('testi-next');

if (testiTrack) {
  const originalCards = Array.from(testiTrack.querySelectorAll('.testi-card'));
  const cardCount     = originalCards.length;
  let testiIndex      = 0;
  let testiAuto       = null;
  let isTransitioning = false;

  // ── Clone cards for infinite loop ──
  // Append clones of all cards to the end
  originalCards.forEach(card => {
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    testiTrack.appendChild(clone);
  });

  // ── Build dots (only for original cards) ──
  originalCards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Review ${i + 1}`);
    dot.addEventListener('click', () => {
      if (isTransitioning) return;
      testiIndex = i;
      updateCarousel(true);
      resetTestiAuto();
    });
    testiDotsEl.appendChild(dot);
  });

  function getCardWidth() {
    const allCards = testiTrack.querySelectorAll('.testi-card');
    return allCards[0].offsetWidth + 24; // card width + 1.5rem gap
  }

  function updateDots() {
    testiDotsEl.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('active', i === testiIndex);
    });
  }

  function updateCarousel(animate = true) {
    if (!animate) {
      testiTrack.style.transition = 'none';
    } else {
      testiTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    const offset = testiIndex * getCardWidth();
    testiTrack.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function nextTesti() {
    if (isTransitioning) return;
    isTransitioning = true;
    testiIndex++;
    updateCarousel(true);
  }

  function prevTesti() {
    if (isTransitioning) return;
    isTransitioning = true;
    testiIndex--;
    updateCarousel(true);
  }

  // ── After transition ends — handle infinite jump ──
  testiTrack.addEventListener('transitionend', () => {
    isTransitioning = false;

    // If we scrolled into the cloned section — jump back silently
    if (testiIndex >= cardCount) {
      testiIndex = testiIndex - cardCount;
      updateCarousel(false); // instant, no animation
    }

    // If we went before 0 (prev from first) — jump to end silently
    if (testiIndex < 0) {
      testiIndex = cardCount + testiIndex;
      updateCarousel(false);
    }

    updateDots();
  });

  function resetTestiAuto() {
    clearInterval(testiAuto);
    testiAuto = setInterval(nextTesti, 5000);
  }

  // Controls
  testiNext.addEventListener('click', () => {
    nextTesti();
    resetTestiAuto();
  });

  testiPrev.addEventListener('click', () => {
    prevTesti();
    resetTestiAuto();
  });

  // Touch swipe
  let testiTouchX = 0;
  testiTrack.addEventListener('touchstart', e => {
    testiTouchX = e.changedTouches[0].clientX;
  }, { passive: true });

  testiTrack.addEventListener('touchend', e => {
    const diff = testiTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextTesti() : prevTesti();
      resetTestiAuto();
    }
  }, { passive: true });

  // Pause on hover
  testiTrack.addEventListener('mouseenter', () => clearInterval(testiAuto));
  testiTrack.addEventListener('mouseleave', resetTestiAuto);

  // Recalculate on resize
  window.addEventListener('resize', () => {
    updateCarousel(false);
  }, { passive: true });

  // Init
  updateCarousel(false);
  resetTestiAuto();
}



// ─── GALLERY LIGHTBOX ────────────────────────
const lightbox         = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightbox-backdrop');
const lightboxImg      = document.getElementById('lightbox-img');
const lightboxCaption  = document.getElementById('lightbox-caption');
const lightboxCounter  = document.getElementById('lightbox-counter');
const lightboxClose    = document.getElementById('lightbox-close');
const lightboxPrev     = document.getElementById('lightbox-prev');
const lightboxNext     = document.getElementById('lightbox-next');

if (lightbox) {
  // Collect all gallery images
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  let lightboxCurrent = 0;

  const galleryData = galleryItems.map(item => ({
    src:     item.querySelector('img').src,
    alt:     item.querySelector('img').alt,
    caption: item.querySelector('.gallery-overlay-content p')?.textContent || ''
  }));

  function openLightbox(index) {
    lightboxCurrent = index;
    updateLightbox();
    lightbox.classList.add('active');
    lightboxBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightboxBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const data = galleryData[lightboxCurrent];
    lightboxImg.style.opacity = '0';
    lightboxImg.style.transform = 'scale(0.97)';
    setTimeout(() => {
      lightboxImg.src = data.src;
      lightboxImg.alt = data.alt;
      lightboxCaption.textContent = data.caption;
      lightboxCounter.textContent = `${lightboxCurrent + 1} / ${galleryData.length}`;
      lightboxImg.style.opacity = '1';
      lightboxImg.style.transform = 'scale(1)';
    }, 200);
  }

  function prevLightbox() {
    lightboxCurrent = (lightboxCurrent - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
  }

  function nextLightbox() {
    lightboxCurrent = (lightboxCurrent + 1) % galleryData.length;
    updateLightbox();
  }

  // Attach zoom button click on each item
  galleryItems.forEach((item, index) => {
    item.querySelector('.gallery-zoom').addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(index);
    });
    // Also open on item click
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', (e) => { e.stopPropagation(); prevLightbox(); });
  lightboxNext.addEventListener('click', (e) => { e.stopPropagation(); nextLightbox(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevLightbox();
    if (e.key === 'ArrowRight')  nextLightbox();
  });

  // Touch swipe on lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => {
    lbTouchX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextLightbox() : prevLightbox();
    }
  }, { passive: true });
}


// ─── CONTACT FORM ────────────────────────────
const contactForm    = document.getElementById('contactForm');
const btnSubmit      = document.getElementById('btn-submit');
const formPopup      = document.getElementById('form-popup');
const formBackdrop   = document.getElementById('form-popup-backdrop');
const btnPopupClose  = document.getElementById('btn-popup-close');
const formErrorRow   = document.getElementById('form-error-row');
const formErrorMsg   = document.getElementById('form-error-msg');
const formPopupMeta  = document.getElementById('form-popup-meta');

function showFormError(msg) {
  formErrorMsg.textContent = msg;
  formErrorRow.style.display = 'block';
  formErrorRow.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideFormError() {
  formErrorRow.style.display = 'none';
}

function setLoading(on) {
  const label   = btnSubmit.querySelector('.btn-submit-label');
  const arrow   = btnSubmit.querySelector('.btn-submit-arrow');
  const spinner = btnSubmit.querySelector('.btn-submit-spinner');
  btnSubmit.disabled    = on;
  label.textContent     = on ? 'Sending...' : 'Send message';
  arrow.style.display   = on ? 'none' : '';
  spinner.style.display = on ? 'inline-block' : 'none';
}

function openPopup(name, email) {
  if (formPopupMeta) {
    formPopupMeta.textContent = `✓ Confirmation sent to ${email}`;
    formPopupMeta.classList.add('visible');
  }
  formPopup.classList.add('active');
  formBackdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  formPopup.classList.remove('active');
  formBackdrop.classList.remove('active');
  document.body.style.overflow = '';
}

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const name    = contactForm.querySelector('#name').value.trim();
    const email   = contactForm.querySelector('#email').value.trim();
    const message = contactForm.querySelector('#message').value.trim();

    if (!name || !email || !message) {
      showFormError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(contactForm);
      const response = await fetch('send-mail.php', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        contactForm.reset();
        openPopup(name, email);
      } else {
        showFormError(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      showFormError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  });
}

if (btnPopupClose)  btnPopupClose.addEventListener('click', closePopup);
if (formBackdrop)   formBackdrop.addEventListener('click', closePopup);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && formPopup?.classList.contains('active')) closePopup();
});

// ─── FOOTER YEAR ─────────────────────────────
const yearEl = document.getElementById('footer-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


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

document.querySelectorAll('[data-reveal]').forEach(el => {
  revealObserver.observe(el);
});



