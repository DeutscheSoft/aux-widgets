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

import { domScheduler } from '../dom_scheduler.js';
import { MASK_CALCULATE, MASK_RENDER } from '../scheduler/scheduler.js';

/**
 * Evaluate size of scroll bars. The size is set as CSS variable
 * `--aux-scrollbar-size` on the `body` element.
 * @returns {void}
 * @function scrollbarSize
 */
let scrollbarMeasured = false;
let scheduled = false;

function measureScrollbarSize() {
  const div = document.createElement('div');
  div.classList.add('aux-widget');
  div.style.overflow = 'scroll';
  div.style.position = 'fixed';
  div.style.visibility = 'hidden';
  document.body.appendChild(div);

  domScheduler.schedule(MASK_CALCULATE, () => {
    scheduled = false;
    const size = div.offsetWidth - div.clientWidth;

    domScheduler.schedule(MASK_RENDER, () => {
      div.remove();
      document.body.style.setProperty('--aux-scrollbar-size', size + 'px');
    });
  });
}

function triggerMeasure() {
  if (scheduled) return;
  scheduled = true;

  domScheduler.schedule(MASK_RENDER, measureScrollbarSize);
}

export function scrollbarSize() {
  if (scrollbarMeasured) return;
  scrollbarMeasured = true;

  if (document.body) triggerMeasure();
  else document.addEventListener('DOMContentLoaded', triggerMeasure);
  window.addEventListener('resize', triggerMeasure);
}
