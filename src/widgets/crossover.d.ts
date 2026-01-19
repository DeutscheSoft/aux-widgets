import { EqBand, IEqBandOptions, IEqBandEvents } from './eqband.js';
import { EqualizerGraph, IEqualizerGraphOptions, IEqualizerGraphEvents } from './equalizer.js';
import { Equalizer, IEqualizerOptions, IEqualizerEvents } from './equalizer.js';
import { EffectiveEvents } from '../implements/base.js';
import { IStandardBiquadFilterName, IBiquadTransform } from '../utils/biquad.js';
import { Filter } from '../modules/filter.js';
import { Range } from '../modules/range.js';

/**
 * Filter type - can be a standard biquad filter name or a custom transform function.
 */
export type ICrossoverFilterType = IStandardBiquadFilterName | IBiquadTransform;

/**
 * Options specific to the CrossoverBand widget.
 * Extends EqBand options.
 */
export interface ICrossoverBandOptions extends IEqBandOptions {
  /** The type of filter for the range below cutoff frequency. See EqBand for more information. */
  lower?: ICrossoverFilterType;
  /** The type of filter for the range above cutoff frequency. See EqBand for more information. */
  upper?: ICrossoverFilterType;
}

/**
 * Events specific to the CrossoverBand widget.
 * Extends EqBand events.
 */
export interface ICrossoverBandEvents extends IEqBandEvents {
  // CrossoverBand doesn't add any specific events beyond EqBand events
}

/**
 * CrossoverBand is an EqBand with an additional filter.
 */
export declare class CrossoverBand<
  TOptions extends ICrossoverBandOptions = ICrossoverBandOptions,
  TEvents extends ICrossoverBandEvents = ICrossoverBandEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends EqBand<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main SVG group. Has class .aux-crossoverband */
  element: SVGGElement;
  /** The filter providing the graphical calculations for the lower graph. */
  lower: Filter;
  /** The filter providing the graphical calculations for the upper graph. */
  upper: Filter;
  /** The filter providing the graphical calculations (alias for lower). */
  filter: Filter;
}

/**
 * Options specific to the CrossoverGraph widget.
 * Extends EqualizerGraph options.
 */
export interface ICrossoverGraphOptions extends IEqualizerGraphOptions {
  /** The index of the crossover band this graph represents. */
  index?: number;
}

/**
 * Events specific to the CrossoverGraph widget.
 * Extends EqualizerGraph events.
 */
export interface ICrossoverGraphEvents extends IEqualizerGraphEvents {
  // CrossoverGraph doesn't add any specific events beyond EqualizerGraph events
}

/**
 * CrossoverGraph is a special EqualizerGraph that draws the response
 * of a specific crossover band by combining the lower filter of one band
 * with the upper filter of the previous band.
 */
export declare class CrossoverGraph<
  TOptions extends ICrossoverGraphOptions = ICrossoverGraphOptions,
  TEvents extends ICrossoverGraphEvents = ICrossoverGraphEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends EqualizerGraph<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The SVG path element. Has class .aux-graph */
  element: SVGPathElement;
  /** The range for the x axis. */
  range_x: Range;
  /** The range for the y axis. */
  range_y: Range;

  /**
   * Returns the functions representing the frequency response for this crossover band.
   * Combines the lower filter of the current band with the upper filter of the previous band.
   * @returns Array of frequency-to-gain functions.
   */
  getFilterFunctions(): ((freq: number) => number)[];
}

/**
 * Options specific to the Crossover widget.
 * Extends Equalizer options.
 */
export interface ICrossoverOptions extends IEqualizerOptions {
  /** Define if bands are allowed to leap over each other. */
  leap?: boolean;
  /** Set a minimal distance between bands. This has no effect if leap=true. The value is interpreted as a factor of the frequency of the next band, e.g. if distance is 0.2 and a band is at 1kHz, then a second lower band cannot be moved beyond 800Hz. */
  distance?: number;
}

/**
 * Events specific to the Crossover widget.
 * Extends Equalizer events.
 */
export interface ICrossoverEvents extends IEqualizerEvents {
  // Crossover doesn't add any specific events beyond Equalizer events
}

/**
 * Crossover is an Equalizer displaying the response
 * of a multi-band crossover filter. Crossover uses CrossoverBand
 * as response handles.
 */
export declare class Crossover<
  TOptions extends ICrossoverOptions = ICrossoverOptions,
  TEvents extends ICrossoverEvents = ICrossoverEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Equalizer<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main DIV container. Has class .aux-crossover */
  element: HTMLDivElement;
  /** The SVG group containing all the bands SVG elements. Has class .aux-eqbands */
  _bands: SVGGElement;

  /**
   * Get all CrossoverBand instances.
   * @returns An array of CrossoverBand instances.
   */
  getCrossoverBands(): CrossoverBand[];

  /**
   * Get all CrossoverGraph instances.
   * @returns An array of CrossoverGraph instances.
   */
  getCrossoverGraphs(): CrossoverGraph[];

  /**
   * Add a new band to the crossover.
   * @param options - An object containing initial options for the CrossoverBand, or an instance of CrossoverBand.
   * @param type - A widget class to be used for the new band (defaults to CrossoverBand).
   * @returns The instance of CrossoverBand.
   * @emits Equalizer#bandadded
   */
  addBand(options: CrossoverBand | ICrossoverBandOptions, type?: typeof CrossoverBand): CrossoverBand;

  /**
   * Remove all bands from the crossover and reset the graphs.
   * @emits Equalizer#emptied
   */
  empty(): void;
}
