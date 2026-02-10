import { Meter, IMeterOptions, IMeterEvents } from './meter.js';
import { EffectiveEvents } from '../implements/base.js';
import { State } from './state.js';

/**
 * Options specific to the LevelMeter widget.
 * Extends Meter options.
 */
export interface ILevelMeterOptions extends IMeterOptions {
  /** If set to true, show the clipping LED. */
  show_clip?: boolean;
  /** If clipping is enabled, this is the threshold for the clipping effect. */
  clipping: number;
  /** This is the clipping timeout. If set to false automatic clipping is disabled. If set to n the clipping effect times out after n ms, if set to -1 it remains forever. */
  auto_clip: number | boolean;
  /** If clipping is enabled, this option is set to true when clipping happens. When automatic clipping is disabled, it can be set to true to set the clipping state. */
  clip: boolean;
  /** If set to true, show the hold value LED. */
  show_hold: boolean;
  /** Size of the hold value LED in the number of segments. */
  hold_size: number;
  /** If set to false the automatic hold LED is disabled, if set to n the hold value is reset after n ms and if set to -1 the hold value is not reset automatically. */
  auto_hold: number | boolean;
  /** The top hold value. If set to false it will equal the meter level. */
  top: number | false;
  /** The bottom hold value. This only exists if a base value is set and the value falls below the base. */
  bottom: number | false;
  /** If set to false the automatic peak label is disabled, if set to n the peak label is reset after n ms and if set to -1 it remains forever. */
  peak_value: number | boolean;
  /** If set to a positive number, activates the automatic falling animation. The meter level will fall by this amount over the time set via falling_duration. */
  falling: number;
  /** This is the time in milliseconds for the falling animation. The level falls by falling in this period of time. */
  falling_duration: number;
  /** Initial falling delay in milliseconds. This option can be used to delay the start of the falling animation in order to avoid flickering if internal and external falling are combined. */
  falling_init: number;
  /** @internal Value time (computed internally) */
  _value_time?: number;
  /** @internal Clip timer (computed internally) */
  _clip_timer?: unknown;
  /** @internal Top timer (computed internally) */
  _top_timer?: unknown;
  /** @internal Bottom timer (computed internally) */
  _bottom_timer?: unknown;
  /** @internal Value timer (computed internally) */
  _value_timer?: unknown;
}

/**
 * Events specific to the LevelMeter widget.
 * Extends Meter events.
 */
export interface ILevelMeterEvents extends IMeterEvents {
  /** Fired when the value label was reset. */
  resetvalue: () => void;
  /** Fired when the clipping LED was reset. */
  resetclip: () => void;
  /** Fired when the top hold was reset. */
  resettop: () => void;
  /** Fired when the bottom hold was reset. */
  resetbottom: () => void;
}

/**
 * LevelMeter is a fully functional meter bar displaying numerical values.
 * LevelMeter is an enhanced Meter containing a clip LED and hold markers.
 * In addition, LevelMeter has an optional falling animation, top and bottom peak
 * values and more.
 */
export declare class LevelMeter<
  TOptions extends ILevelMeterOptions = ILevelMeterOptions,
  TEvents extends ILevelMeterEvents = ILevelMeterEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Meter<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The State instance for the clipping LED. */
  clip: State;

  /**
   * Calculates the effective value considering falling animation.
   */
  effectiveValue(): number;

  /**
   * Resets the value.
   * @emits LevelMeter#resetvalue
   */
  resetValue(): void;

  /**
   * Resets the clipping LED.
   * @emits LevelMeter#resetclip
   */
  resetClip(): void;

  /**
   * Resets the top hold.
   * @emits LevelMeter#resettop
   */
  resetTop(): void;

  /**
   * Resets the bottom hold.
   * @emits LevelMeter#resetbottom
   */
  resetBottom(): void;

  /**
   * Resets all hold features.
   * @emits LevelMeter#resetvalue
   * @emits LevelMeter#resetclip
   * @emits LevelMeter#resettop
   * @emits LevelMeter#resetbottom
   */
  resetAll(): void;
}
