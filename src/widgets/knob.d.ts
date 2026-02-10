import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { ICircularOptions, Circular, ILabel } from './circular.js';
import { DragValue, IDragDirection } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';

/**
 * Preset name options.
 */
export type IPresetName = 'tiny' | 'small' | 'medium' | 'large' | 'huge';

/**
 * Options specific to the Knob widget.
 * Extends Circular options with Knob-specific and DragValue/ScrollValue options.
 */
export interface IKnobOptions extends ICircularOptions {
  /** Reset to this value on double click. */
  reset?: number;
  /** If true, bind the dblclick event to reset the value to the reset option. */
  bind_dblclick?: boolean;
  /** Step size. Used for instance by ScrollValue as the step size. */
  step?: number;
  /** Distance to drag between min and max. */
  basis?: number;
  /** If options.direction is 'polar', this is the angle of separation between positive and negative value changes. */
  blind_angle?: number;
  /** Multiplier for increased stepping speed, e.g. used by ScrollValue when simultaneously pressing 'shift'. */
  shift_up?: number;
  /** Multiplier for decreased stepping speed, e.g. used by ScrollValue when simultaneously pressing 'shift' and 'ctrl'. */
  shift_down?: number;
  /** Direction for changing the value. Can be 'polar', 'vertical' or 'horizontal'. */
  direction?: IDragDirection;
  /** Defines the angle of the center of the positive value changes. 0 means straight upward. For instance, a value of 45 leads to increasing value when moving towards top and right. */
  rotation?: number;
  /** The preset to use. */
  preset?: IPresetName | string;
  /** A set of available presets. */
  presets?: Record<string, Partial<IKnobOptions>>;
  /** @internal Last preset name (computed internally) */
  _lastPreset?: string | null;
}

/**
 * Events specific to the Knob widget.
 * Extends Widget events.
 */
export interface IKnobEvents extends IWidgetEvents {
}

/**
 * Knob is a Circular inside of an SVG which can be
 * modified both by dragging and scrolling utilizing DragValue
 * and ScrollValue.
 * It inherits all options of Circular and DragValue.
 */
export declare class Knob<
  TOptions extends IKnobOptions = IKnobOptions,
  TEvents extends IKnobEvents = IKnobEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main DIV container. Has class .aux-knob */
  element: HTMLDivElement;
  /** The main SVG image. */
  svg: SVGElement;
  /** The Circular module. */
  circular: Circular;
  /** Instance of DragValue used for the interaction. */
  drag: DragValue;
  /** Instance of ScrollValue used for the interaction. */
  scroll: ScrollValue;

  /**
   * This is an alias for Circular#addLabel of the internal circular instance.
   */
  addLabel(x: ILabel | number): void;

  /**
   * This is an alias for Circular#removeLabel of the internal circular instance.
   */
  removeLabel(x: ILabel | number): void;
}
