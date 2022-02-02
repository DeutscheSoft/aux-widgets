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
  Scheduler,
  MASK_CALCULATE,
  MASK_RENDER,
  PHASE_CALCULATE,
  PHASE_RENDER,
} from '../src/scheduler/scheduler.js';
import { Renderer, RenderState, defineRender, defineMeasure, deferRender, deferRenderNext } from '../src/renderer.js';
import { makeCallback } from './helpers.js';

function schedule(callback) {
  Promise.resolve().then(callback);
}

function makeScheduler() {
  const onError = (err) => console.error(err);
  return new Scheduler(schedule, onError);
}

describe.only('Renderer', () => {
  it('animations survive pause', async () => {
    const scheduler = makeScheduler();
    const renderer = new Renderer();
    const state = new RenderState(scheduler, renderer, this);
    const Dependency = {};

    const taskCb = makeCallback();
    const animateCb = makeCallback();

    renderer.addTask(defineRender([ Dependency ], function () {
      taskCb();

      function animate() {
        animateCb(); 
        return deferRenderNext(animate);
      };

      return deferRender(animate);
    }));

    taskCb.assertCalls(0);
    animateCb.assertCalls(0);
    await scheduler.waitForFrame();
    taskCb.assertCalls(0);
    animateCb.assertCalls(0);

    state.invalidate(Dependency);
    await scheduler.waitForFrame();
    taskCb.assertCalls(0);
    animateCb.assertCalls(0);
    state.unpause();
    await scheduler.waitForFrame();
    taskCb.assertCalls(1);
    animateCb.assertCalls(1);
    state.pause();
    await scheduler.waitForFrame();
    taskCb.assertCalls(1);
    animateCb.assertCalls(1);
    state.unpause();
    await scheduler.waitForFrame();
    taskCb.assertCalls(1);
    animateCb.assertCalls(2);
    state.pause();
  });
});
