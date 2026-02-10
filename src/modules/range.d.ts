import { Base, IBaseEvents, EffectiveEvents } from '../implements/base.js';
import { IRangedOptions } from '../utils/ranged.js';

/**
 * Options specific to the Range class.
 * Extends Base options with ranged options.
 */
export interface IRangeOptions extends Record<string, unknown>, IRangedOptions {
  // Range uses IRangedOptions, but with different defaults
  // min defaults to -Infinity, max defaults to Infinity, basis defaults to 0
}

/**
 * Events specific to the Range class.
 * Extends Base events.
 */
export interface IRangeEvents extends IBaseEvents {
  /** Fired when max is set. */
  set_max: () => void;
  /** Fired when min is set. */
  set_min: () => void;
  /** Fired when base is set. */
  set_base: () => void;
  /** Fired when clip is set. */
  set_clip: () => void;
  /** Fired when snap is set. */
  set_snap: () => void;
  /** Fired when basis is set. */
  set_basis: () => void;
  /** Fired when log_factor is set. */
  set_log_factor: () => void;
  /** Fired when reverse is set. */
  set_reverse: () => void;
  /** Fired when scale is set. */
  set_scale: () => void;
  /** Fired when the range is initialized. */
  initialized: () => void;
}

/**
 * Range is used for calculating linear scales from different values.
 * They are useful for building coordinate systems, calculating pixel positions
 * for different scale types, and the like. Range is used e.g. in Scale, Meter
 * and Graph, to draw elements on a certain position according to a value on
 * an arbitrary scale.
 */
export declare class Range<
  TOptions extends IRangeOptions = IRangeOptions,
  TEvents extends IRangeEvents = IRangeEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Base<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /**
   * Convert a coefficient to a based value.
   * @param coef - The coefficient.
   * @param size - The size.
   * @returns The based value.
   */
  valueToBased(coef: number, size: number): number;

  /**
   * Convert a based value to a coefficient.
   * @param coef - The based value.
   * @param size - The size.
   * @returns The coefficient.
   */
  basedToValue(coef: number, size: number): number;

  /**
   * Convert a value to a pixel position.
   * @param value - The value.
   * @returns The pixel position.
   */
  valueToPixel(value: number): number;

  /**
   * Convert a pixel position to a value.
   * @param pos - The pixel position.
   * @returns The value.
   */
  pixelToValue(pos: number): number;

  /**
   * Convert a value to a coefficient.
   * @param value - The value.
   * @returns The coefficient.
   */
  valueToCoef(value: number): number;

  /**
   * Convert a coefficient to a value.
   * @param coef - The coefficient.
   * @returns The value.
   */
  coefToValue(coef: number): number;

  /**
   * Snap a value up to the next snap point.
   * @param value - The value to snap.
   * @returns The snapped value.
   */
  snapUp(value: number): number;

  /**
   * Snap a value down to the previous snap point.
   * @param value - The value to snap.
   * @returns The snapped value.
   */
  snapDown(value: number): number;

  /**
   * Snap a value to the nearest snap point.
   * @param value - The value to snap.
   * @returns The snapped value.
   */
  snap(value: number): number;
}

/**
 * Calculate the effective value considering falling animation.
 * @param value - The current value.
 * @param base - The base value to fall towards.
 * @param falling - The falling amount per duration.
 * @param duration - The duration in milliseconds.
 * @param init - The initial delay in milliseconds.
 * @param value_time - The timestamp of the last value update.
 * @returns The effective value.
 */
export declare function effectiveValue(
  value: number,
  base: number,
  falling: number,
  duration: number,
  init: number,
  value_time: number
): number;
