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

/* jshint -W018 */

import { defineClass } from './../widget_helpers.js';
import { error, warn } from './../utils/log.js';

import {
  LinearSnapModule,
  ArraySnapModule,
  NullSnapModule,
  TrivialSnapModule,
  makePiecewiseLinearTransformation,
  makeFunctionTransformation,
  makeLinearTransformation,
  makeLogarithmicTransformation,
  makeFrequencyTransformation,
} from '../utils/transformations.js';

function numSort(arr) {
  arr = arr.slice(0);
  arr.sort(function (a, b) {
    return a - b;
  });
  return arr;
}
function updateSnap() {
  const O = this.options;
  let snap_module;
  // Notify that the ranged options have been modified
  if (Array.isArray(O.snap)) {
    snap_module = ArraySnapModule(O, new Float64Array(numSort(O.snap)).buffer);
  } else if (typeof O.snap === 'number' && O.snap > 0.0) {
    snap_module = LinearSnapModule({
      min: Math.min(O.min, O.max),
      max: Math.max(O.min, O.max),
      step: O.snap,
      base: O.base || 0,
      clip: O.clip,
    });
  } else if (O.clip && O.min < Infinity && O.max > -Infinity) {
    snap_module = NullSnapModule({
      min: Math.min(O.min, O.max),
      max: Math.max(O.min, O.max),
      clip: O.clip,
    });
  } else {
    snap_module = TrivialSnapModule;
  }

  this.update('snap_module', snap_module);
}

function updateTransformation() {
  const O = this.options;
  const scale = O.scale;

  let module;

  if (typeof scale === 'function') {
    module = makeFunctionTransformation(O);
  } else if (Array.isArray(scale)) {
    let i = 0;
    if (scale.length % 2) {
      error('Malformed piecewise-linear scale.');
    }

    for (i = 0; i < scale.length / 2 - 1; i++) {
      if (!(scale[i] >= 0 && scale[i] <= 1))
        error('piecewise-linear x value not in [0,1].');
      if (!(scale[i] < scale[i + 1]))
        error('piecewise-linear array not sorted.');
    }
    for (i = scale.length / 2; i < scale.length - 1; i++) {
      if (!(scale[i] < scale[i + 1]))
        error('piecewise-linear array not sorted.');
    }

    module = makePiecewiseLinearTransformation(
      O,
      new Float64Array(scale).buffer
    );
  } else {
    switch (scale) {
      case 'linear':
        module = makeLinearTransformation(O);
        break;
      case 'decibel':
        O.trafo_reverse = 1;
        module = makeLogarithmicTransformation(O);
        break;
      case 'log2':
        O.trafo_reverse = 0;
        module = makeLogarithmicTransformation(O);
        break;
      case 'frequency':
        O.trafo_reverse = 0;
        module = makeFrequencyTransformation(O);
        break;
      case 'frequency-reverse':
        O.trafo_reverse = 1;
        module = makeFrequencyTransformation(O);
        break;
      default:
        warn('Unsupported scale', scale);
    }
  }

  this.update('transformation', module);
}
function setCallback(key) {
  switch (key) {
    case 'min':
    case 'max':
    case 'snap':
    case 'clip':
      updateSnap.call(this);
    /* fall through */
    case 'log_factor':
    case 'scale':
    case 'reverse':
    case 'basis':
      updateTransformation.call(this);
      this.emit('rangedchanged');
      break;
  }
}
/**
 * @callback Ranged~scale_cb
 *
 * This is the interface for functions implementing custom coordinate
 * transformations. The transformation is required to map the interval
 * `[min, max]` onto `[0,1]`.
 *
 * @param {number} value - The coordinate value to be transformed.
 * @param {Object} [options={ }] - The options of the
 *      corresponding {@link Ranged} object.
 * @param {boolean} [inverse=false] - If true, the function should return the
 *      inverse transform.
 *
 * @returns {number} The transformed value.
 */
