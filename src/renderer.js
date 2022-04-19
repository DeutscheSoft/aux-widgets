/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import {
  FRAME_SHIFT,
  PHASE_MASK,
  PHASE_RENDER,
  PHASE_CALCULATE,
} from './scheduler/scheduler.js';
import {
  getFirstBit,
  getLimbMask,
  createBitset,
  setBit,
  testBit,
  clearBit,
  createBitList,
  setBitList,
  getBitIndex,
  printBitMask,
} from './scheduler/bitset.js';

function buildDependencyMap(tasks) {
  const m = new Map();

  tasks.forEach((task, i) => {
    task.dependencies.forEach((dependency) => {
      let tmp = m.get(dependency);

      if (!tmp) {
        tmp = [0, []];
        m.set(dependency, tmp);
      }

      tmp[0] |= 1 << task.phase;
      tmp[1].push(i);
    });
  });

  return new Map(
    Array.from(m.entries()).map(([dependency, tmp]) => {
      return [dependency, [tmp[0], createBitList(tmp[1])]];
    })
  );
}

function findAnimation(animations, task) {
  return animations.find((animation) => animation.task === task);
}

function removeAnimation(animations, task) {
  for (let i = 0; i < animations.length; i++) {
    const animation = animations[i];

    if (animation.task === task) {
      animations.splice(i, 1);
    }
  }
}

function makeAnimation(frame, phase, run, task) {
  return { frame, phase, run, task };
}

export function deferRender(callback) {
  return [0, PHASE_RENDER, callback];
}

export function deferMeasure(callback) {
  return [0, PHASE_CALCULATE, callback];
}

export function deferRenderNext(callback) {
  return [1, PHASE_RENDER, callback];
}

export function deferMeasureNext(callback) {
  return [1, PHASE_CALCULATE, callback];
}

export function combineDefer(...args) {
  args = args.filter((arg) => Array.isArray(arg));

  if (args.length === 0) return null;
  if (args.length === 1) return args[0];

  const [frameOffset, phase] = args[0];

  for (let i = 1; i < args.length; i++) {
    if (args[i][0] !== args[0][0] || args[i][1] !== args[0][1])
      throw Error('Different defer calls cannot be combined.');
  }

  const callbacks = args.map((entry) => entry[2]);

  return [
    frameOffset,
    phase,
    () => {
      return combineDefer(...callbacks.map((cb) => cb()));
    },
  ];
}

export class Renderer {
  constructor() {
    // list of tasks
    this.tasks = [];

    // this maps dependencies (e.g. option names) to a
    // phase mask and a bitlist of tasks which depend on that
    // dependency
    this._dependencyMap = null;
  }

  getDependencyMap() {
    let dependencyMap = this._dependencyMap;

    if (dependencyMap) return dependencyMap;

    return (this._dependencyMap = buildDependencyMap(this.tasks));
  }

