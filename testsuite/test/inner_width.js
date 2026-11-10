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
  getInnerHeight,
  getInnerWidth,
  setInnerHeight,
  setInnerWidth,
} from '../../src/utils/dom.js';
import { isJsdom } from '../../src/utils/is_jsdom.js';
import { assert, canvas } from './utils/helpers.js';

const axes = [
  {
    label: 'width',
    size: 'width',
    start: 'Left',
    end: 'Right',
    acrossStart: 'Top',
    acrossEnd: 'Bottom',
    offset: 'offsetWidth',
    rect: 'width',
    scale: 'scaleX(2)',
    get: getInnerWidth,
    set: setInnerWidth,
  },
  {
    label: 'height',
    size: 'height',
    start: 'Top',
    end: 'Bottom',
    acrossStart: 'Left',
    acrossEnd: 'Right',
    offset: 'offsetHeight',
    rect: 'height',
    scale: 'scaleY(2)',
    get: getInnerHeight,
    set: setInnerHeight,
  },
];

function mount(style) {
  const element = document.createElement('div');
  element.style.display = 'block';
  element.style.boxSizing = 'content-box';
  element.style.margin = '0';
  element.style.padding = '0';
  element.style.border = '0 solid transparent';
  for (const key in style) element.style[key] = style[key];
  canvas().appendChild(element);
  return element;
}

function edges(startName, endName, prop, start, end) {
  const suffix = prop === 'border' ? 'Width' : '';
  const style = {};
  if (start != null) style[prop + startName + suffix] = start;
  if (end != null) style[prop + endName + suffix] = end;
  return style;
}

function main(axis, prop, start, end) {
  return edges(axis.start, axis.end, prop, start, end);
}

function cross(axis, prop, start, end) {
  return edges(axis.acrossStart, axis.acrossEnd, prop, start, end);
}

function assertEqual(actual, expected, label) {
  assert(
    Object.is(actual, expected),
    `${label}: expected ${expected}, got ${actual}`
  );
}

