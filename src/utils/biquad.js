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

/**
 * This module contains functions for deadling with biquad filters and
 * also implementation of common filters.
 * The formulae for 'standard' biquad filter coefficients are taken
 * from
 *  "Cookbook formulae for audio EQ biquad filter coefficients"
 *  by Robert Bristow-Johnson.
 *
 * @module utils/biquad
 */

/**
 * Trivial filter.
 *
 * @implements {@link BiquadTransform}
 */
export function NULL(O) {
  /* this biquad does not do anything */
  return {
    b0: 1,
    b1: 1,
    b2: 1,
    a0: 1,
    a1: 1,
    a2: 1,
    sample_rate: O.sample_rate,
  };
}

/**
 * Low-Shelf filter.
 *
 * @implements {@link BiquadTransform}
 */
export function lowShelf(O) {
  var cos = Math.cos,
    sqrt = Math.sqrt,
    A = Math.pow(10, O.gain / 40),
    w0 = (2 * Math.PI * O.freq) / O.sample_rate,
    alpha = Math.sin(w0) / (2 * O.q);
  return {
    b0: A * (A + 1 - (A - 1) * cos(w0) + 2 * sqrt(A) * alpha),
    b1: 2 * A * (A - 1 - (A + 1) * cos(w0)),
    b2: A * (A + 1 - (A - 1) * cos(w0) - 2 * sqrt(A) * alpha),
    a0: A + 1 + (A - 1) * cos(w0) + 2 * sqrt(A) * alpha,
    a1: -2 * (A - 1 + (A + 1) * cos(w0)),
    a2: A + 1 + (A - 1) * cos(w0) - 2 * sqrt(A) * alpha,
    sample_rate: O.sample_rate,
  };
}

/**
 * High-Shelf filter.
 *
 * @implements {@link BiquadTransform}
 */
export function highShelf(O) {
  var cos = Math.cos;
  var sqrt = Math.sqrt;
  var A = Math.pow(10, O.gain / 40);
  var w0 = (2 * Math.PI * O.freq) / O.sample_rate;
  var alpha = Math.sin(w0) / (2 * O.q);
  return {
    b0: A * (A + 1 + (A - 1) * cos(w0) + 2 * sqrt(A) * alpha),
    b1: -2 * A * (A - 1 + (A + 1) * cos(w0)),
    b2: A * (A + 1 + (A - 1) * cos(w0) - 2 * sqrt(A) * alpha),
    a0: A + 1 - (A - 1) * cos(w0) + 2 * sqrt(A) * alpha,
    a1: 2 * (A - 1 - (A + 1) * cos(w0)),
    a2: A + 1 - (A - 1) * cos(w0) - 2 * sqrt(A) * alpha,
    sample_rate: O.sample_rate,
  };
}

/**
 * Peak filter.
 *
 * @implements {@link BiquadTransform}
 */
export function peaking(O) {
  var cos = Math.cos;
  var A = Math.pow(10, O.gain / 40);
  var w0 = (2 * Math.PI * O.freq) / O.sample_rate;
  var alpha = Math.sin(w0) / (2 * O.q);
  return {
    b0: 1 + alpha * A,
    b1: -2 * cos(w0),
    b2: 1 - alpha * A,
    a0: 1 + alpha / A,
    a1: -2 * cos(w0),
    a2: 1 - alpha / A,
    sample_rate: O.sample_rate,
  };
}

/**
 * notch filter.
 *
 * @implements {@link BiquadTransform}
 */
export function notch(O) {
  var cos = Math.cos;
  var w0 = (2 * Math.PI * O.freq) / O.sample_rate;
  var alpha = Math.sin(w0) / (2 * O.q);
  return {
    b0: 1,
    b1: -2 * cos(w0),
    b2: 1,
    a0: 1 + alpha,
    a1: -2 * cos(w0),
    a2: 1 - alpha,
    sample_rate: O.sample_rate,
  };
}

