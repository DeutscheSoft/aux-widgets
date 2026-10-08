import { Chart, IChartOptions, IChartEvents } from './chart.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the FrequencyResponse widget.
 * Extends Chart options.
 */
export interface IFrequencyResponseOptions extends IChartOptions {
  /**
   * Distance in decibels between y axis grid lines.
   * Set to `false` to disable automatic grid generation and keep a custom `grid_y`.
   */
  db_grid: number | false;
  /** The type of the decibels scale. See Range for more details. */
  scale?: string | boolean;
  /** The depth of the z axis (basis of options.range_z). */
  depth?: number;
}

/**
 * Events specific to the FrequencyResponse widget.
 * Extends Chart events.
 */
export interface IFrequencyResponseEvents extends IChartEvents {
  // FrequencyResponse doesn't add any specific events beyond Chart events
}

/**
 * FrequencyResponse is a Chart drawing frequencies on the x axis and dB
 * values on the y axis. This widget automatically draws a Grid depending
 * on the ranges.
 */
export declare class FrequencyResponse<
  TOptions extends IFrequencyResponseOptions = IFrequencyResponseOptions,
  TEvents extends IFrequencyResponseEvents = IFrequencyResponseEvents
> extends Chart<TOptions, TEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-frequencyresponse */
  element: HTMLDivElement;
  /** The SVG group containing all handles. Has class .aux-charthandles */
  _handles: SVGGElement;
}