  run(frame, phase, runnable, animations, context) {
    let mask = 0;

    const tasks = this.tasks;

    // first run all runnable tasks
    for (let i = 0, iN = runnable.length; i < iN; i++) {
      let tmp = runnable[i];

      while (tmp !== 0) {
        const j = getFirstBit(tmp);
        const index = getBitIndex(i, j);

        //console.log('mask %d -> %d. index: %d', tmp, tmp & ~getLimbMask(j), index);

        tmp &= ~getLimbMask(j);

        if (getFirstBit(tmp) === j) throw new Error('boo');

        const task = tasks[index];

        // Check if the task is in the right phase
        if (task.phase !== phase) continue;

        removeAnimation(animations, task);

        try {
          //context.log('Running task %o', task);

          const result = task.run.call(context);

          if (result !== void 0) {
            if (typeof result === 'function') {
              animations.push(makeAnimation(frame, phase, result, task));
              mask |= 1 << phase;
              //context.log('Adding animation', makeAnimation(frame, phase, result, task));
            } else if (Array.isArray(result)) {
              const [frameOffset, phase, func] = result;
              animations.push(
                makeAnimation(frame + frameOffset, phase, func, task)
              );

              mask |= 1 << (phase + frameOffset * FRAME_SHIFT);
              //context.log('Adding animation', makeAnimation(frame + frameOffset, phase, func, task));
            }
          }
        } catch (err) {
          console.error('A task %o threw an error: %o', task, err);
        }

        // clear the bit
        runnable[i] &= ~getLimbMask(j);
      }
    }

    //context.log('Running animations: %o', animations.slice(0));

    // Now run all animations
    for (let i = 0; i < animations.length; i++) {
      const animation = animations[i];

      if (animation.phase !== phase) continue;

      if (animation.frame !== frame) {
        if (animation.frame < frame)
          console.error('Animation was never run: %o', animation);
        continue;
      }

      let stop = false;

      try {
        //context.log('Running animation %o', animation);

        const result = animation.run.call(context);

        if (result === null || result === void 0) {
          //console.log('Stopping animation', animation);
          stop = true;
        } else if (typeof result === 'function') {
          animation.run = result;
          animation.frame += 1;
          mask |= 1 << (phase + FRAME_SHIFT);
        } else if (Array.isArray(result)) {
          const [frameOffset, _phase, func] = result;

          animation.frame += frameOffset;
          animation.phase = _phase;
          animation.run = func;

          //console.log('Animation reschedule', result);
          mask |= 1 << (_phase + frameOffset * FRAME_SHIFT);
        }
      } catch (err) {
        console.error('An animation %o threw an error: %o', animation, err);
        stop = true;
      }

      if (stop) {
        //context.log('Animation %o stopped', animation);
        // animation is done.
        animations.splice(i, 1);
        i--;
      }
    }

    return mask;
  }

  addTask(task) {
    this.tasks.push(task);
  }

  scheduleTasks(dependency, runnable) {
    const tmp = this.getDependencyMap().get(dependency);

    if (tmp !== void 0) {
      const [mask, list] = tmp;
      setBitList(runnable, list);
      return mask;
    } else {
      return 0;
    }
  }

  scheduleAll(runnable) {
    let mask = 0;
    const tasks = this.tasks;

    for (let i = 0; i < tasks.length; i++) {
      mask |= 1 << tasks[i].phase;

      setBit(runnable, i);
    }

    return mask;
  }

  get taskCount() {
    return this.tasks.length;
  }
}

/**
 * Possible (rendering) task patterns.
 *
 * - Simple: Some options change which results in some DOM manipulation to
 *   happen (e.g. a CSS class being set or removed).
 *
 * - Multi-Phase rendering: Some options change which results in some DOM
 *   manipulation, however that manipulation may have to inspect styles or
 *   measure dimensions, which requires it to be scheduled into different
 *   phases.
 *
 * - Animations: An animation runs after some options changed (e.g. a meter
 *   falling) or continuously.
 *
 * - Recalculations: Some synthetic options are calculated based on some other
 *   options being changed. This usually needs to run on demand before all
 *   other tasks.
 *
 * - A resize (or some other non option dependency) triggers some tasks to run
 *   which need to be scheduled before possible dom modifications. That will
 *   usually trigger some internal options to be changed.
 *
 */

export function defineTask(phase, dependencies, run, debug) {
  if (!debug) debug = false;

  if (!Array.isArray(dependencies)) dependencies = [dependencies];

  const optionNames = dependencies.filter((dep) => typeof dep === 'string');

  if (optionNames.length) {
    const arglistIn = optionNames.join(', ');
    const arglistOut = ['this', ...optionNames].join(', ');

    run = new Function(
      'renderFunction',
      `
      return function () {
        const { ${arglistIn} } = this.options;
        return renderFunction.call(${arglistOut});
      };
    `
    )(run);
  }

  return {
    phase,
    dependencies,
    run,
    _dependencies: null,
    debug,
  };
}

export function defineRender(dependencies, run, debug) {
  return defineTask(PHASE_RENDER, dependencies, run, debug);
}

export function defineRecalculation(dependencies, run, debug) {
  return defineTask(PHASE_CALCULATE, dependencies, run, debug);
}

export function defineMeasure(dependencies, run, debug) {
  return defineRecalculation(dependencies, run, debug);
}

