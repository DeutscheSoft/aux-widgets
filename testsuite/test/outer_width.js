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
  getOuterHeight,
  getOuterWidth,
  setOuterHeight,
  setOuterWidth,
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
    get: getOuterWidth,
    set: setOuterWidth,
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
    get: getOuterHeight,
    set: setOuterHeight,
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
    it('reads a content-box size when margin is omitted', () => {
      const element = mount({ [axis.size]: '80px' });
      assertEqual(get(element), 80, 'omitted margin');
      assertStyle(element, '80px', 'style');
    });

    it('reads a content-box size when margin is false', () => {
      const element = mount({
        [axis.size]: '80px',
        ...main(axis, 'margin', '4px', '6px'),
      });
      assertEqual(get(element, false), 80, 'margin false');
    });

    it('includes padding and border in a content-box read', () => {
      const element = mount({
        [axis.size]: '50px',
        padding: '10px',
        borderWidth: '2px',
      });
      assertEqual(get(element, false), 74, 'border box');
    });

    it('reads a border-box size without adding padding or border again', () => {
      const element = mount({
        boxSizing: 'border-box',
        [axis.size]: '100px',
        padding: '10px',
        borderWidth: '2px',
      });
      assertEqual(get(element, false), 100, 'border box');
    });

    it('adds the margins on this axis when margin is true', () => {
      const element = mount({
        [axis.size]: '80px',
        ...main(axis, 'margin', '4px', '6px'),
      });
      assertEqual(get(element, true), 90, 'with margin');
    });

    it('adds margins on this axis around a border-box size', () => {
      const element = mount({
        boxSizing: 'border-box',
        [axis.size]: '100px',
        padding: '10px',
        borderWidth: '2px',
        ...main(axis, 'margin', '5px', '5px'),
      });
      assertEqual(get(element, true), 110, 'border box with margin');
    });

    it('ignores margins on the other axis', () => {
      const element = mount({
        [axis.size]: '40px',
        ...cross(axis, 'margin', '40px', '12px'),
      });
      assertEqual(get(element, true), 40, 'cross margin');
    });

    it('uses the offset size when notransform is true', () => {
      const element = mount({
        [axis.size]: '80px',
        ...main(axis, 'margin', '4px', '6px'),
      });
      assertEqual(get(element, false, true), element[axis.offset], axis.offset);
      assertEqual(get(element, false, true), 80, 'layout size');
      assertEqual(get(element, true, true), 90, 'offset size plus margin');
    });

    it('takes margin and notransform without a size argument', () => {
      const element = mount({
        [axis.size]: '80px',
        ...main(axis, 'margin', null, '6px'),
      });
      assertEqual(get(element, false, true), 80, 'margin false');
      assertEqual(get(element, true, true), 86, 'margin true');
    });

    it('uses the transformed border box unless notransform is set', () => {
      const element = mount({
        [axis.size]: '100px',
        ...main(axis, 'margin', '5px', '5px'),
        transform: axis.scale,
      });
      assertEqual(get(element, false, true), 100, 'untransformed');
      assertEqual(get(element, true, true), 110, 'untransformed with margin');
      assertEqual(get(element), 200, 'transformed');
      assertEqual(get(element, false), 200, 'transformed, margin false');
      assertEqual(get(element, true), 210, 'transformed with unscaled margin');
    });

    it('scales the border box, including padding, and leaves margins unscaled', () => {
      const element = mount({
        [axis.size]: '50px',
        ...main(axis, 'padding', '10px', '10px'),
        ...main(axis, 'margin', '5px', '5px'),
        transform: axis.scale,
      });
      assertEqual(get(element, false, true), 70, 'offset size');
      assertEqual(get(element, false), 140, 'scaled border box');
      assertEqual(get(element, true, true), 80, 'offset size plus margin');
      assertEqual(get(element, true), 150, 'scaled border box plus margin');
    });

    it('reads a zero size', () => {
      const element = mount({ [axis.size]: '0px' });
      assertEqual(get(element, false), 0, 'zero');
      assertEqual(get(element, true), 0, 'zero with margin flag');
    });

    it('does not write the style size while reading', () => {
      const element = mount({ [axis.size]: '80px' });
      get(element, true, true);
      assertStyle(element, '80px', 'style');
    });
  });

  describe(set.name, () => {
    it('assigns a border-box size unchanged when margin is false', () => {
      const element = mount({
        boxSizing: 'border-box',
        padding: '8px',
        borderWidth: '1px',
        ...main(axis, 'margin', '5px', '5px'),
      });
      set(element, false, 120);
      assertStyle(element, '120px', 'style');
      assertEqual(get(element, false, true), 120, 'read back');
      assertEqual(get(element, true, true), 130, 'read back with margin');
    });

    it('subtracts margin on this axis from a border-box size and not padding or border', () => {
      const element = mount({
        boxSizing: 'border-box',
        padding: '8px',
        borderWidth: '1px',
        ...main(axis, 'margin', '5px', '5px'),
      });
      set(element, true, 120);
      assertStyle(element, '110px', 'style');
      assertEqual(get(element, true, true), 120, 'outer size');
    });

    it('subtracts asymmetric padding and border from a content-box size', () => {
      const element = mount({
        ...main(axis, 'padding', '1px', '3px'),
        ...main(axis, 'border', '4px', '5px'),
        ...main(axis, 'margin', '5px', '5px'),
      });
      set(element, false, 100);
      assertStyle(element, '87px', 'style');
      assertEqual(get(element, false, true), 100, 'outer size');
    });

    it('subtracts padding, border, and margin on this axis from a content-box size', () => {
      const element = mount({
        padding: '10px',
        borderWidth: '2px',
        ...main(axis, 'margin', '5px', '5px'),
      });
      set(element, true, 100);
      assertStyle(element, '66px', 'style');
      assertEqual(get(element, true, true), 100, 'outer size');
    });

    it('ignores margin on the other axis while setting', () => {
      const element = mount({
        boxSizing: 'border-box',
        ...cross(axis, 'margin', '50px', '9px'),
        ...main(axis, 'margin', '2px', '3px'),
      });
      set(element, true, 40);
      assertStyle(element, '35px', 'style');
    });

    it('keeps fractional margin arithmetic exact', () => {
      const element = mount({
        boxSizing: 'border-box',
        ...main(axis, 'margin', '1.5px', '2.5px'),
      });
      set(element, true, 20);
      assertStyle(element, '16px', 'style');
      assertEqual(get(element, true, true), 20, 'outer size');
    });

    it('assigns a fractional size as given when there is nothing to subtract', () => {
      const element = mount({ boxSizing: 'border-box' });
      set(element, false, 80.5);
      assertStyle(element, '80.5px', 'style');
      assertEqual(
        get(element),
        element.getBoundingClientRect()[axis.rect],
        'rect'
      );
      assertEqual(get(element, false, true), element[axis.offset], axis.offset);
      assertEqual(get(element), 80.5, 'fractional border box');
    });

    it('treats zero as a set', () => {
      const element = mount({ boxSizing: 'border-box', [axis.size]: '40px' });
      set(element, true, 0);
      assertStyle(element, '0px', 'style');
      assertEqual(get(element, true, true), 0, 'read back');
    });

    it('clamps a negative result to zero', () => {
      const element = mount({ padding: '10px' });
      set(element, false, 10);
      assertStyle(element, '0px', 'style');
      assertEqual(get(element, false, true), 20, 'padding remains');

      const negative = mount({ boxSizing: 'border-box' });
      set(negative, false, -20);
      assertStyle(negative, '0px', 'negative style');
    });

    it('clamps after subtracting margin', () => {
      const element = mount({
        boxSizing: 'border-box',
        ...main(axis, 'margin', '8px', '8px'),
      });
      set(element, true, 10);
      assertStyle(element, '0px', 'style');
      assertEqual(get(element, true, true), 16, 'margins remain');
    });

    it('writes the layout size of a transformed element', () => {
      const element = mount({
        boxSizing: 'border-box',
        ...main(axis, 'margin', '5px', '5px'),
        transform: axis.scale,
      });
      set(element, true, 100);
      assertStyle(element, '90px', 'style');
      assertEqual(get(element, true, true), 100, 'layout outer size');
      assertEqual(get(element, true), 190, 'transformed outer size');
    });

    it('overwrites an existing size', () => {
      const element = mount({ boxSizing: 'border-box', [axis.size]: '10px' });
      set(element, false, 55);
      assertStyle(element, '55px', 'style');
      assertEqual(get(element, false, true), 55, 'read back');
    });

    it('keeps the previous size when the requested size is NaN', () => {
      const element = mount({ boxSizing: 'border-box', [axis.size]: '40px' });
      set(element, true, NaN);
      assertStyle(element, '40px', 'style');
    });
  });

  describe('round trip', () => {
    it('restores a border-box outer size that includes margin', () => {
      const element = mount({
        boxSizing: 'border-box',
        padding: '8px',
        borderWidth: '1px',
        ...main(axis, 'margin', '5px', '7px'),
      });
      set(element, true, 140);
      assertEqual(get(element, true), 140, 'default read');
      assertEqual(get(element, true, true), 140, 'notransform read');
    });

    it('restores a content-box outer size that includes margin', () => {
      const element = mount({
        ...main(axis, 'padding', '10px', '6px'),
        ...main(axis, 'border', '2px', '3px'),
        ...main(axis, 'margin', '4px', '5px'),
      });
      set(element, true, 90);
      assertEqual(get(element, true, true), 90, 'notransform read');
      assertEqual(get(element, true), 90, 'default read');
    });

    it('restores a fractional border-box size through both reads', () => {
      const element = mount({ boxSizing: 'border-box' });
      set(element, false, 80.25);
      assertEqual(get(element), 80.25, 'transformed read');
      assertEqual(
        get(element, false, true),
        element[axis.offset],
        'offset read'
      );
    });
  });
});
