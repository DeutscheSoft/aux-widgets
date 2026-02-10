import { Graph, IGraphOptions, IGraphEvents } from './graph.js';
import { FrequencyResponse, IFrequencyResponseOptions, IFrequencyResponseEvents } from './frequencyresponse.js';
import { EffectiveEvents } from '../implements/base.js';
import { EqBand, IEqBandOptions } from './eqband.js';

/**
 * Rendering filter function for EqualizerGraph.
 * Determines which bands are included when rendering the frequency response curve.
 * @param band - The EqBand to check.
 * @returns True if the band should be included in rendering.
 */
export type IEqualizerGraphRenderingFilter = (band: EqBand) => boolean;

/**
 * Options specific to the EqualizerGraph widget.
 * Extends Graph options.
 */
export interface IEqualizerGraphOptions extends IGraphOptions {
  /** The distance between points on the x axis. Reduces CPU load in favour of accuracy and smoothness. */
  accuracy?: number;
  /** The list of EqBands. */
  bands?: EqBand[];
  /** If slope of the curve is too steep, oversample n times in order to not miss e.g. notch filters. */
  oversampling?: number;
  /** Steepness of slope to oversample, i.e. y pixels difference per x pixel. */
  threshold?: number;
  /** A callback function which can be used to customize which equalizer bands are included when rendering the frequency response curve. This defaults to those bands which have their active option set to true. */
  rendering_filter?: IEqualizerGraphRenderingFilter;
}

/**
 * Events specific to the EqualizerGraph widget.
 * Extends Graph events.
 */
export interface IEqualizerGraphEvents extends IGraphEvents {
  // EqualizerGraph doesn't add any specific events beyond Graph events
}

/**
 * EqualizerGraph is a special Graph, which contains a list of EqBands and draws the
 * resulting frequency response curve.
 */
export declare class EqualizerGraph<
  TOptions extends IEqualizerGraphOptions = IEqualizerGraphOptions,
  TEvents extends IEqualizerGraphEvents = IEqualizerGraphEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Graph<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The SVG path element. Has class .aux-graph */
  element: SVGPathElement;
  /** The range for the x axis. */
  range_x: import('../modules/range.js').Range;
  /** The range for the y axis. */
  range_y: import('../modules/range.js').Range;

  /**
   * Returns the functions representing the frequency response of all active filters.
   * @returns Array of frequency-to-gain functions.
   */
  getFilterFunctions(): ((freq: number) => number)[];

  /**
   * Draws an SVG path for the current frequency response curve.
   * @returns The SVG path string.
   */
  drawPath(): string;

  /**
   * Resizes the graph and invalidates the bands.
   */
  resize(): void;

  /**
   * Add a band to the graph.
   * @param band - The EqBand to add.
   */
  addBand(band: EqBand): void;

  /**
   * Remove a band from the graph.
   * @param band - The EqBand to remove.
   */
  removeBand(band: EqBand): void;
}

/**
 * Options specific to the Equalizer widget.
 * Extends FrequencyResponse options and EqualizerGraph options (since baseline inherits options).
 */
export interface IEqualizerOptions extends IFrequencyResponseOptions, IEqualizerGraphOptions {
  /** Show or hide all bands. */
  show_bands?: boolean;
}

/**
 * Events specific to the Equalizer widget.
 * Extends FrequencyResponse events.
 */
export interface IEqualizerEvents extends IFrequencyResponseEvents {
  /** Fired when a new band was added. */
  bandadded: (band: EqBand) => void;
  /** Fired when a band was removed. */
  bandremoved: (band: EqBand) => void;
  /** Fired when all bands are removed. */
  emptied: () => void;
}

/**
 * Equalizer is a FrequencyResponse, utilizing EqBands instead of simple ChartHandles.
 * An Equalizer - by default - has one EqualizerGraph which contains all bands.
 * Additional EqualizerGraphs can be added. The Equalizer inherits all options of EqualizerGraph.
 */
export declare class Equalizer<
  TOptions extends IEqualizerOptions = IEqualizerOptions,
  TEvents extends IEqualizerEvents = IEqualizerEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends FrequencyResponse<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-equalizer */
  element: HTMLDivElement;
  /** The SVG group containing all the bands SVG elements. Has class .aux-eqbands */
  _bands: SVGGElement;
  /** The graph drawing the zero line. Has class .aux-baseline */
  baseline: EqualizerGraph;

  /**
   * Get all EqBand instances.
   * @returns An array of EqBand instances.
   */
  getBands(): EqBand[];

  /**
   * Add a new band to the equalizer.
   * @param options - An object containing initial options for the EqBand, or an instance of EqBand.
   * @param type - A widget class to be used for the new band (defaults to EqBand).
   * @returns The instance of EqBand.
   * @emits Equalizer#bandadded
   */
  addBand(options: EqBand | IEqBandOptions, type?: typeof EqBand): EqBand;

  /**
   * Add multiple new EqBands to the equalizer.
   * @param bands - An array of options objects for the EqBand, or an array of EqBand instances.
   * @param type - A widget class to be used for the new bands (defaults to EqBand).
   */
  addBands(bands: (EqBand | IEqBandOptions)[], type?: typeof EqBand): void;

  /**
   * Remove a band from the widget.
   * @param band - The EqBand to remove.
   * @emits Equalizer#bandremoved
   */
  removeBand(band: EqBand): void;

  /**
   * Remove multiple EqBands from the equalizer.
   * @param bands - An array of EqBand instances. If the argument is false or undefined, all bands are removed.
   */
  removeBands(bands?: EqBand[] | false): void;
}
