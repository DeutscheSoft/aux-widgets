import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Range, IRangeOptions } from '../modules/range.js';

/**
 * Graph type options for drawing curves.
 */
export type IGraphType =
  | 'L'
  | 'T'
  | 'Q'
  | 'C'
  | 'S'
  | 'H1'
  | 'H2'
  | 'H3'
  | 'H4'
  | 'H5';

/**
 * Drawing mode for the graph.
 */
export type IGraphMode = 'line' | 'bottom' | 'top' | 'center' | 'base' | 'fill';

/**
 * Range type - can be a Range instance, a function returning Range, or options object for Range.
 */
export type IGraphRange = Range | (() => Range) | IRangeOptions;

/**
 * Dot object for 'L' or 'T' type graphs.
 */
export interface IGraphDotL {
  /** The x coordinate value. */
  x: number;
  /** The y coordinate value. */
  y: number;
  /** Optional type override for this specific dot. */
  type?: IGraphType;
}

/**
 * Dot object for 'Q' or 'S' type graphs.
 */
export interface IGraphDotQ {
  /** The x coordinate value. */
  x: number;
  /** The y coordinate value. */
  y: number;
  /** The x1 control point coordinate value. */
  x1: number;
  /** The y1 control point coordinate value. */
  y1: number;
  /** Optional type override for this specific dot. */
  type?: IGraphType;
}

/**
 * Dot object for 'C' type graphs.
 */
export interface IGraphDotC {
  /** The x coordinate value. */
  x: number;
  /** The y coordinate value. */
  y: number;
  /** The x1 control point coordinate value. */
  x1: number;
  /** The y1 control point coordinate value. */
  y1: number;
  /** The x2 control point coordinate value. */
  x2: number;
  /** The y2 control point coordinate value. */
  y2: number;
  /** Optional type override for this specific dot. */
  type?: IGraphType;
}

/**
 * Union type for all possible dot objects.
 */
export type IGraphDot = IGraphDotL | IGraphDotQ | IGraphDotC;

/**
 * Dots input type - can be a string (SVG path), array of dots, or a function returning one of these.
 */
export type IGraphDots =
  | string
  | IGraphDot[]
  | ((graph: Graph) => string | IGraphDot[]);

/**
 * Options specific to the Graph widget.
 * Extends Widget options.
 */
export interface IGraphOptions extends IWidgetOptions {
  /** Callback function returning a Range module for x axis or an object with options for a new Range. */
  range_x?: IGraphRange;
  /** Callback function returning a Range module for y axis or an object with options for a new Range. */
  range_y?: IGraphRange;
  /** The dots of the path. Can be a ready-to-use SVG-path-string or an array of objects. It may also be a function, in which case it is called with this graph widget as first and only argument. */
  dots: IGraphDots | null;
  /** Type of the graph. 'L': normal (needs x,y), 'T': smooth quadratic Bézier (needs x, y), 'H[n]': smooth horizontal, 'Q': quadratic Bézier (needs: x1, y1, x, y), 'C': CurveTo (needs: x1, y1, x2, y2, x, y), 'S': SmoothCurve (needs: x1, y1, x, y). */
  type: IGraphType;
  /** Drawing mode of the graph. 'line': line only, 'bottom': fill below the line, 'top': fill above the line, 'center': fill from the vertical center, 'base': fill from an arbitrary position (set with base), 'fill': close the curve using a Z directive. */
  mode: IGraphMode;
  /** If mode is 'base', set the position of the base line to fill from between 0 (bottom) and 1 (top). */
  base: number;
  /** Set the color of the path. Better use stroke and fill via CSS. */
  color: string;
  /** Show a description for this graph in the charts key, false to turn it off. */
  key: string | false;
}

/**
 * Events specific to the Graph widget.
 * Extends Widget events.
 */
export interface IGraphEvents extends IWidgetEvents {
  // Graph doesn't add any specific events beyond Widget events
}

/**
 * Graph is a single SVG path element. It provides
 * some functions to easily draw paths inside Charts and other
 * derivates.
 */
export declare class Graph<
  TOptions extends IGraphOptions = IGraphOptions,
  TEvents extends IGraphEvents = IGraphEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The SVG path element. Has class .aux-graph */
  element: SVGPathElement;
  /** The range for the x axis. */
  range_x: Range;
  /** The range for the y axis. */
  range_y: Range;

  /**
   * Moves the graph to the front, i.e. add as last element to the containing SVG group element.
   */
  toFront(): void;

  /**
   * Moves the graph to the back, i.e. add as first element to the containing SVG group element.
   */
  toBack(): void;
}
