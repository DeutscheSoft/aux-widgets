/**
 * Calculates 10^(value / factor).
 * Transforms a dBFS value to the corresponding gain.
 *
 * @param value - A decibel value in dBFS.
 * @param factor - The factor (defaults to 20).
 * @returns The gain value.
 */
export declare function dBToGain(value: number, factor?: number): number;

/**
 * Calculates factor * log10(value).
 * Transforms a gain value to the corresponding dBFS value.
 *
 * @param value - A gain factor.
 * @param factor - The factor (defaults to 20).
 * @returns The decibel value in dBFS.
 */
export declare function gainToDB(value: number, factor?: number): number;

/**
 * Calculates a linear value between 0.0 and 1.0
 * from a value and its lower and upper boundaries in decibels.
 *
 * @param value - The value in decibels.
 * @param min - The minimum value in decibels.
 * @param max - The maximum value in decibels.
 * @param reverse - If the scale is reversed.
 * @param factor - Changes the deflection of the logarithm if other than 1.0.
 * @returns A value between 0.0 (min) and 1.0 (max).
 */
export declare function dBToCoef(
  value: number,
  min: number,
  max: number,
  reverse: boolean | number,
  factor: number
): number;

/**
 * Calculates a value in decibels from a value
 * between 0.0 and 1.0 and some lower and upper boundaries in decibels.
 *
 * @param coef - A value between 0.0 and 1.0.
 * @param min - The minimum value in decibels.
 * @param max - The maximum value in decibels.
 * @param reverse - If the scale is reversed.
 * @param factor - Changes the deflection of the logarithm if other than 1.0.
 * @returns The result in decibels.
 */
export declare function coefToDB(
  coef: number,
  min: number,
  max: number,
  reverse: boolean | number,
  factor: number
): number;

/**
 * Calculates a linear value between 0.0 and scale
 * from a value and its lower and upper boundaries in decibels.
 *
 * @param value - The value in decibels.
 * @param min - The minimum value in decibels.
 * @param max - The maximum value in decibels.
 * @param scale - The scale size.
 * @param reverse - If the scale is reversed.
 * @param factor - Changes the deflection of the logarithm if other than 1.0.
 * @returns A value between 0.0 and scale.
 */
export declare function dBToScale(
  value: number,
  min: number,
  max: number,
  scale: number,
  reverse: boolean | number,
  factor: number
): number;

/**
 * Calculates a value in decibels from a value
 * between 0.0 and scale and some lower and upper boundaries in decibels.
 *
 * @param value - A value between 0.0 and scale.
 * @param min - The minimum value in decibels.
 * @param max - The maximum value in decibels.
 * @param scale - The scale size.
 * @param reverse - If the scale is reversed.
 * @param factor - Changes the deflection of the logarithm if other than 1.0.
 * @returns The result in decibels.
 */
export declare function scaleToDB(
  value: number,
  min: number,
  max: number,
  scale: number,
  reverse: boolean | number,
  factor: number
): number;

/**
 * Calculates a linear value between 0.0 and 1.0
 * from a value and its lower and upper boundaries in hertz.
 *
 * @param value - The value in hertz.
 * @param min - The minimum value in hertz.
 * @param max - The maximum value in hertz.
 * @param reverse - If the scale is reversed.
 * @returns A value between 0.0 (min) and 1.0 (max).
 */
export declare function freqToCoef(
  value: number,
  min: number,
  max: number,
  reverse: boolean | number
): number;

/**
 * Calculates a value in hertz from a value
 * between 0.0 and 1.0 and some lower and upper boundaries in hertz.
 *
 * @param coef - A value between 0.0 and 1.0.
 * @param min - The minimum value in hertz.
 * @param max - The maximum value in hertz.
 * @param reverse - If the scale is reversed.
 * @returns The result in hertz.
 */
export declare function coefToFreq(
  coef: number,
  min: number,
  max: number,
  reverse: boolean | number
): number;

/**
 * Calculates a linear value between 0.0 and scale
 * from a value and its lower and upper boundaries in hertz.
 *
 * @param value - The value in hertz.
 * @param min - The minimum value in hertz.
 * @param max - The maximum value in hertz.
 * @param scale - The scale size.
 * @param reverse - If the scale is reversed.
 * @returns A value between 0.0 and scale.
 */
export declare function freqToScale(
  value: number,
  min: number,
  max: number,
  scale: number,
  reverse: boolean | number
): number;

/**
 * Calculates a value in hertz from a value
 * between 0.0 and scale and some lower and upper boundaries in hertz.
 *
 * @param value - A value between 0.0 and scale.
 * @param min - The minimum value in hertz.
 * @param max - The maximum value in hertz.
 * @param scale - The scale size.
 * @param reverse - If the scale is reversed.
 * @returns The result in hertz.
 */
export declare function scaleToFreq(
  value: number,
  min: number,
  max: number,
  scale: number,
  reverse: boolean | number
): number;
