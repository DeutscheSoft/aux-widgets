import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the State widget.
 * Extends Widget options.
 */
export interface IStateOptions extends IWidgetOptions {
  /** The state. To toggle between on|off set to 1|0. Set to fractions of 1 to change "brightness", e.g. 0.5. Values > 0 trigger setting the class .aux-state-on, while a state of 0 results in class .aux-state-off. */
  state?: number | boolean;
  /** A CSS color string for the state LED or false to set the background via external CSS. */
  color?: string | false;
}

/**
 * Events specific to the State widget.
 * Extends Widget events.
 */
export interface IStateEvents extends IWidgetEvents {
  // State doesn't add any specific events beyond Widget events
}

/**
 * The State widget is a multi-functional adaption of a traditional LED. It
 * is able to show different colors as well as on/off states. The
 * "brightness" can be set seamlessly. Classes can be used to display
 * different styles. State extends Widget.
 *
 * The LED effect is implemented as a DIV element, which is overlayed by
 * a DIV element with class .aux-mask. options.state changes the opacity of the mask element.
 */
export declare class State<
  TOptions extends IStateOptions = IStateOptions,
  TEvents extends IStateEvents = IStateEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-state */
  element: HTMLDivElement;
  /** A DIV for masking the background. Has class .aux-mask */
  _mask: HTMLDivElement;
}
