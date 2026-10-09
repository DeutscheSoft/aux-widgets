import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { Label } from './label.js';

/**
 * Options specific to the Frame widget.
 * Extends Container options.
 */
export interface IFrameOptions extends IContainerOptions {
  /** The label of the frame. Set to false to remove it from the DOM. */
  label: string | false;
}

/**
 * Events specific to the Frame widget.
 * Extends Container events.
 */
export interface IFrameEvents extends IContainerEvents {
  // Frame doesn't add any specific events beyond Container events
}

/**
 * Frame is a Container with a Label on top.
 */
export declare class Frame<
  Options extends IFrameOptions = IFrameOptions,
  Events extends IFrameEvents = IFrameEvents
> extends Container<Options, Events> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** The main DIV container. Has class .aux-frame */
  element: HTMLDivElement;
  /** The Label of the frame. */
  label: Label;
}
