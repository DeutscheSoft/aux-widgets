import { Base, IBaseEvents, EffectiveEvents } from '../implements/base.js';

/**
 * Size constraints for resizing.
 */
export interface IResizeMinMax {
  x: number;
  y: number;
}

/**
 * Options for Resize module.
 */
export interface IResizeOptions {
  /** The element to resize. */
  node: HTMLElement;
  /** A DOM node used as handle. If none set the element is used. */
  handle?: HTMLElement;
  /** Set to false to disable resizing. */
  active?: boolean;
  /** Object containing x and y determining minimum size. A value of -1 means no minimum. */
  min?: IResizeMinMax;
  /** Object containing x and y determining maximum size. A value of -1 means no maximum. */
  max?: IResizeMinMax;
}

/**
 * Events for Resize module.
 */
export interface IResizeEvents extends IBaseEvents {
  /** Is fired when resizing starts. */
  resizestart: (event: MouseEvent | TouchEvent) => void;
  /** Is fired when resizing stops. */
  resizestop: (event: MouseEvent | TouchEvent) => void;
  /** Is fired when resizing is in progress. */
  resizing: (event: MouseEvent | TouchEvent, width: number, height: number) => void;
}

/**
 * Resize allows resizing of elements. It does that by continuously resizing an
 * element while the user drags a handle.
 */
export declare class Resize<
  TOptions extends IResizeOptions = IResizeOptions,
  TEvents extends IResizeEvents = IResizeEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Base<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);
}
