import { Base, IBaseEvents, EffectiveEvents } from '../implements/base.js';
import {
  IStandardBiquadFilterName,
  IBiquadTransform,
} from '../utils/biquad.js';

/**
 * EqFilter interface - implemented by all Equalizer filters.
 * Calculates the frequency response of the filter.
 */
export interface IEqFilter {
  /**
   * Calculates the frequency response of the filter, e.g. the effective change in
   * gain applied by this filter to a signal of a certain frequency.
   * @param frequency - The frequency in Hz.
   * @returns The change in gain in dB.
   */
  frequencyToGain(frequency: number): number;
}

/**
 * Filter factory function.
 * Returns an EqFilter object for a given set of parameters. This method will be
 * called by the Equalizer to update the filter objects when its parameters have changed.
 * The factory can return either a function directly or an object with a freq2gain property.
 * @param options - The filter parameters.
 * @param options.freq - The current frequency, i.e. the x position in the equalizer graph.
 * @param options.gain - The current gain, i.e. the y position in the equalizer graph.
 * @param options.q - The Q of the filter, i.e. the z position in the equalizer graph.
 * @param options.sample_rate - The sample rate.
 * @returns An EqFilter object (with freq2gain property) or a function that implements frequencyToGain.
 */
export type IFilterFactory = (options: {
  freq: number;
  gain: number;
  q: number;
  sample_rate: number;
}) =>
  | IEqFilter
  | { freq2gain: (frequency: number) => number }
  | ((frequency: number) => number);

/**
 * Options specific to the Filter class.
 * Extends Base options.
 */
export interface IFilterOptions extends Record<string, unknown> {
  /** The type of filter. This can either be a function which implements the filter_factory interface or a string naming one of the standard filters in StandardBiquadFilters. */
  type?: IStandardBiquadFilterName | IBiquadTransform | IFilterFactory;
  /** The initial frequency. */
  freq?: number;
  /** The initial gain. */
  gain?: number;
  /** The initial Q of the filter. */
  q?: number;
  /** The sample rate. */
  sample_rate?: number;
}

/**
 * Events specific to the Filter class.
 * Extends Base events.
 */
export interface IFilterEvents extends IBaseEvents {
  /** Fired when a filter's drawing function is reset. */
  reset: () => void;
}

/**
 * Filter provides the math for calculating a gain from
 * a given frequency for different types of biquad filters.
 */
export declare class Filter<
  TOptions extends IFilterOptions = IFilterOptions,
  TEvents extends IFilterEvents = IFilterEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends Base<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The frequency-to-gain function. This is computed internally and may be null until getFrequencyToGain() is called. */
  frequencyToGain: ((frequency: number) => number) | null;

  /**
   * Creates the frequency-to-gain function based on the current filter type and parameters.
   * This is called automatically by getFrequencyToGain() if needed.
   */
  createFrequencyToGain(): void;

  /**
   * Returns the frequency-to-gain function for this filter.
   * Creates it if it doesn't exist yet.
   * @returns The frequency-to-gain function that takes a frequency in Hz and returns gain in dB.
   */
  getFrequencyToGain(): (frequency: number) => number;

  /**
   * Resets the filter's drawing function.
   * This will cause it to be recalculated on the next call to getFrequencyToGain().
   * @emits Filter#reset
   */
  reset(): void;
}
