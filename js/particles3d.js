/**
 * JULIAN & ARIA — 3D AMBIENT PARTICLES & BOKEH ENGINE
 * Renders depth-aware golden dust, cinematic bokeh orbs, and floating rose petals
 */

class AmbientParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.petals = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.scrollSpeed = 0;
    this.lastScrollY = window.scrollY;

    this.resize();
    this.initParticles();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  initParticles() {
    this.particles = [];
    // 90 Gold dust particles across 3D Z-depth layers (0.1 to 1.5)
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: 0.2 + Math.random() * 1.3, // depth
        radius: 0.8 + Math.random() * 2.5,
        baseAlpha: 0.15 + Math.random() * 0.65,
        alpha: 0.4,
        pulseSpeed: 0.01 + Math.random() * 0.025,
        pulseOffset: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.4, // float gently upwards
        color: Math.random() > 0.3 ? '212, 175, 55' : '247, 231, 180'
      });
    }

    // 16 Cinematic Glowing Bokeh Orbs
    this.bokehOrbs = [];
    for (let i = 0; i < 16; i++) {
      this.bokehOrbs.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        z: 0.1 + Math.random() * 0.5,
        radius: 30 + Math.random() * 70,
        alpha: 0.04 + Math.random() * 0.07,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.15 - Math.random() * 0.25,
        color: Math.random() > 0.5 ? '212, 175, 55' : '230, 160, 175'
      });
    }

    // 12 Delicate Falling Rose Petals
    this.petals = [];
    for (let i = 0; i < 14; i++) {
      this.petals.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: 9 + Math.random() * 12,
        angle: Math.random() * 360,
        angularSpeed: (Math.random() - 0.5) * 1.8,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayOffset: Math.random() * Math.PI * 2,
        vy: 0.6 + Math.random() * 0.8,
        vx: 0.3,
        opacity: 0.35 + Math.random() * 0.4
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initParticles();
    });

    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX - this.width / 2) / (this.width / 2);
      this.targetMouseY = (e.clientY - this.height / 2) / (this.height / 2);
    });

    window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;
      this.scrollSpeed = (currentScroll - this.lastScrollY) * 0.1;
      this.lastScrollY = currentScroll;
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Smooth mouse lerping
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Decay scroll speed
    this.scrollSpeed *= 0.92;

    const time = Date.now() * 0.001;

    // 1. Draw Large Blurred Bokeh Orbs
    this.bokehOrbs.forEach(orb => {
      orb.x += orb.vx + this.mouseX * orb.z * 0.4;
      orb.y += orb.vy - this.scrollSpeed * orb.z;

      if (orb.y < -orb.radius) orb.y = this.height + orb.radius;
      if (orb.x < -orb.radius) orb.x = this.width + orb.radius;
      if (orb.x > this.width + orb.radius) orb.x = -orb.radius;

      const grad = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
      grad.addColorStop(0, `rgba(${orb.color}, ${orb.alpha})`);
      grad.addColorStop(0.7, `rgba(${orb.color}, ${orb.alpha * 0.4})`);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Draw Floating 3D Gold Dust Particles
    this.particles.forEach(p => {
      // Depth-based movement
      p.x += p.vx + this.mouseX * p.z * 0.8;
      p.y += p.vy - this.scrollSpeed * p.z * 0.5;

      // Wrap boundaries
      if (p.y < 0) p.y = this.height;
      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;

      // Twinkle alpha
      p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(time * 2 + p.pulseOffset));

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
      this.ctx.shadowBlur = 10 * p.z;
      this.ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      this.ctx.fill();
      this.ctx.shadowBlur = 0; // reset
    });

    // 3. Draw Soft Falling Rose Petals
    this.petals.forEach(petal => {
      petal.y += petal.vy + Math.abs(this.scrollSpeed) * 0.3;
      petal.x += Math.sin(time + petal.swayOffset) * 0.9 + this.mouseX * 0.5;
      petal.angle += petal.angularSpeed;

      if (petal.y > this.height + 20) {
        petal.y = -20;
        petal.x = Math.random() * this.width;
      }

      this.ctx.save();
      this.ctx.translate(petal.x, petal.y);
      this.ctx.rotate((petal.angle * Math.PI) / 180);

      // Render organic rose petal curve
      this.ctx.beginPath();
      this.ctx.moveTo(0, -petal.size * 0.5);
      this.ctx.bezierCurveTo(
        petal.size * 0.7, -petal.size * 0.8,
        petal.size * 0.9, petal.size * 0.4,
        0, petal.size
      );
      this.ctx.bezierCurveTo(
        -petal.size * 0.9, petal.size * 0.4,
        -petal.size * 0.7, -petal.size * 0.8,
        0, -petal.size * 0.5
      );

      const petalGrad = this.ctx.createLinearGradient(0, -petal.size, 0, petal.size);
      petalGrad.addColorStop(0, `rgba(215, 125, 140, ${petal.opacity})`);
      petalGrad.addColorStop(0.7, `rgba(180, 80, 100, ${petal.opacity * 0.9})`);
      petalGrad.addColorStop(1, `rgba(140, 50, 75, ${petal.opacity * 0.7})`);

      this.ctx.fillStyle = petalGrad;
      this.ctx.fill();
      this.ctx.restore();
    });

    requestAnimationFrame(this.animate);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AmbientParticleEngine('ambientCanvas');
});
