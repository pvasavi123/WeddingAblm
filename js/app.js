/**
 * JULIAN & ARIA — MAIN APPLICATION LOGIC
 * Coordinates: Countdown, Dual Perspective Story, 3D Gyroscopic Tilt,
 * Digital Guestbook (XSS-safe), RSVP, Interactive Toast, and 4K Lightbox.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initPerspectiveTabs();
  init3DCardTilt();
  initGalleryFilters();
  initGuestbook();
  initInteractiveToast();
  initRSVPForm();
  initLightbox();
  initHUDControls();
  initMobileMenu();
});

/* ==========================================================================
   1. COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  const targetDate = new Date('October 24, 2026 15:00:00 GMT+0200').getTime();

  const daysEl = document.getElementById('daysVal');
  const hoursEl = document.getElementById('hoursVal');
  const minsEl = document.getElementById('minsVal');
  const secsEl = document.getElementById('secsVal');

  if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

  function update() {
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    daysEl.textContent = d < 10 ? `0${d}` : `${d}`;
    hoursEl.textContent = h < 10 ? `0${h}` : `${h}`;
    minsEl.textContent = m < 10 ? `0${m}` : `${m}`;
    secsEl.textContent = s < 10 ? `0${s}` : `${s}`;
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. DUAL PERSPECTIVE STORY ("HIS WORDS" VS "HER WORDS")
   ========================================================================== */
function initPerspectiveTabs() {
  const perspectiveQuotes = {
    'his-1': `"She had accidentally grabbed my black umbrella from the café umbrella stand. I sprinted 100 meters down Rue Lepic in the drizzling rain calling out 'Excuse me!'. When she turned around, flour on her sweater and the sweetest apologetic giggle, I forgot that I was completely soaked. We went back inside, split the last almond croissant 50/50, and talked until the staff started putting the chairs up."`,
    'hers-1': `"I was having a total mess of a Tuesday—missed my metro, bought a pastry I didn't need, and accidentally walked off with someone else's umbrella! When this handsome guy chased me down the street out of breath, I was so embarrassed I offered him half my croissant as a peace bribe. Best negotiation of my life."`,

    'his-2': `"I cracked an egg and the yolk immediately rolled off the flour volcano and splattered on her slippers. Aria retaliated by booping my nose with a handful of semolina flour. Twenty minutes later, we had pasta dough stuck to the cabinet knobs and the kitchen looked like an exploded snowglobe. We ended up sitting on the living room rug eating spicy ramen noodles with extra cheddar cheese, laughing until our ribs ached."`,
    'hers-2': `"He claimed his nonna gave him a secret recipe. 15 minutes in, our kitchen looked like a crime scene committed by Pillsbury Doughboy! We were literally crying laughing picking bits of fettuccine off our foreheads. Eating cheap cheesy ramen on the rug with flour on our noses was when I secretly realized: yup, I'm going to marry this goofball."`,

    'his-3': `"We packed an old pickup truck with string lights, three wool tartan blankets, and two thermoses of hot cocoa with mini marshmallows. At a roadside diner stop in Lake Tahoe, we saw a rescue adoption booth. Aria locked eyes with this chunky little golden retriever with floppy ears. Two hours later, little 'Barnaby' was curled up asleep between us on the tailgate, snoring softly while the Milky Way rotated above."`,
    'hers-3': `"Julian pretended he was just 'looking' at the rescue puppies. Within three minutes, he was letting this floppy golden retriever puppy lick his beard while whispering 'Aria, we have to adopt him, he chose us!'. Falling asleep under the stars with hot cocoa, Julian's arm around me, and Barnaby's paws twitching in puppy dreams was pure magic."`,

    'his-4': `"I had written my whole proposal speech on index cards. As I went down on one knee on the Pacific cliff deck, a sudden gust of ocean wind blew every single card straight off the cliff into the sea! I froze, panicked, and just blurted out: 'Aria, you make my life the most fun adventure, I love how you rescue bees from swimming pools, and I cannot breathe without you. Please marry me!'. She burst into happy tears and tackled me into a bear hug before I could even open the ring box."`,
    'hers-4': `"I saw the index cards fluttering away into the Pacific like a cartoon and Julian looking terrified. But his honest, unfiltered, blubbering little speech about rescuing bees and laughing together was ten thousand times better than any polished script. I didn't even look at the diamond before jumping on him. A million times yes!"`
  };

  const tabs = document.querySelectorAll('.perspective-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const parent = tab.closest('.chapter-body');
      if (!parent) return;

      parent.querySelectorAll('.perspective-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const perspKey = tab.getAttribute('data-persp');
      const quoteEl = parent.querySelector('.active-quote');
      if (quoteEl && perspectiveQuotes[perspKey]) {
        // Smooth fade transition
        quoteEl.style.opacity = '0';
        setTimeout(() => {
          quoteEl.textContent = perspectiveQuotes[perspKey];
          quoteEl.style.opacity = '1';
        }, 150);
      }
    });
  });

  // Mood pills click to smooth scroll to corresponding chapter
  const moodPills = document.querySelectorAll('.mood-pill');
  moodPills.forEach((pill, idx) => {
    pill.style.cursor = 'pointer';
    pill.addEventListener('click', () => {
      moodPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const chapterNum = (idx % 4) + 1;
      const chapter = document.querySelector(`.story-chapter[data-chapter="${chapterNum}"]`);
      if (chapter) {
        chapter.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const card = chapter.querySelector('.chapter-card');
        if (card) {
          card.style.boxShadow = '0 0 45px rgba(212, 175, 55, 0.7)';
          setTimeout(() => {
            card.style.boxShadow = '';
          }, 1500);
        }
      }
    });
  });
}

