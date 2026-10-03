/**
 * JULIAN & ARIA — 4K CINEMATIC FILM SUITE & AUTOMATED TOUR ENGINE
 * Simulates high-frame-rate 4K film motion with Ken Burns 3D panning,
 * anamorphic lens flares, dynamic Ambilight glow, and interactive controls.
 */

class CinemaFilmPlayer {
  constructor() {
    this.canvas = document.getElementById('cinemaVideoCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.overlay = document.getElementById('videoOverlay');
    this.bigPlayBtn = document.getElementById('bigPlayBtn');
    this.playPauseBtn = document.getElementById('ctrlPlayPause');
    this.scrubBar = document.getElementById('scrubBar');
    this.scrubContainer = document.getElementById('scrubContainer');
    this.hudTime = document.getElementById('hudTime');
    this.currentSceneTitle = document.getElementById('currentSceneTitle');
    this.ambilight = document.getElementById('playerAmbilight');
    this.sceneBtns = document.querySelectorAll('.scene-skip-btn');
    this.fullscreenBtn = document.getElementById('ctrlFullscreen');

    this.scenes = [
      {
        id: 0,
        title: "The Autumn Rain Encounter in Paris",
        sub: "Scene I • Café de Flore, Montmartre",
        src: "assets/images/first_date.jpg",
        color: "235, 175, 120",
        panX: 0.05, panY: 0.02, zoomSpeed: 0.0003
      },
      {
        id: 1,
        title: "The Pacific Sunset Proposal",
        sub: "Scene II • Big Sur Ocean Cliffs",
        src: "assets/images/proposal.jpg",
        color: "245, 150, 90",
        panX: -0.04, panY: 0.03, zoomSpeed: 0.00025
      },
      {
        id: 2,
        title: "The Vows at Villa Balbiano",
        sub: "Scene III • Lake Como, Italy",
        src: "assets/images/vows_altar.jpg",
        color: "212, 175, 55",
        panX: 0.02, panY: -0.04, zoomSpeed: 0.00035
      },
      {
        id: 3,
        title: "Dancing Under Glasshouse Chandeliers",
        sub: "Scene IV • Conservatory Ballroom",
        src: "assets/images/first_dance.jpg",
        color: "250, 200, 110",
        panX: -0.03, panY: -0.02, zoomSpeed: 0.0003
      },
      {
        id: 4,
        title: "The Amalfi Coastline Getaway",
        sub: "Scene V • 1958 Convertible into Sunset",
        src: "assets/images/getaway.jpg",
        color: "255, 160, 110",
        panX: 0.06, panY: -0.01, zoomSpeed: 0.0003
      }
    ];

    this.currentSceneIndex = 2; // Default to the iconic Vows
    this.isPlaying = false;
    this.progress = 0.35; // 0 to 1
    this.duration = 270; // 4 mins 30 secs
    this.loadedImages = {};
    this.filmTime = 0;

    this.init();
  }

  init() {
    this.preloadSceneImages();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.bindControls();
    this.updateSceneDisplay();
    this.renderFrame();
  }

  preloadSceneImages() {
    this.scenes.forEach(scene => {
      const img = new Image();
      img.src = scene.src;
      img.onload = () => {
        this.loadedImages[scene.id] = img;
        if (scene.id === this.currentSceneIndex) {
          this.renderFrame();
        }
      };
    });
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width > 0) {
      this.canvas.width = rect.width * (window.devicePixelRatio || 1);
      this.canvas.height = rect.height * (window.devicePixelRatio || 1);
      this.renderFrame();
    }
  }