/**
 * This is a standard lowpass filter with transfer function
 * H(s) = 1/(1+s).
 *
 * @implements {@link BiquadTransform}
 */
export function lowPass1(O) {
  var w0 = (2 * Math.PI * O.freq) / O.sample_rate,
    s0 = Math.sin(w0),
    c0 = Math.cos(w0);
  return {
    b0: 1 - c0,
    b1: 2 * (1 - c0),
    b2: 1 - c0,
    a0: 1 - c0 + s0,
    a1: 2 * (1 - c0),
    a2: 1 - c0 - s0,
    sample_rate: O.sample_rate,
  };
}

/**
 * @implements {@link BiquadTransform}
 */
export function lowPass2(O) {
  var cos = Math.cos;
  var w0 = (2 * Math.PI * O.freq) / O.sample_rate;
  var alpha = Math.sin(w0) / (2 * O.q);
  return {
    b0: (1 - cos(w0)) / 2,
    b1: 1 - cos(w0),
    b2: (1 - cos(w0)) / 2,
    a0: 1 + alpha,
    a1: -2 * cos(w0),
    a2: 1 - alpha,
    sample_rate: O.sample_rate,
  };
}

/**
 * @implements {@link BiquadTransform}
 */
export function lowPass4(O) {
  O = lowPass2(O);
  O.factor = 2;
  return O;
}

/**
 * This is a standard highpass filter with transfer function
 * H(s) = s/(1+s).
 *
 * @implements {@link BiquadTransform}
 */
export function highPass1(O) {
  var w0 = (2 * Math.PI * O.freq) / O.sample_rate,
    s0 = Math.sin(w0),
    c0 = Math.cos(w0);
  return {
    b0: s0,
    b1: 0,
    b2: -s0,
    a0: 1 - c0 + s0,
    a1: 2 * (1 - c0),
    a2: 1 - c0 - s0,
    sample_rate: O.sample_rate,
  };
}

/**
 * @implements {@link BiquadTransform}
 */
export function highPass2(O) {
  var cos = Math.cos;
  var w0 = (2 * Math.PI * O.freq) / O.sample_rate;
  var alpha = Math.sin(w0) / (2 * O.q);
  return {
    b0: (1 + cos(w0)) / 2,
    b1: -(1 + cos(w0)),
    b2: (1 + cos(w0)) / 2,
    a0: 1 + alpha,
    a1: -2 * cos(w0),
    a2: 1 - alpha,
    sample_rate: O.sample_rate,
  };
}

/**
 * @implements {@link BiquadTransform}
 */
export function highPass4(O) {
  O = highPass2(O);
  O.factor = 2;
  return O;
}

/**
 * A set of standard filters.
 *
 * @property {Filter~filter_factory} null - The trivial filter, which does not
 *      change the gain.
 * @property {Filter~filter_factory} parametric - peaking.
 * @property {Filter~filter_factory} notch -  notch.
 * @property {Filter~filter_factory} low-shelf - lowShelf.
 * @property {Filter~filter_factory} high-shelf - highShelf.
 * @property {Filter~filter_factory} lowpass1 - lowPass1.
 * @property {Filter~filter_factory} lowpass2 - lowPass2.
 * @property {Filter~filter_factory} lowpass3 - lowPass3.
 * @property {Filter~filter_factory} lowpass4 - lowPass4.
 * @property {Filter~filter_factory} highpass1 - highPass1.
 * @property {Filter~filter_factory} highpass2 - highPass2.
 * @property {Filter~filter_factory} highpass3 - highPass3.
 * @property {Filter~filter_factory} highpass4 - highPass4.
 */
export const standardBiquadFilters = {
  null: biquadFilter(NULL),
  'low-shelf': biquadFilter(lowShelf),
  'high-shelf': biquadFilter(highShelf),
  parametric: biquadFilter(peaking),
  notch: biquadFilter(notch),
  lowpass1: biquadFilter(lowPass1),
  lowpass2: biquadFilter(lowPass2),
  lowpass3: biquadFilter(lowPass1, lowPass2),
  lowpass4: biquadFilter(lowPass4),
  highpass1: biquadFilter(highPass1),
  highpass2: biquadFilter(highPass2),
  highpass3: biquadFilter(highPass1, highPass2),
  highpass4: biquadFilter(highPass4),
};

