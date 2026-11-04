import {
  Widget,
  IWidgetOptions,
  IWidgetEvents,
  WidgetInteractiveOptions,
} from './widget.js';

/**
 * Layout direction for Button and other widgets.
 */
export type ILayout = 'horizontal' | 'vertical';

/**
 * Button-specific options that extend Widget options.
 */
export interface IButtonOptions extends IWidgetOptions {
  /** Text for the button label. Set to false to remove the label from DOM. */
  label: string | false;
  /** URL to an image file or an icon class. If set to false, the icon is removed from DOM. */
  icon: string | false;
  /** State of the button, reflected as class `.aux-active`. */
  state: boolean;
  /** Define the arrangement of label and icon. 'vertical' means icon above the label, 'horizontal' places the icon left to the label. */
  layout: ILayout;
  /** Enable delayed events. The value is set in milliseconds. If this is set to >0, Button fires some additional events, most importantly `press_start` after the delay has finished without the user leaving the button or lifting the pointer. */
  delay: number;
  /** @internal Whether the label child is present in the DOM. */
  _show_label: boolean;
  /** @internal Whether the icon child is present in the DOM. */
  _show_icon: boolean;
  /** @internal Effective label content pushed to the Label child. */
  _label: string | false;
  /** @internal Effective icon content pushed to the Icon child. */
  _icon: string | false;
}

/**
 * Button-specific events that extend Widget events.
 */
export interface IButtonEvents extends IWidgetEvents {
  /** Fired after either a mousedown or a touchstart happened but `delay` is set so firing `press_start` will be delayed. */
  press_delayed: () => void;
  /** Fired if `delay` is set and the timeout has finished. Arguments: event */
  pressed: (event: Event) => void;
  /** Fired after either a mousedown or a touchstart happened and `delay` is set to `0`. If a delay is set, `press_delayed` is fired instead on mousedown/touchstart and this event gets fired as soon as the delay time is over. Arguments: event */
  press_start: (event: Event) => void;
  /** Fired if a delay is set, after the pointer is released and the timeout hasn't finished yet. Doesn't fire after the timeout finished. Arguments: event */
  clicked: (event: Event) => void;
  /** Fired after either a mouseup or a touchend happened and the pointer didn't leave the button element after `press_start` or `press_delayed` was fired. Arguments: event */
  press_end: (event: Event) => void;
  /** Fired after `press_start` or `press_delay` and before a `press_end` was fired while the pointer is dragged outside of the button element. Arguments: event */
  press_cancel: (event: Event) => void;
}

/**
 * Button options that may be changed through user interaction.
 */
export interface ButtonInteractiveOptions extends WidgetInteractiveOptions {}

/**
 * Button is a simple, clickable widget containing an Icon and a Label to trigger functions.
 * Button serves as base for other widgets, too, e.g. Toggle, ConfirmButton and Select.
 *
 * @template Options - The options type for this button. Extends IButtonOptions.
 * @template Events - The events type for this button. Extends IButtonEvents.
 * @template InteractiveOptions - Options that may be set via user interaction.
 */
export declare class Button<
  Options extends IButtonOptions = IButtonOptions,
  Events extends IButtonEvents = IButtonEvents,
  InteractiveOptions extends ButtonInteractiveOptions = ButtonInteractiveOptions
> extends Widget<Options, Events, InteractiveOptions> {
  /**
   * Creates a new Button instance.
   *
   * @param options - An object containing initial options. All options are optional.
   */
  constructor(options?: Partial<NoInfer<Options>>);
}
