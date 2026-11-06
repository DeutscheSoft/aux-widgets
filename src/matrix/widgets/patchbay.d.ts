import type {
  Container,
  IContainerOptions,
  IContainerEvents,
  ContainerInteractiveOptions,
} from '../../widgets/container.js';
import type { VirtualTreeDataView } from '../models/virtualtreedataview.js';

/**
 * Options for {@link Patchbay}.
 */
export interface IPatchbayOptions extends IContainerOptions {
  /** Sources virtual tree data view. */
  sources: VirtualTreeDataView | null | undefined;
  /** Sinks virtual tree data view. */
  sinks: VirtualTreeDataView | null | undefined;
  /** Entry / cell size in pixels. */
  size: number;
}

/**
 * Events for {@link Patchbay}.
 */
export interface IPatchbayEvents extends IContainerEvents {}

/**
 * Patchbay options that may be changed through user interaction.
 */
export interface PatchbayInteractiveOptions
  extends ContainerInteractiveOptions {}

/**
 * Base layout for managing connections between sources and sinks.
 */
export declare class Patchbay<
  Options extends IPatchbayOptions = IPatchbayOptions,
  Events extends IPatchbayEvents = IPatchbayEvents,
  InteractiveOptions extends PatchbayInteractiveOptions = PatchbayInteractiveOptions
> extends Container<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);
}