  bindControls() {
    // Big Play Button
    if (this.bigPlayBtn) {
      this.bigPlayBtn.addEventListener('click', () => this.togglePlayback());
    }

    // Small Play/Pause HUD button
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => this.togglePlayback());
    }

    // Hero Watch Trailer button
    const heroBtn = document.getElementById('heroPlayFilmBtn');
    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        const filmSec = document.getElementById('filmSection');
        if (filmSec) {
          filmSec.scrollIntoView({ behavior: 'smooth' });
          setTimeout(() => {
            if (!this.isPlaying) this.togglePlayback();
          }, 600);
        }
      });
    }

    // Scene Selector Buttons
    this.sceneBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const sceneId = parseInt(btn.getAttribute('data-scene'), 10);
        this.changeScene(sceneId);
      });
    });

    // Scrubber click seeking
    if (this.scrubContainer) {
      this.scrubContainer.addEventListener('click', (e) => {
        const rect = this.scrubContainer.getBoundingClientRect();
        const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        this.progress = pos;
        this.updateScrubber();
      });
    }

    // Fullscreen toggle
    if (this.fullscreenBtn) {
      this.fullscreenBtn.addEventListener('click', () => {
        const screen = document.getElementById('cinemaScreen');
        if (!document.fullscreenElement) {
          screen.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  togglePlayback() {
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      if (this.overlay) this.overlay.classList.add('playing');
      if (this.playPauseBtn) this.playPauseBtn.textContent = '❚❚';
      // Also start musical score if muted
      if (window.weddingAudio && !window.weddingAudio.isPlaying) {
        window.weddingAudio.play();
        const status = document.getElementById('audioStatus');
        if (status) status.textContent = 'Soundtrack: Playing';
      }
      this.startPlaybackLoop();
    } else {
      if (this.overlay) this.overlay.classList.remove('playing');
      if (this.playPauseBtn) this.playPauseBtn.textContent = '▶';
    }
  }

  changeScene(sceneId) {
    if (sceneId < 0 || sceneId >= this.scenes.length) return;
    this.currentSceneIndex = sceneId;
    this.filmTime = 0; // reset camera pan
    this.progress = sceneId / this.scenes.length;

    this.sceneBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-scene'), 10) === sceneId);
    });

    this.updateSceneDisplay();
    this.renderFrame();
  }

  updateSceneDisplay() {
    const scene = this.scenes[this.currentSceneIndex];
    if (this.currentSceneTitle) {
      this.currentSceneTitle.textContent = scene.title;
    }
    const sceneBadge = document.querySelector('.scene-badge');
    if (sceneBadge) {
      const roman = ['I', 'II', 'III', 'IV', 'V'][scene.id] || 'I';
      sceneBadge.textContent = `SCENE ${roman}`;
    }

    // Update dynamic Ambilight Glow color
    if (this.ambilight) {
      this.ambilight.style.background = `radial-gradient(ellipse at center, rgba(${scene.color}, 0.3) 0%, rgba(${scene.color}, 0.1) 50%, transparent 80%)`;
    }
  }

  startPlaybackLoop() {
    const loop = () => {
      if (!this.isPlaying) return;

      this.filmTime += 0.016;
      this.progress += 0.016 / this.duration;

      if (this.progress >= 1) {
        this.progress = 0;
      }

      // Check if progress should advance scene
      const expectedScene = Math.floor(this.progress * this.scenes.length);
      if (expectedScene !== this.currentSceneIndex && this.scenes[expectedScene]) {
        this.currentSceneIndex = expectedScene;
        this.sceneBtns.forEach(btn => {
          btn.classList.toggle('active', parseInt(btn.getAttribute('data-scene'), 10) === expectedScene);
        });
        this.updateSceneDisplay();
      }

      this.updateScrubber();
      this.renderFrame();

      requestAnimationFrame(loop);
    };

    requestAnimationFrame(loop);
  }

  updateScrubber() {
    if (this.scrubBar) {
      this.scrubBar.style.width = `${this.progress * 100}%`;
    }
    if (this.hudTime) {
      const currentSec = Math.floor(this.progress * this.duration);
      const m = Math.floor(currentSec / 60);
      const s = currentSec % 60;
      this.hudTime.textContent = `0${m}:${s < 10 ? '0' : ''}${s} / 04:30`;
    }
  }

  renderFrame() {
    if (!this.ctx) return;
    const w = this.canvas.width;
    const h = this.canvas.height;
    if (w === 0 || h === 0) return;

    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, w, h);

    const img = this.loadedImages[this.currentSceneIndex];
    const scene = this.scenes[this.currentSceneIndex];

    if (img && img.complete) {
      // Ken Burns 3D camera pan & zoom effect
      const t = this.filmTime;
      const zoom = 1 + (t * scene.zoomSpeed) % 0.12;
      const panX = Math.sin(t * 0.4) * (w * 0.04);
      const panY = Math.cos(t * 0.3) * (h * 0.025);

      this.ctx.save();
      this.ctx.translate(w / 2 + panX, h / 2 + panY);
      this.ctx.scale(zoom, zoom);

      // Draw image centered
      const imgAspect = img.width / img.height;
      const canvasAspect = w / h;
      let drawW, drawH;

      if (imgAspect > canvasAspect) {
        drawH = h * 1.1;
        drawW = drawH * imgAspect;
      } else {
        drawW = w * 1.1;
        drawH = drawW / imgAspect;
      }

      this.ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      this.ctx.restore();

      // Cinematic Anamorphic Optical Glare & Vignette
      const grad = this.ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, w * 0.65);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.8, 'rgba(0, 0, 0, 0.4)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, w, h);

      // Subtle warm anamorphic horizontal lens flare
      const flareY = h * 0.38 + Math.sin(t * 0.5) * (h * 0.05);
      const flareGrad = this.ctx.createLinearGradient(0, flareY - 4, 0, flareY + 4);
      flareGrad.addColorStop(0, 'rgba(212, 175, 55, 0)');
      flareGrad.addColorStop(0.5, 'rgba(255, 235, 180, 0.22)');
      flareGrad.addColorStop(1, 'rgba(212, 175, 55, 0)');
      this.ctx.fillStyle = flareGrad;
      this.ctx.fillRect(0, flareY - 4, w, 8);
    }
  }
}

