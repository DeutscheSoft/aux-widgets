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

/**
 * AudioMath provides transformations commonly used when handling
 * audio related units.
 *
 * @module utils/audiomath
 */

const log = Math.log;
const pow = Math.pow;
const MAX = Math.max;
const LN2 = Math.LN2;
const LN10 = Math.LN10;

function log2(value) {
  value = +value;
  return +log(value) / LN2;
}

function log10(value) {
  value = +value;
  return +log(value) / LN10;
}

/**
 * Calculates 10^(value / factor).
 * Transforms a dBFS value to the corresponding gain.
 *
 * @function dBToGain
 *
 * @param {number} value - A decibel value in dBFS.
 * @param {number} [factor=20] - The factor.
 */
export function dBToGain(value, factor) {
  value = +value;
  factor = +factor;

  if (!(factor >= 0.0)) factor = 20.0;

  value = +(value / factor);
  value = +pow(10.0, value);

  return value;
}

/**
 * Calculates factor * log10(value).
 * Transforms a gain value to the corresponding dBFS value.
 *
 * @function gainToDB
 *
 * @param {number} value - A gain factor.
 * @param {number} [factor=20] - The factor.
 */
export function gainToDB(value, factor) {
  value = +value;
  factor = +factor;

  if (!(factor >= 0.0)) factor = 20.0;

  value = factor * +log10(value);

  return value;
}

/**
 * Calculates a linear value between 0.0 and 1.0
 * from a value and its lower and upper boundaries in decibels.
 *
 * @function dBToCoef
 *
 * @param {number} value - The value in decibels.
 * @param {number} min - The minimum value in decibels.
 * @param {number} max - The maximum value in decibels.
 * @param {boolean} reverse - If the scale is reversed.
 * @param {number} factor - Changes the deflection of the logarithm if other than 1.0.
 *
 * @returns {number} A value between 0.0 (min) and 1.0 (max).
 */
export function dBToCoef(value, min, max, reverse, factor) {
  value = +value;
  min = +min;
  max = +max;
  reverse = reverse | 0;
  factor = +factor;
  let logfac = 1.0;
  if (factor === 0.0) factor = 1.0;
  else logfac = +MAX(1.0, +pow(2.0, factor) - 1.0);
  if (reverse) value = max - (value - min);
  value = +log2(1.0 + ((value - min) / (max - min)) * logfac) / factor;
  if (reverse) value = -value + 1.0;
  return value;
}

/**
 * Calculates a value in decibels from a value
 * between 0.0 and 1.0 and some lower and upper boundaries in decibels.
 *
 * @function coefToDB
 *
 * @param {number} coef - A value between 0.0 and 1.0.
 * @param {number} min - The minimum value in decibels.
 * @param {number} max - The maximum value in decibels.
 * @param {boolean} reverse - If the scale is reversed.
 * @param {number} factor - Changes the deflection of the logarithm if other than 1.0.
 *
 * @returns {number} The result in decibels.
 */
export function coefToDB(coef, min, max, reverse, factor) {
  coef = +coef;
  min = +min;
  max = +max;
  reverse = reverse | 0;
  factor = +factor;
  let logfac = 1.0;
  if (factor === 0.0) factor = 1.0;
  else logfac = +MAX(1.0, +pow(2.0, factor) - 1.0);
  if (reverse) coef = -coef + 1.0;
  coef = ((+pow(2.0, coef * factor) - 1.0) / logfac) * (max - min) + min;
  if (reverse) coef = max - coef + min;
  return coef;
}

/**
 * Calculates a linear value between 0.0 and scale.
 * from a value and its lower and upper boundaries in decibels.
 *
 * @function dBToScale
 *
 * @param {number} value - The value in decibels.
 * @param {number} min - The minimum value in decibels.
 * @param {number} max - The maximum value in decibels.
 * @param {boolean} reverse - If the scale is reversed.
 * @param {number} factor - Changes the deflection of the logarithm if other than 1.0.
 *
 * @returns {number} A value between 0.0 and scale.
 */
export function dBToScale(value, min, max, scale, reverse, factor) {
  value = +value;
  min = +min;
  max = +max;
  scale = +scale;
  reverse = reverse | 0;
  factor = +factor;
  let logfac = 1.0;
  if (factor === 0.0) factor = 1.0;
  else logfac = +MAX(1.0, +pow(2.0, factor) - 1.0);
  if (reverse) value = max - (value - min);
  value = +log2(1.0 + ((value - min) / (max - min)) * logfac) / factor;
  if (reverse) value = -value + 1.0;
  return value * scale;
}

