import type {
  Patchbay,
  IPatchbayOptions,
  IPatchbayEvents,
  PatchbayInteractiveOptions,
} from './patchbay.js';
import type { VirtualTree } from './virtualtree.js';
import type {
  Indicators,
  IndicatorsBatchRectangle,
  IndicatorsIndexRectangle,
} from './indicators.js';
import type { Indicator, IIndicatorOptions } from './indicator.js';
import type {
  VirtualTreeEntryBase,
  IVirtualTreeEntryBaseOptions,
} from './virtualtreeentrybase.js';
import type { ConnectionDataView } from '../models/connectiondataview.js';
import type { VirtualTreeDataView } from '../models/virtualtreedataview.js';
import type { TreeNodeData } from '../models/treenode.js';

/** Signal-flow orientation for {@link Matrix}. */
export type MatrixSignalFlow = 'left-top' | 'top-left';

/**
 * Options for {@link Matrix}.
 */
export interface IMatrixOptions extends IPatchbayOptions {
  /**
   * Class used for indicators inside {@link Indicators}.
   */
  indicator_class: new (options?: Partial<IIndicatorOptions>) => Indicator;
  /**
   * Class used for entries in both virtual trees.
   */
  entry_class: new (
    options?: Partial<IVirtualTreeEntryBaseOptions>
  ) => VirtualTreeEntryBase;
  /**
   * Placement of sources vs sinks. `left-top` puts sources on the left and
   * sinks on top; `top-left` swaps them.
   */
  signal_flow: MatrixSignalFlow;
  /** Enable batch connection rectangle in {@link Indicators}. */
  batch: boolean;
}

/**
 * Events for {@link Matrix}.
 */
export interface IMatrixEvents extends IPatchbayEvents {
  toggleConnection: (source: TreeNodeData, sink: TreeNodeData) => void;
  toggle_connection: (source: TreeNodeData, sink: TreeNodeData) => void;
  indicatorEnter: (detail: {
    source: TreeNodeData;
    sink: TreeNodeData;
    event: Event;
    indicator: Indicator;
  }) => void;
  indicator_enter: (detail: {
    source: TreeNodeData;
    sink: TreeNodeData;
    event: Event;
    indicator: Indicator;
  }) => void;
  indicatorLeave: (detail: {
    source: TreeNodeData;
    sink: TreeNodeData;
    event: Event;
    indicator: Indicator;
  }) => void;
  indicator_leave: (detail: {
    source: TreeNodeData;
    sink: TreeNodeData;
    event: Event;
    indicator: Indicator;
  }) => void;
  connectDiagonal: (
    indexRectangle: IndicatorsIndexRectangle,
    rectangle: IndicatorsBatchRectangle
  ) => void;
  connect_diagonal: (
    indexRectangle: IndicatorsIndexRectangle,
    rectangle: IndicatorsBatchRectangle
  ) => void;
  disconnectDiagonal: (
    indexRectangle: IndicatorsIndexRectangle,
    rectangle: IndicatorsBatchRectangle
  ) => void;
  disconnect_diagonal: (
    indexRectangle: IndicatorsIndexRectangle,
    rectangle: IndicatorsBatchRectangle
  ) => void;
  disconnectAll: (
    indexRectangle: IndicatorsIndexRectangle,
    rectangle: IndicatorsBatchRectangle
  ) => void;
  disconnect_all: (
    indexRectangle: IndicatorsIndexRectangle,
    rectangle: IndicatorsBatchRectangle
  ) => void;
}

/**
 * Matrix options that may be changed through user interaction.
 */
export interface MatrixInteractiveOptions extends PatchbayInteractiveOptions {}

/**
 * Patchbay with left and top {@link VirtualTree}s plus an {@link Indicators}
 * connection grid.
 */
export declare class Matrix<
  Options extends IMatrixOptions = IMatrixOptions,
  Events extends IMatrixEvents = IMatrixEvents,
  InteractiveOptions extends MatrixInteractiveOptions = MatrixInteractiveOptions
> extends Patchbay<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** Left virtual tree. Has class `.aux-virtualtreeleft`. */
  virtualtree_left: VirtualTree;
  /** Top virtual tree. Has class `.aux-virtualtreetop`. */
  virtualtree_top: VirtualTree;
  /** Connection indicators grid. Has class `.aux-indicators`. */
  indicators: Indicators;
  /** Active connection data view, or `null` before sources/sinks are set. */
  connectionview: ConnectionDataView | null;

  /** Virtual tree data view currently bound to the left tree. */
  getVirtualTreeViewLeft(): VirtualTreeDataView | null | undefined;
  /** Virtual tree data view currently bound to the top tree. */
  getVirtualTreeViewTop(): VirtualTreeDataView | null | undefined;

  /**
   * Scroll both trees (and thus the indicators) to the given offsets.
   */
  scrollTo(options: { top?: number; left?: number }): void;

  /** Current scroll offsets of the left (top) and top (left) trees. */
  getScrollPosition(): { top: number; left: number };
}
