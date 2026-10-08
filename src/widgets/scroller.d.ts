import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';

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
}
export interface IScrollBarEvents extends IWidgetEvents {}

export declare class ScrollBar<
  TOptions extends IScrollBarOptions = IScrollBarOptions,
  TEvents extends IScrollBarEvents = IScrollBarEvents
> extends Widget<TOptions, TEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}

export interface IScrollerOptions extends IContainerOptions {}
export interface IScrollerEvents extends IContainerEvents {}

export declare class Scroller<
  TOptions extends IScrollerOptions = IScrollerOptions,
  TEvents extends IScrollerEvents = IScrollerEvents
> extends Container<TOptions, TEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}
