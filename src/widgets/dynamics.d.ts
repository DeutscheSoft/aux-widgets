import { Chart, IChartOptions, IChartEvents } from './chart.js';
import { EffectiveEvents } from '../implements/base.js';
import { ChartHandle } from './charthandle.js';
import { Graph } from './graph.js';

/**
 * Type of dynamics processor.
 */
export type IDynamicsType = 'compressor' | 'expander' | 'gate' | 'limiter' | false;

/**
 * Grid label formatting function.
 * @param val - The value to format.
 * @returns The formatted label string.
 */
export type IDynamicsGridLabels = (val: number) => string;

/**
 * Handle label formatting function.
 * @param label - The label text.
 * @param x - The x coordinate value.
 * @param y - The y coordinate value.
 * @param z - The z coordinate value.
 * @returns The formatted label string.
 */
export type IDynamicsHandleLabel = (
  label: string,
  x: number,
  y: number,
  z: number
) => string;

/**
 * Options specific to the Dynamics widget.
 * Extends Chart options.
 */
export interface IDynamicsOptions extends IChartOptions {
  /** Minimum decibels to display. */
  min?: number;
  /** Maximum decibels to display. */
  max?: number;
  /** Scale of the display, see Range for details. */
  scale?: string;
  /** Type of the dynamics: 'compressor', 'expander', 'gate', 'limiter' or false to draw your own graph. */
  type?: IDynamicsType;
  /** Threshold of the dynamics. */
  threshold?: number;
  /** Ratio of the dynamics. */
  ratio?: number;
  /** Makeup of the dynamics. This raises the whole graph after all other properties are applied. */
  makeup?: number;
  /** Range of the dynamics. Only used in type 'expander'. The maximum gain reduction. */
  range?: number;
  /** Input gain of the dynamics. */
  gain?: number;
  /** Input reference of the dynamics. */
  reference?: number;
  /** Soft knee width of the compressor in dB. Replaces the hard knee of the compressor at the salient point by a quadratic curve. */
  knee?: number;
  /** Callback to format the labels of the Grid. */
  grid_labels?: IDynamicsGridLabels;
  /** Draw a grid line every [n] decibels. */
  db_grid?: number;
  /** Draw a handle to manipulate threshold and ratio. */
  show_handle?: boolean;
  /** Function to format the handle label. */
  handle_label?: IDynamicsHandleLabel | false;
  /** @internal Last type value (computed internally). */
  _last_type?: IDynamicsType;
}

/**
 * Events specific to the Dynamics widget.
 * Extends Chart events.
 */
export interface IDynamicsEvents extends IChartEvents {
  // Dynamics doesn't add any specific events beyond Chart events
}

/**
 * Dynamics are based on Chart and display the characteristics of dynamic
 * processors. They are square widgets drawing a Grid automatically based on
 * the range.
 */
export declare class Dynamics<
  TOptions extends IDynamicsOptions = IDynamicsOptions,
  TEvents extends IDynamicsEvents = IDynamicsEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Chart<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-dynamics */
  element: HTMLDivElement;
  /** The handle to set threshold. Has class .aux-handle */
  handle: ChartHandle;
  /** The graph drawing the zero line. Has class .aux-steady */
  steady: Graph;
  /** The graph drawing the dynamics response. Has class .aux-response */
  response: Graph;

  /**
   * Draws the dynamics response graph based on current options.
   */
  drawGraph(): void;
}

/**
 * Options specific to the Compressor widget.
 * Extends Dynamics options.
 */
export interface ICompressorOptions extends IDynamicsOptions {
  /** Show the ratio handle. */
  show_ratio?: boolean;
  /** Function to format the label of the ratio. False for no label. */
  ratio_label?: IDynamicsHandleLabel | false;
  /** X position of the ratio handle. */
  ratio_x?: number;
}

/**
 * Events specific to the Compressor widget.
 * Extends Dynamics events.
 */
export interface ICompressorEvents extends IDynamicsEvents {
  // Compressor doesn't add any specific events beyond Dynamics events
}

/**
 * Compressor is a pre-configured Dynamics widget.
 */
export declare class Compressor<
  TOptions extends ICompressorOptions = ICompressorOptions,
  TEvents extends ICompressorEvents = ICompressorEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Dynamics<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-compressor */
  element: HTMLDivElement;
  /** The handle to set ratio. Has class .aux-ratio */
  ratio: ChartHandle;
}

/**
 * Options specific to the Expander widget.
 * Extends Dynamics options.
 */
export interface IExpanderOptions extends IDynamicsOptions {
  // Expander doesn't add any specific options beyond Dynamics options
}

/**
 * Events specific to the Expander widget.
 * Extends Dynamics events.
 */
export interface IExpanderEvents extends IDynamicsEvents {
  // Expander doesn't add any specific events beyond Dynamics events
}

/**
 * Expander is a pre-configured Dynamics widget.
 */
export declare class Expander<
  TOptions extends IExpanderOptions = IExpanderOptions,
  TEvents extends IExpanderEvents = IExpanderEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Dynamics<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-expander */
  element: HTMLDivElement;
}

/**
 * Options specific to the Gate widget.
 * Extends Dynamics options.
 */
export interface IGateOptions extends IDynamicsOptions {
  // Gate doesn't add any specific options beyond Dynamics options
}

/**
 * Events specific to the Gate widget.
 * Extends Dynamics events.
 */
export interface IGateEvents extends IDynamicsEvents {
  // Gate doesn't add any specific events beyond Dynamics events
}

/**
 * Gate is a pre-configured Dynamics widget.
 */
export declare class Gate<
  TOptions extends IGateOptions = IGateOptions,
  TEvents extends IGateEvents = IGateEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Dynamics<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-gate */
  element: HTMLDivElement;
}

/**
 * Options specific to the Limiter widget.
 * Extends Dynamics options.
 */
export interface ILimiterOptions extends IDynamicsOptions {
  // Limiter doesn't add any specific options beyond Dynamics options
}

/**
 * Events specific to the Limiter widget.
 * Extends Dynamics events.
 */
export interface ILimiterEvents extends IDynamicsEvents {
  // Limiter doesn't add any specific events beyond Dynamics events
}

/**
 * Limiter is a pre-configured Dynamics widget.
 */
export declare class Limiter<
  TOptions extends ILimiterOptions = ILimiterOptions,
  TEvents extends ILimiterEvents = ILimiterEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Dynamics<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-limiter */
  element: HTMLDivElement;
}
