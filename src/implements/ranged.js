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
import {
  dBToScale,
  scaleToDB,
  freqToScale,
  scaleToFreq,
} from '../utils/audiomath.js';
import { error, warn } from './../utils/log.js';

function LinearSnapModule(options) {
  var min = +options.min;
  var max = +options.max;
  var step = +options.step;
  var base = +options.base;
  const clip = !!options.clip;

  function lowSnap(v, direction) {
    v = +v;
    direction = +direction;
    var n = 0.0;
    var t = 0.0;

    if (clip) {
      if (!(v > min)) {
        v = min;
        direction = 1.0;
      } else if (!(v < max)) {
        v = max;
        direction = +1.0;
      }
    }

    t = (v - base) / step;

    if (direction > 0.0) n = Math.ceil(t);
    else if (direction < 0.0) n = Math.floor(t);
    else {
      if (t - Math.floor(t) < 0.5) {
        n = Math.floor(t);
      } else {
        n = Math.ceil(t);
      }
    }

    return base + step * n;
  }

  /**
   * Returns the nearest value on the grid which is bigger than <code>value</code>.
   *
   * @method Ranged#snapUp
   *
   * @param {number} value - The value to snap.
   *
   * @returns {number} The snapped value.
   */
  function snapUp(v) {
    v = +v;
    return +lowSnap(v, 1.0);
  }

  /**
   * Returns the nearest value on the grid which is smaller than <code>value</code>.
   *
   * @method Ranged#snapDown
   *
   * @param {number} value - The value to snap.
   *
   * @returns {number} The snapped value.
   */
  function snapDown(v) {
    v = +v;
    return +lowSnap(v, -1.0);
  }

  /**
   * Returns the nearest value on the grid. Its rounding behavior is similar to that
   * of <code>Math.round</code>.
   *
   * @method Ranged#snap
   *
   * @param {number} value - The value to snap.
   *
   * @returns {number} The snapped value.
   */
  function snap(v) {
    v = +v;
    return +lowSnap(v, 0.0);
  }

  return {
    snapUp: snapUp,
    snapDown: snapDown,
    snap: snap,
  };
}

function ArraySnapModule(options, heap) {
  var values = new Float64Array(heap);
  var len = (heap.byteLength >> 3) | 0;
  var min = +(options.min !== void 0 ? options.min : values[0]);
  var max = +(options.max !== void 0 ? options.max : values[len - 1]);
  const clip = !!options.clip;

  function lowSnap(v, direction) {
    v = +v;
    direction = +direction;
    var a = 0;
    var mid = 0;
    var b = 0;
    var t = 0.0;

    b = len - 1;

    if (clip) {
      if (!(v > min)) v = min;
      if (!(v < max)) v = max;
    }

    if (!(v < +values[(b << 3) >> 3])) return +values[(b << 3) >> 3];
    if (!(v > +values[0])) return +values[0];

    do {
      mid = (a + b) >>> 1;
      t = +values[(mid << 3) >> 3];
      if (v > t) a = mid;
      else if (v < t) b = mid;
      else return t;
    } while (((b - a) | 0) > 1);

    if (direction > 0.0) return +values[(b << 3) >> 3];
    else if (direction < 0.0) return +values[(a << 3) >> 3];

    if (values[(b << 3) >> 3] - v <= v - values[(a << 3) >> 3])
      return +values[(b << 3) >> 3];
    return +values[(a << 3) >> 3];
  }

  function snapUp(v) {
    v = +v;
    return +lowSnap(v, 1.0);
  }

  function snapDown(v) {
    v = +v;
    return +lowSnap(v, -1.0);
  }

  function snap(v) {
    v = +v;
    return +lowSnap(v, 0.0);
  }

  return {
    snapUp: snapUp,
    snapDown: snapDown,
    snap: snap,
  };
}
function NullSnapModule(options) {
  var min = +options.min;
  var max = +options.max;
  const clip = !!options.clip;

  function snap(v) {
    v = +v;
    if (clip) {
      if (!(v < max)) v = max;
      if (!(v > min)) v = min;
    }
    return v;
  }

  return {
    snap: snap,
    snapUp: snap,
    snapDown: snap,
  };
}
function numSort(arr) {
  arr = arr.slice(0);
  arr.sort(function (a, b) {
    return a - b;
  });
  return arr;
}
function updateSnap() {
  var O = this.options;
  // Notify that the ranged options have been modified
  if (Array.isArray(O.snap)) {
    Object.assign(
      this,
      ArraySnapModule(O, new Float64Array(numSort(O.snap)).buffer)
    );
  } else if (typeof O.snap === 'number' && O.snap > 0.0) {
    Object.assign(
      this,
      LinearSnapModule({
        min: Math.min(O.min, O.max),
        max: Math.max(O.min, O.max),
        step: O.snap,
        base: O.base || 0,
        clip: O.clip,
      })
    );
  } else if (O.min < Infinity && O.max > -Infinity) {
    Object.assign(
      this,
      NullSnapModule({
        min: Math.min(O.min, O.max),
        max: Math.max(O.min, O.max),
        clip: O.clip,
      })
    );
  } else {
    Object.assign(this, {
      snap: function (v) {
        return +v;
      },
      snapUp: function (v) {
        return +v;
      },
      snapDown: function (v) {
        return +v;
      },
    });
  }
}

