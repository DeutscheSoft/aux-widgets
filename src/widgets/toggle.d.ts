import { Button, IButtonOptions, IButtonEvents } from './button.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the Toggle widget.
 * Extends Button options.
 */
export interface IToggleOptions extends IButtonOptions {
  /** If true, the button is toggled on click. */
  toggle: boolean;
  /** Controls press behavior. If options.toggle is false and this option is 0, the toggle button will toggle until released. If options.toggle is true and this option is a positive integer, it is interpreted as a milliseconds timeout. When pressing a button longer than this timeout, it will be toggled until released, otherwise it will be toggled permanently. */
  press: number;
  /** An optional icon which is only displayed when the button toggle state is true. Please note that this option only works if icon is also set. */
  icon_active: string | false;
  /** An optional label which is only displayed when the button toggle state is true. Please note that this option only works if label is also set. */
  label_active: string | false;
  /** @internal */
  icon_inactive: string | false;
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
 * A toggle button. The toggle button can either be pressed (which means that it will
 * switch its state as long as it is pressed) or toggled permanently. Its behavior is
 * controlled by the two options press and toggle.
 */
export declare class Toggle<
  TOptions extends IToggleOptions = IToggleOptions,
  TEvents extends IToggleEvents = IToggleEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Button<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /**
   * Toggle the button state.
   * @emits Toggle#toggled
   */
  toggle(): void;
}
