import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Range, IRangeOptions } from '../modules/range.js';
import { Graph, IGraphOptions } from './graph.js';
import { ChartHandle, IChartHandleOptions } from './charthandle.js';
import { Grid, IGridLine } from './grid.js';

/**
 * Label position for the Chart.
 */
export type IChartLabelPosition =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

/**
 * Range type - can be a Range instance, a function returning Range, or options object for Range.
 */
export type IChartRange = Range | (() => Range) | IRangeOptions;

/**
 * Options specific to the Chart widget.
 * Extends Widget options.
 */
export interface IChartOptions extends IWidgetOptions {
  /** A label for the Chart. Set to false to remove the label from the DOM. */
  label: string | false;
  /** Position of the label inside of the chart. */
  label_position: IChartLabelPosition;
  /** An array containing objects to draw the vertical grid lines. */
  grid_x: IGridLine[] | number[];
  /** An array containing objects to draw the horizontal grid lines. */
  grid_y: IGridLine[] | number[];
  /** Either a function returning a Range or an object containing options for a new Range for the x axis. */
  range_x: IChartRange;
  /** Either a function returning a Range or an object containing options for a new Range for the y axis. */
  range_y: IChartRange;
  /** Either a function returning a Range or an object containing options for a new Range for the z axis. */
  range_z: IChartRange;
  /** Multiplicator of square pixels on hit testing labels to gain importance. */
  importance_label: number;
  /** Multiplicator of square pixels on hit testing handles to gain importance. */
  importance_handle: number;
  /** Multiplicator of square pixels on hit testing borders to gain importance. */
  importance_border: number;
  /** An array of options for creating ChartHandle on init. */
  handles: IChartHandleOptions[];
  /** An array of options for creating Graph on init. */
  graphs: IGraphOptions[];
  /** Show or hide all handles. */
  show_handles: boolean;
  /** Keep the Chart as a square. */
  square: boolean;
  /** The depth of the z axis (basis of options.range_z). */
  depth?: number;
  /** @internal The computed width of the element. */
  _width?: number;
  /** @internal The computed height of the element. */
  _height?: number;
  /** @internal Whether the widget has been resized (computed internally). */
  resized: boolean;
  /** @deprecated Use CSS instead. */
  width?: number;
  /** @deprecated Use CSS instead. */
  height?: number;
}

/**
 * Intersection result object returned by Chart.intersect().
 */
export interface IChartIntersectResult {
  /** The amount of intersecting square pixels. */
  intersect: number;
  /** The amount of overlapping elements. */
  count: number;
}

/**
 * Events specific to the Chart widget.
 * Extends Widget events.
 */
export interface IChartEvents extends IWidgetEvents {
  /** Fired when a graph was added. Arguments are the graph and its position in the array. */
  graphadded: (graph: Graph) => void;
  /** Fired when a graph was removed. Arguments are the graph and its position in the array. */
  graphremoved: (graph: Graph) => void;
  /** Fired when a new handle was added. */
  handleadded: (handle: ChartHandle) => void;
  /** Fired when a handle was removed. */
  handleremoved: (handle: ChartHandle) => void;
  /** Fired when all graphs or all handles are removed. */
  emptied: () => void;
}

/**
 * Chart is an SVG image containing one or more Graphs. Chart
 * extends Widget and contains a Grid and two Ranges.
 */
export declare class Chart<
  TOptions extends IChartOptions = IChartOptions,
  TEvents extends IChartEvents = IChartEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-chart */
  element: HTMLDivElement;
  /** The SVG element containing all chart elements. */
  svg: SVGSVGElement;
  /** The Range for the x axis. */
  range_x: Range;
  /** The Range for the y axis. */
  range_y: Range;
  /** The Range for the z axis. */
  range_z: Range;
  /** The SVG group containing all graphs. Has class .aux-graphs */
  _graphs: SVGGElement;
  /** The SVG group containing all handles. Has class .aux-handles */
  _handles: SVGGElement;
  /** The label of the chart. Has class .aux-label */
  _label: SVGTextElement | null;
  /** The grid element of the chart. Has class .aux-grid */
  grid: Grid;
  /** An array containing all ChartHandle instances. */
  handles: ChartHandle[];

  /**
   * Get all Graph instances.
   * @returns An array of Graph instances.
   */
  getGraphs(): Graph[];

  /**
   * Get all ChartHandle instances.
   * @returns An array of ChartHandle instances.
   */
  getHandles(): ChartHandle[];

  /**
   * Add a graph to the chart.
   * @param options - The graph to add. This can be either an instance of Graph or an object of options to Graph.
   * @returns The instance of Graph.
   * @emits Chart#graphadded
   */
  addGraph(options: Graph | IGraphOptions): Graph;

  /**
   * Add multiple new Graph to the widget. Options is an array of objects containing options for the new instances of Graph.
   * @param graphs - An array of options objects for the Graph.
   */
  addGraphs(graphs: IGraphOptions[]): void;

  /**
   * Remove a graph from the chart.
   * @param graph - The Graph to remove.
   * @emits Chart#graphremoved
   */
  removeGraph(graph: Graph): void;

  /**
   * Remove all graphs from the chart.
   * @emits Chart#emptied
   */
  empty(): void;

  /**
   * Add a new handle to the widget. Options is an object containing options for the ChartHandle.
   * @param options - An object containing initial options for the ChartHandle, or an instance of ChartHandle.
   * @param type - A widget class to be used as the new handle (defaults to ChartHandle).
   * @returns The instance of ChartHandle.
   * @emits Chart#handleadded
   */
  addHandle(options: ChartHandle | IChartHandleOptions, type?: typeof ChartHandle): ChartHandle;

  /**
   * Add multiple new ChartHandle to the widget. Options is an array of objects containing options for the new instances of ChartHandle.
   * @param handles - An array of options objects for the ChartHandle.
   * @param type - A widget class to be used for the new handles (defaults to ChartHandle).
   */
  addHandles(handles: IChartHandleOptions[], type?: typeof ChartHandle): void;

  /**
   * Remove a handle from the widget.
   * @param handle - The ChartHandle to remove.
   * @emits Chart#handleremoved
   */
  removeHandle(handle: ChartHandle): void;

  /**
   * Remove multiple or all ChartHandle from the widget.
   * @param handles - An array of ChartHandle instances. If the argument is false or undefined, all handles are removed from the widget.
   */
  removeHandles(handles?: ChartHandle[] | false): void;

  /**
   * @internal
   * Calculate intersection with other handles and borders.
   * @param X - An array representing the bounding box [x1, y1, x2, y2].
   * @param handle - The handle to exclude from intersection calculation.
   * @returns An object containing intersect (the amount of intersecting square pixels) and count (the amount of overlapping elements).
   */
  intersect(X: [number, number, number, number], handle?: ChartHandle): IChartIntersectResult;
}