// Creates a piecewise linear transformation.
function makePiecewiseLinearTransformation(options, heap) {
  var reverse = options.reverse | 0;
  var l = heap.byteLength >> 4;
  var X = new Float64Array(heap, 0, l);
  var Y = new Float64Array(heap, l * 8, l);
  var basis = +options.basis;

  if (!(l >= 2))
    throw new TypeError(
      'piece-wise linear transformations need at least 2 entries.'
    );

  function valueToBased(coef, size) {
    var a = 0,
      b = (l - 1) | 0,
      mid = 0,
      t = 0.0;

    coef = +coef;
    size = +size;

    if (!(coef > +Y[0])) return +X[0] * size;
    if (!(coef < +Y[(b << 3) >> 3])) return +X[(b << 3) >> 3] * size;

    do {
      mid = (a + b) >>> 1;
      t = +Y[(mid << 3) >> 3];
      if (coef > t) a = mid;
      else if (coef < t) b = mid;
      else return +X[(mid << 3) >> 3] * size;
    } while (((b - a) | 0) > 1);

    /* value lies between a and b */

    t =
      (+X[(b << 3) >> 3] - +X[(a << 3) >> 3]) /
      (+Y[(b << 3) >> 3] - +Y[(a << 3) >> 3]);

    t = +X[(a << 3) >> 3] + (coef - +Y[(a << 3) >> 3]) * t;

    t *= size;

    if (reverse) t = size - t;

    return t;
  }
  function basedToValue(coef, size) {
    var a = 0,
      b = (l - 1) | 0,
      mid = 0,
      t = 0.0;

    coef = +coef;
    size = +size;
    if (reverse) coef = size - coef;
    coef /= size;

    if (!(coef > 0)) return Y[0];
    if (!(coef < 1)) return Y[(b << 3) >> 3];

    do {
      mid = (a + b) >>> 1;
      t = +X[(mid << 3) >> 3];
      if (coef > t) a = mid;
      else if (coef < t) b = mid;
      else return +Y[(mid << 3) >> 3];
    } while (((b - a) | 0) > 1);

    /* value lies between a and b */

    t =
      (+Y[(b << 3) >> 3] - +Y[(a << 3) >> 3]) /
      (+X[(b << 3) >> 3] - +X[(a << 3) >> 3]);

    return +Y[(a << 3) >> 3] + (coef - +X[(a << 3) >> 3]) * t;
  }
  function valueToPixel(n) {
    return valueToBased(n, basis || 1);
  }
  function pixelToValue(n) {
    return basedToValue(n, basis || 1);
  }
  function valueToCoef(n) {
    return valueToBased(n, 1);
  }
  function coefToValue(n) {
    return basedToValue(n, 1);
  }
  return {
    valueToBased: valueToBased,
    basedToValue: basedToValue,
    valueToPixel: valueToPixel,
    pixelToValue: pixelToValue,
    valueToCoef: valueToCoef,
    coefToValue: coefToValue,
  };
}

// Creates a transformation from generic function.
function makeFunctionTransformation(options) {
  var reverse = options.reverse | 0;
  var scale = options.scale;
  var basis = +options.basis;
  function valueToBased(value, size) {
    value = +value;
    size = +size;
    value = scale(value, options, false) * size;
    if (reverse) value = size - value;
    return value;
  }
  function basedToValue(coef, size) {
    coef = +coef;
    size = +size;
    if (reverse) coef = size - coef;
    coef = scale(coef / size, options, true);
    return coef;
  }
  function valueToPixel(n) {
    return valueToBased(n, basis || 1);
  }
  function pixelToValue(n) {
    return basedToValue(n, basis || 1);
  }
  function valueToCoef(n) {
    return valueToBased(n, 1);
  }
  function coefToValue(n) {
    return basedToValue(n, 1);
  }
  return {
    valueToBased: valueToBased,
    basedToValue: basedToValue,
    valueToPixel: valueToPixel,
    pixelToValue: pixelToValue,
    valueToCoef: valueToCoef,
    coefToValue: coefToValue,
  };
}

