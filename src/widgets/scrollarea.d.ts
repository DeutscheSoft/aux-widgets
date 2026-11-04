import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the ScrollArea widget.
 * Extends Widget options.
 */
export interface IScrollAreaOptions extends IWidgetOptions {
  // ScrollArea doesn't add any specific options beyond Widget options
}

/**
 * Events specific to the ScrollArea widget.
 * Extends Widget events.
 */
export interface IScrollAreaEvents extends IWidgetEvents {
  // ScrollArea doesn't add any specific events beyond Widget events
}

/**
 * The ScrollArea widget disables or enables rendering in its child widgets
 * depending on whether or not they are visible according to an
 * IntersectionObserver.
 */
export declare class ScrollArea<
  Options extends IScrollAreaOptions = IScrollAreaOptions,
  Events extends IScrollAreaEvents = IScrollAreaEvents
> extends Widget<Options, Events> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** The main DIV element. Has class .aux-scroller */
  element: HTMLDivElement;

  /**
   * Enable drawing for all visible child widgets.
   */
  enableDrawChildren(): void;

  /**
   * Add a child widget and observe it with IntersectionObserver.
   * @param child - The child widget to add.
   */
  addChild(child: Widget): void;

  /**
   * Remove a child widget and stop observing it.
   * @param child - The child widget to remove.
   */
  removeChild(child: Widget): void;
}
