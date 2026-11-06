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

import { DragCapture } from '../../src/modules/dragcapture.js';
import { assert, assertEqual } from './utils/helpers.js';

function dispatchPointer(node, type, x, y) {
  const event = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
  });

  for (const [key, value] of [
    ['clientX', x],
    ['clientY', y],
    ['pointerId', 1],
  ]) {
    if (event[key] === value) continue;
    Object.defineProperty(event, key, { value });
  }

  node.dispatchEvent(event);
  return event;
}

function createCapture(options) {
  const node = document.createElement('div');
  const drag = new DragCapture({ element: node }, { node, ...options });
  return { node, drag };
}

describe('DragCapture', () => {
  it('captures a drag when active', () => {
    let started = 0;
    const { node, drag } = createCapture({
      onstartcapture() {
        started++;
        return true;
      },
    });

    const down = dispatchPointer(node, 'pointerdown', 0, 0);

    assertEqual(started, 1);
    assert(down.defaultPrevented);
    assert(drag.dragging());
    assert(drag.state());

    drag.destroy();
  });

  it('ignores pointerdown when active is false', () => {
    let started = 0;
    const { node, drag } = createCapture({
      active: false,
      onstartcapture() {
        started++;
        return true;
      },
    });

    const down = dispatchPointer(node, 'pointerdown', 0, 0);

    assertEqual(started, 0);
    assert(!down.defaultPrevented);
    assert(!drag.dragging());
    assertEqual(drag.state(), null);

    drag.destroy();
  });

  it('stops an active drag when active is set to false', () => {
    let stopped = 0;
    const { node, drag } = createCapture({
      onstartcapture() {
        return true;
      },
      onstopcapture() {
        stopped++;
      },
    });

    dispatchPointer(node, 'pointerdown', 0, 0);
    assert(drag.dragging());

    drag.set('active', false);

    assertEqual(stopped, 1);
    assert(!drag.dragging());
    assertEqual(drag.state(), null);

    const down = dispatchPointer(node, 'pointerdown', 4, 4);
    assert(!down.defaultPrevented);
    assert(!drag.dragging());

    drag.set('active', true);
    dispatchPointer(node, 'pointerdown', 8, 8);
    assert(drag.dragging());

    drag.destroy();
  });
});
