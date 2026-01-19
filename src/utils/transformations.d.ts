/**
 * Options passed to scale callback functions.
 * Contains the ranged options needed for transformation calculations.
 */
export interface IScaleCallbackOptions {
  /** Minimum value of the range. */
  min: number;
  /** Maximum value of the range. */
  max: number;
  /** The size of the linear scale. */
  basis?: number;
  /** Used to overexpand logarithmic curves. */
  log_factor?: number;
  /** Reverse the scale of the range. */
  reverse?: boolean;
  /** Additional options that may be needed by custom transformations. */
  [key: string]: unknown;
}

/**
 * Scale callback function signature for custom transformations.
 * This function is used to define custom coordinate transformations.
 *
 * @param value - The value to transform. When reverse is false, this is a value in the range [min, max].
 *   When reverse is true, this is a coefficient in the range [0, 1].
 * @param options - The transformation options containing min, max, and other ranged options.
 * @param reverse - If false, transforms from value to coefficient. If true, transforms from coefficient to value.
 * @returns The transformed value. When reverse is false, returns a coefficient [0, 1]. When reverse is true, returns a value in [min, max].
 */
export type IScaleCallback = (
  value: number,
  options: IScaleCallbackOptions,
  reverse: boolean
) => number;

/**
 * Transformation object returned by transformation factory functions.
 */
export interface ITransformation {
  /** Transforms a value from the coordinate system to the interval 0...basis. */
  valueToBased: (value: number, size: number) => number;
  /** Transforms a value from the interval 0...basis to the coordinate system. */
  basedToValue: (coef: number, size: number) => number;
  /** Transforms a value to pixel position. */
  valueToPixel: (value: number) => number;
  /** Transforms a pixel position to value. */
  pixelToValue: (pixel: number) => number;
  /** Transforms a value to coefficient (basis = 1). */
  valueToCoef: (value: number) => number;
  /** Transforms a coefficient to value (basis = 1). */
  coefToValue: (coef: number) => number;
  /** Clamps the given value into the value range of this transformation. */
  clampValue: (value: number) => number;
  /** Clamps the given value into the pixel range of this transformation. */
  clampPixel: (pos: number) => number;
}

/**
 * Factory function which creates a piecewise linear transformation.
 * The array structure is: [x0, x1, x2, ..., x(n-1), y0, y1, y2, ..., y(n-1)] where:
 * - The first half contains x values in the range [0, 1] (must be sorted)
 * - The second half contains y values (must be sorted)
 * The array must have an even number of elements and at least 2 entries (i.e., at least one x,y pair).
 *
 * @param params - Transformation parameters
 * @param params.basis - The size of the linear scale
 * @param params.reverse - Reverse the scale of the range
 * @param heap - ArrayBuffer containing the piecewise-linear data as Float64Array.
 *   The array should be structured as [x0, x1, ..., x(n-1), y0, y1, ..., y(n-1)] with the first half being x values and the second half being y values.
 * @returns A transformation object with methods for value/pixel conversion
 */
export declare function makePiecewiseLinearTransformation(
  params: { basis: number; reverse: number | boolean },
  heap: ArrayBuffer
): ITransformation;

/**
 * Factory function which creates a transformation from a generic function.
 *
 * @param params - Transformation parameters
 * @param params.reverse - Reverse the scale of the range
 * @param params.scale - The scale callback function
 * @param params.basis - The size of the linear scale
 * @param options - The transformation options containing min, max, and other ranged options
 * @returns A transformation object with methods for value/pixel conversion
 */
export declare function makeFunctionTransformation(
  params: { reverse: number | boolean; scale: IScaleCallback; basis: number },
  options: IScaleCallbackOptions
): ITransformation;
