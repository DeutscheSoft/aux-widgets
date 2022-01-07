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
  Scheduler, MASK_CALCULATE, MASK_RENDER,
  PHASE_CALCULATE, PHASE_RENDER
} from '../src/scheduler/scheduler.js';

import { makeCallback } from './helpers.js';

function schedule(callback) {
  Promise.resolve().then(callback);
}

describe('Scheduler', () => {
  const onError = makeCallback();
  const scheduler = new Scheduler(schedule, onError);

  it('schedule() basic', async () => {
    // Schedule a function
    const cb = makeCallback();
    const frame = scheduler.frame;

    scheduler.schedule(MASK_CALCULATE, cb);
    scheduler.schedule(MASK_RENDER, cb);
    scheduler.schedule(MASK_RENDER, cb);
    scheduler.schedule(MASK_CALCULATE, cb);
    cb.assertCalls(0);
    await scheduler.waitForFrame();
    cb.assertCalls(4);
    cb.assertArgs(frame, PHASE_CALCULATE);
    cb.assertArgs(frame, PHASE_CALCULATE);
    cb.assertArgs(frame, PHASE_RENDER);
    cb.assertArgs(frame, PHASE_RENDER);
    onError.assertCalls(0);
  });

  it('schedule() reentrant', async () => {
    // Reschedule a function from run().
    const frame = scheduler.frame;
    let cb;
    let first = true;
    cb = makeCallback(() => {
      if (first) {
        scheduler.schedule(MASK_CALCULATE, cb);
        scheduler.schedule(MASK_RENDER, cb);
        first = false;
      }
    });

    scheduler.schedule(MASK_RENDER, cb);
    cb.assertCalls(0);
    await scheduler.waitForFrame();
    cb.assertCalls(3);
    cb.assertArgs(frame, PHASE_RENDER);
    cb.assertArgs(frame, PHASE_RENDER);
    cb.assertArgs(frame, PHASE_CALCULATE);
    onError.assertCalls(0);
  });

  it('error handling', async () => {
    // Error handling.
    const frame = scheduler.frame;
    const err = new Error('Ignore.');
    const cb = makeCallback(() => {
      throw err;
    });
    scheduler.schedule(MASK_RENDER, cb);
    scheduler.schedule(MASK_RENDER, cb);
    scheduler.schedule(MASK_CALCULATE, cb);
    cb.assertCalls(0);
    await scheduler.waitForFrame();
    cb.assertCalls(3);
    cb.assertArgs(frame, PHASE_CALCULATE);
    cb.assertArgs(frame, PHASE_RENDER);
    cb.assertArgs(frame, PHASE_RENDER);
    onError.assertCalls(3);
    onError.assertArgs(scheduler, cb, err);
    onError.assertArgs(scheduler, cb, err);
    onError.assertArgs(scheduler, cb, err);
  });

  it('reschedule into next frame', async () => {
    // Reschedule a function from run()
    // into the next frame.
    const frame = scheduler.frame;
    let cb;
    let first = true;
    cb = makeCallback(() => {
      if (first) {
        scheduler.scheduleNext(MASK_CALCULATE, cb);
        scheduler.scheduleNext(MASK_RENDER, cb);
        first = false;
      }
    });

    scheduler.schedule(MASK_RENDER, cb);
    cb.assertCalls(0);
    await scheduler.waitForFrame();
    cb.assertCalls(1);
    cb.assertArgs(frame, PHASE_RENDER);
    await scheduler.waitForFrame();
    cb.assertCalls(2);
    cb.assertArgs(frame+1, PHASE_CALCULATE);
    cb.assertArgs(frame+1, PHASE_RENDER);
    onError.assertCalls(0);
  });

  if (false)
  it('recursion detection', async () => {
    // Test that recursively scheduling the same callback
    // is being detected.
    let cb;
    cb = makeCallback(() => {
      scheduler.schedule(MASK_RENDER, cb);
    });
    scheduler.schedule(MASK_RENDER, cb);
    await scheduler.waitForFrame();
    onError.assertCalls(1);
  });
});

