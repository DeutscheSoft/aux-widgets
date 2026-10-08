import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Root can be used as a top-level container for programmatic UIs.
 * It is not strictly required anymore for technical reasons; Container
 * can be used directly instead.
 */
export declare class Root<
  TOptions extends IContainerOptions = IContainerOptions,
  TEvents extends IContainerEvents = IContainerEvents
> extends Container<TOptions, TEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-root */
  element: HTMLDivElement;
}
