/**
 * Options for biquad filter transformations.
 */
export interface IBiquadTransformOptions {
  /** The current frequency, i.e. the x position in the equalizer graph. */
  freq: number;
  /** The current gain, i.e. the y position in the equalizer graph. */
  gain: number;
  /** The Q of the filter, i.e. the z position in the equalizer graph. */
  q: number;
  /** The sample rate. */
  sample_rate: number;
  /** Optional factor for some filters. */
  factor?: number;
}

/**
 * Biquad filter coefficients returned by transform functions.
 */
export interface IBiquadCoefficients {
  /** Biquad coefficient b0. */
  b0: number;
  /** Biquad coefficient b1. */
  b1: number;
  /** Biquad coefficient b2. */
  b2: number;
  /** Biquad coefficient a0. */
  a0: number;
  /** Biquad coefficient a1. */
  a1: number;
  /** Biquad coefficient a2. */
  a2: number;
  /** The sample rate. */
  sample_rate: number;
  /** Optional factor for some filters. */
  factor?: number;
}

/**
 * Biquad transform function signature.
 * Takes filter parameters and returns biquad coefficients.
 */
export type IBiquadTransform = (options: IBiquadTransformOptions) => IBiquadCoefficients;

/**
 * Frequency to gain function signature.
 * Calculates the gain in dB for a given frequency.
 */
export type IFrequencyToGain = (frequency: number) => number;

/**
 * Filter factory function signature.
 * Creates a frequency-to-gain function from filter options.
 */
export type IFilterFactory = (options: IBiquadTransformOptions) => IFrequencyToGain;

/**
 * Standard biquad filter names.
 */
export type IStandardBiquadFilterName =
  | 'null'
  | 'low-shelf'
  | 'high-shelf'
  | 'parametric'
  | 'notch'
  | 'lowpass1'
  | 'lowpass2'
  | 'lowpass3'
  | 'lowpass4'
  | 'highpass1'
  | 'highpass2'
  | 'highpass3'
  | 'highpass4';

/**
 * Trivial filter that does not change the gain.
 */
export declare function NULL(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Low-Shelf filter.
 */
export declare function lowShelf(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * High-Shelf filter.
 */
export declare function highShelf(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Peak filter.
 */
export declare function peaking(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Notch filter.
 */
export declare function notch(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Standard lowpass filter with transfer function H(s) = 1/(1+s).
 */
export declare function lowPass1(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Lowpass filter (2nd order).
 */
export declare function lowPass2(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Lowpass filter (4th order).
 */
export declare function lowPass4(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Standard highpass filter with transfer function H(s) = s/(1+s).
 */
export declare function highPass1(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Highpass filter (2nd order).
 */
export declare function highPass2(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * Highpass filter (4th order).
 */
export declare function highPass4(options: IBiquadTransformOptions): IBiquadCoefficients;

/**
 * A set of standard filters.
 * Each property is a filter factory function that implements the EqFilter interface.
 */
export declare const standardBiquadFilters: Record<IStandardBiquadFilterName, IFilterFactory>;

/**
 * This function can be used to turn a series of biquad filter transformations
 * into an object which implements the EqFilter interface. In other
 * words, this method will calculate the frequency response of generic biquad
 * filters based on their biquad coefficients.
 *
 * @param transforms - The list of biquad transformations. Each of
 *      these functions is expected to implement the IBiquadTransform interface.
 *      If a single transform is provided, it returns a factory for that transform.
 *      If multiple transforms are provided, it returns a factory that combines them.
 * @returns The filter factory object.
 */
export declare function biquadFilter(
  transform: IBiquadTransform
): IFilterFactory;
export declare function biquadFilter(
  ...transforms: IBiquadTransform[]
): IFilterFactory;
