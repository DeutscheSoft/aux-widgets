import { Widget, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Knob, IKnobOptions } from './knob.js';
import { Value, IValueOptions } from './value.js';
import { Label } from './label.js';
import { Range } from '../modules/range.js';

/**
 * Layout options for ValueKnob.
 */
export type IValueKnobLayout = 'vertical' | 'horizontal' | 'left' | 'right';

/**
 * Options specific to the ValueKnob widget.
 * Extends Knob and Value options since child widgets inherit options.
 * Note: 'label' and 'show_value' are blacklisted from the knob child widget.
 * Note: 'size' and 'value' are omitted from both interfaces to avoid conflicts, then redefined with compatible types.
 */
export interface IValueKnobOptions extends Omit<IKnobOptions, 'size' | 'value'>, Omit<IValueOptions, 'size' | 'value'> {
  /** Layout of the knob. Select from 'horizontal', 'vertical' (default), 'left' and 'right'. */
  layout?: IValueKnobLayout;
  /** Label of the knob. Set to false to hide the element from the DOM. This is blacklisted from the knob child widget. */
  label?: string | false;
  /** Set to false to hide the Value. This is blacklisted from the knob child widget. */
  show_value?: boolean;
  /** Set to false to hide the Knob. */
  show_knob?: boolean;
  /** The value. */
  value?: number;
}

/**
 * Events specific to the ValueKnob widget.
 * Extends Widget events.
 */
export interface IValueKnobEvents extends IWidgetEvents {
  /** Fired when the user starts editing the value manually. */
  valueedit: (value: number) => void;
  /** Fired when the user finished editing the value manually. */
  valueset: (value: number) => void;
}

/**
 * ValueKnob combines a Knob, a Label and a Value whose value is synchronized.
 * It inherits all options from Knob and Value.
 */
export declare class ValueKnob<
  TOptions extends IValueKnobOptions = IValueKnobOptions,
  TEvents extends IValueKnobEvents = IValueKnobEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-valueknob */
  element: HTMLDivElement;
  /** The Label widget. */
  label: Label;
  /** The Knob widget. */
  knob: Knob;
  /** The Value widget. */
  value: Value;

  /**
   * Get the Range object used by the knob.
   * @returns The Range object.
   */
  getRange(): Range;
}
