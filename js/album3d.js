/**
 * JULIAN & ARIA — 3D INTERACTIVE PHOTOBOOK / ALBUM ENGINE
 * Provides 3D perspective manipulation, page-turn physics, and spread management
 */

class WeddingAlbum3D {
  constructor() {
    this.bookContainer = document.getElementById('book3D');
    this.perspectiveWrapper = document.getElementById('bookPerspective');
    this.coverPage = document.getElementById('coverPage');
    this.startFlippingBtn = document.getElementById('startFlippingBtn');
    this.prevBtn = document.getElementById('prevPageBtn');
    this.nextBtn = document.getElementById('nextPageBtn');
    this.spreadIndicator = document.getElementById('currentSpreadIndicator');

    this.spreads = [
      document.getElementById('spread1'),
      document.getElementById('spread2'),
      document.getElementById('spread3'),
      document.getElementById('spread4')
    ];

    this.currentSpread = 0; // 0 = Cover closed, 1 = Spread 1, 2 = Spread 2, 3 = Spread 3
    this.totalSpreads = this.spreads.length;

    this.init();
  }

  init() {
    if (!this.bookContainer) return;

    this.bindEvents();
    this.bind3DMouseTilt();
    this.updateSpreadState();
  }

  bindEvents() {
    // Open cover button
    if (this.startFlippingBtn) {
      this.startFlippingBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openCover();
      });
    }

    // Cover click itself to open
    if (this.coverPage) {
      this.coverPage.addEventListener('click', () => {
        if (this.currentSpread === 0) {
          this.openCover();
        }
      });
    }

    // Next page button
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        if (this.currentSpread < this.totalSpreads) {
          this.setSpread(this.currentSpread + 1);
        }
      });
    }

    // Prev page button
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        if (this.currentSpread > 0) {
          this.setSpread(this.currentSpread - 1);
        }
      });
    }

    // Direct HUD / Nav Open Album
    const directBtn = document.getElementById('openAlbumDirectBtn');
    if (directBtn) {
      directBtn.addEventListener('click', () => {
        const albumSec = document.getElementById('albumSection');
        if (albumSec) {
          albumSec.scrollIntoView({ behavior: 'smooth' });
          if (this.currentSpread === 0) {
            setTimeout(() => this.openCover(), 600);
          }
        }
      });
    }

    // Click on Polaroid photos inside album to view in 4K Lightbox
    document.querySelectorAll('.photo-frame-polaroid').forEach(frame => {
      frame.addEventListener('click', (e) => {
        const imgPath = frame.getAttribute('data-zoom');
        const caption = frame.querySelector('.photo-caption')?.textContent || 'Wedding Memoir';
        const heading = frame.closest('.page')?.querySelector('.page-heading')?.textContent || 'Photobook Detail';
        if (window.openLightbox && imgPath) {
          window.openLightbox(imgPath, heading, caption);
        }
      });
    });
  }

  openCover() {
    this.setSpread(1);
  }

  setSpread(index) {
    if (window.weddingAudio && typeof window.weddingAudio.playPageTurn === 'function') {
      window.weddingAudio.playPageTurn();
    }

    this.currentSpread = index;
    this.updateSpreadState();
  }

  updateSpreadState() {
    // 0: Cover closed
    if (this.currentSpread === 0) {
      if (this.coverPage) {
        this.coverPage.classList.remove('flipped');
        this.coverPage.classList.add('active');
      }
      this.spreads.forEach(spread => spread && spread.classList.remove('active'));
      if (this.prevBtn) this.prevBtn.disabled = true;
      if (this.nextBtn) this.nextBtn.disabled = false;
      if (this.spreadIndicator) this.spreadIndicator.textContent = 'Cover';
    } else {
      // Book is opened to spread
      if (this.coverPage) {
        this.coverPage.classList.add('flipped');
        this.coverPage.classList.remove('active');
      }

      this.spreads.forEach((spread, idx) => {
        if (spread) {
          if (idx === this.currentSpread - 1) {
            spread.classList.add('active');
            spread.scrollTop = 0;
          } else {
            spread.classList.remove('active');
          }
        }
      });

      if (this.prevBtn) this.prevBtn.disabled = false;
      if (this.nextBtn) this.nextBtn.disabled = (this.currentSpread >= this.totalSpreads);
      if (this.spreadIndicator) this.spreadIndicator.textContent = `Spread ${this.currentSpread}`;
    }
  }

  // Realistic 3D Gyroscopic & Mouse Tilt
  bind3DMouseTilt() {
    if (!this.perspectiveWrapper) return;

    this.perspectiveWrapper.addEventListener('mousemove', (e) => {
      if (window.innerWidth < 768 || window.matchMedia('(hover: none)').matches) return;
      const rect = this.perspectiveWrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const rotY = (x / (rect.width / 2)) * 8; // -8 to 8 deg
      const rotX = -(y / (rect.height / 2)) * 6; // -6 to 6 deg

      if (this.bookContainer) {
        this.bookContainer.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    });

    this.perspectiveWrapper.addEventListener('mouseleave', () => {
      if (this.bookContainer) {
        this.bookContainer.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.weddingAlbum = new WeddingAlbum3D();
});
