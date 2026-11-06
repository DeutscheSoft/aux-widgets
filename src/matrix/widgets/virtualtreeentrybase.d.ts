import type {
  Container,
  IContainerOptions,
  IContainerEvents,
  ContainerInteractiveOptions,
} from '../../widgets/container.js';
import type { TreeNodeData } from '../models/treenode.js';
import type { VirtualTreeDataView } from '../models/virtualtreedataview.js';

/**
 * Options for {@link VirtualTreeEntryBase}.
 */
export interface IVirtualTreeEntryBaseOptions extends IContainerOptions {
  /** Data model for this entry, or `null` when unused. */
  data: TreeNodeData | null;
}

/**
 * Events for {@link VirtualTreeEntryBase}.
 */
export interface IVirtualTreeEntryBaseEvents extends IContainerEvents {}

/**
 * VirtualTreeEntryBase options that may be changed through user interaction.
 */
export interface VirtualTreeEntryBaseInteractiveOptions
  extends ContainerInteractiveOptions {}

/**
 * Base class for entries shown in {@link VirtualTree}.
 */
export declare class VirtualTreeEntryBase<
  Options extends IVirtualTreeEntryBaseOptions = IVirtualTreeEntryBaseOptions,
  Events extends IVirtualTreeEntryBaseEvents = IVirtualTreeEntryBaseEvents,
  InteractiveOptions extends VirtualTreeEntryBaseInteractiveOptions = VirtualTreeEntryBaseInteractiveOptions
> extends Container<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /**
   * Called when the entry is (re)bound to list data. Override in subclasses
   * to display additional fields.
   */
  updateData(
    virtualtreeview: VirtualTreeDataView,
    index: number,
    element: TreeNodeData | undefined,
    treePosition: boolean[]
  ): void;
}
