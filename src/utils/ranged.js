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
  LinearSnapModule,
  ArraySnapModule,
  NullSnapModule,
  TrivialSnapModule,
  makePiecewiseLinearTransformation,
  makeFunctionTransformation,
  makeLinearTransformation,
  makeLogarithmicTransformation,
  makeFrequencyTransformation,
} from './transformations.js';
import { defineRender } from '../renderer.js';
import { applyAttribute } from './dom.js';

import { error, warn } from './log.js';

export const rangedOptionsDefaults = {
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
  log_factor: 1,
  format_ariavalue: (v) => (isFinite(v) ? v.toFixed(2) : ''),
  set_ariavalue: false,
};

export const rangedOptionsTypes = {
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
  log_factor: 'number',
  transformation: 'object',
  snap_module: 'object',
  format_ariavalue: 'function',
  set_ariavalue: 'boolean',
};

function numSort(arr) {
  arr = arr.slice(0);
  arr.sort(function (a, b) {
    return a - b;
  });
  return arr;
}

export function makeSnapModule(snap, clip, min, max, base) {
  if (Array.isArray(snap)) {
    return ArraySnapModule(
      {
        min,
        max,
        clip,
      },
      new Float64Array(numSort(snap)).buffer
    );
  } else if (typeof snap === 'number' && snap > 0.0) {
    return LinearSnapModule({
      min: Math.min(min, max),
      max: Math.max(min, max),
      step: snap,
      base: base || 0,
      clip: clip,
    });
  } else if (clip && min < Infinity && max > -Infinity) {
    return NullSnapModule({
      min: Math.min(min, max),
      max: Math.max(min, max),
      clip,
    });
  } else {
    return TrivialSnapModule;
  }
}

export function makeTransformation(
  basis,
  log_factor,
  max,
  min,
  reverse,
  scale,
  options
) {
  if (typeof scale === 'function') {
    return makeFunctionTransformation(
      {
        basis,
        scale,
        reverse,
      },
      options
    );
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

    return makePiecewiseLinearTransformation(
      { basis, reverse },
      new Float64Array(scale).buffer
    );
  } else {
    switch (scale) {
      case 'linear':
        return makeLinearTransformation({ basis, max, min, reverse });
      case 'decibel':
        return makeLogarithmicTransformation({
          basis,
          log_factor,
          max,
          min,
          reverse,
          trafo_reverse: 1,
        });
      case 'log2':
        return makeLogarithmicTransformation({
          basis,
          log_factor,
          max,
          min,
          reverse,
          trafo_reverse: 0,
        });
      case 'frequency':
        return makeFrequencyTransformation({
          basis,
          max,
          min,
          reverse,
          trafo_reverse: 0,
        });
      case 'frequency-reverse':
        return makeFrequencyTransformation({
          basis,
          max,
          min,
          reverse,
          trafo_reverse: 1,
        });
      default:
        warn('Unsupported scale', scale);
    }
  }
}

/**
 * Making a widget ranged combines functionality for two distinct purposes.
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
 * @param {Widget} The widget to make ranged.
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
 * @property {Function} [options.format_ariavalue=v => v.toFixed(2)] - Function to format the aria-valuenow attribute.
 * @property {Boolean} [options.set_ariavalue=false] - Define if aria-valuemin, aria-valuemax and aria-valuenow should be set.
 *
 */
export const rangedRenderers = [
  defineRender(
    ['value', 'aria_valuenow', 'format_ariavalue', 'set_ariavalue'],
    function (value, aria_valuenow, format_ariavalue, set_ariavalue) {
      if (aria_valuenow !== void 0) return;
      if (!set_ariavalue) return;

      const targets = this.getARIATargets();

      targets.forEach((element) => {
        applyAttribute(element, 'aria-valuenow', format_ariavalue(value));
      });
    }
  ),
  defineRender(
    ['min', 'aria_valuemin', 'format_ariavalue', 'set_ariavalue'],
    function (min, aria_valuemin, format_ariavalue, set_ariavalue) {
      if (aria_valuemin !== void 0) return;
      if (!set_ariavalue) return;

      const targets = this.getARIATargets();

      targets.forEach((element) => {
        applyAttribute(element, 'aria-valuemin', format_ariavalue(min));
      });
    }
  ),
  defineRender(
    ['max', 'aria_valuemax', 'format_ariavalue', 'set_ariavalue'],
    function (max, aria_valuemax, format_ariavalue, set_ariavalue) {
      if (aria_valuemax !== void 0) return;
      if (!set_ariavalue) return;

      const targets = this.getARIATargets();

      targets.forEach((element) => {
        applyAttribute(element, 'aria-valuemax', format_ariavalue(max));
      });
    }
  ),
];

function updateSnapModule() {
  const { snap, clip, min, max, base } = this.options;
  this.update('snap_module', makeSnapModule(snap, clip, min, max, base));
}

function updateTransformation() {
  const { basis, log_factor, max, min, reverse, scale } = this.options;

  this.update(
    'transformation',
    makeTransformation(
      basis,
      log_factor,
      max,
      min,
      reverse,
      scale,
      this.options
    )
  );
}

export const rangedEvents = {
  // changes both
  set_max: [updateSnapModule, updateTransformation],
  set_min: [updateSnapModule, updateTransformation],
  // changes snap_module
  set_base: updateSnapModule,
  set_clip: updateSnapModule,
  set_snap: updateSnapModule,
  // changes transformation
  set_basis: updateTransformation,
  set_log_factor: updateTransformation,
  set_reverse: updateTransformation,
  set_scale: updateTransformation,

  initialized: [updateSnapModule, updateTransformation],
};