describe.skipIf(isJsdom).each(axes)('$label', (axis) => {
  const { get, set } = axis;

  function assertStyle(element, expected, label) {
    assertEqual(element.style[axis.size], expected, label);
  }

  describe(get.name, () => {
    it('reads a content-box size with no padding or border', () => {
      const element = mount({ [axis.size]: '80px' });
      assertEqual(get(element), 80, 'inner size');
      assertStyle(element, '80px', 'style');
    });

    it('subtracts padding and border from a content-box read', () => {
      const element = mount({
        [axis.size]: '50px',
        padding: '10px',
        borderWidth: '2px',
      });
      assertEqual(get(element), 50, 'content size');
    });

    it('subtracts asymmetric padding and border', () => {
      const element = mount({
        [axis.size]: '50px',
        ...main(axis, 'padding', '1px', '3px'),
        ...main(axis, 'border', '4px', '5px'),
      });
      assertEqual(get(element, true), 50, 'content size');
      assertEqual(element[axis.offset], 63, 'border box');
    });

    it('subtracts padding and border from a border-box read', () => {
      const element = mount({
        boxSizing: 'border-box',
        [axis.size]: '100px',
        padding: '10px',
        borderWidth: '2px',
      });
      assertEqual(get(element), 76, 'content size');
    });

    it('reads zero when a border-box size is smaller than its padding and border', () => {
      const element = mount({
        boxSizing: 'border-box',
        [axis.size]: '10px',
        ...main(axis, 'padding', '10px', '10px'),
      });
      assertEqual(get(element, true), 0, 'clamped content');
    });

    it('ignores margins', () => {
      const element = mount({
        [axis.size]: '80px',
        ...main(axis, 'margin', '4px', '6px'),
        ...cross(axis, 'margin', '40px', '12px'),
      });
      assertEqual(get(element), 80, 'margins ignored');
    });

    it('ignores padding and border on the other axis', () => {
      const element = mount({
        [axis.size]: '40px',
        ...cross(axis, 'padding', '15px', '9px'),
        ...cross(axis, 'border', '4px', '6px'),
      });
      assertEqual(get(element), 40, 'cross axis chrome');
    });

    it('uses the offset size when notransform is true', () => {
      const element = mount({
        [axis.size]: '80px',
        ...main(axis, 'padding', '4px', '6px'),
      });
      assertEqual(
        get(element, true),
        element[axis.offset] - 10,
        'offset minus chrome'
      );
      assertEqual(get(element, true), 80, 'content size');
    });

    it('uses the transformed border box unless notransform is set', () => {
      const element = mount({
        [axis.size]: '100px',
        ...main(axis, 'padding', '5px', '5px'),
        transform: axis.scale,
      });
      assertEqual(get(element, true), 100, 'untransformed content');
      assertEqual(
        get(element),
        210,
        'scaled border box minus unscaled padding'
      );
    });

    it('reads a zero size', () => {
      const element = mount({ [axis.size]: '0px' });
      assertEqual(get(element), 0, 'zero');
      assertEqual(get(element, true), 0, 'zero, notransform');
    });

    it('does not write the style size while reading', () => {
      const element = mount({ [axis.size]: '80px' });
      get(element, true);
      assertStyle(element, '80px', 'style');
    });
  });

  describe(set.name, () => {
    it('assigns a content-box inner size unchanged', () => {
      const element = mount({
        padding: '8px',
        borderWidth: '1px',
        ...main(axis, 'margin', '5px', '5px'),
      });
      set(element, 120);
      assertStyle(element, '120px', 'style');
      assertEqual(get(element, true), 120, 'read back');
    });

    it('adds padding and border when setting a border-box size', () => {
      const element = mount({
        boxSizing: 'border-box',
        padding: '8px',
        borderWidth: '1px',
      });
      set(element, 120);
      assertStyle(element, '138px', 'style');
      assertEqual(get(element, true), 120, 'inner size');
    });

    it('adds only the padding and border on this axis', () => {
      const element = mount({
        boxSizing: 'border-box',
        ...main(axis, 'padding', '1px', '3px'),
        ...main(axis, 'border', '4px', '5px'),
        ...cross(axis, 'padding', '20px', '20px'),
        ...cross(axis, 'border', '7px', '7px'),
      });
      set(element, 100);
      assertStyle(element, '113px', 'style');
      assertEqual(get(element, true), 100, 'inner size');
    });

    it('keeps a fractional size exact when there is nothing to add', () => {
      const element = mount({ boxSizing: 'border-box' });
      set(element, 80.5);
      assertStyle(element, '80.5px', 'style');
      assertEqual(
        get(element),
        element.getBoundingClientRect()[axis.rect],
        'rect'
      );
      assertEqual(get(element, true), element[axis.offset], axis.offset);
      assertEqual(get(element), 80.5, 'fractional content');
    });

    it('treats zero as a set', () => {
      const element = mount({ boxSizing: 'border-box', [axis.size]: '40px' });
      set(element, 0);
      assertStyle(element, '0px', 'style');
      assertEqual(get(element, true), 0, 'read back');
    });

    it('clamps a negative content-box size to zero', () => {
      const element = mount({ padding: '10px' });
      set(element, -20);
      assertStyle(element, '0px', 'style');
      assertEqual(get(element, true), 0, 'content size');
    });

    it('adds padding before clamping a negative border-box size', () => {
      const covered = mount({
        boxSizing: 'border-box',
        ...main(axis, 'padding', '10px', '10px'),
      });
      set(covered, -5);
      assertStyle(covered, '15px', 'style');
      assertEqual(get(covered, true), 0, 'used content is clamped at zero');

      const uncovered = mount({
        boxSizing: 'border-box',
        ...main(axis, 'padding', '10px', '10px'),
      });
      set(uncovered, -30);
      assertStyle(uncovered, '0px', 'style');
      assertEqual(get(uncovered, true), 0, 'used content is clamped at zero');
    });

    it('writes the layout size of a transformed element', () => {
      const element = mount({
        boxSizing: 'border-box',
        ...main(axis, 'padding', '5px', '5px'),
        transform: axis.scale,
      });
      set(element, 80);
      assertStyle(element, '90px', 'style');
      assertEqual(get(element, true), 80, 'layout inner size');
      assertEqual(get(element), 170, 'transformed inner size');
    });

    it('overwrites an existing size', () => {
      const element = mount({ [axis.size]: '10px' });
      set(element, 55);
      assertStyle(element, '55px', 'style');
      assertEqual(get(element, true), 55, 'read back');
    });

    it('keeps the previous size when the requested size is NaN', () => {
      const element = mount({ boxSizing: 'border-box', [axis.size]: '40px' });
      set(element, NaN);
      assertStyle(element, '40px', 'style');
    });
  });

  describe('round trip', () => {
    it('restores a content-box inner size that has padding and border', () => {
      const element = mount({
        ...main(axis, 'padding', '10px', '6px'),
        ...main(axis, 'border', '2px', '3px'),
      });
      set(element, 90);
      assertEqual(get(element, true), 90, 'notransform read');
      assertEqual(get(element), 90, 'default read');
    });

    it('restores a border-box inner size that has padding and border', () => {
      const element = mount({
        boxSizing: 'border-box',
        ...main(axis, 'padding', '8px', '4px'),
        ...main(axis, 'border', '1px', '3px'),
      });
      set(element, 140);
      assertEqual(get(element), 140, 'default read');
      assertEqual(get(element, true), 140, 'notransform read');
    });

    it('restores a fractional border-box size through both reads', () => {
      const element = mount({ boxSizing: 'border-box' });
      set(element, 80.25);
      assertEqual(get(element), 80.25, 'transformed read');
      assertEqual(get(element, true), element[axis.offset], 'offset read');
    });
  });
});
