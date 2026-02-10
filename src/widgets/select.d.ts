import { Button, IButtonOptions, IButtonEvents } from './button.js';
import { EffectiveEvents } from '../implements/base.js';
import { Icon } from './icon.js';
import { Label } from './label.js';

/**
 * Entry input type for Select entries.
 * Can be a string (used as both label and value), an object with entry properties, or a SelectEntry instance.
 */
export type ISelectEntryInput =
  | string
  | { label?: string; value: unknown; icon?: string | false; [key: string]: unknown }
  | SelectEntry;

/**
 * Sort function for Select entries.
 * @param a - First entry to compare.
 * @param b - Second entry to compare.
 * @returns Comparison result (negative if a < b, positive if a > b, 0 if equal).
 */
export type ISelectSortFunction = (a: SelectEntry, b: SelectEntry) => number;

/**
 * Options specific to the Select widget.
 * Extends Button options.
 */
export interface ISelectOptions extends IButtonOptions {
  /** The list of SelectEntry. Each member can be a string, an object with Button properties and value, or a SelectEntry instance. */
  entries: ISelectEntryInput[];
  /** The index of the selected SelectEntry. Set to -1 to unselect any already selected entries. */
  selected: number;
  /** The value of the selected entry. */
  value: unknown;
  /** The currently selected entry. */
  selected_entry: SelectEntry | null;
  /** If true, the Select is auto-sized to be as wide as the widest SelectEntry. */
  auto_size: boolean;
  /** Whether to show the select list. */
  show_list: boolean;
  /** Sort function for entries. */
  sort?: ISelectSortFunction;
  /** Whether the widget has been resized. */
  resized?: boolean;
  /** Placeholder for the button label. Set to false to have an empty placeholder. This placeholder is shown when no entry is selected. */
  placeholder: string | false;
  /** A CSS class to be set on the list. This is a static option and can only be set once on initialization. */
  list_class: string;
  /** Delay in milliseconds for typing to focus entries. */
  typing_delay: number;
  /** Arrow icon name. */
  arrow: string;
  /** @internal Whether any entry has an icon (computed internally). */
  _has_icon?: boolean;
  /** @internal Whether the list is shown (computed internally). */
  _show_list?: boolean;
}

/**
 * Events specific to the Select widget.
 * Extends Button events.
 */
export interface ISelectEvents extends IButtonEvents {
  /** Fired when a new SelectEntry is added to the list. */
  entryadded: (entry: SelectEntry) => void;
  /** Fired when an entry was removed from the list. */
  entryremoved: (entry: SelectEntry) => void;
  /** Fired when the list is cleared. */
  cleared: () => void;
  /** Fired when a selection was made by the user. The arguments are the value of the currently selected SelectEntry, its index, its label and the SelectEntry instance. */
  select: (value: unknown, id: number, label: string, entry: SelectEntry) => void;
}

/**
 * Options specific to the SelectEntry widget.
 * Extends Button options.
 */
export interface ISelectEntryOptions extends IButtonOptions {
  /** The value of the entry. */
  value?: unknown;
  /** Whether this entry is selected. */
  selected?: boolean;
}

/**
 * Events specific to the SelectEntry widget.
 * Extends Button events.
 */
export interface ISelectEntryEvents extends IButtonEvents {
  // SelectEntry doesn't add any specific events beyond Button events
}

/**
 * SelectEntry provides a Button as an entry for Select.
 */
export declare class SelectEntry<
  TOptions extends ISelectEntryOptions = ISelectEntryOptions,
  TEvents extends ISelectEntryEvents = ISelectEntryEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Button<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}

/**
 * Select provides a Button with a select list to choose from a list of SelectEntry.
 */
