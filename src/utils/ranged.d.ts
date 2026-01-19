import { IScaleCallback } from './transformations.js';

/**
 * Scale name types supported by ranged widgets.
 */
export type IScaleName = 'linear' | 'decibel' | 'log2' | 'frequency' | 'frequency-reverse';

/**
 * Piecewise-linear scale array.
 * An array with an even number of elements (at least 2) where:
 * - The first half contains x values in the range [0, 1] (must be sorted)
 * - The second half contains y values (must be sorted)
 * Example: [0, 0.5, 1, 0, 50, 100] represents a piecewise-linear scale
 *   where x=[0, 0.5, 1] and y=[0, 50, 100]
 */
export type IPiecewiseLinearScale = number[];

/**
 * Ranged options that are used by Fader and other ranged widgets.
 * These options provide functionality for value ranges, scaling, and snapping.
 */
export interface IRangedOptions {
  /** The type of the scale. Either one of the predefined scale names, a piecewise-linear array, or a custom callback function. */
  scale?: IScaleName | IPiecewiseLinearScale | IScaleCallback;
  /** Reverse the scale of the range. */
  reverse?: boolean;
  /** The size of the linear scale. Set to pixel width or height if used for drawing purposes or to 100 for percentages. */
  basis?: number;
  /** If true, snap() will clip values into the interval between min and max. */
  clip?: boolean;
  /** Minimum value of the range. */
  min?: number;
  /** Maximum value of the range. */
  max?: number;
  /** Base point. Used e.g. to mark 0dB on a fader from -96dB to 12dB. */
  base?: number;
  /** Step size. Used for instance by ScrollValue as the step size. */
  step?: number;
  /** Multiplier for increased stepping speed, e.g. used by ScrollValue when simultaneously pressing 'shift'. */
  shift_up?: number;
  /** Multiplier for decreased stepping speed, e.g. used by ScrollValue when simultaneously pressing 'shift' and 'ctrl'. */
  shift_down?: number;
  /** Defines a virtual grid. If a positive number, it is interpreted as the distance of grid points. If an array, it defines grid points with non-uniform spacing. */
  snap?: number | number[];
  /** Used to overexpand logarithmic curves. 1 keeps the natural curve while values above 1 will overbend. */
  log_factor?: number;
  /** Function to format the aria-valuenow attribute. */
  format_ariavalue?: (value: number) => string;
  /** Define if aria-valuemin, aria-valuemax and aria-valuenow should be set. */
  set_ariavalue?: boolean;
  /** @internal Transformation object (computed internally) */
  transformation?: unknown;
  /** @internal Snap module object (computed internally) */
  snap_module?: unknown;
}
