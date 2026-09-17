"use strict";
// Pure timing and diagram model; independent of DOM, network, and frame rate.
((root) => {
  const duration = 10;
  const stages = Object.freeze([
    { start: 0, id: "input", text: "Receiving the client input.", request: "active", validate: "ready", branches: ["ready", "ready", "ready"], cat: 0 },
    { start: 1.25, id: "validate", text: "Checking the model response.", request: "done", validate: "active", branches: ["ready", "ready", "ready"], cat: 2 },
    { start: 2.6, id: "parallel", text: "Running three branches in parallel.", request: "done", validate: "done", branches: ["active", "active", "active"], cat: 2 },
    { start: 4.1, id: "failed", text: "A and B are complete. C needs a retry.", request: "done", validate: "done", branches: ["done", "done", "failed"], cat: 2 },
    { start: 5.25, id: "retry", text: "Retrying C. Completed work is kept.", request: "done", validate: "done", branches: ["done", "done", "retry"], cat: 2 },
    { start: 6.65, id: "merge", text: "All branches passed. Assembling the result.", request: "done", validate: "done", branches: ["done", "done", "done"], cat: 5 },
    { start: 8, id: "complete", text: "Validated JSON is ready.", request: "done", validate: "done", branches: ["done", "done", "done"], cat: 3 },
    { start: 9, id: "rest", text: "Complete. Only the failed request was retried.", request: "done", validate: "done", branches: ["done", "done", "done"], cat: 4 },
  ].map((stage) => Object.freeze({ ...stage, branches: Object.freeze(stage.branches) })));
  function stateAt(seconds) {
    const time = Math.max(0, Math.min(duration, Number(seconds) || 0));
    let index = 0;
    while (index + 1 < stages.length && time >= stages[index + 1].start) index++;
    const end = stages[index + 1]?.start ?? duration;
    return { ...stages[index], index, fraction: Math.min(1, (time - stages[index].start) / (end - stages[index].start)) };
  }
  class Timeline {
    constructor() { this.elapsed = 0; this.startedAt = 0; this.running = false; }
    value(now) { return Math.min(duration, this.elapsed + (this.running ? Math.max(0, now - this.startedAt) / 1000 : 0)); }
    play(now) { if (this.running) return; if (this.elapsed >= duration) this.elapsed = 0; this.startedAt = now; this.running = true; }
    pause(now) { this.elapsed = this.value(now); this.running = false; }
    seek(seconds) { this.elapsed = Math.max(0, Math.min(duration, Number(seconds) || 0)); this.running = false; }
  }
  // Diagram coordinates match the responsive wire SVG; these are paths, not data.
  const paths = {
    input: [[[25,110],[210,110]]],
    validate: [[[290,110],[810,110]]],
    parallel: [[[810,165],[810,230],[180,230],[180,340]], [[810,165],[810,230],[500,230],[500,340]], [[810,165],[810,230],[820,230],[820,340]]],
    retry: [[[910,340],[955,340],[955,250],[820,250],[820,290]]],
    merge: [[[180,390],[180,470],[780,470],[780,550]], [[500,390],[500,470],[780,470],[780,550]], [[820,390],[820,470],[780,470],[780,550]]],
  };
  function pointOnPath(points, fraction) {
    const lengths = points.slice(1).map((point, i) => Math.hypot(point[0] - points[i][0], point[1] - points[i][1]));
    let distance = Math.max(0, Math.min(1, fraction)) * lengths.reduce((sum, n) => sum + n, 0);
    for (let i = 0; i < lengths.length; i++) {
      if (distance <= lengths[i]) { const f = lengths[i] ? distance / lengths[i] : 0; return [points[i][0] + f * (points[i + 1][0] - points[i][0]), points[i][1] + f * (points[i + 1][1] - points[i][1])]; }
      distance -= lengths[i];
    }
    return points.at(-1);
  }
  root.PortfolioMotionModel = Object.freeze({ duration, stages, stateAt, Timeline, paths, pointOnPath });
})(typeof window === "undefined" ? globalThis : window);
