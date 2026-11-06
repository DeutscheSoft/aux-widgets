import {
  Container,
  IContainerOptions,
  IContainerEvents,
  ContainerInteractiveOptions,
} from './container.js';
import {
  Widget,
  IWidgetOptions,
  IWidgetEvents,
  WidgetInteractiveOptions,
} from './widget.js';
import type { DragValue } from '../modules/dragvalue.js';

export declare class ScrollHide<
  Options extends IContainerOptions = IContainerOptions,
  Events extends IContainerEvents = IContainerEvents
> extends Container<Options, Events> {
  constructor(options?: Partial<NoInfer<Options>>);
}

export interface IScrollBarOptions extends IWidgetOptions {
  position: 'top' | 'right' | 'bottom' | 'left';
  content?: number;
  clip?: number;
  /** Scroll position along the scrollbar axis. */
  scroll: number;
}
export interface IScrollBarEvents extends IWidgetEvents {}

/**
 * ScrollBar options that may be changed through user interaction.
 */
export interface ScrollBarInteractiveOptions extends WidgetInteractiveOptions {
  /** Scroll position along the scrollbar axis. */
  scroll: IScrollBarOptions['scroll'];
}

export declare class ScrollBar<
  Options extends IScrollBarOptions = IScrollBarOptions,
  Events extends IScrollBarEvents = IScrollBarEvents,
  InteractiveOptions extends ScrollBarInteractiveOptions = ScrollBarInteractiveOptions
> extends Widget<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** Drag helper used to scrub the scrollbar. */
  drag: DragValue;
}

export interface IScrollerOptions extends IContainerOptions {
  /** Show the horizontal scrollbar. */
  scroll_x: boolean;
  /** Show the vertical scrollbar. */
  scroll_y: boolean;
}
export interface IScrollerEvents extends IContainerEvents {}

/**
 * Scroller options that may be changed through user interaction.
 */
export interface ScrollerInteractiveOptions
  extends ContainerInteractiveOptions {}

export declare class Scroller<
  Options extends IScrollerOptions = IScrollerOptions,
  Events extends IScrollerEvents = IScrollerEvents,
  InteractiveOptions extends ScrollerInteractiveOptions = ScrollerInteractiveOptions
> extends Container<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** Inner container that hides native scrollbars. */
  scrollhide: ScrollHide;
  /** Horizontal scrollbar. */
  scroll_x: ScrollBar;
  /** Vertical scrollbar. */
  scroll_y: ScrollBar;
}
