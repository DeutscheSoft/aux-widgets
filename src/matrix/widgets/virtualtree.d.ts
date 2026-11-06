import type {
  Scroller,
  IScrollerOptions,
  IScrollerEvents,
  ScrollerInteractiveOptions,
} from '../../widgets/scroller.js';
import type { VirtualTreeDataView } from '../models/virtualtreedataview.js';
import type { TreeNodeData } from '../models/treenode.js';
import type {
  VirtualTreeEntryBase,
  IVirtualTreeEntryBaseOptions,
} from './virtualtreeentrybase.js';

/**
 * Options for {@link VirtualTree}.
 */
export interface IVirtualTreeOptions extends IScrollerOptions {
  /** Height of a single entry in pixels. */
  size: number;
  /** Class used to create list entries. */
  entry_class: new (
    options?: Partial<IVirtualTreeEntryBaseOptions>
  ) => VirtualTreeEntryBase;
  /** Data view driving the list. */
  virtualtreeview: VirtualTreeDataView | null | undefined;
  /** Extra entries to keep rendered above the viewport. */
  prerender_top: number;
  /** Extra entries to keep rendered below the viewport. */
  prerender_bottom: number;
}

/**
 * Events for {@link VirtualTree}.
 */
export interface IVirtualTreeEvents extends IScrollerEvents {
  scrollTopChanged: (scrollTop: number) => void;
  scroll_top_changed: (scrollTop: number) => void;
}

/**
 * VirtualTree options that may be changed through user interaction.
 */
export interface VirtualTreeInteractiveOptions
  extends ScrollerInteractiveOptions {}

/**
 * Scrollable window over a {@link VirtualTreeDataView}, rendering only the
 * visible {@link VirtualTreeEntry} widgets.
 */
export declare class VirtualTree<
  Options extends IVirtualTreeOptions = IVirtualTreeOptions,
  Events extends IVirtualTreeEvents = IVirtualTreeEvents,
  InteractiveOptions extends VirtualTreeInteractiveOptions = VirtualTreeInteractiveOptions
> extends Scroller<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** Container for entry elements. Has class `.aux-sizer`. */
  _sizer: HTMLDivElement;
  /** Currently pooled entry widgets. */
  entries: VirtualTreeEntryBase[];

  /** Create an entry from `options.entry_class`. */
  createEntry(): VirtualTreeEntryBase;

  /** Pixel Y position for the entry at `index`. */
  calculateEntryPosition(index: number): number;

  /**
   * Bind `entry` to list data at `index`.
   */
  updateEntry(
    entry: VirtualTreeEntryBase,
    virtualtreeview: VirtualTreeDataView,
    index: number,
    element: TreeNodeData | undefined,
    treePosition: boolean[]
  ): void;

  /** Entry currently showing `index`, or `null` if out of the window. */
  getEntry(index: number): VirtualTreeEntryBase | null;

  /** Index of the port with `id`, or `-1` if missing / filtered out. */
  getIndexById(id: string | number): number;

  /** Entry for the port with `id`, or `null` if not in view. */
  getEntryById(id: string | number): VirtualTreeEntryBase | null;

  /** Re-apply entry transforms after layout changes. */
  triggerReposition(): void;

  /**
   * Scroll to a pixel offset or a native `scrollTo` options object.
   */
  scrollTo(options: number | ScrollToOptions): void;

  /** Current vertical scroll offset. */
  getScrollTop(): number;

  /**
   * Scroll the entry at `index` into view.
   */
  scrollEntryIntoView(
    index: number,
    options?: { block?: 'top' | 'bottom'; behavior?: ScrollBehavior }
  ): void;

  /**
   * Inclusive start and exclusive-ish end indices of the visible range.
   */
  getVisibleRange(): [number, number];
}
