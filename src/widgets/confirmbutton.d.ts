import { Button, IButtonOptions, IButtonEvents } from './button.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the ConfirmButton widget.
 * Extends Button options.
 */
export interface IConfirmButtonOptions extends IButtonOptions {
  /** Defines if the button acts as ConfirmButton or normal Button. */
  confirm: boolean;
  /** Defines a time in milliseconds after the button resets to defaults if no second click happens. */
  timeout: number;
  /** Defines a duration in milliseconds within further clicks are ignored. Set to avoid double-clicks being recognized as confirmation. */
  interrupt: number;
  /** The label to be used while in active state. */
  label_confirm: string | false | undefined;
  /** The icon to be used while in active state. */
  icon_confirm: string | false | undefined;
}

/**
 * Events specific to the ConfirmButton widget.
 * Extends Button events.
 */
export interface IConfirmButtonEvents extends IButtonEvents {
  /** Fired when the button was hit two times with at least interrupt milliseconds between both clicks. */
  confirmed: () => void;
  /** Fired when the user didn't confirm in time or clicked anywhere else. */
  canceled: () => void;
}

/**
 * ConfirmButton is a Button firing the confirmed event
 * after it was hit a second time. While waiting for the confirmation, a
 * dedicated label and icon can be displayed. The button is reset to
 * default if no second click appears. A click outside of the button
 * resets it, too. It receives class .aux-active while waiting for
 * the confirmation.
 */
export declare class ConfirmButton<
  TOptions extends IConfirmButtonOptions = IConfirmButtonOptions,
  TEvents extends IConfirmButtonEvents = IConfirmButtonEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Button<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}
