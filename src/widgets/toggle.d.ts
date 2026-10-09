import {
  Button,
  IButtonOptions,
  IButtonEvents,
  ButtonInteractiveOptions,
} from './button.js';

/**
 * Options specific to the Toggle widget.
 * Extends Button options.
 */
export interface IToggleOptions extends IButtonOptions {
  /** If true, the button is toggled on click. */
  toggle: boolean;
  /** Controls press behavior. If options.toggle is false and this option is 0, the toggle button will toggle until released. If options.toggle is true and this option is a positive integer, it is interpreted as a milliseconds timeout. When pressing a button longer than this timeout, it will be toggled until released, otherwise it will be toggled permanently. */
  press: number;
  /** An optional icon displayed when the button toggle state is true. If icon is false, the icon element exists only while active. */
  icon_active: string | false;
  /** An optional label displayed when the button toggle state is true. If label is false, the label element exists only while active. */
  label_active: string | false;
}

/**
 * Events specific to the Toggle widget.
 * Extends Button events.
 */
export interface IToggleEvents extends IButtonEvents {
  /** Fired when the button was toggled. */
  toggled: (state: boolean) => void;
}

/**
 * Toggle options that may be changed through user interaction.
 */
export interface ToggleInteractiveOptions extends ButtonInteractiveOptions {
  /** State of the button, reflected as class `.aux-active`. */
  state: IToggleOptions['state'];
}

/**
 * A toggle button. The toggle button can either be pressed (which means that it will
 * switch its state as long as it is pressed) or toggled permanently. Its behavior is
 * controlled by the two options press and toggle.
 */
export declare class Toggle<
  Options extends IToggleOptions = IToggleOptions,
  Events extends IToggleEvents = IToggleEvents,
  InteractiveOptions extends ToggleInteractiveOptions = ToggleInteractiveOptions
> extends Button<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /**
   * Toggle the button state.
   * @emits Toggle#toggled
   */
  toggle(): void;
}
