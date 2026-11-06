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

import { Indicators } from '../../src/matrix/widgets/indicators.js';
import { Matrix } from '../../src/matrix/widgets/matrix.js';
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

function dragBatchRectangle(indicators) {
  const down = dispatchPointer(indicators.element, 'pointerdown', 10, 10);
  dispatchPointer(indicators.element, 'pointermove', 80, 10);
  return down;
}

describe('Indicators batch drag', () => {
  it('enables the batch rectangle by default', () => {
    const indicators = new Indicators({});

    assertEqual(indicators.get('batch'), true);
    assertEqual(indicators.drag.get('active'), true);

    const down = dragBatchRectangle(indicators);

    assert(down.defaultPrevented);
    assert(indicators.drag.dragging());
    assertEqual(indicators.get('_batch'), true);

    indicators.destroy();
  });

  it('does not start a batch rectangle when batch is false', () => {
    const indicators = new Indicators({ batch: false });

    assertEqual(indicators.drag.get('active'), false);

    const down = dragBatchRectangle(indicators);

    assert(!down.defaultPrevented);
    assert(!indicators.drag.dragging());
    assertEqual(indicators.get('_batch'), false);
    assertEqual(indicators.get('_batch_open'), false);

    indicators.destroy();
  });

  it('drops an open drag when batch is turned off', () => {
    const indicators = new Indicators({});

    dragBatchRectangle(indicators);
    assertEqual(indicators.get('_batch'), true);

    indicators.set('batch', false);

    assertEqual(indicators.drag.get('active'), false);
    assert(!indicators.drag.dragging());
    assertEqual(indicators.get('_batch'), false);
    assertEqual(indicators.get('_batch_open'), false);

    const down = dragBatchRectangle(indicators);
    assert(!down.defaultPrevented);
    assertEqual(indicators.get('_batch'), false);

    indicators.destroy();
  });
});

describe('Matrix batch option', () => {
  it('funnels batch into Indicators', () => {
    const matrix = new Matrix({ batch: false });

    assertEqual(matrix.get('batch'), false);
    assertEqual(matrix.indicators.get('batch'), false);
    assertEqual(matrix.indicators.drag.get('active'), false);

    const down = dragBatchRectangle(matrix.indicators);
    assert(!down.defaultPrevented);
    assertEqual(matrix.indicators.get('_batch'), false);

    matrix.set('batch', true);

    assertEqual(matrix.indicators.get('batch'), true);
    assertEqual(matrix.indicators.drag.get('active'), true);

    const enabled = dragBatchRectangle(matrix.indicators);
    assert(enabled.defaultPrevented);
    assertEqual(matrix.indicators.get('_batch'), true);

    matrix.destroy();
  });

  it('accepts indicators.batch on the matrix', () => {
    const matrix = new Matrix({});

    assertEqual(matrix.indicators.get('batch'), true);

    matrix.set('indicators.batch', false);

    assertEqual(matrix.indicators.get('batch'), false);
    assertEqual(matrix.indicators.drag.get('active'), false);

    const down = dragBatchRectangle(matrix.indicators);
    assert(!down.defaultPrevented);
    assertEqual(matrix.indicators.get('_batch'), false);

    matrix.destroy();
  });
});
