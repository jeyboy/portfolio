/* Timing/recovery invariants; this is not a browser layout test. */
const assert = require('node:assert/strict');
require('../motion-model.js');
const { Timeline, duration, stateAt, paths, pointOnPath } = globalThis.PortfolioMotionModel;
const clock = new Timeline();
clock.play(1000);
assert.equal(clock.value(3000), 2);
clock.pause(3000);
assert.equal(clock.value(99000), 2, 'Paused time must not advance in a hidden tab');
clock.play(100000);
assert.equal(clock.value(101250), 3.25, 'Resume must continue rather than restart');
clock.pause(101250);
clock.seek(5.8);
assert.equal(stateAt(clock.value(200000)).id, 'retry');
clock.play(200000);
assert.equal(clock.value(299999), duration, 'A long frame must clamp at completion');
clock.pause(299999);
clock.play(300000);
assert.equal(clock.value(300000), 0, 'Replay must start from the beginning');
for (let t = 4.1; t <= duration; t += .013) {
  const state = stateAt(t);
  assert.equal(state.branches[0], 'done', 'Completed A must not rerun');
  assert.equal(state.branches[1], 'done', 'Completed B must not rerun');
}
assert.equal(stateAt(5.25).branches[2], 'retry');
assert.equal(stateAt(6.65).branches[2], 'done');
assert.ok(stateAt(7.99).index < 6, 'The result must wait until branch validation finishes');
assert.equal(stateAt(8).id, 'complete');
assert.equal(stateAt(-1).index, 0);
assert.equal(stateAt(1000).id, 'rest');
for (const group of Object.values(paths)) for (const path of group) {
  assert.deepEqual(pointOnPath(path, 0), path[0]);
  assert.deepEqual(pointOnPath(path, 1), path.at(-1));
  for (const fraction of [.1, .4, .8]) assert.ok(pointOnPath(path, fraction).every(Number.isFinite));
}
console.log('Motion checks passed: pause/resume, replay, long-frame recovery, completed-branch retention, output ordering, path endpoints.');
