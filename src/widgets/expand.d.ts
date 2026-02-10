import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';

export interface IExpandOptions extends IContainerOptions {}
export interface IExpandEvents extends IContainerEvents {}

export declare class Expand<
  TOptions extends IExpandOptions = IExpandOptions,
  TEvents extends IExpandEvents = IExpandEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);
}
