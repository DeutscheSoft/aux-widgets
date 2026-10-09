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
  Options extends IProgressBarOptions = IProgressBarOptions,
  Events extends IProgressBarEvents = IProgressBarEvents
> extends Meter<Options, Events> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** The main DIV container. Has class .aux-progressbar */
  element: HTMLDivElement;
}
