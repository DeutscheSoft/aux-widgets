import {
  Widget,
  IWidgetOptions,
  IWidgetEvents,
  WidgetInteractiveOptions,
} from './widget.js';

/**
 * Input type options.
 */
export type IInputType = 'text' | 'password';

/**
 * Edit mode options.
 */
export type IEditMode = 'onenter' | 'immediate';

/**
 * How Value parses and displays its value.
 * `"string"` keeps text. A custom `format` or `set` is left in place.
 */
export type IValueMode = 'number' | 'string';

/**
 * Options specific to the Value widget.
 * Extends Widget options.
 */
export interface IValueOptions extends IWidgetOptions {
  /** The value. */
  value: number | string;
  /**
   * `"number"` parses user input with parseFloat.
   * `"string"` keeps it as text. Does not replace a custom format or set.
   */
  mode: IValueMode;
  /** A formatting function used to display the value. */
  format: (value: number | string) => string | number;
  /** Size attribute of the input element. null to unset. */
  size: number | null;
  /** Maxlength attribute of the input element. null to unset. */
  maxlength: number | null;
  /** A function which is called to parse user input. Set to false to disable editing. */
  set: ((val: string) => number | string) | false;
  /** Select the entire text if clicked. */
  auto_select: boolean;
  /** Sets the readonly attribute. */
  readonly: boolean;
  /** Sets the placeholder attribute. */
  placeholder: string;
  /** Sets the type attribute. Type can be either 'text' or 'password'. */
  type: IInputType;
  /** Sets the event to trigger the userset event. Can be one out of 'onenter' or 'immediate'. */
  editmode: IEditMode;
  /** Set a unique identifier to enable browsers internal auto completion. */
  autocomplete: string | false;
  /** Set the value if user hits TAB. */
  tab_to_set: boolean;
  /** The ARIA role for the value input. Defaults to 'textbox'. */
  role: string;
}

/**
 * Events specific to the Value widget.
 * Extends Widget events.
 */
export interface IValueEvents extends IWidgetEvents {
  /** Fired when the value was clicked. */
  valueclicked: (value: number | string) => void;
  /** Fired when the ESC key was pressed while editing the value. */
  valueescape: (value: number | string) => void;
  /** Fired after the value has been set and editing has ended. */
  valueset: (value: number | string) => void;
  /** Fired when the user hits a key while editing the value. */
  valuetyping: (event: KeyboardEvent, value: number | string) => void;
  /** Fired when editing of the value ends. */
  valuedone: (value: number | string) => void;
}

/**
 * Value options that may be changed through user interaction.
 */
export interface ValueInteractiveOptions extends WidgetInteractiveOptions {
  /** The value. */
  value: IValueOptions['value'];
}

/**
 * Value is a formatted and editable text field displaying values as
 * strings or numbers.
 */
export declare class Value<
  Options extends IValueOptions = IValueOptions,
  Events extends IValueEvents = IValueEvents,
  InteractiveOptions extends ValueInteractiveOptions = ValueInteractiveOptions
> extends Widget<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** The main DIV container. Has class .aux-value */
  element: HTMLDivElement;
  /** The input element. Has class .aux-input */
  _input: HTMLInputElement;
}
