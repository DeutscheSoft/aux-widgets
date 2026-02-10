import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { Label, ILabelOptions } from './label.js';

/**
 * Easing function for animation.
 */
export type IMarqueeEasing = 'ease' | 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | `cubic-bezier(${number}, ${number}, ${number}, ${number})`;

/**
 * Options specific to the Marquee widget.
 * Extends Container and Label options (since it inherits Label options).
 */
export interface IMarqueeOptions extends IContainerOptions, Omit<ILabelOptions, 'visible'> {
  /** Speed of the movement in CSS pixels per second. */
  speed: number;
  /** Pause the animation on start and end for this amount of milliseconds. */
  pause: number;
  /** Function of the animation, one out of 'ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out', 'cubic-bezier(n, n, n, n)'. */
  easing: IMarqueeEasing | string;
  /** @internal Inner width (computed internally). */
  _inner?: number;
  /** @internal Outer width (computed internally). */
  _outer?: number;
}

/**
 * Events specific to the Marquee widget.
 * Extends Container events.
 */
export interface IMarqueeEvents extends IContainerEvents {
  // No additional events beyond those inherited from Container
}

/**
 * Marquee is a Label inside a Container. Marquee inherits all options of Label.
 */
export declare class Marquee<
  TOptions extends IMarqueeOptions = IMarqueeOptions,
  TEvents extends IMarqueeEvents = IMarqueeEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-marquee */
  element: HTMLDivElement;
  /** Instance of Label displaying the text to be scrolled. */
  label: Label;
  /** Internal style element for animations. */
  _style: HTMLStyleElement;
}
