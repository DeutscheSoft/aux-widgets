import { Button, IButtonOptions, IButtonEvents } from './button.js';
import { EffectiveEvents } from '../implements/base.js';
import { IRangedOptions } from '../utils/ranged.js';
import { DragValue, IDragDirection } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';
import { Value } from './value.js';
import { Scale } from './scale.js';

/**
 * Options specific to the ValueButton widget.
 * Extends Button options with ranged options and drag/scroll options.
 */
export interface IValueButtonOptions extends IButtonOptions, IRangedOptions {
  /** The value of the widget. */
  value?: number;
  /** Direction for changing the value. Can be 'polar', 'vertical' or 'horizontal'. */
  direction?: IDragDirection;
  /** Defines the angle of the center of the positive value changes. 0 means straight upward. For instance, a value of 45 leads to increasing value when moving towards top and right. */
  rotation?: number;
  /** If options.direction is 'polar', this is the angle of separation between positive and negative value changes. */
  blind_angle?: number;
  /** Snap value while dragging. */
  snap?: number;
  /** Reset to this value on double click. */
  reset?: number;
  /** Distance to drag between min and max in pixels. */
  basis?: number;
}

/**
 * Events specific to the ValueButton widget.
 * Extends Button events.
 */
export interface IValueButtonEvents extends Omit<IButtonEvents, 'doubleclick'> {
  /** Fired when the user starts editing the value manually. */
  valueedit: (value: number) => void;
  /** Fired when the user finished editing the value manually. */
  valueset: (value: number) => void;
  /** Fired when the user doubleclicks the valuebutton in order to reset to initial value.
   *  Supports both the base Button signature (MouseEvent) and ValueButton signature (number).
   */
  doubleclick: (eventOrValue: MouseEvent | number) => void;
}

/**
 * ValueButton combines a Button, a Scale and a Value.
 * ValueButton uses DragValue and ScrollValue for setting its value.
 * It inherits all options of DragValue and Scale.
 */
export declare class ValueButton<
  TOptions extends IValueButtonOptions = IValueButtonOptions,
  TEvents extends IValueButtonEvents = IValueButtonEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Button<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-valuebutton */
  element: HTMLDivElement;
  /** The DragValue module. */
  drag: DragValue;
  /** The ScrollValue module. */
  scroll: ScrollValue;
  /** The value widget for editing the value manually. */
  value: Value;
  /** The Scale showing the value. */
  scale: Scale;
}
