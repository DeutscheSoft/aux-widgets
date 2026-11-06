import type {
  Button,
  IButtonOptions,
  IButtonEvents,
  ButtonInteractiveOptions,
} from '../../widgets/button.js';
import type { TreeNodeData } from '../models/treenode.js';
import type { ConnectionData } from '../models/connection.js';
import type { ConnectionDataView } from '../models/connectiondataview.js';

/**
 * Connection payload shown by an indicator: a single connection, a set of
 * connections (group cells), or none.
 */
export type IndicatorConnection =
  | ConnectionData
  | Set<ConnectionData>
  | null
  | undefined;

/**
 * Options for {@link Indicator}.
 */
export interface IIndicatorOptions extends IButtonOptions {
  /** Sink and source represented by this indicator are connected. */
  connected: boolean;
  /** Sink and source can be connected (neither is a group). */
  connectable: boolean;
  /** The source is a group header. */
  sourceisgroup: boolean;
  /** The sink is a group header. */
  sinkisgroup: boolean;
  /** Either source or sink is a group header. */
  isgroup: boolean;
}

/**
 * Events for {@link Indicator}.
 */
export interface IIndicatorEvents extends IButtonEvents {}

/**
 * Indicator options that may be changed through user interaction.
 */
export interface IndicatorInteractiveOptions extends ButtonInteractiveOptions {}

/**
 * Button inside {@link Indicators} for one matrix cell. Connection state is
 * reflected as CSS classes on the element.
 */
export declare class Indicator<
  Options extends IIndicatorOptions = IIndicatorOptions,
  Events extends IIndicatorEvents = IIndicatorEvents,
  InteractiveOptions extends IndicatorInteractiveOptions = IndicatorInteractiveOptions
> extends Button<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  /** Source node for this cell, or `null` when empty. */
  source: TreeNodeData | null;
  /** Sink node for this cell, or `null` when empty. */
  sink: TreeNodeData | null;
  /** Connection(s) for this cell. */
  connection: IndicatorConnection;

  /**
   * Update this indicator from connection-view data.
   */
  updateData(
    index1: number,
    index2: number,
    connection: IndicatorConnection,
    source: TreeNodeData | null | undefined,
    sink: TreeNodeData | null | undefined,
    connectionView?: ConnectionDataView
  ): void;
}
