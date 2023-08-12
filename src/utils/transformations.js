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

import { dBToScale, scaleToDB, freqToScale, scaleToFreq } from './audiomath.js';

/**
 * A factory function which creates a snap module which
 * snaps to values which are distributed at equal distance
 * on a range.
 */
export function LinearSnapModule({ base, clip, max, min, step }) {
  min = +min;
  max = +max;
  step = +step;
  base = +base;
  clip = !!clip;

  function lowSnap(v, direction) {
    v = +v;
    direction = +direction;
    let n = 0.0;
    let t = 0.0;

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

/**
 * A factory function which creates a snap module which snaps to values
 * in a sorted list.
 */
export function ArraySnapModule({ clip, max, min }, heap) {
  const values = new Float64Array(heap);
  const len = (heap.byteLength >> 3) | 0;

  if (min !== void 0) {
    min = +min;
  } else {
    min = values[0];
  }

  if (max !== void 0) {
    max = +max;
  } else {
    max = values[len - 1];
  }

  clip = !!clip;

  function lowSnap(v, direction) {
    v = +v;
    direction = +direction;
    let a = 0;
    let mid = 0;
    let b = 0;
    let t = 0.0;

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

/**
 * A factory function which creates a snap modules which does
 * no snapping. If <code>options.clip</code> is <code>true</code>,
 * it will clip to <code>options.min</code> and <code>options.max</code>.
 */
export function NullSnapModule({ max, min, clip }) {
  min = +min;
  max = +max;
  clip = !!clip;

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

/**
 * Does not snapping or clipping at all.
 */
export const TrivialSnapModule = {
  snap: function (v) {
    return +v;
  },
  snapUp: function (v) {
    return +v;
  },
  snapDown: function (v) {
    return +v;
  },
};

/**
 * Factory function which creates a piecewise linear transformation.
 */
export function makePiecewiseLinearTransformation({ basis, reverse }, heap) {
  reverse |= 0;
  basis = +basis;
  const l = heap.byteLength >> 4;
  const X = new Float64Array(heap, 0, l);
  const Y = new Float64Array(heap, l * 8, l);

  if (!(l >= 2))
    throw new TypeError(
      'piece-wise linear transformations need at least 2 entries.'
    );

  function valueToBased(coef, size) {
    let a = 0,
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
    let a = 0,
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

/**
 * Factory function which creates a transformation from generic function.
 */
export function makeFunctionTransformation({ reverse, scale, basis }, options) {
  reverse |= 0;
  basis = +basis;

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

/**
 * Creates a linear transformation.
 */
export function makeLinearTransformation({ reverse, min, max, basis }) {
  reverse |= 0;
  min = +min;
  max = +max;
  basis = +basis || 1.0;

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
  function valueToPixel(n) {
    n = +n;
    return +valueToBased(n, basis);
  }
  function pixelToValue(n) {
    n = +n;
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

/**
 * Factory function which creates a logarithmic transformation.
 */
export function makeLogarithmicTransformation({
  basis,
  log_factor,
  max,
  min,
  reverse,
  trafo_reverse,
}) {
  reverse |= 0;
  min = +min;
  max = +max;
  log_factor = +log_factor;
  trafo_reverse |= 0;
  basis = +basis;

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

/**
 * Factory function which creates a transformation for frequency scales.
 */
export function makeFrequencyTransformation({
  basis,
  max,
  min,
  reverse,
  trafo_reverse,
}) {
  reverse |= 0;
  min = +min;
  max = +max;
  trafo_reverse |= 0;
  basis = +basis;

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