/**
 * AUTOMATED CINEMA EXPERIENCE / TOUR
 * Smoothly navigates the user through the website like a 4K wedding documentary
 */
class CinemaTourEngine {
  constructor() {
    this.tourBtn = document.getElementById('cinemaTourBtn');
    this.isTourRunning = false;
    this.tourStep = 0;
    this.tourTimeout = null;

    this.steps = [
      { id: 'hero', duration: 4000, desc: 'Prologue: Julian & Aria' },
      { id: 'filmSection', duration: 6000, desc: 'The 4K Wedding Film' },
      { id: 'albumSection', duration: 7000, desc: 'The 3D Leather Photobook' },
      { id: 'loveStory', duration: 8000, desc: 'The Realistic Love Story' },
      { id: 'gallery', duration: 6000, desc: '3D Fine Art Memoirs' },
      { id: 'celebration', duration: 5000, desc: 'The Italian Festivities' },
      { id: 'wishes', duration: 4000, desc: 'Words of Warmth' }
    ];

    if (this.tourBtn) {
      this.tourBtn.addEventListener('click', () => this.toggleTour());
    }
  }

  toggleTour() {
    if (this.isTourRunning) {
      this.stopTour();
    } else {
      this.startTour();
    }
  }

  startTour() {
    this.isTourRunning = true;
    document.body.classList.add('cinema-mode-active');
    if (this.tourBtn) {
      this.tourBtn.classList.add('active');
      const text = this.tourBtn.querySelector('.btn-text');
      if (text) text.textContent = 'Exit Cinema Mode';
    }

    // Start background music
    if (window.weddingAudio && !window.weddingAudio.isPlaying) {
      window.weddingAudio.play();
      const status = document.getElementById('audioStatus');
      if (status) status.textContent = 'Soundtrack: Playing';
    }

    this.tourStep = 0;
    this.runNextStep();
  }

  stopTour() {
    this.isTourRunning = false;
    document.body.classList.remove('cinema-mode-active');
    if (this.tourBtn) {
      this.tourBtn.classList.remove('active');
      const text = this.tourBtn.querySelector('.btn-text');
      if (text) text.textContent = 'Cinema Experience';
    }
    if (this.tourTimeout) {
      clearTimeout(this.tourTimeout);
      this.tourTimeout = null;
    }
  }

  runNextStep() {
    if (!this.isTourRunning || this.tourStep >= this.steps.length) {
      this.stopTour();
      return;
    }

    const current = this.steps[this.tourStep];
    const el = document.getElementById(current.id);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Special action if reaching 3D Album
      if (current.id === 'albumSection' && window.weddingAlbum) {
        setTimeout(() => {
          window.weddingAlbum.setSpread(1);
          setTimeout(() => {
            if (this.isTourRunning) window.weddingAlbum.setSpread(2);
          }, 3000);
        }, 1200);
      }

      // Special action if reaching Video Film
      if (current.id === 'filmSection' && window.cinemaPlayer) {
        setTimeout(() => {
          if (!window.cinemaPlayer.isPlaying) {
            window.cinemaPlayer.togglePlayback();
          }
        }, 1000);
      }
    }

    this.tourTimeout = setTimeout(() => {
      this.tourStep++;
      this.runNextStep();
    }, current.duration);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.cinemaPlayer = new CinemaFilmPlayer();
  window.cinemaTour = new CinemaTourEngine();
});
