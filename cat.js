"use strict";
(() => {
  const rigs = new Map();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const states = ['idle', 'blink', 'watch', 'stretch', 'sleep', 'wave'];
  class Cat {
    constructor(button) {
      this.el = button; this.svg = button.querySelector('svg');
      this.resting = button.hasAttribute('data-cat-resting');
      this.variant = button.dataset.catVariant || (this.resting ? 'sleeping' : 'interactive');
      this.decorative = this.variant !== 'interactive';
      this.abort = new AbortController(); this.baseState = this.resting ? 'sleep' : 'idle'; this.override = false;
      this.manualPaused = false; this.scenePaused = Boolean(button.closest('[data-motion]'));
      this.sceneCalm = false; this.inView = !('IntersectionObserver' in window);
      this.timer = null; this.lookFrame = null; this.pointer = null;
      this.toggle = button.closest('[data-cat-area]')?.querySelector('[data-cat-toggle]');
      if (!this.decorative) button.disabled = false;
      button.classList.add('is-cat-ready');
      const options = { signal: this.abort.signal };
      if (!this.decorative) {
        button.addEventListener('click', () => this.preview('wave', 2900), options);
        document.addEventListener('pointermove', (event) => {
          if (event.pointerType === 'touch') return;
          this.pointer = { x: event.clientX, y: event.clientY };
          this.scheduleLook();
        }, { ...options, passive: true });
        document.addEventListener('pointerout', (event) => {
          if (!event.relatedTarget) { this.pointer = null; this.resetLook(); }
        }, options);
        window.addEventListener('scroll', () => this.scheduleLook(), { ...options, passive: true });
        window.addEventListener('resize', () => this.scheduleLook(), { ...options, passive: true });
        window.addEventListener('blur', () => { this.pointer = null; this.resetLook(); }, options);
        button.addEventListener('focus', () => {
          if (!this.calm() && !this.manualPaused) this.preview('watch', 1200);
        }, options);
      }
      if (this.toggle) {
        this.toggle.hidden = false;
        this.toggle.addEventListener('click', () => {
          this.manualPaused = !this.manualPaused; this.sync();
        }, options);
      }
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          this.inView = entries[0].isIntersecting; this.sync();
        }, { threshold: 0 });
        // Observe the stable layout box, never an animated SVG body part.
        this.observer.observe(button.closest('[data-cat-area]') || button);
      }
      button.dataset.catState = this.baseState;
      this.sync();
    }
    calm() { return reduced.matches || this.sceneCalm; }
    scheduleLook() {
      if (!this.pointer || this.decorative || this.calm() || this.lookFrame !== null || this.el.classList.contains('is-cat-stopped') || this.el.dataset.catState === 'sleep') return;
      this.lookFrame = requestAnimationFrame(() => {
        this.lookFrame = null;
        if (!this.pointer || this.calm() || this.el.classList.contains('is-cat-stopped') || this.el.dataset.catState === 'sleep') return;
        const rect = this.el.getBoundingClientRect();
        // Follow the viewport pointer relative to the face, with bounded motion.
        const dx = this.pointer.x - (rect.left + rect.width * 106 / 220);
        const dy = this.pointer.y - (rect.top + rect.height * 80 / 210);
        const x = Math.max(-1, Math.min(1, dx / Math.max(rect.width * 1.5, window.innerWidth * .35)));
        const y = Math.max(-1, Math.min(1, dy / Math.max(rect.height * 1.5, window.innerHeight * .4)));
        this.svg.style.setProperty('--look-x', `${(x * 3).toFixed(3)}px`);
        this.svg.style.setProperty('--look-y', `${(y * 2).toFixed(3)}px`);
        this.svg.style.setProperty('--head-look', `${(x * 4).toFixed(3)}deg`);
      });
    }
    resetLook() { ['--look-x', '--look-y', '--head-look'].forEach((key) => this.svg.style.removeProperty(key)); }
    setScene(pose, running, calm) {
      this.baseState = states[pose] || 'idle'; this.scenePaused = !running; this.sceneCalm = calm;
      if (!this.override) this.el.dataset.catState = this.baseState;
      this.sync();
    }
    preview(state, duration = 2600) {
      clearTimeout(this.timer);
      this.override = true; this.el.dataset.catState = states.includes(state) ? state : 'idle';
      this.sync();
      // A requested action is one finite animation, including a soft return.
      if (!this.calm()) this.timer = setTimeout(() => {
        this.el.dataset.catState = this.baseState;
        this.timer = setTimeout(() => { this.override = false; this.sync(); }, 850);
      }, duration);
    }
    cancelPreview() {
      clearTimeout(this.timer); this.override = false;
      this.el.dataset.catState = this.baseState; this.sync();
    }
    sync() {
      const hidden = !this.inView || document.hidden || Boolean(this.el.closest('[hidden]'));
      const stopped = hidden || this.calm() || this.manualPaused || (this.scenePaused && !this.override);
      this.el.classList.toggle('is-cat-stopped', stopped);
      this.el.classList.toggle('is-cat-calm', this.calm());
      if (this.calm()) this.resetLook();
      if (!stopped) this.scheduleLook();
      if (this.toggle) {
        this.toggle.disabled = reduced.matches;
        this.toggle.textContent = reduced.matches ? 'Calm mode' : this.manualPaused ? 'Resume cat' : 'Pause cat';
        const label = this.decorative ? `${this.variant} cat` : 'cat';
        this.toggle.setAttribute('aria-label', reduced.matches ? `Reduced motion is enabled for the ${label}` : `${this.manualPaused ? 'Resume' : 'Pause'} ${label} animation`);
        this.toggle.setAttribute('aria-pressed', String(this.manualPaused || reduced.matches));
      }
    }
    destroy() {
      clearTimeout(this.timer);
      if (this.lookFrame !== null) cancelAnimationFrame(this.lookFrame);
      this.abort.abort(); this.observer?.disconnect(); rigs.delete(this.el);
    }
  }
  function init(root = document) {
    root.querySelectorAll('[data-cat-rig]').forEach((button) => { if (!rigs.has(button)) rigs.set(button, new Cat(button)); });
  }
  function destroy(root) { [...rigs.values()].filter((cat) => root.contains(cat.el)).forEach((cat) => cat.destroy()); }
  function sync() { rigs.forEach((cat) => cat.sync()); }
  document.addEventListener('visibilitychange', sync); reduced.addEventListener('change', sync);
  window.PortfolioCat = Object.freeze({ init, destroy, sync, states, get: (element) => rigs.get(element) });
  init();
})();
