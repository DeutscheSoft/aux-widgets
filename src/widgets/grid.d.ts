import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Range, IRangeOptions } from '../modules/range.js';

/**
 * Range type - can be a Range instance, a function returning Range, or options object for Range.
 */
export type IGridRange = Range | (() => Range) | IRangeOptions;

/**
 * Grid line object for grid_x arrays (vertical grid lines).
 */
export interface IGridLineX {
  /** The value where to draw grid line and corresponding label. */
  pos?: number;
  /** A valid CSS color string to colorize the elements. */
  color?: string;
  /** A class name for the elements. */
  class?: string;
  /** A label string. */
  label?: string;
  /** Start this line at this value's position instead of 0. */
  y_min?: number;
  /** End this line at this value's position instead of maximum height. */
  y_max?: number;
}

/**
 * Grid line object for grid_y arrays (horizontal grid lines).
 */
export interface IGridLineY {
  /** The value where to draw grid line and corresponding label. */
  pos?: number;
  /** A valid CSS color string to colorize the elements. */
  color?: string;
  /** A class name for the elements. */
  class?: string;
  /** A label string. */
  label?: string;
  /** Start this line at this value's position instead of 0. */
  x_min?: number;
  /** End this line at this value's position instead of maximum width. */
  x_max?: number;
}

/**
 * Union type for grid line objects (used in Chart for simplified grid lines).
 */
export type IGridLine = IGridLineX | IGridLineY;

/**
 * Options specific to the Grid widget.
 * Extends Widget options.
 */
export interface IGridOptions extends IWidgetOptions {
  /** Array for vertical grid lines containing either numbers or objects. */
  grid_x?: IGridLineX[] | number[];
  /** Array for horizontal grid lines containing either numbers or objects. */
  grid_y?: IGridLineY[] | number[];
  /** A function returning a Range instance for vertical grid lines or an object containing options for a new Range. */
  range_x?: IGridRange;
  /** A function returning a Range instance for horizontal grid lines or an object containing options for a new Range. */
  range_y?: IGridRange;
  /** Width of the grid. */
  width?: number;
  /** Height of the grid. */
  height?: number;
  /** Value to start horizontal lines at this position instead of 0. */
  x_min?: number | false;
  /** Value to end horizontal lines at this position instead of maximum width. */
  x_max?: number | false;
  /** Value to start vertical lines at this position instead of 0. */
  y_min?: number | false;
  /** Value to end vertical lines at this position instead of maximum height. */
  y_max?: number | false;
}

/**
 * Events specific to the Grid widget.
 * Extends Widget events.
 */
export interface IGridEvents extends IWidgetEvents {
  // Grid doesn't add any specific events beyond Widget events
}

/**
 * Grid creates a couple of lines and labels in a SVG
 * image on the x and y axis. It is used in e.g. Graph and
 * FrequencyResponse to draw markers and values. Grid needs a
 * parent SVG image do draw into. The base element of a Grid is a
 * SVG group containing all the labels and lines.
 */
export declare class Grid<
  TOptions extends IGridOptions = IGridOptions,
  TEvents extends IGridEvents = IGridEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main SVG group containing all grid elements. Has class .aux-grid */
  element: SVGGElement;
  /** The range for the x axis. */
  range_x: Range;
  /** The range for the y axis. */
  range_y: Range;
}