export const Ranged = defineClass({
  /**
   * Ranged combines functionality for two distinct purposes.
   * Firstly, Ranged can be used to snap values to a virtual grid.
   * This grid is defined by the options <code>snap</code>,
   * <code>step</code>, <code>min</code>, <code>max</code> and <code>base</code>.
   * The second feature of anged is that it allows transforming values between coordinate systems.
   * This can be used to transform values from and to linear scales in which they are displayed on the
   * screen. It is used inside of AUX to translate values (e.g. in Hz or dB) to pixel positions or
   * percentages, for instance in widgets such as {@link Scale}, {@link Meter} or
   * {@link Graph}.
   *
   * Ranged features several types of coordinate systems which are often used in audio applications.
   * They can be configured using the <code>options.scale</code> option, possible values are:
   * <ul>
   *  <li><code>linear</code> for linear coordinates,
   *  <li><code>decibel</code> for linear coordinates,
   *  <li><code>log2</code> for linear coordinates,
   *  <li><code>frequency</code> for linear coordinates or
   *  <li><code>frequency-reverse"</code> for linear coordinates.
   * </ul>
   * If <code>options.scale</code> is a function, it is used as the coordinate transformation.
   * Its signature is {@link Ranged~scale_cb}. This allows the definition of custom
   * coordinate transformations, which go beyond the standard types.
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {String|Array<Number>|Function} [options.scale="linear"] -
   *  The type of the scale. Either one of <code>linear</code>, <code>decibel</code>, <code>log2</code>,
   *  <code>frequency</code> or <code>frequency-reverse</code>; or an array containing a
   *  piece-wise linear scale;
   *  or a callback function of type {@link Ranged~scale_cb}.
   * @property {Boolean} [options.reverse=false] - Reverse the scale of the range.
   * @property {Number} [options.basis=1] - The size of the linear scale. Set to pixel width or height
   * if used for drawing purposes or to 100 for percentages.
   * @property {Boolean} [options.clip=true] - If true, snap() will clip values
   *  into the interval between min and max.
   * @property {Number} [options.min=0] - Minimum value of the range.
   * @property {Number} [options.max=1] - Maximum value of the range.
   * @property {Number} [options.log_factor=1] - Used to overexpand logarithmic curves. 1 keeps the
   *  natural curve while values above 1 will overbend.
   * @property {Number|Array.<number>} [options.snap=0] -
   *  Defines a virtual grid.
   *  If <code>options.snap</code> is a positive number, it is interpreted as the distance of
   *  grid points.
   *  Then, inside of the interval <code>options.min</code> ... <code>options.max</code> the grid
   *  points are <code> options.base + n * options.snap </code> where <code>n</code> is any
   *  integer. Any values outside of that interval are rounded to the biggest or smallest grid
   *  point, respectively.
   *  In order to define grids with non-uniform spacing, set <code>options.snap</code> to an Array
   *  of grid points.
   * @property {Number} [options.base=0] - Base point. Used e.g. to mark 0dB on a fader from -96dB to 12dB.
   * @property {Number} [options.step=0] - Step size. Used for instance by {@link ScrollValue}
   *  as the step size.
   * @property {Number} [options.shift_up=4] - Multiplier for increased stepping speed, e.g. used by
   *  {@link ScrollValue} when simultaneously pressing 'shift'.
   * @property {Number} [options.shift_down=0.25] - Multiplier for decreased stepping speed, e.g. used by
   *  {@link ScrollValue} when simultaneously pressing 'shift' and 'ctrl'.
   *
   * @mixin Ranged
   */

  options: {
    scale: 'linear',
    reverse: false,
    basis: 1,
    clip: true,
    min: 0,
    max: 1,
    base: 0,
    step: 0,
    shift_up: 4,
    shift_down: 0.25,
    snap: 0,
    round: true /* default for Range, no dedicated option */,
    log_factor: 1,
    trafo_reverse: false /* used internally, no documentation */,
    transformation: null,
    snap_module: TrivialSnapModule,
  },
  _options: {
    scale: 'string|array|function',
    reverse: 'boolean',
    basis: 'number',
    clip: 'boolean',
    min: 'number',
    max: 'number',
    base: 'number',
    step: 'number',
    shift_up: 'number',
    shift_down: 'number',
    snap: 'number|array',
    round: 'boolean',
    log_factor: 'number',
    trafo_reverse: 'boolean',
    transformation: 'object',
    snap_module: 'object',
  },
  static_events: {
    set: setCallback,
    initialized: function () {
      const O = this.options;
      if (!(O.min <= O.max))
        warn(
          'Ranged needs min <= max. min: ',
          O.min,
          ', max:',
          O.max,
          ', options:',
          O
        );
      updateSnap.call(this);
      updateTransformation.call(this);
    },
  },
});
