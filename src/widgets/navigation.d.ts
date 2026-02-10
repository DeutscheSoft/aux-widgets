import { Container, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import {
  Buttons,
  IButtonsOptions,
  IButtonsButtonInput,
} from './buttons.js';
import { Button } from './button.js';

/**
 * Options specific to the Navigation widget.
 * Extends Buttons options to pass through to the child Buttons widget.
 */
export interface INavigationOptions extends IButtonsOptions {
  /** Set icons on previous/next buttons to standard arrows. */
  icons: boolean;
  /** Show or hide previous and next buttons. */
  arrows: boolean;
  /** Enable automatic creation of the previous/next buttons. */
  auto_arrows: boolean;
  /** Internal resize state. */
  resized: boolean;
  /** Duration of the scrolling animation in milliseconds. */
  scroll: number;
}

/**
 * Events specific to the Navigation widget.
 * Extends Container events.
 */
export interface INavigationEvents extends IContainerEvents {
  // No additional events beyond those inherited from Container
}

/**
 * Navigation is a Container including a Buttons widget for navigating between pages.
 */
export declare class Navigation<
  TOptions extends INavigationOptions = INavigationOptions,
  TEvents extends INavigationEvents = INavigationEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-navigation */
  element: HTMLDivElement;
  /** Child Buttons widget holding the navigation buttons. */
  buttons: Buttons;
  /** Previous button widget. */
  prev: Button;
  /** Next button widget. */
  next: Button;

  /**
   * Add a single button.
   */
  addButton(options: IButtonsButtonInput, position?: number): Button;

  /**
   * Add multiple buttons.
   */
  addButtons(list: IButtonsButtonInput[]): Button[];

  /**
   * Remove a button.
   */
  removeButton(button: number | Button, destroy?: boolean): void;

  /**
   * Remove all buttons.
   */
  empty(): void;
}
