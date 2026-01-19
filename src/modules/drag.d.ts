import { Base, IBaseEvents, EffectiveEvents } from '../implements/base.js';

/**
 * Position constraints for dragging.
 */
export interface IDragMinMax {
  x: number | false;
  y: number | false;
}

/**
 * Options for Drag module.
 */
export interface IDragOptions {
  /** The element to drag. */
  node: HTMLElement | SVGElement;
  /** A DOM node to be used as a handle. If not set, options.node is used. */
  handle?: HTMLElement | SVGElement;
  /** Enable or disable dragging. */
  active?: boolean;
  /** Object containing the minimum positions for x and y. A value of false is interpreted as no minimum. */
  min?: IDragMinMax;
  /** Object containing the maximum positions for x and y. A value of false is interpreted as no maximum. */
  max?: IDragMinMax;
  /** Number of pixels the user has to move until dragging starts. */
  initial?: number;
  /** Use CSS transformations instead of absolute positioning. */
  transform?: boolean;
}

/**
 * Events for Drag module.
 */
export interface IDragEvents extends IBaseEvents {
  /** The user is dragging this item. */
  dragging: (event: MouseEvent | TouchEvent) => void;
  /** The user started dragging this item. */
  startdrag: (event: MouseEvent | TouchEvent) => void;
  /** The user stopped dragging this item. */
  stopdrag: (event: MouseEvent | TouchEvent) => void;
}

/**
 * Drag enables dragging of elements on the screen positioned absolutely or by CSS transformation.
 */
export declare class Drag<
  TOptions extends IDragOptions = IDragOptions,
  TEvents extends IDragEvents = IDragEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Base<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);
}
