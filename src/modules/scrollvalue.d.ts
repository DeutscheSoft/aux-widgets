import { Base, IBaseEvents } from '../implements/base.js';

/**
 * Options for ScrollValue.
 */
export interface IScrollValueOptions {
  /** The element receiving the scroll event. */
  node: HTMLElement | SVGElement | boolean;
  /** Callback returning the value. By default returns this.parent.options.value. */
  get?: () => number;
  /** Callback setting the value. By default calls this.parent.userset("value", v). */
  set?: (value: number) => void | false;
  /** A function returning a Range instance or options for a new one. */
  range?: () => unknown;
  /** A function returning an element receiving events or false to fire events on the main element. */
  events?: () => unknown | false;
  /** Element receiving classes or false to set classes on the main element. */
  classes?: HTMLElement | SVGElement | boolean;
  /** Disable the scroll event. */
  active?: boolean;
  /** An array containing values for x, y and z defining the direction of scrolling. */
  scroll_direction?: [number, number, number];
  /** Clamp the returned value using clampValue of the transformation. */
  limit?: boolean;
  /** Focus this element on scroll. Set to false if no focus should be set. */
  focus?: HTMLElement | SVGElement | boolean;
  /** @internal */
  scrolling?: boolean;
}

/**
 * Events for ScrollValue.
 */
export interface IScrollValueEvents extends IBaseEvents {
  /** Fired when scrolling starts. */
  scrollstarted: (event: WheelEvent) => void;
  /** Fired while scrolling happens. */
  scrolling: (event: WheelEvent) => void;
  /** Fired when scrolling ended. */
  scrollended: () => void;
}

/**
 * ScrollValue enables the scroll wheel for setting a value of an
 * object. For instance, it is used by Knob to allow turning
 * the knob using the scroll wheel.
 */
export declare class ScrollValue extends Base<
  IScrollValueOptions,
  IScrollValueEvents
> {
  constructor(widget: unknown, options?: Partial<IScrollValueOptions>);

  /** The parent widget. */
  parent: unknown;
}
