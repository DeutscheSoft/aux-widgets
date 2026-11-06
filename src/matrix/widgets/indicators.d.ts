import type {
  Container,
  IContainerOptions,
  IContainerEvents,
  ContainerInteractiveOptions,
} from '../../widgets/container.js';
import type { Button } from '../../widgets/button.js';
import type { ConfirmButton } from '../../widgets/confirmbutton.js';
import type { ConnectionDataView } from '../models/connectiondataview.js';
import type { TreeNodeData } from '../models/treenode.js';
import type { Indicator, IIndicatorOptions } from './indicator.js';

/** Pixel rectangle for a batch selection. */
export interface IndicatorsBatchRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  flip_x: boolean;
  flip_y: boolean;
}

/** Index-space rectangle for a batch selection. */
export interface IndicatorsIndexRectangle {
  startColumn: number;
  endColumn: number;
  startRow: number;
  endRow: number;
}

/**
 * Options for {@link Indicators}.
 */
export interface IIndicatorsOptions extends IContainerOptions {
  /**
   * Class used to create indicators. Must be a subclass of {@link Indicator}.
   */
  indicator_class: new (options?: Partial<IIndicatorOptions>) => Indicator;
  /** Connection data view driving the indicator grid. */
  connectionview: ConnectionDataView | null;
  /** Cell size in pixels (usually mapped from {@link Matrix}). */
  size: number;
  /** Enable batch connection rectangle. */
  batch: boolean;
  /** Minimum drag distance before the batch rectangle appears. */
  min_distance: number;
  /** Allow batch “deselect all”. */
  has_deselect_all: boolean;
  /** Allow batch “deselect diagonal”. */
  has_deselect_diagonal: boolean;
  /** Allow batch “select diagonal”. */
  has_select_diagonal: boolean;
}

/**
 * Events for {@link Indicators}.
 */
export interface IIndicatorsEvents extends IContainerEvents {
  indicatorClicked: (source: TreeNodeData, sink: TreeNodeData) => void;
  indicator_clicked: (source: TreeNodeData, sink: TreeNodeData) => void;
  scrollChanged: (scrollTop: number, scrollLeft: number) => void;
  scroll_changed: (scrollTop: number, scrollLeft: number) => void;
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
 * Indicators options that may be changed through user interaction.
 */
export interface IndicatorsInteractiveOptions
  extends ContainerInteractiveOptions {}

/**
 * Matrix of {@link Indicator} cells for connections between two virtual trees.
 */
export declare class Indicators<
  Options extends IIndicatorsOptions = IIndicatorsOptions,
  Events extends IIndicatorsEvents = IIndicatorsEvents,
  InteractiveOptions extends IndicatorsInteractiveOptions = IndicatorsInteractiveOptions
> extends Container<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** Scroller element holding indicators. Has class `.aux-scroller`. */
  _scroller: HTMLDivElement;
  /** Batch selection rectangle. Has class `.aux-batch`. */
  _batch: HTMLDivElement;
  /** Batch action buttons container. */
  buttons: Container;
  /** Disconnect-diagonal confirm button. */
  deselect_diagonal: ConfirmButton;
  /** Disconnect-all confirm button. */
  deselect_all: ConfirmButton;
  /** Connect-diagonal confirm button. */
  select_diagonal: ConfirmButton;
  /** Cancel batch selection button. */
  cancel: Button;

  /** Create an indicator from `options.indicator_class`. */
  createIndicator(): Indicator;

  /** Scroll vertically to `position` pixels. */
  scrollTopTo(position: number): void;
  /** Scroll horizontally to `position` pixels. */
  scrollLeftTo(position: number): void;
  /** Native `scrollTo` on the indicators element. */
  scrollTo(options: ScrollToOptions): void;
}
