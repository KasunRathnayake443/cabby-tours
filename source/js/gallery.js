document.addEventListener('DOMContentLoaded', () => {

  // ─── FILTER ──────────────────────────────────
  const filterBtns = document.querySelectorAll('.gp-filter');
  const gpItems    = document.querySelectorAll('.gp-item');
  let   activeFilter = 'all';

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;

      gpItems.forEach(item => {
        const match = activeFilter === 'all' || item.dataset.category === activeFilter;
        if (match) {
          item.classList.remove('gp-hidden');
          item.classList.add('gp-visible');
        } else {
          item.classList.add('gp-hidden');
          item.classList.remove('gp-visible');
        }
      });

      updateCount();
    });
  });

  function updateCount() {
    const visible = document.querySelectorAll('.gp-item:not(.gp-hidden)').length;
    const countEl = document.getElementById('gp-count');
    if (countEl) countEl.innerHTML = `Showing <strong>${visible}</strong> photos`;
  }

  // ─── LOAD MORE (simulation) ───────────────────
  const loadMoreBtn = document.getElementById('btn-load-more');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      // In production connect this to a real data source
      loadMoreBtn.disabled = true;
      loadMoreBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" style="animation:spin 1s linear infinite">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-dasharray="60" stroke-dashoffset="20"/>
        </svg>
        Loading...`;

      setTimeout(() => {
        loadMoreBtn.innerHTML = `All photos loaded`;
        loadMoreBtn.disabled = true;
      }, 1500);
    });
  }

  // ─── LIGHTBOX ────────────────────────────────
  const lightbox    = document.getElementById('gp-lightbox');
  const backdrop    = document.getElementById('gp-lb-backdrop');
  const lbImg       = document.getElementById('gp-lb-img');
  const lbCaption   = document.getElementById('gp-lb-caption');
  const lbCredit    = document.getElementById('gp-lb-credit');
  const lbCounter   = document.getElementById('gp-lb-counter');
  const lbClose     = document.getElementById('gp-lb-close');
  const lbPrev      = document.getElementById('gp-lb-prev');
  const lbNext      = document.getElementById('gp-lb-next');

  let currentIndex = 0;
  let visibleItems = [];

  function buildVisibleItems() {
    visibleItems = Array.from(document.querySelectorAll('.gp-item:not(.gp-hidden)'));
  }

  function openLightbox(index) {
    buildVisibleItems();
    currentIndex = index;
    showImage();
    lightbox.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showImage() {
    const item    = visibleItems[currentIndex];
    const img     = item.querySelector('img');
    const caption = item.querySelector('.gp-overlay-info p')?.textContent || '';
    const credit  = item.querySelector('.gp-credit')?.textContent || '';

    lbImg.style.opacity   = '0';
    lbImg.style.transform = 'scale(0.97)';

    setTimeout(() => {
      lbImg.src             = img.src;
      lbImg.alt             = img.alt;
      lbCaption.textContent = caption;
      lbCredit.textContent  = credit;
      lbCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
      lbImg.style.opacity   = '1';
      lbImg.style.transform = 'scale(1)';
    }, 180);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showImage();
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showImage();
  }

  // Attach click to each item and zoom button
  document.querySelectorAll('.gp-item').forEach((item, index) => {
    item.addEventListener('click', () => {
      buildVisibleItems();
      const visibleIndex = visibleItems.indexOf(item);
      if (visibleIndex !== -1) openLightbox(visibleIndex);
    });

    item.querySelector('.gp-zoom-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      buildVisibleItems();
      const visibleIndex = visibleItems.indexOf(item);
      if (visibleIndex !== -1) openLightbox(visibleIndex);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  backdrop.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });
  lbNext.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevImage();
    if (e.key === 'ArrowRight')  nextImage();
  });

  // Touch swipe on lightbox
  let lbTouchX = 0;
  lightbox.addEventListener('touchstart', e => { lbTouchX = e.changedTouches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend',   e => {
    const diff = lbTouchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) { diff > 0 ? nextImage() : prevImage(); }
  }, { passive: true });

  // Spinner keyframe
  const style = document.createElement('style');
  style.textContent = `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);

});