/* ==========================================================================
   3. 3D GYROSCOPIC TILT FOR GALLERY & CHAPTER CARDS
   ========================================================================== */
function init3DCardTilt() {
  if (window.matchMedia('(hover: none)').matches) return;
  const cards = document.querySelectorAll('.gallery-item-3d, .glass-3d-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const deltaX = (x - centerX) / centerX;
      const deltaY = (y - centerY) / centerY;

      const rotY = deltaX * 10;
      const rotX = -deltaY * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      const sheen = card.querySelector('.gallery-sheen, .card-glass-shine');
      if (sheen) {
        sheen.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.3) 0%, transparent 60%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      const sheen = card.querySelector('.gallery-sheen, .card-glass-shine');
      if (sheen) {
        sheen.style.background = '';
      }
    });
  });
}

/* ==========================================================================
   4. GALLERY FILTERING
   ========================================================================== */
function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.gallery-item-3d');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        const cat = item.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          item.classList.remove('hidden');
          item.style.opacity = '0';
          setTimeout(() => { item.style.opacity = '1'; }, 50);
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   5. DIGITAL GUESTBOOK (Secure DOM Construction per Security Guidelines)
   ========================================================================== */
function initGuestbook() {
  const container = document.getElementById('wishesContainer');
  const form = document.getElementById('wishForm');
  const feedback = document.getElementById('formFeedback');

  const initialWishes = [
    {
      name: "Countess Sofia & Alessandro",
      relation: "Family",
      message: "Dearest Julian and Aria, witnessing your union beneath the Italian sky was pure poetry. May your days overflow with laughter, fine Chianti, and unending tenderness.",
      tilt: -1.5
    },
    {
      name: "Dr. Ethan Hayes",
      relation: "Close Friend",
      message: "I remember when Julian first came back from Paris with that starry-eyed grin. You two were made for each other. Here's to a lifetime of adventures, my friends!",
      tilt: 1.2
    },
    {
      name: "Clara Beauchamp",
      relation: "Maid of Honor",
      message: "Aria, my dearest sister-at-heart, seeing your radiant happiness brings tears to my eyes. Julian is everything you deserved and more. Love you both infinitely!",
      tilt: -0.8
    },
    {
      name: "Liam & Penelope Sterling",
      relation: "Close Friend",
      message: "Hands down the most cinematic, emotionally stirring wedding of our generation. Thank you for including us in your fairytale. Cheers to eternity!",
      tilt: 1.8
    }
  ];

  // Securely render wish card using textContent and createElement
  function createWishCard(wish) {
    const card = document.createElement('div');
    card.className = 'guestbook-card';
    card.style.setProperty('--rand-tilt', wish.tilt || 0);

    const nameEl = document.createElement('h4');
    nameEl.className = 'card-guest-name';
    nameEl.textContent = wish.name;

    const relEl = document.createElement('p');
    relEl.className = 'card-guest-rel';
    relEl.textContent = wish.relation;

    const msgEl = document.createElement('p');
    msgEl.className = 'card-guest-msg';
    msgEl.textContent = `“${wish.message}”`;

    card.appendChild(nameEl);
    card.appendChild(relEl);
    card.appendChild(msgEl);

    return card;
  }

  // Populate initial cards
  if (container) {
    initialWishes.forEach(wish => {
      container.appendChild(createWishCard(wish));
    });
  }

  // Handle form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('guestName');
      const relationInput = document.getElementById('guestRelation');
      const messageInput = document.getElementById('guestMessage');

      const name = nameInput.value.trim();
      const relation = relationInput.value.trim();
      const message = messageInput.value.trim();

      if (!name || !message) {
        feedback.textContent = 'Please fill out your name and a heartfelt message.';
        feedback.className = 'form-feedback error';
        return;
      }

      const randomTilt = (Math.random() - 0.5) * 3;
      const newCard = createWishCard({
        name: name,
        relation: relation,
        message: message,
        tilt: randomTilt
      });

      // Insert at the front with animation
      if (container) {
        newCard.style.opacity = '0';
        newCard.style.transform = 'scale(0.8)';
        container.prepend(newCard);
        setTimeout(() => {
          newCard.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          newCard.style.opacity = '1';
          newCard.style.transform = `rotate(${randomTilt}deg) scale(1)`;
        }, 50);
      }

      form.reset();
      feedback.textContent = 'Thank you! Your heartfelt blessing has been inscribed.';
      feedback.className = 'form-feedback success';

      // Play audio glass clink in celebration
      if (window.weddingAudio && typeof window.weddingAudio.playGlassClink === 'function') {
        window.weddingAudio.playGlassClink();
      }

      setTimeout(() => {
        feedback.textContent = '';
      }, 5000);
    });
  }
}

