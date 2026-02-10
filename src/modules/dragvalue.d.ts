import { Base } from '../implements/base.js';
import { IDragCaptureEvents } from './dragcapture.js';

/**
 * Drag direction options.
 */
export type IDragDirection = 'polar' | 'vertical' | 'horizontal';

/**
 * Options for DragValue.
 */
export interface IDragValueOptions {
  /** The DOM node used for dragging. All DOM events are registered with this Element. */
  node: HTMLElement | SVGElement;
  /** A function returning a Ranged object for calculating the value. Returns its parent by default. */
  range?: () => unknown;
  /** Returns an element firing the events startdrag, dragging and stopdrag. By default it returns this.parent. */
  events?: () => unknown;
  /** While dragging, the class .aux-dragging will be added to this element. If set to false the class will be set on options.node. */
  classes?: HTMLElement | SVGElement | boolean;
  /** Callback function returning the value to drag. By default it returns this.parent.options.value. */
  get?: () => number;
  /** Callback function for setting the value. By default it calls this.parent.userset("value", [value]). */
  set?: (value: number) => void;
  /** Direction for changing the value. Can be 'polar', 'vertical' or 'horizontal'. */
  direction?: IDragDirection;
  /** If false, dragging is deactivated. */
  active?: boolean;
  /** If true, a global cursor is set while dragging. */
  cursor?: boolean;
  /** If options.direction is 'polar', this is the angle of separation between positive and negative value changes. */
  blind_angle?: number;
  /** Defines the angle of the center of the positive value changes. 0 means straight upward. For instance, a value of 45 leads to increasing value when moving towards top and right. */
  rotation?: number;
  /** If true, the difference of pointer travel is inverted. */
  reverse?: boolean;
  /** Limit the returned value to min and max of the range. */
  limit?: boolean;
  /** @internal */
  absolute?: boolean;
  /** @internal */
  dragging?: boolean;
  /** @internal */
  state?: boolean;
  /** @internal */
  focus?: HTMLElement | SVGElement | boolean;
}

/**
 * Events for DragValue.
 */
export interface IDragValueEvents extends IDragCaptureEvents {
  /** Fired while a user is dragging. */
  dragging: (event: MouseEvent | TouchEvent) => void;
  /** Fired when a user starts dragging. */
  startdrag: (event: MouseEvent | TouchEvent) => void;
  /** Fired when a user stops dragging. */
  stopdrag: (event: MouseEvent | TouchEvent) => void;
}

/**
 * DragValue enables dragging an element and setting a
 * value according to the dragged distance. DragValue is for example
 * used in Knob and ValueButton.
 */
export declare class DragValue extends Base<
  IDragValueOptions,
  IDragValueEvents
> {
  constructor(widget: unknown, options?: Partial<IDragValueOptions>);

  /** The parent widget. */
  parent: unknown;
}