export function defineMultiPhaseRenderer(phase, dependencies, run, debug) {
  return defineTask(phase, dependencies, run, debug);
}

// Merges the masks of two frames
function mergeFrames(mask) {
  return (PHASE_MASK & mask) | (mask >> FRAME_SHIFT);
}

function notCalledError() {
  throw new Error('Not called in last frame.');
}

export class RenderState {
  constructor(scheduler, renderer, context) {
    this._runnable = createBitset(renderer.taskCount);
    this._animations = [];
    this._scheduled = 0;
    this._frame = 0;
    this._renderer = renderer;
    this._scheduler = scheduler;
    this._context = context;
    this._paused = true;
    this._pscheduled = 0;
    this._pframe = 0;
    this._run = (frame, phase) => {
      let scheduled = this._scheduled;

      //this.log('run(%d, %d)', frame, phase);

      if (frame !== this._frame) {
        if (scheduled & PHASE_MASK)
          notCalledError();

        scheduled >>= FRAME_SHIFT;
        //this.log('%d -> %d', this._scheduled, scheduled);
        this._frame = frame;

        if (!(scheduled & PHASE_MASK))
          throw new Error('Called but not scheduled.');
      }

      scheduled &= ~(1 << phase);
      this._scheduled = scheduled;

      if (!this._paused) {
        const { _renderer, _runnable, _animations, _context } = this;

        //this.log('Starting renderer.');

        const mask = _renderer.run(
          frame,
          phase,
          _runnable,
          _animations,
          _context
        );

        if (mask) this._schedule(mask);
      }
    };
    this.invalidateAll();
  }

  log(fmt, ...args) {
    this._context.log(fmt, ...args);
  }

  _adjustFrame() {
    const { _scheduler, _frame } = this;
    const frame = _scheduler.frame;

    if (_frame === frame) return false;

    if (this._scheduled & PHASE_MASK)
      notCalledError();

    this._scheduled >>= FRAME_SHIFT;
    this._frame = frame;
    return true;
  }

  _schedule(mask) {
    if (this._paused) {
      this._pscheduled |= mask;
    } else {
      this._adjustFrame();

      const { _scheduler, _scheduled } = this;

      mask &= ~_scheduled;

      if (mask === 0) return;

      _scheduler.schedule(mask, this._run);

      //this.log('scheduling for %d. Frame %d -> %d', mask, this._frame, frame);

      this._scheduled |= mask;
    }
  }

  invalidate(dependency) {
    const mask = this._renderer.scheduleTasks(dependency, this._runnable);

    if (mask) {
      //this.log('Scheduling for mask %d', mask);
      this._schedule(mask);
    }
  }

  invalidateAll() {
    const mask = this._renderer.scheduleAll(this._runnable);

    if (mask) this._schedule(mask);
  }

  getSchedulingStatus() {
    const { _frame, _scheduled, _runnable } = this;
    return {
      frame: _frame,
      scheduled: _scheduled,
      runnable: printBitMask(_runnable),
    };
  }

  pause() {
    if (this._paused) return;
    this._paused = true;
    this._pscheduled = this._scheduled;
    this._pframe = this._frame;
  }

  unpause() {
    if (!this._paused) return;
    this._paused = false;

    if (this._adjustFrame())
      this._animations.forEach((animation) => {
        if (animation.frame < this._frame)
          animation.frame = this._frame;
      });

    let pscheduled = this._pscheduled;
    const scheduled = this._scheduled;

    if (pscheduled === scheduled) return;

    const pframe = this._pframe;
    const frame = this._frame;

    if (pframe !== frame)
      pscheduled = (PHASE_MASK & pscheduled) | (pscheduled >> FRAME_SHIFT);

    if (pscheduled === scheduled) return;

    this._schedule(pscheduled);
  }

  isPaused() {
    return this._paused;
  }
}

export function getRenderers(Class) {
  if (!Class) return [];

  const parentRenderers = getRenderers(Object.getPrototypeOf(Class));
  const renderers = Class.renderers;

  return renderers ? parentRenderers.concat(renderers) : parentRenderers;
}
