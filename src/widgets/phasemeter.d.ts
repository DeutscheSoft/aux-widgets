import {
  LevelMeter,
  ILevelMeterOptions,
  ILevelMeterEvents,
} from './levelmeter.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the PhaseMeter widget.
 * Extends LevelMeter options.
 */
export interface IPhaseMeterOptions extends ILevelMeterOptions {
  // PhaseMeter doesn't add any specific options beyond LevelMeter
  // It just changes default values: show_clip: false, layout: 'top', min: -1, max: 1, base: 0, levels: [0.05, 0.1, 0.5, 1]
}

/**
 * Events specific to the PhaseMeter widget.
 * Extends LevelMeter events.
 */
export interface IPhaseMeterEvents extends ILevelMeterEvents {
  // PhaseMeter doesn't add any specific events beyond LevelMeter events
}

/**
 * PhaseMeter is a LevelMeter configured to display phase correlation.
 */
export declare class PhaseMeter<
  TOptions extends IPhaseMeterOptions = IPhaseMeterOptions,
  TEvents extends IPhaseMeterEvents = IPhaseMeterEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends LevelMeter<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-phasemeter */
  element: HTMLDivElement;
}
