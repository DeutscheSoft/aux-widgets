import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Select, SelectEntry, ISelectEntryInput } from './select.js';
import { Value, IEditMode } from './value.js';

/**
 * Options specific to the ComboBox widget.
 * Extends Widget options.
 */
export interface IComboBoxOptions extends IWidgetOptions {
  /** The value of the combobox. */
  value?: string | null;
  /** The list of SelectEntry for the Select child widget. Each member can be a string, an object with Button properties and value, or a SelectEntry instance. */
  entries?: ISelectEntryInput[];
  /** A CSS class to be set on the Select list. This is a static option and can only be set once on initialization. */
  list_class?: string;
  /** Edit mode for the Value child widget. */
  editmode?: IEditMode;
}

/**
 * Events specific to the ComboBox widget.
 * Extends Widget events.
 */
export interface IComboBoxEvents extends IWidgetEvents {
  /** Fired when the user selects an entry from the list. */
  select: (value: unknown, index: number, label: string, entry: SelectEntry) => void;
}

/**
 * Combobox is a combination of a Select and a Value.
 */
export declare class ComboBox<
  TOptions extends IComboBoxOptions = IComboBoxOptions,
  TEvents extends IComboBoxEvents = IComboBoxEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV element. Has class .aux-combobox */
  element: HTMLDivElement;
  /** The Select widget. */
  select: Select;
  /** The Value widget. */
  value: Value;
}