// Creates a linear transformation.
function makeLinearTransformation(options) {
  var reverse = options.reverse | 0;
  var min = +options.min;
  var max = +options.max;
  var basis = +options.basis;
  function valueToBased(value, size) {
    value = +value;
    size = +size;
    value = ((value - min) / (max - min)) * size;
    if (reverse) value = size - value;
    return value;
  }
  function basedToValue(coef, size) {
    coef = +coef;
    size = +size;
    if (reverse) coef = size - coef;
    coef = (coef / size) * (max - min) + min;
    return coef;
  }
  // just a wrapper for having understandable code and backward
  // compatibility
  function valueToPixel(n) {
    n = +n;
    if (basis == 0.0) basis = 1.0;
    return +valueToBased(n, basis);
  }
  // just a wrapper for having understandable code and backward
  // compatibility
  function pixelToValue(n) {
    n = +n;
    if (basis == 0.0) basis = 1.0;
    return +basedToValue(n, basis);
  }
  // calculates a coefficient for the value
  function valueToCoef(n) {
    n = +n;
    return +valueToBased(n, 1.0);
  }
  // calculates a value from a coefficient
  function coefToValue(n) {
    n = +n;
    return +basedToValue(n, 1.0);
  }
  return {
    /**
     * Transforms a value from the coordinate system to the interval <code>0</code>...<code>basis</code>.
     *
     * @method Ranged#valueToBased
     *
     * @param {number} value
     * @param {number} [basis=1]
     *
     * @returns {number}
     */
    valueToBased: valueToBased,
    /**
     * Transforms a value from the interval <code>0</code>...<code>basis</code> to the coordinate system.
     *
     * @method Ranged#basedToValue
     *
     * @param {number} value
     * @param {number} [basis=1]
     *
     * @returns {number}
     */
    basedToValue: basedToValue,
    /**
     * This is an alias for {@link Ranged#valueToPixel}.
     *
     * @method Ranged#valueToPixel
     *
     * @param {number} value
     *
     * @returns {number}
     */
    valueToPixel: valueToPixel,
    /**
     * This is an alias for {@link Ranged#pixelToValue}.
     *
     * @method Ranged#pixelToValue
     *
     * @param {number} value
     *
     * @returns {number}
     */
    pixelToValue: pixelToValue,
    /**
     * Calls {@link basedToValue} with <code>basis = 1</code>.
     *
     * @method Ranged#valueToCoef
     *
     * @param {number} value
     *
     * @returns {number}
     */
    valueToCoef: valueToCoef,
    /**
     * Calls {@link basedToValue} with <code>basis = 1</code>.
     *
     * @method Ranged#coefToValue
     *
     * @param {number} value
     *
     * @returns {number}
     */
    coefToValue: coefToValue,
  };
}

// Creates a logarithmic transformation.
function makeLogarithmicTransformation(options) {
  var reverse = options.reverse | 0;
  var min = +options.min;
  var max = +options.max;
  var log_factor = +options.log_factor;
  var trafo_reverse = options.trafo_reverse | 0;
  var basis = +options.basis;
  function valueToBased(value, size) {
    value = +value;
    size = +size;
    value = +dBToScale(value, min, max, size, trafo_reverse, log_factor);
    if (reverse) value = size - value;
    return value;
  }
  function basedToValue(coef, size) {
    coef = +coef;
    size = +size;
    if (reverse) coef = size - coef;
    coef = +scaleToDB(coef, min, max, size, trafo_reverse, log_factor);
    return coef;
  }
  function valueToPixel(n) {
    return valueToBased(n, basis || 1);
  }
  function pixelToValue(n) {
    return basedToValue(n, basis || 1);
  }
  function valueToCoef(n) {
    return valueToBased(n, 1);
  }
  function coefToValue(n) {
    return basedToValue(n, 1);
  }
  return {
    valueToBased: valueToBased,
    basedToValue: basedToValue,
    valueToPixel: valueToPixel,
    pixelToValue: pixelToValue,
    valueToCoef: valueToCoef,
    coefToValue: coefToValue,
  };
}

// A transformation for frequency scales.
function makeFrequencyTransformation(options) {
  var reverse = options.reverse | 0;
  var min = +options.min;
  var max = +options.max;
  var trafo_reverse = options.trafo_reverse | 0;
  var basis = +options.basis;
  function valueToBased(value, size) {
    value = +value;
    size = +size;
    value = +freqToScale(value, min, max, size, trafo_reverse);
    if (reverse) value = size - value;
    return value;
  }
  function basedToValue(coef, size) {
    coef = +coef;
    size = +size;
    if (reverse) coef = size - coef;
    coef = +scaleToFreq(coef, min, max, size, trafo_reverse);
    return coef;
  }
  function valueToPixel(n) {
    return valueToBased(n, basis || 1);
  }
  function pixelToValue(n) {
    return basedToValue(n, basis || 1);
  }
  function valueToCoef(n) {
    return valueToBased(n, 1);
  }
  function coefToValue(n) {
    return basedToValue(n, 1);
  }
  return {
    valueToBased: valueToBased,
    basedToValue: basedToValue,
    valueToPixel: valueToPixel,
    pixelToValue: pixelToValue,
    valueToCoef: valueToCoef,
    coefToValue: coefToValue,
  };
}
function updateTransformation() {
  var O = this.options;
  var scale = O.scale;

  var module;

  if (typeof scale === 'function') {
    module = makeFunctionTransformation(O);
  } else if (Array.isArray(scale)) {
    var i = 0;
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

    module = makePiecewiseLinearTransformation(O, new Float64Array(scale).buffer);
  } else
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

  Object.assign(this, module);
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
  },
  static_events: {
    set: setCallback,
    initialized: function () {
      var O = this.options;
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
