import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Root can be used as a top-level container for programmatic UIs.
 * It is not strictly required anymore for technical reasons; Container
 * can be used directly instead.
 */
export declare class Root<
  Options extends IContainerOptions = IContainerOptions,
  Events extends IContainerEvents = IContainerEvents
> extends Container<Options, Events> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** The main DIV container. Has class .aux-root */
  element: HTMLDivElement;
}
