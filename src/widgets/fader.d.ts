import { Widget, IWidgetOptions, IWidgetEvents, EffectiveEvents } from './widget.js';
import { IRangedOptions } from '../utils/ranged.js';
import { IWarningOptions } from '../utils/warning.js';

/**
 * Fader layout direction.
 */
export type IFaderLayout = 'top' | 'left' | 'right' | 'bottom';

/**
 * Direction for fader and other widgets.
 */
export type IDirection = 'horizontal' | 'vertical';

/**
 * Fader-specific options that extend Widget, Ranged, and Warning options.
 */
export interface IFaderOptions extends IWidgetOptions, IRangedOptions, IWarningOptions {
  /** The fader's position. This option is modified by user interaction. */
  value?: number;
  /** The fader's layout. One out of 'top', 'left', 'right' or 'bottom', defining the fader handles position in comparison to the scale. */
  layout?: IFaderLayout;
  /** If true, a click on the fader will move the handle to the pointed position. */
  bind_click?: boolean;
  /** If true, a dblclick on the fader will reset the fader value to options.reset. */
  bind_dblclick?: boolean;
  /** The reset value, which is used by the dblclick event and the reset method. */
  reset?: number;
  /** If true, a Scale is added to the fader. */
  show_scale?: boolean;
  /** If true, a Value widget is added to the fader. */
  show_value?: boolean;
  /** Add a label to the fader. Set to false to remove the label from the DOM. */
  label?: string | false;
  /** Set a cursor from standard cursors on drag or scroll. Set to false to disable. */
  cursor?: string | false;
  /** @internal Division value (used internally) */
  division?: number;
  /** @internal Levels array (used internally) */
  levels?: number[];
  /** @internal Gap dots value (used internally) */
  gap_dots?: number;
  /** @internal Gap labels value (used internally) */
  gap_labels?: number;
  /** @internal Show labels flag (used internally) */
  show_labels?: boolean;
  /** @internal Labels function (used internally) */
  labels?: (value: number) => string;
  /** @internal Direction (computed from layout) */
  direction?: IDirection;
  /** @internal Internal value (computed) */
  _value?: number;
  /** @internal Internal position (computed) */
  _position?: number;
  /** @internal Warning state (computed) */
  _warning_state?: boolean;
  /** @internal Value time (computed) */
  _value_time?: number;
}

/**
 * Fader-specific events that extend Widget events.
 */
export interface IFaderEvents extends IWidgetEvents {
  /** Fired when the scale was changed. Arguments: key, value */
  scalechanged: (key: string, value: unknown) => void;
}

/**
 * Fader is a slidable control with a Scale next to it which can be both dragged and scrolled.
 * Fader implements Ranged and inherits its options. A Label and a Value are available optionally.
 *
 * @template TOptions - The options type for this fader. Extends IFaderOptions.
 * @template TEvents - The events type for this fader. Extends IFaderEvents.
 * @template TEffectiveEvents - The effective events type (defaults to EffectiveEvents<TOptions, TEvents>).
 *   Users can override this to add additional events or customize the event type.
 */
export declare class Fader<
  TOptions extends IFaderOptions = IFaderOptions,
  TEvents extends IFaderEvents = IFaderEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  /**
   * Creates a new Fader instance.
   *
   * @param options - An object containing initial options. All options are optional.
   */
  constructor(options?: Partial<TOptions>);
}
