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
