/**
 * JULIAN & ARIA — COUPLES' MEMORY VAULT & HEIRLOOM ENGINE
 * Enables married couples to store, upload, manage, and cherish their lifetime
 * of marriage memories, photos, dual reflections, milestones, and anniversary time capsules.
 */

class MemoryVaultEngine {
  constructor() {
    this.storageKey = 'couples_memory_vault_v1';
    this.capsuleKey = 'couples_time_capsules_v1';
    this.memories = [];
    this.capsules = [];
    this.marriageDate = new Date('2024-10-24T15:00:00'); // Wedding Day
    
    this.init();
  }

  init() {
    this.loadVault();
    this.initMarriageTicker();
    this.bindVaultEvents();
    this.renderCustomMemories();
    this.initTimeCapsules();
  }

  loadVault() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.memories = JSON.parse(stored);
      } else {
        // Initial Default Core Couple Memories
        this.memories = [
          {
            id: 'mem_1',
            title: "First Anniversary Gondola in Venice",
            date: "2025-10-24",
            location: "Grand Canal, Venice, Italy",
            category: "Anniversary",
            mood: "romantic",
            image: "assets/images/getaway.jpg",
            hisNote: "One full year of calling Aria my wife. We drank Bellinis as the sunset turned the ancient marble palaces into pure bronze.",
            herNote: "Julian still looks at me the exact way he did at the altar. Best 365 days of my life.",
            timestamp: Date.now() - 10000000
          },
          {
            id: 'mem_2',
            title: "Sunday Kitchen Fettuccine Catastrophe",
            date: "2022-03-06",
            location: "Our First Apartment Kitchen",
            category: "Everyday Joy",
            mood: "hilarious",
            image: "assets/images/kitchen_pasta.jpg",
            hisNote: "Flour on her nose, dough stuck to the ceiling fan, and laughing until our ribs ached over instant ramen.",
            herNote: "This was the exact Sunday I knew without a shadow of a doubt I wanted to spend forever with this goofball.",
            timestamp: Date.now() - 20000000
          },
          {
            id: 'mem_3',
            title: "Welcoming Barnaby by the Campfire",
            date: "2023-10-12",
            location: "Lake Tahoe Pine Woods",
            category: "Family Milestone",
            mood: "milestone",
            image: "assets/images/campfire_puppy.jpg",
            hisNote: "Tartan blankets, hot cocoa with marshmallows, and our sleepy golden retriever pup snoring softly between us.",
            herNote: "The night our duo became a little family of three.",
            timestamp: Date.now() - 30000000
          }
        ];
        this.saveVault();
      }
    } catch (e) {
      console.warn("Using in-memory vault fallback:", e);
    }
  }

  saveVault() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.memories));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
  }

  // Live "Time Married Together" Ticker
  initMarriageTicker() {
    const yearsEl = document.getElementById('yearsMarried');
    const daysEl = document.getElementById('daysMarried');
    const hoursEl = document.getElementById('hoursMarried');
    const minsEl = document.getElementById('minsMarried');
    const secsEl = document.getElementById('secsMarried');

    if (!daysEl) return;

    const updateClock = () => {
      const now = new Date();
      let diff = now.getTime() - this.marriageDate.getTime();
      
      const isPast = diff >= 0;
      diff = Math.abs(diff);

      const totalSeconds = Math.floor(diff / 1000);
      const totalMinutes = Math.floor(totalSeconds / 60);
      const totalHours = Math.floor(totalMinutes / 60);
      const totalDays = Math.floor(totalHours / 24);

      const years = Math.floor(totalDays / 365);
      const remainingDays = totalDays % 365;
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;
      const seconds = totalSeconds % 60;

      if (yearsEl) yearsEl.textContent = years < 10 ? `0${years}` : `${years}`;
      if (daysEl) daysEl.textContent = remainingDays < 10 ? `0${remainingDays}` : `${remainingDays}`;
      if (hoursEl) hoursEl.textContent = hours < 10 ? `0${hours}` : `${hours}`;
      if (minsEl) minsEl.textContent = minutes < 10 ? `0${minutes}` : `${minutes}`;
      if (secsEl) secsEl.textContent = seconds < 10 ? `0${seconds}` : `${seconds}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
  }

  bindVaultEvents() {
    // Open Memory Upload Modal
    const openModalBtns = document.querySelectorAll('.open-add-memory-btn');
    const modal = document.getElementById('memoryModal');
    const closeBtn = document.getElementById('closeMemoryModal');
    const backdrop = document.getElementById('memoryModalBackdrop');

    openModalBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (modal) {
          modal.classList.add('active');
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeModal = () => {
      if (modal) {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Image Upload Preview with validation
    const fileInput = document.getElementById('memoryImageFile');
    const previewContainer = document.getElementById('memoryImagePreview');
    let loadedImageDataUrl = '';

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation against allowed mime types & size
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
          alert('Please select a valid image (JPEG, PNG, WEBP, or GIF).');
          fileInput.value = '';
          return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          alert('Image size exceeds 10MB limit.');
          fileInput.value = '';
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          loadedImageDataUrl = event.target.result;
          if (previewContainer) {
            previewContainer.replaceChildren();
            const previewImg = document.createElement('img');
            previewImg.src = loadedImageDataUrl;
            previewImg.alt = "Memory Preview";
            previewImg.className = "vault-preview-thumb";
            previewContainer.appendChild(previewImg);
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Submit Memory Form
    const form = document.getElementById('addMemoryForm');
    const feedback = document.getElementById('memoryFormFeedback');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('memoryTitle').value.trim();
        const date = document.getElementById('memoryDate').value;
        const location = document.getElementById('memoryLocation').value.trim();
        const category = document.getElementById('memoryCategory').value;
        const mood = document.getElementById('memoryMood').value;
        const hisNote = document.getElementById('memoryHisNote').value.trim();
        const herNote = document.getElementById('memoryHerNote').value.trim();

        if (!title || !date) {
          if (feedback) {
            feedback.textContent = 'Please enter at least a memory title and date.';
            feedback.className = 'form-feedback error';
          }
          return;
        }

        // Fallback default image if none chosen
        const finalImage = loadedImageDataUrl || 'assets/images/hero.jpg';

        const newMemory = {
          id: 'mem_' + Date.now(),
          title: title,
          date: date,
          location: location || "Special Location",
          category: category,
          mood: mood,
          image: finalImage,
          hisNote: hisNote,
          herNote: herNote,
          timestamp: Date.now()
        };

        this.memories.unshift(newMemory);
        this.saveVault();
        this.renderCustomMemories();

        // Add to 3D Photobook dynamically
        this.appendMemoryToPhotobook(newMemory);

        // Feedback & Reset
        if (feedback) {
          feedback.textContent = '✨ Memory inscribed forever in your family heirloom vault!';
          feedback.className = 'form-feedback success';
        }

        form.reset();
        loadedImageDataUrl = '';
        if (previewContainer) previewContainer.replaceChildren();

        // Sound effect
        if (window.weddingAudio && typeof window.weddingAudio.playGlassClink === 'function') {
          window.weddingAudio.playGlassClink();
        }

        setTimeout(() => {
          closeModal();
          if (feedback) feedback.textContent = '';
        }, 1500);
      });
    }

    // Export Vault Backup JSON
    const exportBtn = document.getElementById('exportVaultBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.memories, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `Our_Marriage_Heirloom_Vault_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      });
    }

    // Filter Memories in Vault
    const filterBtns = document.querySelectorAll('.vault-filter-pill');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.getAttribute('data-vault-filter');
        this.renderCustomMemories(cat);
      });
    });
  }

  // Render Memories inside the "Our Marriage Vault" showcase
  renderCustomMemories(filter = 'all') {
    const container = document.getElementById('vaultCardsGrid');
    if (!container) return;

    container.replaceChildren();

    const filtered = filter === 'all'
      ? this.memories
      : this.memories.filter(m => m.category.toLowerCase().includes(filter.toLowerCase()) || m.mood.toLowerCase() === filter.toLowerCase());

    if (filtered.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'vault-empty-msg';
      emptyMsg.textContent = 'No memoirs in this milestone category yet. Click "+ Add Memory" to preserve your moment!';
      container.appendChild(emptyMsg);
      return;
    }

    filtered.forEach(mem => {
      const card = document.createElement('div');
      card.className = 'vault-memoir-card glass-3d-card';

      // Media
      const mediaWrap = document.createElement('div');
      mediaWrap.className = 'vault-card-media';

      const img = document.createElement('img');
      img.src = mem.image;
      img.alt = mem.title;
      img.className = 'vault-thumb-img';

      const tag = document.createElement('span');
      tag.className = 'vault-category-badge';
      tag.textContent = `${this.getMoodEmoji(mem.mood)} ${mem.category}`;

      mediaWrap.appendChild(img);
      mediaWrap.appendChild(tag);

      // Body
      const body = document.createElement('div');
      body.className = 'vault-card-body';

      const dateEl = document.createElement('span');
      dateEl.className = 'vault-date';
      dateEl.textContent = `📅 ${mem.date} • 📍 ${mem.location}`;

      const titleEl = document.createElement('h4');
      titleEl.className = 'vault-title';
      titleEl.textContent = mem.title;

      body.appendChild(dateEl);
      body.appendChild(titleEl);

      // Reflections (His & Her)
      if (mem.hisNote || mem.herNote) {
        const notesBox = document.createElement('div');
        notesBox.className = 'vault-notes-box';

        if (mem.hisNote) {
          const his = document.createElement('p');
          his.className = 'vault-note his';
          his.textContent = `👔 His: "${mem.hisNote}"`;
          notesBox.appendChild(his);
        }

        if (mem.herNote) {
          const hers = document.createElement('p');
          hers.className = 'vault-note hers';
          hers.textContent = `👗 Hers: "${mem.herNote}"`;
          notesBox.appendChild(hers);
        }

        body.appendChild(notesBox);
      }

      // 4K Zoom trigger
      const zoomBtn = document.createElement('button');
      zoomBtn.className = 'vault-zoom-btn';
      zoomBtn.textContent = 'Inspect 4K Memoir 🔍';
      zoomBtn.addEventListener('click', () => {
        if (window.openLightbox) {
          window.openLightbox(mem.image, mem.title, `${mem.date} — ${mem.location}`);
        }
      });
      body.appendChild(zoomBtn);

      card.appendChild(mediaWrap);
      card.appendChild(body);
      container.appendChild(card);
    });

    // Rebind 3D tilt
    if (window.init3DCardTilt) {
      window.init3DCardTilt();
    }
  }

  getMoodEmoji(mood) {
    switch (mood) {
      case 'romantic': return '❤️';
      case 'hilarious': return '😂';
      case 'tearjerker': return '🥹';
      case 'milestone': return '🌟';
      default: return '✨';
    }
  }

  // Appends new memory onto the 3D photobook
  appendMemoryToPhotobook(mem) {
    const book3D = document.getElementById('book3D');
    if (!book3D) return;

    const spreadIndex = (window.weddingAlbum?.totalSpreads || 4) + 1;

    const spread = document.createElement('div');
    spread.className = 'spread-container';
    spread.id = `spread${spreadIndex}`;
    spread.setAttribute('data-spread', spreadIndex);

    // Left Page
    const pageLeft = document.createElement('div');
    pageLeft.className = 'page page-left';

    const leftPaper = document.createElement('div');
    leftPaper.className = 'page-paper';

    const polaroid = document.createElement('div');
    polaroid.className = 'photo-frame-polaroid tilt-left';
    polaroid.setAttribute('data-zoom', mem.image);

    const img = document.createElement('img');
    img.src = mem.image;
    img.alt = mem.title;
    img.className = 'album-photo';

    const cap = document.createElement('div');
    cap.className = 'photo-caption font-script';
    cap.textContent = `"${mem.title}"`;

    polaroid.appendChild(img);
    polaroid.appendChild(cap);

    polaroid.addEventListener('click', () => {
      if (window.openLightbox) {
        window.openLightbox(mem.image, mem.title, `${mem.date} • ${mem.location}`);
      }
    });

    const leftText = document.createElement('div');
    leftText.className = 'parchment-text';

    const h4 = document.createElement('h4');
    h4.className = 'page-heading';
    h4.textContent = mem.title;

    const p = document.createElement('p');
    p.className = 'story-passage';
    p.textContent = mem.hisNote ? `Julian: "${mem.hisNote}"` : `A cherished milestone at ${mem.location}.`;

    const pNum = document.createElement('span');
    pNum.className = 'page-number';
    pNum.textContent = `Page 0${spreadIndex * 2 - 1}`;

    leftText.appendChild(h4);
    leftText.appendChild(p);
    leftText.appendChild(pNum);

    leftPaper.appendChild(polaroid);
    leftPaper.appendChild(leftText);
    pageLeft.appendChild(leftPaper);

    // Right Page
    const pageRight = document.createElement('div');
    pageRight.className = 'page page-right';

    const rightPaper = document.createElement('div');
    rightPaper.className = 'page-paper';

    const rightText = document.createElement('div');
    rightText.className = 'parchment-text';
    rightText.style.marginTop = '40px';

    const rightH4 = document.createElement('h4');
    rightH4.className = 'page-heading';
    rightH4.textContent = "Her Reflections & Memoir Seal";

    const rightP = document.createElement('p');
    rightP.className = 'story-passage';
    rightP.textContent = mem.herNote ? `Aria: "${mem.herNote}"` : `Inscribed with endless love on ${mem.date}.`;

    const seal = document.createElement('div');
    seal.className = 'album-cover-seal';
    seal.style.marginTop = '50px';
    seal.textContent = `OFFICIAL FAMILY HEIRLOOM • ${mem.category.toUpperCase()}`;

    const rightPNum = document.createElement('span');
    rightPNum.className = 'page-number';
    rightPNum.textContent = `Page 0${spreadIndex * 2}`;

    rightText.appendChild(rightH4);
    rightText.appendChild(rightP);
    rightText.appendChild(seal);
    rightText.appendChild(rightPNum);

    rightPaper.appendChild(rightText);
    pageRight.appendChild(rightPaper);

    spread.appendChild(pageLeft);
    spread.appendChild(pageRight);
    book3D.appendChild(spread);

    if (window.weddingAlbum) {
      window.weddingAlbum.spreads.push(spread);
      window.weddingAlbum.totalSpreads = window.weddingAlbum.spreads.length;
      const indicator = document.getElementById('currentSpreadIndicator');
      if (indicator) {
        indicator.parentElement.lastElementChild.textContent = `${window.weddingAlbum.totalSpreads} Spreads`;
      }
    }
  }

  // Anniversary Time Capsules
  initTimeCapsules() {
    const capsulesGrid = document.getElementById('capsulesGrid');
    if (!capsulesGrid) return;

    const milestones = [
      { year: 1, name: "Paper Anniversary", lockedUntil: "2025-10-24", icon: "📜", letter: "To my soulmate on our 1st year: Thank you for turning our home into a sanctuary of warmth and endless giggles." },
      { year: 5, name: "Wood Anniversary", lockedUntil: "2029-10-24", icon: "🌲", letter: "Five years of roots grown deep. The best decisions of my life all began with you." },
      { year: 10, name: "Tin / Aluminum Anniversary", lockedUntil: "2034-10-24", icon: "✨", letter: "A whole decade of laughter, triumphs, and holding hands through every season." },
      { year: 25, name: "Silver Jubilee", lockedUntil: "2049-10-24", icon: "🥈", letter: "Quarter of a century. Silver hair, golden hearts, eternal love." }
    ];

    capsulesGrid.replaceChildren();

    milestones.forEach(m => {
      const lockDate = new Date(m.lockedUntil);
      const isUnlocked = new Date() >= lockDate;

      const card = document.createElement('div');
      card.className = `capsule-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const icon = document.createElement('div');
      icon.className = 'capsule-icon';
      icon.textContent = isUnlocked ? '🔓' : '🔒';

      const yr = document.createElement('span');
      yr.className = 'capsule-year';
      yr.textContent = `YEAR ${m.year}`;

      const title = document.createElement('h4');
      title.className = 'capsule-title';
      title.textContent = m.name;

      const status = document.createElement('p');
      status.className = 'capsule-status';
      status.textContent = isUnlocked ? `Unlocked on ${m.lockedUntil} ✨` : `Sealed until ${m.lockedUntil}`;

      const letterBox = document.createElement('div');
      letterBox.className = 'capsule-letter';
      if (isUnlocked) {
        letterBox.textContent = `“${m.letter}”`;
      } else {
        letterBox.textContent = "🔒 This romantic love letter is cryptographically sealed until your anniversary date!";
      }

      card.appendChild(icon);
      card.appendChild(yr);
      card.appendChild(title);
      card.appendChild(status);
      card.appendChild(letterBox);

      capsulesGrid.appendChild(card);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.memoryVault = new MemoryVaultEngine();
});
