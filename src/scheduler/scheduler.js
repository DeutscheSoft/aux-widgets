export const PHASE_NONE = 0x7fffffff;
export const PHASE_CALCULATE = 0;
export const PHASE_RENDER = 1;
export const PHASE_MIN = PHASE_CALCULATE;
export const PHASE_MAX = PHASE_RENDER;
export const PHASE_MASK = 3;
export const FRAME_SHIFT = 2;
export const MASK_RENDER = 1 << PHASE_RENDER;
export const MASK_CALCULATE = 1 << PHASE_CALCULATE;

function phaseName(phase) {
  switch (phase) {
    case PHASE_NONE:
      return 'NONE';
    case PHASE_CALCULATE:
      return 'CALCULATE';
    case PHASE_RENDER:
      return 'RENDER';
    default:
      throw new TypeError('Unknown phase: ' + phase);
  }
}

const defaultSchedule = requestAnimationFrame.bind(window);

function handleError(scheduler, fun, error) {
  console.error(
    'Scheduler(%o) Task %o threw an error: %o',
    scheduler.getStatus(),
    fun,
    error
  );
}

function qSize(q) {
  return q ? q.length : 0;
}

/*
 * Scheduler
 */
export class Scheduler {
  constructor(schedule, onError) {
    this._queues = [];
    this._scheduled = false;
    this._running = false;
    this._phase = PHASE_NONE;
    this._frame = 0;
    this._schedule = schedule || defaultSchedule;
    this._onError = onError || handleError;
    this._trap = null;
    this._now = 0;
    this._run = () => {
      this._scheduled = false;
      this._running = true;
      this._phase = PHASE_NONE;
      this._now = performance.now();
      const frame = this._frame;
      this.run(frame);
      this._running = false;
      this._frame = (frame + 1) | 0;
    };
  }

  get frame() {
    return this._frame;
  }

  now() {
    return this._running ? this._now : performance.now();
  }

  schedule(phaseMask, callback) {
    const { _queues } = this;
    let frameOffset = 0;

    phaseMask |= 0;

    if (phaseMask === 0) return this._frame;

    if (this._trap !== null && phaseMask & PHASE_MASK)
      this._checkTrap(callback);

    do {
      for (let phase = PHASE_MIN; phase <= PHASE_MAX; phase++) {
        if (!(phaseMask & (1 << phase))) continue;

        const index = phase + frameOffset * FRAME_SHIFT;

        const q = _queues[index];

        if (q) {
          q.push(callback);
        } else {
          _queues[index] = [callback];
        }
      }

      frameOffset++;
      phaseMask >>= FRAME_SHIFT;
    } while (phaseMask);

    const { _running, _scheduled } = this;

    if (!_scheduled) {
      if (!_running || frameOffset) {
        this._scheduled = true;
        this._schedule(this._run);
      }
    }

    return this._frame;
  }

  scheduleNext(phaseMask, callback) {
    this.schedule(phaseMask << FRAME_SHIFT, callback);
  }

  log(fmt, ...args) {
    return;
    console.log('Scheduler(%o): ' + fmt, this.getStatus(), ...args);
  }

  getStatus() {
    const { _scheduled, _running, _phase, _frame } = this;
    return {
      scheduled: _scheduled,
      running: _running,
      phase: phaseName(_phase),
      frame: _frame,
    };
  }

  waitForFrame() {
    return new Promise((resolve) => {
      this.schedule(1 << PHASE_CALCULATE, resolve);
    });
  }

  run(frame) {
    const { _queues } = this;

    //this.log('Frame %d', frame);

    let iterations = 0;
    const trapThreshold =
      100 +
      10 * (qSize(_queues[PHASE_CALCULATE]) + qSize(_queues[PHASE_RENDER]));

    do {
      for (let phase = PHASE_MIN; phase <= PHASE_MAX; phase++) {
        const q = _queues[phase];

        if (!q) {
          //this.log('No tasks for phase %d', phase);
          continue;
        }

        this._phase = phase;

        //this.log('Running %d tasks in phase %d', q.length, phase);

        for (let i = 0; i < q.length; i++) {
          const fun = q[i];

          try {
            fun(frame, phase);
          } catch (err) {
            this._onError(this, fun, err);
          }

          iterations++;

          if (false && iterations === trapThreshold) this._installTrap();
        }

        //this.log('ran %d tasks.', q.length);

        q.length = 0;
      }
    } while (qSize(_queues[PHASE_CALCULATE]));

    let length = _queues.length;

    // Move the current queues to the back
    if (length > FRAME_SHIFT) {
      // Note: this code assumes FRAME_SHIFT == 2
      let q1 = _queues[PHASE_CALCULATE];
      let q2 = _queues[PHASE_RENDER];

      length -= 2;

      for (let i = 0; i < length; i += 2) {
        _queues[i] = _queues[i + 2];
        _queues[i + 1] = _queues[i + 3];
      }

      _queues[length + PHASE_CALCULATE] = q1;
      _queues[length + PHASE_RENDER] = q2;
    }

    if (false && iterations >= trapThreshold) this._removeTrap();
  }

  _installTrap() {
    this._trap = new Set();
  }

  _removeTrap() {
    this._trap.clear();
    this._trap = null;
  }

  _checkTrap(callback) {
    const trap = this._trap;

    if (trap.has(callback)) throw new Error('Callback recursively scheduled.');

    trap.add(callback);
  }
}
