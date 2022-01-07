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

import { Base } from '../implements/base.js';
import {
  rangedOptionsDefaults,
  rangedOptionsTypes,
  makeRanged,
} from '../utils/make_ranged.js';

/* jshint -W079 */

/**
 * Range is used for calculating linear scales from
 * different values. They are useful for building coordinate systems,
 * calculating pixel positions for different scale types, and the like.
 * Range is used e.g. in {@link Scale}, {@link Meter} and {@link Graph}, to draw
 * elements on a certain position according to a value on an
 * arbitrary scale.
 *
 * @class Range
 *
 * @extends Base
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String|Function} [options.scale="linear"] - Type of the value.
 *   <code>linear</code>, <code>decibel</code>, <code>log2</code>, <code>frequency</code>
 *   or a <code>function (value, options, coef) {}</code>.
 *   If a function instead of a constant is handed over, it receives the
 *   actual options object as the second argument and is supposed to return a
 *   coefficient between 0 and 1. If the third argument "coef" is true, it is
 *   supposed to return a value depending on a coefficient handed over as the
 *   first argument.
 * @property {Boolean} [options.reverse=false] - <code>true</code> if
 *   the range is reversed.
 * @property {Number} [options.basis=0] - Dimensions of the range, set to
 *   width/height in pixels, if you need it for drawing purposes, to 100 if
 *   you need percentual values or to 1 if you just need a linear
 *   coefficient for a e.g. logarithmic scale.
 * @property {Number} [options.min=0] - The minimum value possible.
 * @property {Number} [options.max=0] - The maximum value possible.
 * @property {Number} [options.step=1] - Step size, needed for e.g. user
 *   interaction
 * @property {Number} [options.shift_up=4] - Multiplier for e.g. SHIFT pressed
 *   while stepping
 * @property {Number} [options.shift_down=0.25] - Multiplier for e.g. SHIFT + CONTROL
 *   pressed while stepping
 * @property {Number|Array} [options.snap=0] - Snap the value to a virtual grid
 *   with this distance. Numbers define the step size between snaps, an
 *   array contains a list of values to snap to.
 *   Using snap option with float values
 *   causes the range to reduce its minimum and maximum values depending
 *   on the amount of decimal digits because of the implementation of
 *   math in JavaScript. Using a step size of e.g. 1.125
 *   reduces the maximum usable value from 9,007,199,254,740,992 to
 *   9,007,199,254,740.992 (note the decimal point).
 * @property {Boolean} [options.round=false] - if snap is set,
 *   decide how to jump between snaps. Setting this to true
 *   slips to the next snap if the value is more than on its half way to it.
 *   Otherwise the value has to reach the next snap until it is hold there
 *   again.
 */
export class Range extends Base {
  static get _options() {
    return rangedOptionsTypes;
  }

  static get options() {
    return Object.assign({}, rangedOptionsDefaults, {
      scale: 'linear',
      reverse: false,
      basis: 0,
      min: -Infinity,
      max: Infinity,
      step: 1,
      shift_up: 4,
      shift_down: 0.25,
      snap: 0,
      round: false,
    });
  }

  valueToBased(coef, size) {
    return this.get('transformation').valueToBased(coef, size);
  }

  basedToValue(coef, size) {
    return this.get('transformation').basedToValue(coef, size);
  }

  valueToPixel(value) {
    return this.get('transformation').valueToPixel(value);
  }

  pixelToValue(pos) {
    return this.get('transformation').pixelToValue(pos);
  }

  valueToCoef(value) {
    return this.get('transformation').valueToCoef(value);
  }

  coefToValue(coef) {
    return this.get('transformation').coefToValue(coef);
  }

  snapUp(value) {
    return this.get('snap_module').snapUp(value);
  }

  snapDown(value) {
    return this.get('snap_module').snapDown(value);
  }

  snap(value) {
    return this.get('snap_module').snap(value);
  }
}
makeRanged(Range);

/* jshint +W079 */

export function effectiveValue(value, base, falling, duration, init, value_time) {
  if (falling <= 0) return value;

  const age = performance.now() - value_time;
  const diff = age * (falling / duration);

  if (age > init) {
    if (value > base) {
      value -= diff;
      if (value < base) value = base;
    } else {
      value += diff;
      if (value > base) value = base;
    }
  }
  return value;
}