export declare class Select<
  TOptions extends ISelectOptions = ISelectOptions,
  TEvents extends ISelectEvents = ISelectEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Button<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-select */
  element: HTMLDivElement;
  /** An array containing all entry objects with members label and value. */
  entries: SelectEntry[];
  /** A HTML list for displaying the entry labels. Has class .aux-selectlist */
  _list: HTMLDivElement;
  /** The arrow icon. */
  arrow: Icon;
  /** A blind element for auto_size. */
  sizer: Label;

  /**
   * Show or hide the select list.
   * @param show - true to show and false to hide the list of SelectEntry.
   */
  showList(show: boolean): void;

  /**
   * Select a SelectEntry by its index.
   * @param index - The index of the SelectEntry to select. Set to -1 or false to unselect.
   */
  select(index: number | false): void;

  /**
   * Select a SelectEntry by its value.
   * @param value - The value of the SelectEntry to select.
   */
  selectValue(value: unknown): void;

  /**
   * Select a SelectEntry by its label.
   * @param label - The label of the SelectEntry to select.
   */
  selectLabel(label: string): void;

  /**
   * Replaces the list of SelectEntry to select from with an entirely new one.
   * @param entries - An array of SelectEntry to set as the new list to select from.
   * @emits Select#cleared
   */
  setEntries(entries: ISelectEntryInput[]): void;

  /**
   * Adds new SelectEntry to the end of the list to select from.
   * @param entries - An array of SelectEntry to add to the end of the list.
   */
  addEntries(entries: ISelectEntryInput[]): void;

  /**
   * Adds a single SelectEntry to the end of the list.
   * @param entry - A string to be displayed and used as the value, an object with members label and value, or an instance of SelectEntry.
   * @param position - The position in the list to add the new entry at. If omitted, the entry is added at the end.
   * @returns The added SelectEntry.
   * @emits Select#entryadded
   */
  addEntry(entry: ISelectEntryInput, position?: number): SelectEntry;

  /**
   * Remove a SelectEntry from the list by its index.
   * @param index - The index of the SelectEntry to be removed from the list.
   * @emits Select#entryremoved
   */
  removeIndex(index: number): void;

  /**
   * Remove a SelectEntry from the list by its value.
   * @param value - The value of the SelectEntry to be removed from the list.
   * @emits Select#entryremoved
   */
  removeValue(value: unknown): void;

  /**
   * Remove an entry from the list by its label.
   * @param label - The label of the entry to be removed from the list.
   * @emits Select#entryremoved
   */
  removeLabel(label: string): void;

  /**
   * Remove an entry from the list.
   * @param entry - The SelectEntry to be removed from the list.
   * @emits Select#entryremoved
   */
  removeEntry(entry: SelectEntry): void;

  /**
   * Remove multiple entries from the list.
   * @param entries - An array of SelectEntry to be removed from the list.
   * @emits Select#entryremoved (for each entry)
   */
  removeEntries(entries: SelectEntry[]): void;

  /**
   * Get the index of a SelectEntry by its value.
   * @param value - The value of the SelectEntry.
   * @returns The index of the entry or -1.
   */
  indexByValue(value: unknown): number;

  /**
   * Get the index of a SelectEntry by its label.
   * @param label - The label of the SelectEntry.
   * @returns The index of the entry or -1.
   */
  indexByLabel(label: string): number;

  /**
   * Get the index of a SelectEntry by the SelectEntry itself.
   * @param entry - The SelectEntry.
   * @returns The index of the entry or -1.
   */
  indexByEntry(entry: SelectEntry): number;

  /**
   * Get the index of a SelectEntry by its HTMLElement.
   * @param element - The element of the SelectEntry.
   * @returns The index of the entry or -1.
   */
  indexByElement(element: HTMLElement): number;

  /**
   * Get a SelectEntry by its value.
   * @param value - The value of the SelectEntry.
   * @returns The SelectEntry or null.
   */
  entryByValue(value: unknown): SelectEntry | null;

  /**
   * Get a SelectEntry by its label.
   * @param label - The label of the SelectEntry.
   * @returns The SelectEntry or null.
   */
  entryByLabel(label: string): SelectEntry | null;

  /**
   * Get the next SelectEntry whose label starts with the given string.
   * @param label - The label prefix to search for.
   * @param current - The current index to start searching.
   * @returns The SelectEntry or null.
   */
  nextEntryByPartialLabel(label: string, current?: number): SelectEntry | null;

  /**
   * Get a SelectEntry by its index.
   * @param index - The index of the SelectEntry.
   * @returns The SelectEntry or null.
   */
  entryByIndex(index: number): SelectEntry | null;

  /**
   * Get a value by its SelectEntry index.
   * @param index - The index of the SelectEntry.
   * @returns The value of the SelectEntry or undefined.
   */
  valueByIndex(index: number): unknown;

  /**
   * Get the value of a SelectEntry.
   * @param entry - The SelectEntry.
   * @returns The value of the SelectEntry.
   */
  valueByEntry(entry: SelectEntry): unknown;

  /**
   * Get the value of a SelectEntry by its label.
   * @param label - The label of the SelectEntry.
   * @returns The value of the SelectEntry or undefined.
   */
  valueByLabel(label: string): unknown;

  /**
   * Remove all SelectEntry from the list.
   * @emits Select#cleared
   */
  clear(): void;

  /**
   * Get the currently selected SelectEntry.
   * @returns The currently selected SelectEntry or null.
   */
  current(): SelectEntry | null;

  /**
   * Get the currently selected SelectEntry's index.
   * @returns The index of the currently selected SelectEntry or -1.
   */
  currentIndex(): number;

  /**
   * Get the currently selected SelectEntry's value.
   * @returns The value of the currently selected SelectEntry or undefined.
   */
  currentValue(): unknown;

  /**
   * Focus an entry while typing (for keyboard navigation).
   * @param key - The key that was pressed.
   */
  focusWhileTyping(key: string): void;
}
