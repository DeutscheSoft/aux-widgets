import { EffectiveEvents } from '../implements/base.js';
import { IStandardBiquadFilterName, IBiquadTransform } from '../utils/biquad.js';
import {
  ChartHandle,
  IChartHandleOptions,
  IChartHandleEvents,
} from './charthandle.js';

/**
 * Options specific to the EqBand widget.
 * Extends ChartHandle options.
 */
export interface IEqBandOptions extends IChartHandleOptions {
  /** The type of the filter. Possible values are 'parametric', 'notch', 'low-shelf', 'high-shelf', 'lowpass[n]' or 'highpass[n]', or a custom biquad transform function. */
  type?: IStandardBiquadFilterName | IBiquadTransform;
  /** Frequency setting. This is an alias for the option x defined by ChartHandle. */
  freq?: number;
  /** Gain setting. This is an alias for the option y defined by ChartHandle. */
  gain?: number;
  /** Quality setting. This is an alias for the option z defined by ChartHandle. */
  q?: number;
  /** Value of the x-coordinate (frequency). */
  x?: number;
  /** Value of the y-coordinate (gain). */
  y?: number;
  /** Value of the z-coordinate (quality/Q). */
  z?: number;
  /** Set to false to not take this filter into account when drawing the response graph. */
  active?: boolean;
}

/**
 * Events specific to the EqBand widget.
 * Extends ChartHandle events.
 */
export interface IEqBandEvents extends IChartHandleEvents {
  // EqBand doesn't add any specific events beyond ChartHandle events
}

/**
 * An EqBand extends a ChartHandle and holds a
 * dependent Filter. It is used as a fully functional representation
 * of a single equalizer band in Equalizer. EqBand needs a Chart
 * or any other derivate to be drawn in.
 */
export declare class EqBand<
  TOptions extends IEqBandOptions = IEqBandOptions,
  TEvents extends IEqBandEvents = IEqBandEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends ChartHandle<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main SVG group. Has class .aux-eqband */
  element: SVGGElement;
  /** The filter providing the graphical calculations. */
  filter: import('../modules/filter.js').Filter;

  /**
   * Calculate the gain for a given frequency in Hz.
   *
   * @param freq - The frequency.
   * @returns The gain at the given frequency.
   */
  frequencyToGain(freq: number): number;
}