/* ==========================================================================
   6. INTERACTIVE TOAST ("RAISE A GLASS")
   ========================================================================== */
function initInteractiveToast() {
  const toastBtn = document.getElementById('raiseToastBtn');
  const counterEl = document.getElementById('toastCounter');
  const flute = document.getElementById('fluteLeft');
  const sparklesBox = document.getElementById('sparklesBox');

  let toastCount = 1428;

  if (toastBtn) {
    toastBtn.addEventListener('click', () => {
      toastCount++;
      if (counterEl) {
        counterEl.textContent = toastCount.toLocaleString();
      }

      // Clink animation
      if (flute) {
        flute.classList.remove('clink');
        void flute.offsetWidth; // trigger reflow
        flute.classList.add('clink');
      }

      // Play synthesized crystal glass chime
      if (window.weddingAudio && typeof window.weddingAudio.playGlassClink === 'function') {
        window.weddingAudio.playGlassClink();
      }

      // Golden sparkling burst
      createSparkleBurst(sparklesBox);
    });
  }

  function createSparkleBurst(container) {
    if (!container) return;
    for (let i = 0; i < 16; i++) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle-star';
      sparkle.textContent = ['✨', '✦', '🥂', '💛'][Math.floor(Math.random() * 4)];
      sparkle.style.position = 'absolute';
      sparkle.style.left = '50%';
      sparkle.style.top = '50%';
      sparkle.style.pointerEvents = 'none';

      const angle = (i / 16) * Math.PI * 2;
      const dist = 40 + Math.random() * 90;
      const destX = Math.cos(angle) * dist;
      const destY = Math.sin(angle) * dist;

      sparkle.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      sparkle.style.transform = 'translate(-50%, -50%) scale(0.5)';
      sparkle.style.opacity = '1';

      container.appendChild(sparkle);

      setTimeout(() => {
        sparkle.style.transform = `translate(calc(-50% + ${destX}px), calc(-50% + ${destY}px)) scale(1.4)`;
        sparkle.style.opacity = '0';
      }, 20);

      setTimeout(() => {
        sparkle.remove();
      }, 900);
    }
  }
}

