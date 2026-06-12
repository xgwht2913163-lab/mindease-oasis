/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class MentalAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private nodes: {
    solfeggio?: { osc: OscillatorNode; gain: GainNode };
    binaural?: { oscL: OscillatorNode; oscR: OscillatorNode; gain: GainNode };
    noise?: { source: AudioWorkletNode | ScriptProcessorNode; gain: GainNode; filter: BiquadFilterNode; lfo: OscillatorNode };
    bowlTimer?: any;
  } = {};

  private volumes: {
    solfeggio: number;
    binaural: number;
    noise: number;
    bell: number;
  } = {
    solfeggio: 0.0,
    binaural: 0.0,
    noise: 0.0,
    bell: 0.0,
  };

  private initContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Set individual volumes (0 to 1)
  public setVolume(channel: "solfeggio" | "binaural" | "noise" | "bell", value: number) {
    this.volumes[channel] = value;
    this.updateChannelVolume(channel);
  }

  public getVolume(channel: "solfeggio" | "binaural" | "noise" | "bell"): number {
    return this.volumes[channel];
  }

  private updateChannelVolume(channel: "solfeggio" | "binaural" | "noise" | "bell") {
    if (!this.ctx) return;
    const vol = this.volumes[channel];

    // Solfeggio 528Hz Tone
    if (channel === "solfeggio") {
      if (vol > 0) {
        if (!this.nodes.solfeggio) this.startSolfeggio();
        if (this.nodes.solfeggio) {
          // Smooth volume transition using exponential ramp
          this.nodes.solfeggio.gain.gain.setTargetAtTime(vol * 0.15, this.ctx.currentTime, 0.2);
        }
      } else {
        this.stopSolfeggio();
      }
    }

    // Binaural Beat (150Hz / 158Hz)
    if (channel === "binaural") {
      if (vol > 0) {
        if (!this.nodes.binaural) this.startBinaural();
        if (this.nodes.binaural) {
          this.nodes.binaural.gain.gain.setTargetAtTime(vol * 0.2, this.ctx.currentTime, 0.2);
        }
      } else {
        this.stopBinaural();
      }
    }

    // Brown Noise (Deep breathing wind)
    if (channel === "noise") {
      if (vol > 0) {
        if (!this.nodes.noise) this.startNoise();
        if (this.nodes.noise) {
          this.nodes.noise.gain.gain.setTargetAtTime(vol * 0.45, this.ctx.currentTime, 0.2);
        }
      } else {
        this.stopNoise();
      }
    }

    // Chime Bells
    if (channel === "bell") {
      if (vol > 0) {
        this.startBowlChimeInterval();
      } else {
        this.stopBowlChimeInterval();
      }
    }
  }

  // --- SOLFEGGIO 528HZ DRONE ---
  private startSolfeggio() {
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(528, this.ctx.currentTime); // 528Hz repair frequency

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    // Warm vibrato modulation (detuning LFO)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // very slow swell (0.12 Hz)
    lfoGain.gain.setValueAtTime(4, this.ctx.currentTime); // detune slightly

    lfo.connect(lfoGain);
    lfoGain.connect(osc.detune);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start();
    osc.start();

    // Set initial volume
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    
    this.nodes.solfeggio = { osc, gain };
  }

  private stopSolfeggio() {
    if (this.nodes.solfeggio) {
      try {
        this.nodes.solfeggio.osc.stop();
      } catch (e) {}
      delete this.nodes.solfeggio;
    }
  }

  // --- BINAURAL MEDITATION BEAT (Alpha wave 8Hz rhythm) ---
  private startBinaural() {
    this.initContext();
    if (!this.ctx) return;

    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    oscL.type = "sine";
    oscL.frequency.setValueAtTime(140, this.ctx.currentTime); // Left ear 140Hz

    oscR.type = "sine";
    oscR.frequency.setValueAtTime(148, this.ctx.currentTime); // Right ear 148Hz (Creates 8Hz Alpha beat)

    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    if (pannerL && pannerR) {
      pannerL.pan.setValueAtTime(-1, this.ctx.currentTime);
      pannerR.pan.setValueAtTime(1, this.ctx.currentTime);

      oscL.connect(pannerL);
      pannerL.connect(gain);

      oscR.connect(pannerR);
      pannerR.connect(gain);
    } else {
      oscL.connect(gain);
      oscR.connect(gain);
    }

    gain.connect(this.ctx.destination);

    oscL.start();
    oscR.start();

    this.nodes.binaural = { oscL, oscR, gain };
  }

  private stopBinaural() {
    if (this.nodes.binaural) {
      try {
        this.nodes.binaural.oscL.stop();
        this.nodes.binaural.oscR.stop();
      } catch (e) {}
      delete this.nodes.binaural;
    }
  }

  // --- DEEP OCEAN BROWN NOISE SYSTHESIS ---
  private startNoise() {
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Generate Brownian noise mathematically: cumulative random walk with decay.
    // It creates a very soft rumble like distant waterfalls or ocean waves.
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5; // Amplify slightly for buffer
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(350, this.ctx.currentTime);

    // Dynamic Ocean Rhythm LFO: modulates the filter cutoff to simulate waves breaking
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.1, this.ctx.currentTime); // 10s wave cycle
    lfoGain.gain.setValueAtTime(150, this.ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    lfo.start();
    noiseSource.start();

    gain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.nodes.noise = { source: noiseSource as any, gain, filter, lfo };
  }

  private stopNoise() {
    if (this.nodes.noise) {
      try {
        (this.nodes.noise.source as any).stop();
        this.nodes.noise.lfo.stop();
      } catch (e) {}
      delete this.nodes.noise;
    }
  }

  // --- SINGING BOWL GENTLE RING (Triggerable and periodic) ---
  private startBowlChimeInterval() {
    if (this.nodes.bowlTimer) return;
    
    // Play immediately first
    this.playBowlChime();

    // Chime periodically every 15 seconds
    this.nodes.bowlTimer = setInterval(() => {
      this.playBowlChime();
    }, 15000);
  }

  private stopBowlChimeInterval() {
    if (this.nodes.bowlTimer) {
      clearInterval(this.nodes.bowlTimer);
      delete this.nodes.bowlTimer;
    }
  }

  public playBowlChime() {
    this.initContext();
    if (!this.ctx || this.volumes.bell === 0) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator(); // Overtones to make it sounds like brass
    const gain = this.ctx.createGain();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(440, now); // Core fundamental (La tone)

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(440 * 1.5, now); // Pure harmonic fifth overtones (660Hz)

    const masterGainVal = this.volumes.bell * 0.35;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(masterGainVal, now + 0.1); // Quick attack
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.0); // Very long, soothing delay decay (6s)

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1000, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 6.5);
    osc2.stop(now + 6.5);
  }

  public stopAll() {
    this.volumes = { solfeggio: 0, binaural: 0, noise: 0, bell: 0 };
    this.stopSolfeggio();
    this.stopBinaural();
    this.stopNoise();
    this.stopBowlChimeInterval();
  }
}

export const audioSynth = new MentalAudioSynthesizer();
