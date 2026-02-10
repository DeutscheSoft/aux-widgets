import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { IRangedOptions } from '../utils/ranged.js';
import { IScaleOptions, IScaleLayout, Scale } from './scale.js';
import { DragValue } from '../modules/dragvalue.js';
import { Value } from './value.js';
import { Label } from './label.js';

/**
 * Options specific to the Spread widget.
 * Extends Widget options with ranged options and Scale options.
 */
export interface ISpreadOptions extends IWidgetOptions, Omit<IRangedOptions, 'base'>, IScaleOptions {
  /** The spread's lower position. This option is modified by user interaction. */
  lower: number;
  /** The spread's upper position. This option is modified by user interaction. */
  upper: number;
  /** The spread's layout. One out of 'top', 'left', 'right' or 'bottom', defining the spread's handles position in comparison to the scale. */
  layout: IScaleLayout;
  /** If true, a dblclick on the Spread will reset lower and upper to options.reset_lower and options.reset_upper. */
  bind_dblclick: boolean;
  /** If true, a click on the Spread will reset lower and upper. */
  bind_click?: boolean;
  /** The reset value, which is used by the dblclick event and the reset method for the lower handle. */
  reset_lower?: number;
  /** The reset value, which is used by the dblclick event and the reset method for the upper handle. */
  reset_upper?: number;
  /** If true, a Scale is added to the spread. */
  show_scale?: boolean;
  /** If true, two Value widgets are added to the spread. */
  show_values: boolean;
  /** Add a label to the spread. Set to false to remove the label from the DOM. */
  label: string | false;
  /** Set a cursor from standard cursors on drag or scroll. Set to false to disable. */
  cursor: string | false;
  /** Direction for dragging. Computed from layout ('vertical' or 'horizontal'). */
  direction?: 'vertical' | 'horizontal';
}

/**
 * Events specific to the Spread widget.
 * Extends Widget events.
 */
export interface ISpreadEvents extends Omit<IWidgetEvents, 'doubleclick'> {
  /** Fired when the handle receives a double click.
   *  Supports both the base Widget signature (MouseEvent) and Spread signature (number).
   */
  doubleclick: (eventOrValue: MouseEvent | number) => void;
  /** Fired when the scale was changed. */
  scalechanged: (key: string, value: unknown) => void;
}

/**
 * Spread is a slidable control with a Scale next to it which
 * can be both dragged and scrolled. Spread implements Ranged
 * and inherits its options.
 * A Label and a Value are available optionally.
 */
export declare class Spread<
  TOptions extends ISpreadOptions = ISpreadOptions,
  TEvents extends ISpreadEvents = ISpreadEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-spread */
  element: HTMLDivElement;
  /** The track for the handles. Has class .aux-track */
  _track: HTMLDivElement;
  /** The lower handle of the spread. Has class .aux-lower */
  _lower: HTMLDivElement;
  /** The upper handle of the spread. Has class .aux-upper */
  _upper: HTMLDivElement;
  /** Instance of DragValue used for the lower handle interaction. */
  draglower: DragValue;
  /** Instance of DragValue used for the upper handle interaction. */
  dragupper: DragValue;
  /** A Scale to display a scale next to the fader. */
  scale: Scale;
  /** A Label to display a title. */
  label: Label;
  /** A Value to display the current lower value, offering a way to enter a value via keyboard. */
  valuelower: Value;
  /** A Value to display the current upper value, offering a way to enter a value via keyboard. */
  valueupper: Value;

  /**
   * Resets the lower and upper value to options.reset_lower and options.reset_upper.
   */
  reset(): void;
}
