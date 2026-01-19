import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { Button, IButtonOptions } from './button.js';
import { ChildWidgets } from '../utils/child_widgets.js';

/**
 * Direction for button layout.
 */
export type IButtonsDirection = 'horizontal' | 'vertical';

/**
 * Input type for creating buttons - can be a Button instance, options object, or label string.
 */
export type IButtonsButtonInput = Button | IButtonOptions | string;

/**
 * Select type - can be a single index, array of indices, Button instance, or array of Button instances.
 */
export type IButtonsSelect = number | number[] | Button | Button[];

/**
 * Options specific to the Buttons widget.
 * Extends Container options.
 */
export interface IButtonsOptions extends IContainerOptions {
  /** A list of Button instances, button options objects or label strings which is converted to button instances on init. */
  buttons?: IButtonsButtonInput[];
  /** The layout of the button list, either "horizontal" or "vertical". */
  direction?: IButtonsDirection;
  /** The Button or a list of Buttons, depending on multi_select, to highlight. Expects either the buttons index starting from zero or the Button instance(s) itself. Set to -1 or [] to de-select any selected button. */
  select?: IButtonsSelect;
  /** A class to be used for instantiating new buttons. */
  button_class?: typeof Button;
  /** A role to be used for instantiating new buttons. */
  button_role?: string;
  /** Set to 0 to disable multiple selection, 1 for unlimited and any other number for a defined maximum amount of selectable buttons. */
  multi_select?: number;
  /** Define if single-selection (options.multi_select=false) can be de-selected. */
  deselect?: boolean;
  /** @internal Focus state (computed internally). */
  _focus?: number | false;
}

/**
 * Events specific to the Buttons widget.
 * Extends Container events.
 */
export interface IButtonsEvents extends IContainerEvents {
  /** Fired when a Button was added to Buttons. */
  added: (button: Button) => void;
  /** Fired when a Button was removed from the Buttons. */
  removed: (button: Button) => void;
}

/**
 * Buttons is a list of Buttons, arranged
 * either vertically or horizontally. Single buttons can be selected by clicking.
 * If multi_select is enabled, buttons can be added and removed from
 * the selection by clicking on them. Buttons uses warning
 * to highlight buttons which can't be selected due to options.multi_select=n.
 */
export declare class Buttons<
  TOptions extends IButtonsOptions = IButtonsOptions,
  TEvents extends IButtonsEvents = IButtonsEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main DIV container. Has class .aux-buttons */
  element: HTMLDivElement;
  /** An instance of ChildWidgets holding all Buttons. */
  buttons: ChildWidgets;

  /**
   * Move focus to the next button.
   */
  focusNext(): void;

  /**
   * Move focus to the previous button.
   */
  focusPrevious(): void;

  /**
   * Move focus to the first button.
   */
  focusFirst(): void;

  /**
   * Move focus to the last button.
   */
  focusLast(): void;

  /**
   * Refocus the current button.
   */
  reFocus(): void;

  /**
   * Adds an array of buttons to the end of the list.
   * @param list - An Array containing Button instances, objects with options for the buttons or strings for the buttons labels.
   * @returns Array of Button instances.
   */
  addButtons(list: IButtonsButtonInput[]): Button[];

  /**
   * Creates a Button instance from the given input.
   * @param options - A Button instance, an object with options for a new Button, or a string for the label.
   * @returns The Button instance.
   */
  createButton(options: IButtonsButtonInput): Button;

  /**
   * Adds a Button to Buttons.
   * @param options - An already instantiated Button, an object containing options for a new Button to add or a string for the label of the newly created Button.
   * @param position - The position to add the Button to. If undefined, the Button is added to the end of the list.
   * @returns The Button instance.
   */
  addButton(options: IButtonsButtonInput, position?: number): Button;

  /**
   * Removes a Button from Buttons.
   * @param button - Button index or the Button instance to be removed.
   * @param destroy - Destroy the Button after removal.
   */
  removeButton(button: number | Button, destroy?: boolean): void;

  /**
   * Get the list of Buttons.
   * @returns The list of Button instances.
   */
  getButtons(): Button[];

  /**
   * Removes all buttons.
   */
  empty(): void;

  /**
   * Checks if an index or Button is selected.
   * @param probe - Button index or Button instance.
   * @returns True if the button is selected.
   */
  isSelected(probe: number | Button): boolean;
}
