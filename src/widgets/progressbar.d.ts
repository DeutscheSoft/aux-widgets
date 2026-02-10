import { Meter, IMeterOptions, IMeterEvents } from './meter.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the ProgressBar widget.
 * Extends Meter options.
 */
export interface IProgressBarOptions extends IMeterOptions {
  // ProgressBar doesn't add any specific options beyond Meter
  // It just changes default values: min: 0, max: 100, show_scale: false, show_value: true, format_value, layout: 'top', role: 'progressbar'
}

/**
 * Events specific to the ProgressBar widget.
 * Extends Meter events.
 */
export interface IProgressBarEvents extends IMeterEvents {
  // ProgressBar doesn't add any specific events beyond Meter events
}

/**
 * ProgressBar is a pre-configured Meter to display progress in percent.
 */
export declare class ProgressBar<
  TOptions extends IProgressBarOptions = IProgressBarOptions,
  TEvents extends IProgressBarEvents = IProgressBarEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends Meter<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-progressbar */
  element: HTMLDivElement;
}
