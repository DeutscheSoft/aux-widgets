import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Range } from '../modules/range.js';
import { DragCapture } from '../modules/dragcapture.js';

/**
 * Handle mode type for ChartHandle.
 */
export type IChartHandleMode =
  | 'circular'
  | 'line-vertical'
  | 'line-horizontal'
  | 'block-left'
  | 'block-right'
  | 'block-top'
  | 'block-bottom';

/**
 * Label position preference type for ChartHandle.
 */
export type IChartHandleLabelPosition =
  | 'top'
  | 'top-right'
  | 'right'
  | 'bottom-right'
  | 'bottom'
  | 'bottom-left'
  | 'left'
  | 'top-left'
  | 'center';

/**
 * Z-handle position type for ChartHandle.
 */
export type IChartHandleZHandlePosition =
  | 'top'
  | 'top-left'
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
export type IChartHandleRange = Range | (() => Range) | Record<string, unknown>;

/**
 * Intersection callback function signature.
 * @param x1 - Left coordinate of the bounding box.
 * @param y1 - Top coordinate of the bounding box.
 * @param x2 - Right coordinate of the bounding box.
 * @param y2 - Bottom coordinate of the bounding box.
 * @param id - Identifier for the element being checked.
 * @returns An object describing the amount of intersection.
 */
export interface IChartHandleIntersectResult {
  /** The amount of intersection. */
  intersect: number;
  /** The count of intersections. */
  count: number;
}

export type IChartHandleIntersectFunction = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  id?: unknown
) => IChartHandleIntersectResult;

/**
 * Label formatting function signature.
 * @param label - The label text.
 * @param x - The x coordinate value.
 * @param y - The y coordinate value.
 * @param z - The z coordinate value.
 * @returns The formatted label string.
 */
export type IChartHandleFormatLabelFunction = (
  label: string,
  x: number,
  y: number,
  z: number
) => string;

/**
 * Options specific to the ChartHandle widget.
 * Extends Widget options.
 */
export interface IChartHandleOptions extends IWidgetOptions {
  /** The name of the handle. */
  label?: string;
  /** Callback returning a Range for the x-axis or an object with options for a Range. This is usually the x_range of the parent chart. */
  range_x: IChartHandleRange;
  /** Callback returning a Range for the y-axis or an object with options for a Range. This is usually the y_range of the parent chart. */
  range_y: IChartHandleRange;
  /** Callback returning a Range for the z-axis or an object with options for a Range. */
  range_z: IChartHandleRange;
  /** Callback function for checking intersections. Returns a value describing the amount of intersection with other handle elements. */
  intersect: IChartHandleIntersectFunction;
  /** Type of the handle. */
  mode: IChartHandleMode;
  /** Possible label positions by order of preference. */
  preferences: IChartHandleLabelPosition[];
  /** Label formatting function. Arguments are label, x, y, z. If set to false, no label is displayed. */
  format_label: IChartHandleFormatLabelFunction | false;
  /** Value of the x-coordinate. */
  x: number;
  /** Value of the y-coordinate. */
  y: number;
  /** Value of the z-coordinate. */
  z: number;
  /** Minimum size of the handle in px. */
  min_size: number;
  /** Maximum size of the handle in px. */
  max_size: number;
  /** Margin in px between the handle and the label. */
  margin: number;
  /** If not false, a small handle is drawn at the given position, which can be dragged to change the value of the z-coordinate. */
  z_handle: IChartHandleZHandlePosition | false;
  /** Size in px of the z-handle. */
  z_handle_size: number;
  /** Size of the z-handle in center positions. If this option is between 0 and 1, it is interpreted as a ratio, otherwise as a px size. */
  z_handle_centered: number;
  /** Render the z-handle below the normal handle in the DOM. SVG doesn't know CSS attribute z-index, so this workaround is needed from time to time. */
  z_handle_below: boolean;
  /** Amount of pixels the handle has to be dragged before it starts to move. */
  min_drag: number;
  /** Minimum value of the x-coordinate. */
  x_min: number | false;
  /** Maximum value of the x-coordinate. */
  x_max: number | false;
  /** Minimum value of the y-coordinate. */
  y_min: number | false;
  /** Maximum value of the y-coordinate. */
  y_max: number | false;
  /** Minimum value of the z-coordinate. */
  z_min: number | false;
  /** Maximum value of the z-coordinate. */
  z_max: number | false;
  /** If set to true, additional lines are drawn at the coordinate values. */
  show_axis: boolean;
  /** Whether the handle is being hovered. */
  hover: boolean;
  /** Whether the handle is being dragged. */
  dragging: boolean;
  /** Whether to show the handle. */
  show_handle: boolean;
}

/**
 * Positions object for handle events.
 */
export interface IChartHandlePositions {
  /** The actual value on the x axis. */
  x: number;
  /** The actual value on the y axis. */
  y: number;
  /** The position in pixels on the x axis. */
  pos_x: number;
  /** The position in pixels on the y axis. */
  pos_y: number;
}

/**
 * Events specific to the ChartHandle widget.
 * Extends Widget events.
 */
export interface IChartHandleEvents extends IWidgetEvents {
  /** Fired when the user grabs the z-handle. The argument is the actual z value. */
  zchangestarted: (z: number) => void;
  /** Fired when the user releases the z-handle. The argument is the actual z value. */
  zchangeended: (z: number) => void;
  /** Fired when the main handle is grabbed by the user. */
  handlegrabbed: (positions: IChartHandlePositions) => void;
  /** Fired when the user releases the main handle. */
  handlereleased: (positions: IChartHandlePositions) => void;
  /** Fired when the mouse wheel is used. */
  wheel: (event: WheelEvent) => void | false;
  /** Native DOM mouseenter event. */
  mouseenter: () => void;
  /** Native DOM mouseleave event. */
  mouseleave: () => void;
}

/**
 * ChartHandle is a draggable SVG element, which can be used to represent and change
 * a value inside a FrequencyResponse and is drawn inside of a Chart.
 */
export declare class ChartHandle<
  TOptions extends IChartHandleOptions = IChartHandleOptions,
  TEvents extends IChartHandleEvents = IChartHandleEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main SVG group containing all handle elements. Has class .aux-charthandle */
  element: SVGGElement;
  /** The Range for the x axis. */
  range_x: Range;
  /** The Range for the y axis. */
  range_y: Range;
  /** The Range for the z axis. */
  range_z: Range;
  /** The label bounding box as [x1, y1, x2, y2]. */
  label: [number, number, number, number];
  /** The DragCapture instance for z-axis dragging. */
  z_drag: DragCapture;
  /** The DragCapture instance for position dragging. */
  pos_drag: DragCapture;

  /**
   * Get the handle position as [x1, y1, x2, y2].
   * @returns The handle position bounding box.
   */
  getHandlePosition(): [number, number, number, number];

  /**
   * Moves the handle to the front, i.e. add as last element to the containing SVG group element.
   */
  toFront(): void;

  /**
   * Moves the handle to the back, i.e. add as first element to the containing SVG group element.
   */
  toBack(): void;

  /**
   * Handle wheel events for changing the z value.
   * @param e - The wheel event.
   */
  onWheel(e: WheelEvent): void | boolean;
}
