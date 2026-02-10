import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { IRangedOptions } from '../utils/ranged.js';
import { Label } from './label.js';
import { Scale } from './scale.js';

/**
 * Meter layout options.
 */
export type IMeterLayout = 'left' | 'right' | 'top' | 'bottom';

/**
 * Paint mode options.
 */
export type IPaintMode = 'value' | 'inverse';

/**
 * Gradient color stop definition.
 */
export interface IGradientColorStop {
  value: number;
  color: string;
}

/**
 * Gradient definition as an object with string keys.
 */
export type IGradientObject = Record<string, string>;

/**
 * Gradient fill style function signature.
 */
export type IGradientFunction = (
  ctx: CanvasRenderingContext2D,
  options: unknown,
  canvas: HTMLCanvasElement,
  width: number,
  height: number
) => void;

/**
 * Color or gradient definition for meter fill styles.
 * Can be a CSS color string, an array of color stops, an object with string keys, or a function.
 */
export type IMeterFillStyle =
  | string
  | false
  | IGradientColorStop[]
  | IGradientObject
  | IGradientFunction;

/**
 * Options specific to the Meter widget.
 * Extends Widget and Ranged options, and includes Scale widget options.
 */
export interface IMeterOptions extends IWidgetOptions, Omit<IRangedOptions, 'base'> {
  /** A string describing the layout of the meter. Possible values are 'left', 'right', 'top' and 'bottom'. */
  layout?: IMeterLayout;
  /** Segment size. Pixel positions of the meter level are rounded to multiples of this size. This can be used to give the level meter a LED effect and to reduce processor load. */
  segment?: number;
  /** Level value. */
  value?: number;
  /** The base value of the meter. If set to false, the base will coincide with the minimum value options.min. The meter level is drawn starting from the base to the value. Overrides IRangedOptions.base to allow boolean. */
  base?: number | boolean;
  /** Value to be displayed on the label. */
  value_label?: number;
  /** Function for formatting the label. */
  format_value?: (value: number) => string;
  /** If set to true a label is displayed. */
  show_label?: boolean;
  /** The title of the Meter. Set to false to hide it. */
  label?: string | false;
  /** Set to false to hide the scale. */
  show_scale?: boolean;
  /** Synchronize the value on the bar with the value label using format_value function. */
  sync_value?: boolean;
  /** Color or gradient definition to draw the overlay. Can be either a string containing a valid CSS color, an array containing objects like [{value: -60, color: 'green'}, {value: 0, color: '#ff8800'}], an object with numerical strings as keys, or a function receiving the canvas' context, the widget's options, the canvas element and width and height. */
  foreground?: IMeterFillStyle;
  /** Color or gradient definition to draw the backdrop. Can be either a string containing a valid CSS color, an array containing objects like [{value: -60, color: 'green'}, {value: 0, color: '#ff8800'}], an object with numerical strings as keys, or a function. */
  background?: IMeterFillStyle;
  /** Deprecated. Use background, instead. */
  gradient?: IMeterFillStyle | IGradientFunction;
  /** Either 'value' or 'inverse'. The meter value is drawn using two canvas elements. With paint_mode='inverse' the foreground canvas shows the inverse of the metering value. In this mode the foreground acts as a mask and the background element represents the current metering value. With paint_mode='value' the foreground canvas shows the value itself. In this mode the meter is represented by the foreground element. */
  paint_mode?: IPaintMode;
  /** @internal Canvas width (computed internally) */
  _width?: number;
  /** @internal Canvas height (computed internally) */
  _height?: number;
  /** @internal Background fill style (computed internally) */
  _background_fillstyle?: string | CanvasGradient | CanvasPattern;
  /** @internal Foreground fill style (computed internally) */
  _foreground_fillstyle?: string | CanvasGradient | CanvasPattern;
  /** @internal Draw context (computed internally) */
  _draw_context?: unknown;
}

/**
 * Events specific to the Meter widget.
 * Extends Widget events.
 */
export interface IMeterEvents extends IWidgetEvents {
  /** Fired when the scale was changed. */
  scalechanged: (key: string, value: unknown) => void;
}

/**
 * Meter is a base class to build different meters from, such as LevelMeter.
 * Meter contains a Scale widget and inherits all its options.
 *
 * Note that level meters with high update frequencies can be very demanding when it comes
 * to rendering performance. These performance requirements can be reduced by increasing the
 * segment size using the segment option. Using a segment, the different level
 * meter positions are reduced. This widget will take advantage of that by avoiding rendering those
 * changes to the meter level, which fall into the same segment.
 *
 * The meter is drawn as a mask above a background. The mask represents the
 * inactive part of the meter. This mask is drawn into a canvas. The
 * fillstyle of this mask is initialized from the background-color style
 * of the canvas element with class aux-mask. Note that using a background-color
 * value with opacity will lead to rendering artifacts in the meter. Instead, set
 * the opacity of the mask to the desired value.
 */
export declare class Meter<
  TOptions extends IMeterOptions = IMeterOptions,
  TEvents extends IMeterEvents = IMeterEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-meter */
  element: HTMLDivElement;
  /** The DIV element containing the masks and drawing the background. Has class .aux-bar */
  _bar: HTMLDivElement;
  /** The canvas element drawing the background. Has class .aux-backdrop */
  _backdrop: HTMLCanvasElement;
  /** The canvas element drawing the mask. Has class .aux-mask */
  _canvas: HTMLCanvasElement;
  /** The Scale of the meter. */
  scale: Scale;
  /** The Label displaying the title. Has class .aux-label */
  label: Label;
  /** The Label displaying the value. */
  value: Label;
}
