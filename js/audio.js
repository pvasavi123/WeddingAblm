/**
 * JULIAN & ARIA — WEDDING AUDIO ENGINE
 * Generates an ethereal, romantic cinematic piano & string score using Web Audio API
 * Plus sound effects for page flips, glass clinks, and film projector ambiance.
 */

class WeddingAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.masterGain = null;
    this.melodyTimer = null;
    this.isMuted = true;
    this.currentNoteIndex = 0;
    
    // Romantic Chord Progression: Dmaj9 -> Bm7 -> Gmaj7 -> A7sus4 (Cinematic Love Theme)
    this.chords = [
      { root: 146.83, notes: [293.66, 369.99, 440.00, 554.37] }, // D Maj 9 (D3, D4, F#4, A4, C#5)
      { root: 123.47, notes: [246.94, 293.66, 369.99, 440.00] }, // B min 7 (B2, B3, D4, F#4, A4)
      { root: 98.00,  notes: [196.00, 246.94, 293.66, 369.99] }, // G Maj 7 (G2, G3, B3, D4, F#4)
      { root: 110.00, notes: [220.00, 293.66, 329.63, 440.00] }  // A sus4  (A2, A3, D4, E4, A4)
    ];

    this.melodyLine = [
      587.33, 554.37, 440.00, 369.99, // D5, C#5, A4, F#4
      440.00, 493.88, 554.37, 587.33, // A4, B4, C#5, D5
      659.25, 587.33, 554.37, 440.00, // E5, D5, C#5, A4
      493.88, 554.37, 587.33, 739.99  // B4, C#5, D5, F#5
    ];
  }

  initContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMusic() {
    this.initContext();
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  play() {
    this.initContext();
    this.isPlaying = true;
    this.isMuted = false;
    this.masterGain.gain.setTargetAtTime(0.35, this.ctx.currentTime, 0.5);
    this.startThemeLoop();
  }

  stop() {
    this.isPlaying = false;
    this.isMuted = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.5);
    }
    if (this.melodyTimer) {
      clearInterval(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  startThemeLoop() {
    let chordIndex = 0;
    let step = 0;

    const playStep = () => {
      if (!this.isPlaying || !this.ctx) return;

      const now = this.ctx.currentTime;
      // Play warm string pad for the chord
      if (step % 8 === 0) {
        chordIndex = Math.floor(step / 8) % this.chords.length;
        this.playWarmPad(this.chords[chordIndex], now, 3.8);
      }

      // Play soft delicate piano arpeggio note
      const currentChord = this.chords[chordIndex];
      const noteFreq = currentChord.notes[step % currentChord.notes.length];
      this.playPianoNote(noteFreq, now, 0.18, 0.9);

      // Play occasional singing high melody note
      if (step % 2 === 0 && Math.random() > 0.3) {
        const melNote = this.melodyLine[this.currentNoteIndex % this.melodyLine.length];
        this.playPianoNote(melNote, now + 0.1, 0.12, 1.6);
        this.currentNoteIndex++;
      }

      step++;
    };

    playStep();
    this.melodyTimer = setInterval(playStep, 450);
  }

  // Synthesize a warm orchestral string pad
  playWarmPad(chord, startTime, duration) {
    if (!this.ctx) return;
    
    // Play root + notes with slow attack and lush low-pass filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, startTime);
    filter.frequency.linearRampToValueAtTime(700, startTime + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(400, startTime + duration);

    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.001, startTime);
    padGain.gain.linearRampToValueAtTime(0.12, startTime + 1.2);
    padGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    filter.connect(padGain);
    padGain.connect(this.masterGain);

    [chord.root, ...chord.notes.slice(0, 2)].forEach(freq => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);
      // Slight detune for analog string warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 12, startTime);
      osc.connect(filter);
      osc.start(startTime);
      osc.stop(startTime + duration);
    });
  }

  // Synthesize a realistic soft upright/grand piano note
  playPianoNote(freq, startTime, velocity = 0.2, decay = 1.2) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + decay);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq, startTime);
    osc2.detune.setValueAtTime(3, startTime);

    noteGain.gain.setValueAtTime(velocity, startTime);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + decay);

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(startTime);
    osc2.start(startTime);
    osc.stop(startTime + decay);
    osc2.stop(startTime + decay);
  }

  // Synthesize realistic crystal champagne glass clink
  playGlassClink() {
    this.initContext();
    const now = this.ctx.currentTime;
    
    // High resonant bell frequencies (e.g. 2600Hz & 3100Hz)
    const freqs = [2520, 3180, 4200];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 40, now);

      gain.gain.setValueAtTime(0.25 / (idx + 1), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 1.4);
    });
  }

  // Realistic paper album page-turn sound
  playPageTurn() {
    this.initContext();
    const now = this.ctx.currentTime;

    // Filtered pink/white noise burst
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.linearRampToValueAtTime(600, now + 0.3);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.35);
  }
}

// Global instance
window.weddingAudio = new WeddingAudioEngine();