/* ==========================================================================
   7. RSVP FORM SUBMISSION
   ========================================================================== */
function initRSVPForm() {
  const form = document.getElementById('rsvpForm');
  const feedback = document.getElementById('rsvpFeedback');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('rsvpName').value.trim();
      const attendance = document.getElementById('rsvpAttendance').value;

      if (!name) {
        feedback.textContent = 'Please provide your full name.';
        feedback.className = 'form-feedback error';
        return;
      }

      feedback.textContent = attendance === 'yes'
        ? `We are joyous to celebrate with you, ${name}! Your seat has been reserved.`
        : `Thank you for letting us know, ${name}. We will miss you dearly in Italy!`;

      feedback.className = 'form-feedback success';
      form.reset();

      setTimeout(() => {
        feedback.textContent = '';
      }, 8000);
    });
  }
}

/* ==========================================================================
   8. 4K LIGHTBOX MODAL
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const backdrop = document.getElementById('lightboxBackdrop');
  const closeBtn = document.getElementById('lightboxClose');
  const imgEl = document.getElementById('lightboxImg');
  const titleEl = document.getElementById('lightboxTitle');
  const descEl = document.getElementById('lightboxDesc');

  window.openLightbox = function(src, title, desc) {
    if (!modal || !imgEl) return;
    imgEl.src = src;
    imgEl.alt = title;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  function closeLightbox() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeLightbox();
    }
  });

  // Attach lightbox triggers in gallery
  document.querySelectorAll('.lightbox-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const img = btn.getAttribute('data-img');
      const title = btn.getAttribute('data-title');
      const desc = btn.getAttribute('data-desc');
      window.openLightbox(img, title, desc);
    });
  });
}

/* ==========================================================================
   9. HUD & CINEMATIC CONTROLS
   ========================================================================== */
function initHUDControls() {
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioStatus = document.getElementById('audioStatus');
  const audioIcon = document.getElementById('audioIcon');
  const grainBtn = document.getElementById('grainToggleBtn');
  const filmGrain = document.getElementById('filmGrain');

  // Soundtrack toggle
  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      if (!window.weddingAudio) return;
      const isPlaying = window.weddingAudio.toggleMusic();
      if (isPlaying) {
        if (audioStatus) audioStatus.textContent = 'Soundtrack: Playing';
        if (audioIcon) audioIcon.textContent = '🎶';
      } else {
        if (audioStatus) audioStatus.textContent = 'Soundtrack: Muted';
        if (audioIcon) audioIcon.textContent = '🎵';
      }
    });
  }

  // 35mm Grain toggle
  if (grainBtn && filmGrain) {
    grainBtn.addEventListener('click', () => {
      filmGrain.classList.toggle('disabled');
      const isDisabled = filmGrain.classList.contains('disabled');
      const text = grainBtn.querySelector('.btn-text');
      if (text) text.textContent = isDisabled ? 'Grain: Off' : 'Grain: On';
    });
  }

  // Active section indicator in Nav
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 150;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   10. RESPONSIVE MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const navWrapper = document.getElementById('navMenuWrapper');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const header = document.getElementById('luxuryHeader');

  if (!toggleBtn || !navWrapper) return;

  function openMenu() {
    toggleBtn.classList.add('active');
    toggleBtn.setAttribute('aria-expanded', 'true');
    navWrapper.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
    document.body.classList.add('mobile-menu-locked');
  }

  function closeMenu() {
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
    navWrapper.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
    document.body.classList.remove('mobile-menu-locked');
  }

  function toggleMenu() {
    if (navWrapper.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  // Close when clicking any nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close when clicking modal trigger button inside mobile drawer
  const mobileActionBtns = navWrapper.querySelectorAll('.open-add-memory-btn');
  mobileActionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navWrapper.classList.contains('open')) {
      closeMenu();
    }
  });

  // Close on screen resize to desktop (> 768px)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navWrapper.classList.contains('open')) {
      closeMenu();
    }
  });
}
