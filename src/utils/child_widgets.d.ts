import { Events } from '../events.js';
import { Widget } from '../widgets/widget.js';

/**
 * Filter function for ChildWidgets.
 * Can be a class constructor (to filter by instance type) or a predicate function.
 */
export type IChildWidgetsFilter<T extends Widget = Widget> = 
  | (new (...args: unknown[]) => T)
  | ((child: Widget) => boolean);

/**
 * Options for ChildWidgets constructor.
 */
export interface IChildWidgetsOptions {
  /** Filter function or class constructor to filter children. If undefined, all children are included. */
  filter?: IChildWidgetsFilter;
}

/**
 * Events emitted by ChildWidgets.
 */
export interface IChildWidgetsEvents {
  /** Fired when a child widget is added. Arguments: child, position */
  child_added: (child: Widget, position: number) => void;
  /** Fired when a child widget is removed. Arguments: child, position */
  child_removed: (child: Widget, position: number) => void;
  /** Fired when the list of children changes. */
  changed: () => void;
}

/**
 * ChildWidgets is a utility class that manages a filtered list of child widgets.
 * It extends Events and automatically tracks when children are added or removed.
 */
export declare class ChildWidgets extends Events {
  constructor(widget: Widget, options?: IChildWidgetsOptions);

  /** The parent widget. */
  widget: Widget | null;
  /** The filter function used to determine which children to include. */
  filter: (child: Widget) => boolean;
  /** The filtered list of child widgets. */
  list: Widget[];
  /** Internal subscriptions array. */
  subscriptions: (() => void)[];

  /**
   * Sort the list of children by their DOM order.
   */
  sortByDOM(): void;

  /**
   * Sort the list of children by their DOM order and emit a 'changed' event.
   */
  sort(): void;

  /**
   * Get the index of a child widget in the list.
   * @param child - The child widget.
   * @returns The index of the child, or -1 if not found.
   */
  indexOf(child: Widget): number;

  /**
   * Check if a child widget is in the list.
   * @param child - The child widget.
   * @returns True if the child is in the list.
   */
  includes(child: Widget): boolean;

  /**
   * Iterate over all children in the list.
   * @param cb - The callback function.
   */
  forEach(cb: (child: Widget, index: number, array: Widget[]) => void): void;

  /**
   * Get the list of filtered child widgets.
   * @returns The array of child widgets.
   */
  getList(): Widget[];

  /**
   * Get a child widget at a specific index.
   * @param index - The index.
   * @returns The child widget at that index, or undefined.
   */
  at(index: number): Widget | undefined;

  /**
   * Destroy the ChildWidgets instance and clean up subscriptions.
   */
  destroy(): void;

  /**
   * Iterate over all children asynchronously, with automatic subscription management.
   * The callback can return a cleanup function that will be called when the child is removed.
   * @param callback - The callback function that receives (child, position) and optionally returns a cleanup function.
   * @returns A cleanup function that unsubscribes all subscriptions.
   */
  forEachAsync(callback: (child: Widget, position: number) => (() => void) | null | undefined): () => void;
}
