/* ============================================================
   TINKS — Carousel & Card Flip Logic
   ============================================================ */

(function () {
  const carousel = document.getElementById('carousel');
  const cards = Array.from(carousel.querySelectorAll('.card'));
  const prevBtn = document.getElementById('navPrev');
  const nextBtn = document.getElementById('navNext');
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let activeIndex = 0;

  // -----------------------------------------------------------
  // Scroll-based active card detection
  // -----------------------------------------------------------
  function getClosestCardIndex() {
    const carouselRect = carousel.getBoundingClientRect();
    const center = carouselRect.left + carouselRect.width / 2;
    let closest = 0;
    let minDist = Infinity;

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(center - cardCenter);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });

    return closest;
  }

  function updateActiveCard() {
    const newIndex = getClosestCardIndex();
    if (newIndex === activeIndex) return;
    activeIndex = newIndex;

    // Dim non-active cards
    cards.forEach((card, i) => {
      card.classList.toggle('dimmed', i !== activeIndex);
    });
  }

  // Throttled scroll handler
  let scrollRaf = null;
  carousel.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      updateActiveCard();
      scrollRaf = null;
    });
  }, { passive: true });

  // -----------------------------------------------------------
  // Arrow navigation
  // -----------------------------------------------------------
  function scrollToCard(index) {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    cards[clamped].scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  prevBtn.addEventListener('click', () => {
    scrollToCard(activeIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    scrollToCard(activeIndex + 1);
  });

  // -----------------------------------------------------------
  // Card flip — Desktop: hover + click | Mobile: tap
  // -----------------------------------------------------------
  function flipCard(card) {
    card.classList.add('flipped');
  }

  function unflipCard(card) {
    card.classList.remove('flipped');
  }

  cards.forEach((card) => {
    // Track if user clicked "see less" while hovering,
    // so hover doesn't immediately re-flip
    let manuallyUnflipped = false;

    if (!isTouchDevice) {
      card.addEventListener('mouseenter', () => {
        if (!manuallyUnflipped) {
          flipCard(card);
        }
      });
      card.addEventListener('mouseleave', () => {
        unflipCard(card);
        manuallyUnflipped = false;
      });
    } else {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.btn-visit')) return;
        card.classList.toggle('flipped');
      });
    }

    // "SEE MORE" button — flip to state 2
    const ctaBtn = card.querySelector('.card-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        flipCard(card);
        manuallyUnflipped = false;
      });
    }

    // "See less" button — flip back to state 1
    const lessBtn = card.querySelector('.btn-less');
    if (lessBtn) {
      lessBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        unflipCard(card);
        if (!isTouchDevice) manuallyUnflipped = true;
      });
    }

    // Prevent visit-site clicks from toggling flip
    const visitBtn = card.querySelector('.btn-visit');
    if (visitBtn) {
      visitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  });

  // -----------------------------------------------------------
  // Splash screen
  // -----------------------------------------------------------
  const splash = document.getElementById('splash');
  const SPLASH_DURATION = 3500; // ms — ~2 GIF loops
  const FADE_DURATION = 800;   // ms — matches CSS transition

  setTimeout(() => {
    splash.classList.add('fade-out');

    setTimeout(() => {
      splash.remove();
      // Trigger entrance animations
      document.body.classList.add('loaded');

      // Set initial dimmed state after entrance animations complete
      setTimeout(() => {
        cards.forEach((card, i) => {
          card.classList.toggle('dimmed', i !== 0);
        });
      }, 1200);
    }, FADE_DURATION);
  }, SPLASH_DURATION);
})();
