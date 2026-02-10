import { Base, IBaseEvents, EffectiveEvents } from '../implements/base.js';

/**
 * Options specific to the Module class.
 * Extends Base options.
 */
export interface IModuleOptions extends Record<string, unknown> {
  // Module doesn't add any specific options beyond Base
}

/**
 * Events specific to the Module class.
 * Extends Base events.
 */
export interface IModuleEvents extends IBaseEvents {
  // Module doesn't add any specific events beyond Base
}

/**
 * Module is a base class for modules that are attached to widgets.
 * Modules extend Base and have a parent widget reference.
 */
export declare class Module<
  TOptions extends IModuleOptions = IModuleOptions,
  TEvents extends IModuleEvents = IModuleEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Base<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The parent widget this module is attached to. */
  parent: unknown;

  /**
   * Initialize the module with a parent widget and options.
   * @param widget - The parent widget.
   * @param options - The module options.
   */
  protected initialize(widget: unknown, options?: Partial<TOptions>): void;

  /**
   * Destroy the module and clean up resources.
   */
  destroy(): void;
}
