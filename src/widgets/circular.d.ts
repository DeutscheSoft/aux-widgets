import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { IRangedOptions } from '../utils/ranged.js';
import { IWarningOptions } from '../utils/warning.js';

/**
 * Label alignment options.
 */
export type ILabelAlign = 'inner' | 'outer';

/**
 * Hand dimensions for the circular widget.
 */
export interface IHandOptions {
  /** Width of the hand. */
  width?: number;
  /** Length of the hand. */
  length?: number;
  /** Margin of the hand. */
  margin?: number;
}

/**
 * Default options for dots.
 */
export interface IDotsDefaults {
  /** Width of the dots. */
  width?: number;
  /** Length of the dots. */
  length?: number;
  /** Margin of the dots. */
  margin?: number;
}

/**
 * Individual dot configuration.
 * Can be a number (position) or an object with position and optional styling.
 */
export interface IDot {
  /** Position in the value range. */
  pos: number;
  /** Optional color for the dot. */
  color?: string;
  /** Optional CSS class for the dot. */
  class?: string;
  /** Width of the dot (overrides dots_defaults). */
  width?: number;
  /** Length of the dot (overrides dots_defaults). */
  length?: number;
  /** Margin of the dot (overrides dots_defaults). */
  margin?: number;
}

/**
 * Default options for markers.
 */
export interface IMarkersDefaults {
  /** Thickness of the marker. */
  thickness?: number;
  /** Margin of the marker. */
  margin?: number;
}

/**
 * Individual marker configuration.
 */
export interface IMarker {
  /** Start position in the value range. */
  from?: number;
  /** End position in the value range. */
  to?: number;
  /** Optional color for the marker. */
  color?: string;
  /** Optional CSS class for the marker. */
  class?: string;
  /** Thickness of the marker (overrides markers_defaults). */
  thickness?: number;
  /** Margin of the marker (overrides markers_defaults). */
  margin?: number;
  /** If true, disable snapping for this marker. */
  nosnap?: boolean;
}

/**
 * Default options for labels.
 */
export interface ILabelsDefaults {
  /** Distance of the label from the circle. */
  margin?: number;
  /** Controls if labels are positioned inside or outside of the circle. */
  align?: ILabelAlign;
  /** Optional formatting function for the label. Receives the label value as first argument. */
  format?: (value: number) => string | number;
}

/**
 * Individual label configuration.
 * Can be a number (position) or an object with position and optional styling.
 */
export interface ILabel {
  /** Position in the value range. */
  pos: number;
  /** Optional label text. If not provided, the format function will be used. */
  label?: string;
  /** Optional color for the label. */
  color?: string;
  /** Optional CSS class for the label. */
  class?: string;
  /** Margin of the label (overrides labels_defaults). */
  margin?: number;
  /** Alignment of the label (overrides labels_defaults). */
  align?: ILabelAlign;
  /** Format function for the label (overrides labels_defaults). */
  format?: (value: number) => string | number;
}

/**
 * Options specific to the Circular widget.
 * Extends Widget, Ranged, and Warning options.
 */
export interface ICircularOptions extends IWidgetOptions, Omit<IRangedOptions, 'base'>, IWarningOptions {
  /** Sets the value on the hand and on the ring at the same time. */
  value: number;
  /** Sets the value on the hand. */
  value_hand: number;
  /** Sets the value on the ring. */
  value_ring: number;
  /** The diameter of the circle. This is the base value for all following layout-related parameters. Keeping it set to 100 offers percentual lengths. Set the final size of the widget via CSS. */
  size: number;
  /** The thickness of the circle. */
  thickness: number;
  /** The margin between base and value circles. */
  margin: number;
  /** Draw the hand. */
  show_hand: boolean;
  /** Dimensions of the hand. */
  hand: IHandOptions;
  /** The starting point in degrees. */
  start: number;
  /** The maximum degree of the rotation when value === max. */
  angle: number;
  /** If a base value is set in degrees, circular starts drawing elements from this position. Overrides IRangedOptions.base to allow boolean. */
  base: number | false;
  /** Draw the base ring. */
  show_base: boolean;
  /** Draw the value ring. */
  show_value: boolean;
  /** Horizontal displacement of the circle. */
  x: number;
  /** Vertical displacement of the circle. */
  y: number;
  /** Show/hide all dots. */
  show_dots: boolean;
  /** Default values for the individual dots specified in dots. */
  dots_defaults: IDotsDefaults;
  /** An array of objects or numbers describing where dots should be placed along the circle. If it is a number, it is equivalent to an object containing just pos. */
  dots: (IDot | number)[];
  /** Show/hide all markers. */
  show_markers: boolean;
  /** Default values for the individual markers specified in markers. */
  markers_defaults: IMarkersDefaults;
  /** An array containing objects which describe where markers are to be placed. */
  markers: IMarker[];
  /** Show/hide all labels. */
  show_labels: boolean;
  /** Default values for the individual labels specified in labels. */
  labels_defaults: ILabelsDefaults;
  /** An array containing objects or numbers which describe labels to be displayed. If it is a number, it is equivalent to an object containing just pos. */
  labels: (ILabel | number)[];
  /** Presets object for configuration presets. */
  presets?: Record<string, Partial<ICircularOptions>>;
  /** Name of the preset to use. */
  preset?: string;
  /** @internal Stroke width (computed internally) */
  _stroke_width: number;
  /** @internal Value coefficient for base (computed internally) */
  _coef_base?: number;
  /** @internal Value coefficient for ring (computed internally) */
  _coef_ring?: number;
  /** @internal Value coefficient for hand (computed internally) */
  _coef_hand?: number;
  /** @internal Processed dots (computed internally) */
  _dots?: IDot[];
  /** @internal Processed markers (computed internally) */
  _markers?: IMarker[];
  /** @internal Processed labels (computed internally) */
  _labels?: ILabel[];
}

/**
 * Events specific to the Circular widget.
 * Extends Widget events.
 */
export interface ICircularEvents extends IWidgetEvents {
  /** Fired when dots are (re)drawn. */
  dotsdrawn: () => void;
  /** Fired when labels are (re)drawn. */
  labelsdrawn: () => void;
  /** Fired when markers are (re)drawn. */
  markersdrawn: () => void;
}

/**
 * Circular is a SVG group element containing two paths for displaying
 * numerical values in a circular manner. Circular is able to draw labels,
 * dots and markers and can show a hand. Circular e.g. is implemented by
 * Clock to draw hours, minutes and seconds. Circular is based on Range.
 */
export declare class Circular<
  TOptions extends ICircularOptions = ICircularOptions,
  TEvents extends ICircularEvents = ICircularEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main SVG element. Has class .aux-circular */
  element: SVGElement;
  /** The base of the ring. Has class .aux-base */
  _base: SVGPathElement;
  /** The ring showing the value. Has class .aux-value */
  _value: SVGPathElement;
  /** The hand of the knob. Has class .aux-hand */
  _hand: SVGRectElement;
  /** A group containing all markers. Has class .aux-markers */
  _markers: SVGElement;
  /** A group containing all dots. Has class .aux-dots */
  _dots: SVGElement;
  /** A group containing all labels. Has class .aux-labels */
  _labels: SVGElement;

  /**
   * Gets the stroke width from the base and value elements.
   */
  getStroke(): number;
}
