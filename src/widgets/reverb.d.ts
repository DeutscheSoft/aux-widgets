import { Chart, IChartOptions, IChartEvents } from './chart.js';
import { EffectiveEvents } from '../implements/base.js';
import { Graph } from './graph.js';
import { ChartHandle } from './charthandle.js';

/**
 * Reflection definition for a single reflection.
 */
export interface IReverbReflection {
  /** Time in milliseconds. */
  time: number;
  /** Level in decibel. */
  level: number;
}

/**
 * Reflection configuration object for generating multiple reflections.
 */
export interface IReverbReflectionsConfig {
  /** Number of reflections to be created. */
  amount: number;
  /** Time in milliseconds to spread the reflections. */
  spread: number;
  /** Randomness in decibels to randomize the levels. */
  randomness: number;
}

/**
 * Reflections input - can be an array of reflections, a configuration object, or false to disable.
 */
export type IReverbReflections = IReverbReflection[] | IReverbReflectionsConfig | false;

/**
 * Options specific to the Reverb widget.
 * Extends Chart options.
 */
export interface IReverbOptions extends IChartOptions {
  /** An alias for range_x.max, defining the maximum time of the chart. */
  timeframe?: number;
  /** The initial delay of the input signal, not to be confused with predelay. */
  delay?: number;
  /** The minimum delay. */
  delay_min?: number;
  /** The maximum delay. */
  delay_max?: number;
  /** The gain for the input signal. */
  gain?: number;
  /** The minimum gain. */
  gain_min?: number;
  /** The maximum gain. */
  gain_max?: number;
  /** The predelay of the diffuse reverb. */
  predelay?: number;
  /** The minimum predelay. */
  predelay_min?: number;
  /** The maximum predelay. */
  predelay_max?: number;
  /** The level of the diffuse reverb. */
  rlevel?: number;
  /** The minimum reverb level. */
  rlevel_min?: number;
  /** The maximum reverb level. */
  rlevel_max?: number;
  /** The duration of the diffuse reverb. This acts in conjunction with the reference option. */
  rtime?: number;
  /** The minimum reverb time. */
  rtime_min?: number;
  /** The maximum reverb time. */
  rtime_max?: number;
  /** The level of the early reflections. */
  erlevel?: number;
  /** The minimum level of early reflections. */
  erlevel_min?: number;
  /** The maximum level of early reflections. */
  erlevel_max?: number;
  /** The attack time for the diffuse reverb. */
  attack?: number;
  /** The noisefloor at which attack starts from. */
  noisefloor?: number;
  /** The reference level for calculating the reverb time. */
  reference?: number;
  /** Draw the line showing the input signal. */
  show_input?: boolean;
  /** Show the handle defining input level and initial delay. */
  show_input_handle?: boolean;
  /** Show the handle defining reverb level and predelay. */
  show_rlevel_handle?: boolean;
  /** Show the handle defining the reverb time. */
  show_rtime_handle?: boolean;
  /** Show the handle defining predelay. */
  show_predelay_handle?: boolean;
  /** Defines reflections to be displayed. Either an array of objects {time: n, level: n} where time is in milliseconds, level in decibel or an object {amount: n, spread: n, randomness: n} where spread is a time in milliseconds to spread the reflections, randomness in decibels to randomize the levels and amount the number of reflections to be created. false disables drawing of the reflections. */
  reflections?: IReverbReflections;
  /** @internal Reflections array (computed internally). */
  _reflections?: Array<{
    level: number;
    time: number;
    graph: Graph | null;
  }>;
}

/**
 * Events specific to the Reverb widget.
 * Extends Chart events.
 */
export interface IReverbEvents extends IChartEvents {
  // No additional events beyond those inherited from Chart
}

/**
 * Reverb is a Chart with various handles to set and display
 * parameters of a typical classic reverb.
 */
export declare class Reverb<
  TOptions extends IReverbOptions = IReverbOptions,
  TEvents extends IReverbEvents = IReverbEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Chart<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The Graph displaying the input signal as a vertical bar. */
  input: Graph;
  /** The Graph displaying the reverb signal as a triangle. */
  reverb: Graph;
  /** The ChartHandle displaying/setting the initial delay and gain. */
  input_handle: ChartHandle;
  /** The ChartHandle displaying/setting the pre delay and reverb level. */
  rlevel_handle: ChartHandle;
  /** The ChartHandle displaying/setting the reverb time. */
  rtime_handle: ChartHandle;
}
