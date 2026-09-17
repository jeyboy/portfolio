"use strict";
(() => {
  const model = window.PortfolioMotionModel;
  const instances = new Set();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const labels = { ready: "Ready", active: "Running", done: "Complete", failed: "Check failed", retry: "Retrying" };

  class Scene {
    constructor(element) {
      this.el = element;
      this.clock = new model.Timeline();
      this.abort = new AbortController();
      this.manualCalm = false;
      this.inView = false;
      this.autoPaused = false;
      this.autoAttempted = false;
      this.frame = null;
      this.lastStage = null;
      this.lastCatState = null;
      this.play = element.querySelector('[data-action="play"]');
      this.pause = element.querySelector('[data-action="pause"]');
      this.calm = element.querySelector('[data-action="calm"]');
      this.cat = window.PortfolioCat?.get(element.querySelector('[data-cat-rig]'));
      this.packets = [...element.querySelectorAll('[data-packet]')];
      element.querySelector('.motion-controls').hidden = false;
      const options = { signal: this.abort.signal };
      this.play.addEventListener('click', () => this.start(), options);
      this.pause.addEventListener('click', () => { this.autoPaused = false; this.stop(); this.announce("Animation paused."); }, options);
      this.calm.addEventListener('click', () => {
        this.manualCalm = !this.manualCalm;
        this.applyPreference();
        this.announce(this.isCalm() ? "Calm mode. Use Next step to inspect the flow." : "Motion enabled. Press Play to start.");
      }, options);
      this.applyPreference();
      this.tick = (now) => {
        this.frame = null;
        if (!this.el.isConnected) { this.destroy(); return; }
        if (this.clock.value(now) >= model.duration) {
          this.clock.pause(now);
          this.announce("Workflow complete. Completed requests were kept during the retry.");
        }
        this.render(now);
        if (this.clock.running) this.frame = requestAnimationFrame(this.tick);
      };
      if ("IntersectionObserver" in window) {
        this.observer = new IntersectionObserver((entries) => {
          this.inView = entries[0].isIntersecting;
          this.syncVisibility();
          if (this.inView && !this.autoAttempted && element.dataset.autoplay === "true") {
            this.autoAttempted = true;
            if (!this.isCalm() && !document.hidden) this.start(false);
          }
        }, { threshold: .2 });
        this.observer.observe(element);
      } else {
        this.inView = true; // The complete scene remains manually playable.
      }
      this.render(performance.now());
    }
    isCalm() { return this.manualCalm || reduced.matches; }
    announce(text) { this.el.querySelector('[data-motion-announcement]').textContent = text; }
    applyPreference() {
      if (this.isCalm()) { this.stop(); this.autoPaused = false; }
      this.el.classList.toggle('is-calm', this.isCalm());
      this.calm.setAttribute('aria-pressed', String(this.isCalm()));
      this.calm.disabled = reduced.matches;
      this.calm.title = reduced.matches ? 'Reduced motion is enabled in your device settings.' : '';
      this.render(performance.now());
    }
    start(manual = true) {
      const now = performance.now();
      this.autoPaused = false;
      this.cat?.cancelPreview();
      if (this.isCalm()) {
        const state = model.stateAt(this.clock.value(now));
        this.clock.seek(model.stages[(state.index + 1) % model.stages.length].start);
        this.render(now);
        this.announce(model.stateAt(this.clock.value(now)).text);
        return;
      }
      if (this.clock.running) this.clock.seek(0);
      this.clock.play(now);
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.tick(now);
      if (manual) this.announce('Playing the workflow illustration.');
    }
    stop() {
      this.cat?.cancelPreview();
      this.clock.pause(performance.now());
      if (this.frame !== null) cancelAnimationFrame(this.frame);
      this.frame = null;
      this.render(performance.now());
    }
    syncVisibility() {
      const visible = this.inView && !document.hidden && !this.el.closest('[hidden]');
      if (!visible && this.clock.running) { this.autoPaused = true; this.stop(); }
      else if (visible && this.autoPaused && !this.isCalm()) { this.autoPaused = false; this.start(false); }
    }
    showPose(pose, milliseconds = 1400) {
      this.cat?.preview(window.PortfolioCat.states[pose], milliseconds);
    }
    render(now) {
      const time = this.clock.value(now);
      const state = model.stateAt(time);
      this.el.dataset.stage = state.id;
      this.el.classList.toggle('is-running', this.clock.running);
      this.el.classList.toggle('is-paused', !this.clock.running);
      if (this.lastStage !== state.index) {
        this.lastStage = state.index;
        this.el.querySelector('[data-motion-status]').textContent = state.text;
        this.el.querySelector('[data-step]').textContent = `${String(state.index + 1).padStart(2, '0')} / 08`;
        this.el.querySelector('[data-node="request"]').dataset.state = state.request;
        this.el.querySelector('[data-node="validate"]').dataset.state = state.validate;
        state.branches.forEach((status, i) => {
          this.el.querySelector(`[data-branch="${i}"]`).dataset.state = status;
          this.el.querySelector(`[data-branch-status="${i}"]`).textContent = labels[status];
        });
        this.el.querySelector('[data-output]').dataset.state = state.index >= 6 ? 'done' : 'ready';
      }
      this.el.querySelector('[data-progress]').style.transform = `scaleX(${time / model.duration})`;
      const catState = `${state.cat}:${this.clock.running}:${this.isCalm()}`;
      if (this.lastCatState !== catState) {
        this.lastCatState = catState;
        this.cat?.setScene(state.cat, this.clock.running, this.isCalm());
      }
      const paths = model.paths[state.id] || [];
      this.packets.forEach((packet, index) => {
        const path = paths[index];
        packet.style.display = path ? '' : 'none';
        if (path) {
          const point = model.pointOnPath(path, state.fraction);
          packet.setAttribute('cx', point[0]); packet.setAttribute('cy', point[1]);
          packet.setAttribute('fill', state.id === 'retry' ? '#9b660f' : '#08766c');
        }
      });
      this.play.textContent = this.isCalm() ? 'Next step' : this.clock.running ? 'Restart' : time >= model.duration ? 'Replay' : time > 0 ? 'Resume' : 'Play';
      this.pause.disabled = !this.clock.running || this.isCalm();
    }
    destroy() {
      this.stop(); this.abort.abort(); this.observer?.disconnect();
      delete this.el.dataset.motionInitialized; instances.delete(this);
    }
  }

  function init(root = document) {
    window.PortfolioCat?.init(root);
    root.querySelectorAll('[data-motion]').forEach((element) => {
      if (!element.dataset.motionInitialized) { element.dataset.motionInitialized = 'true'; instances.add(new Scene(element)); }
    });
    const lab = root.querySelector('[data-motion-lab]');
    if (lab && !lab.dataset.initialized) {
      lab.dataset.initialized = 'true';
      const tabs = [...lab.querySelectorAll('[role="tab"]')];
      function select(tab, focus = false) {
        tabs.forEach((button) => {
          const active = button === tab;
          button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
          lab.querySelector('#' + button.getAttribute('aria-controls')).hidden = !active;
        });
        instances.forEach((scene) => scene.syncVisibility());
        window.PortfolioCat?.sync();
        if (focus) tab.focus();
      }
      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', (event) => {
          let next;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          if (next !== undefined) { event.preventDefault(); select(tabs[next], true); }
        });
      });
      lab.querySelectorAll('[data-pose]').forEach((button) => button.addEventListener('click', () => {
        const panel = button.closest('[role="tabpanel"]');
        const scene = [...instances].find((instance) => panel.contains(instance.el));
        if (scene) { scene.autoPaused = false; scene.stop(); scene.showPose(Number(button.dataset.pose), 2200); }
      }));
    }
    root.querySelectorAll('.stack-motion').forEach((stage) => {
      if (stage.dataset.stackInitialized) return;
      stage.dataset.stackInitialized = 'true';
      const animations = [];
      stage.querySelectorAll('.tech-orbit').forEach((button) => {
        const animate = () => {
          if (reduced.matches) return;
          button.classList.remove('is-playing'); void button.offsetWidth; button.classList.add('is-playing');
        };
        animations.push(animate);
        ['pointerenter', 'focus', 'click'].forEach((event) => button.addEventListener(event, animate));
        button.addEventListener('animationend', (event) => {
          if (event.animationName === 'icon-orbit') button.classList.remove('is-playing');
        });
      });
      stage.querySelector('[data-stack-play]')?.addEventListener('click', () => animations.forEach((animate) => animate()));
    });
  }
  function destroy(root) {
    [...instances].filter((scene) => root.contains(scene.el)).forEach((scene) => scene.destroy());
    window.PortfolioCat?.destroy(root);
  }
  document.addEventListener('visibilitychange', () => instances.forEach((scene) => scene.syncVisibility()));
  reduced.addEventListener('change', () => instances.forEach((scene) => scene.applyPreference()));
  window.PortfolioMotion = Object.freeze({ init, destroy });
  init();
})();
