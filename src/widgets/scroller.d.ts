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

export declare class ScrollHide<
  TOptions extends IContainerOptions = IContainerOptions,
  TEvents extends IContainerEvents = IContainerEvents
> extends Container<TOptions, TEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
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
  TOptions extends IScrollBarOptions = IScrollBarOptions,
  TEvents extends IScrollBarEvents = IScrollBarEvents,
  Interactive extends ScrollBarInteractiveOptions = ScrollBarInteractiveOptions
> extends Widget<TOptions, TEvents, Interactive> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}

export interface IScrollerOptions extends IContainerOptions {}
export interface IScrollerEvents extends IContainerEvents {}

/**
 * Scroller options that may be changed through user interaction.
 */
export interface ScrollerInteractiveOptions
  extends ContainerInteractiveOptions {}

export declare class Scroller<
  TOptions extends IScrollerOptions = IScrollerOptions,
  TEvents extends IScrollerEvents = IScrollerEvents,
  Interactive extends ScrollerInteractiveOptions = ScrollerInteractiveOptions
> extends Container<TOptions, TEvents, Interactive> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}