function nullFilter() {
  return 0;
}

//function bilinearModule(O) {
//var log = Math.log;
//var sin = Math.sin;

//var LN10_10 = ((O.factor || 1.0) * 10) / Math.LN10;
//var PI = +(Math.PI / O.sample_rate);
//var Ra = +(((O.a0 + O.a1) * (O.a0 + O.a1)) / 4);
//var Rb = +(((O.b0 + O.b1) * (O.b0 + O.b1)) / 4);
//var Ya = +(O.a1 * O.a0);
//var Yb = +(O.b1 * O.b0);

//if (Ra === Rb && Ya === Yb) return nullModule;

//function frequencyToGain(f) {
//f = +f;
//var S = +sin(PI * f);
//S *= S;
//return LN10_10 * log((Rb - S * Yb) / (Ra - S * Ya));
//}

//return frequencyToGain;
//}

function biquadModule(O) {
  var log = Math.log;
  var sin = Math.sin;

  var LN10_10 = ((O.factor || 1.0) * 10) / Math.LN10;
  var PI = +(Math.PI / O.sample_rate);
  var Ra = +(((O.a0 + O.a1 + O.a2) * (O.a0 + O.a1 + O.a2)) / 4);
  var Rb = +(((O.b0 + O.b1 + O.b2) * (O.b0 + O.b1 + O.b2)) / 4);
  var Xa = +(4 * O.a0 * O.a2);
  var Ya = +(O.a1 * (O.a0 + O.a2));
  var Xb = +(4 * O.b0 * O.b2);
  var Yb = +(O.b1 * (O.b0 + O.b2));

  if (Ra === Rb && Ya === Yb && Xa === Xb) return nullFilter;

  return function (f) {
    f = +f;
    var S = +sin(PI * f);
    S *= S;
    return (
      LN10_10 *
      log((Rb - S * (Xb * (1 - S) + Yb)) / (Ra - S * (Xa * (1 - S) + Ya)))
    );
  };
}

function biquadFilter1(trafo) {
  function factory(O) {
    return biquadModule(trafo(O));
  }

  return factory;
}

function biquadFilterN(trafos) {
  function factory(O) {
    var A = new Array(trafos.length);
    var i;

    for (i = 0; i < trafos.length; i++) {
      A[i] = biquadModule(trafos[i](O));
    }

    return function (f) {
      var ret = 0.0;
      var j;

      for (j = 0; j < A.length; j++) {
        ret += A[j](f);
      }

      return ret;
    };
  }

  return factory;
}

/**
 * @callback biquadTransform
 *
 * @param {Object} options - The filter parameters.
 * @param {number} options.freq - The current frequency, i.e. the x position in
 *      the equalizer graph.
 * @param {number} options.gain - The current gain, i.e. the y position in the
 *      equalizer graph.
 * @param {number} options.q - The Q of the filter, i.e. the z position in the
 *      equalizer graph.
 * @param {number} options.sample_rate - The sample rate.
 * @returns {Object} - An object containing the biquad coefficients `a0`, `a1`,
 * `a2`, `b0`, `b1`, `b2` and the sample rate `sample_rate`.
 */

/**
 * This function can be used to turn a series of biquad filter transformations
 * into an object which implements the {@link EqFilter} interface. In other
 * words, this method will calculate the frequency response of generic biquad
 * filters based on their biquad coefficients.
 *
 * @param {...Function} transforms - The list of biquad transformations. Each of
 *      these functions is expected to implement the {@link BiquadTransform}
 *      interface.
 * @returns {EqFilter} - The filter object.
 */
export function biquadFilter() {
  if (arguments.length === 1) return biquadFilter1(arguments[0]);

  return biquadFilterN.call(this, Array.prototype.slice.call(arguments));
}
