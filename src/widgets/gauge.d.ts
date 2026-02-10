import { Widget, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Circular, ICircularOptions, ILabelAlign } from './circular.js';

/**
 * Gauge label configuration.
 */
export interface IGaugeLabel {
  /** Position inside the circle in degrees. */
  pos?: number;
  /** Margin of the label string. */
  margin?: number;
  /** Alignment of the label. */
  align?: ILabelAlign;
  /** Label string. */
  label?: string;
}

/**
 * Options specific to the Gauge widget.
 * Extends Circular options.
 */
export interface IGaugeOptions extends ICircularOptions {
  /** Width of the element. */
  width: number;
  /** Height of the SVG. */
  height: number;
  /** Optional gauge label or label configuration. */
  label: string | IGaugeLabel;
}

/**
 * Events specific to the Gauge widget.
 * Extends Widget events.
 */
export interface IGaugeEvents extends IWidgetEvents {
  /** Fired when the label changed. */
  labeldrawn: () => void;
}

/**
 * Gauge draws a single Circular into a SVG image.
 */
export declare class Gauge<
  TOptions extends IGaugeOptions = IGaugeOptions,
  TEvents extends IGaugeEvents = IGaugeEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-gauge */
  element: HTMLDivElement;
  /** The main SVG image. */
  svg: SVGSVGElement;
  /** The label text element. */
  _label: SVGTextElement;
  /** The Circular module. */
  circular: Circular;
}