/**
 * Calculates a value in decibels from a value
 * between 0.0 and scale and some lower and upper boundaries in decibels.
 *
 * @function scaleToDB
 *
 * @param {number} value - A value between 0.0 and scale.
 * @param {number} min - The minimum value in decibels.
 * @param {number} max - The maximum value in decibels.
 * @param {boolean} reverse - If the scale is reversed.
 * @param {number} factor - Changes the deflection of the logarithm if other than 1.0.
 *
 * @returns {number} The result in decibels.
 */
export function scaleToDB(value, min, max, scale, reverse, factor) {
  value = +value;
  min = +min;
  max = +max;
  scale = +scale;
  reverse = reverse | 0;
  factor = +factor;
  let logfac = 1.0;
  if (factor === 0.0) factor = 1.0;
  else logfac = +MAX(1.0, +pow(2.0, factor) - 1.0);
  value = value / scale;
  if (reverse) value = -value + 1.0;
  value = ((+pow(2.0, value * factor) - 1.0) / logfac) * (max - min) + min;
  if (reverse) value = max - value + min;
  return value;
}

/**
 * Calculates a linear value between 0.0 and 1.0
 * from a value and its lower and upper boundaries in hertz.
 *
 * @function freqToCoef
 *
 * @param {number} value - The value in hertz.
 * @param {number} min - The minimum value in hertz.
 * @param {number} max - The maximum value in hertz.
 * @param {boolean} reverse - If the scale is reversed.
 *
 * @returns {number} A value between 0.0 (min) and 1.0 (max).
 */
export function freqToCoef(value, min, max, reverse /*, prescaled, factor*/) {
  value = +value;
  min = +min;
  max = +max;
  reverse = reverse | 0;
  // FIXME: unused
  if (reverse) value = max - (value - min);
  min = +log10(min);
  max = +log10(max);
  value = (+log10(value) - min) / (max - min);
  if (reverse) value = -value + 1.0;
  return value;
}

/**
 * Calculates a value in hertz from a value
 * between 0.0 and 1.0 and some lower and upper boundaries in hertz.
 *
 * @function coefToFreq
 *
 * @param {number} coef - A value between 0.0 and 1.0.
 * @param {number} min - The minimum value in hertz.
 * @param {number} max - The maximum value in hertz.
 * @param {boolean} reverse - If the scale is reversed.
 * @param {number} factor - Changes the deflection of the logarithm if other than 1.0.
 *
 * @returns {number} The result in hertz.
 */
export function coefToFreq(coef, min, max, reverse) {
  coef = +coef;
  min = +min;
  max = +max;
  reverse = reverse | 0;
  if (reverse) coef = -coef + 1.0;
  min = +log10(min);
  max = +log10(max);
  coef = +pow(10.0, coef * (max - min) + min);
  if (reverse) coef = max - coef + min;
  return coef;
}

/**
 * Calculates a linear value between 0.0 and scale
 * from a value and its lower and upper boundaries in hertz.
 *
 * @function freqToScale
 *
 * @param {number} value - The value in hertz.
 * @param {number} min - The minimum value in hertz.
 * @param {number} max - The maximum value in hertz.
 * @param {boolean} reverse - If the scale is reversed.
 *
 * @returns {number} A value between 0.0 and scale.
 */
export function freqToScale(value, min, max, scale, reverse) {
  value = +value;
  min = +min;
  max = +max;
  scale = +scale;
  reverse = reverse | 0;
  if (reverse) value = max - (value - min);
  min = +log10(min);
  max = +log10(max);
  value = (+log10(value) - min) / (max - min);
  if (reverse) value = -value + 1.0;
  return value * scale;
}

/**
 * Calculates a value in hertz from a value
 * between 0.0 and scale and some lower and upper boundaries in hertz.
 *
 * @function scaleToFreq
 *
 * @param {number} value - A value between 0.0 and scale.
 * @param {number} min - The minimum value in hertz.
 * @param {number} max - The maximum value in hertz.
 * @param {boolean} reverse - If the scale is reversed.
 * @param {number} factor - Changes the deflection of the logarithm if other than 1.0.
 *
 * @returns {number} The result in hertz.
 */
export function scaleToFreq(value, min, max, scale, reverse) {
  value = +value;
  min = +min;
  max = +max;
  scale = +scale;
  reverse = reverse | 0;
  value = value / scale;
  if (reverse) value = -value + 1.0;
  min = +log10(min);
  max = +log10(max);
  value = pow(10.0, value * (max - min) + min);
  if (reverse) value = max - value + min;
  return value;
}
