import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { Circular } from './circular.js';

/**
 * Label formatting function signature.
 * @param date - The Date object.
 * @param fps - The framerate.
 * @param months - Array of month names.
 * @param days - Array of day names.
 * @returns The formatted label string.
 */
export type IClockLabelFunction = (date: Date, fps: number, months: string[], days: string[]) => string;

/**
 * Options specific to the Clock widget.
 * Extends Widget options.
 */
export interface IClockOptions extends IWidgetOptions {
  /** Thickness of the rings in percent of the maximum dimension. */
  thickness: number;
  /** Margin between the Circular widgets in percent of the maximum dimension. */
  margin: number;
  /** Width and height of the widget. */
  size: number;
  /** Show seconds ring. */
  show_seconds: boolean;
  /** Show minutes ring. */
  show_minutes: boolean;
  /** Show hours ring. */
  show_hours: boolean;
  /** The timeout of the redraw trigger. */
  timeout: number;
  /** Set additional milliseconds to add to the timeout target system clock regularly. */
  timeadd: number;
  /** If a timeout is set, offset the system time in milliseconds. */
  offset: number;
  /** Framerate for calculating SMTP frames. */
  fps: number;
  /** Array containing all month names. */
  months: string[];
  /** Array containing all day names. */
  days: string[];
  /** Callback to format the main label. */
  label: IClockLabelFunction;
  /** Callback to format the upper label. */
  label_upper: IClockLabelFunction;
  /** Callback to format the lower label. */
  label_lower: IClockLabelFunction;
  /** The scale of label_upper and label_lower compared to the main label. */
  label_scale: number;
  /** Margin between the rings and the main label in percent of the overall size. */
  label_margin: number;
  /** Position of the upper label as fraction of the overall height. */
  label_upper_pos: number;
  /** Position of the lower label as fraction of the overall height. */
  label_lower_pos: number;
  /** Set a specific time and date. To avoid auto-updates, set timeout to 0. Can be a Date, string, or number. */
  time?: Date | string | number;
  /** @internal Computed margin (computed internally). */
  _margin?: number;
}

/**
 * Events specific to the Clock widget.
 * Extends Widget events.
 */
export interface IClockEvents extends IWidgetEvents {
  /** Fired when the time was drawn. Arguments: time - The Date which was drawn. */
  timedrawn: (time: Date) => void;
}

/**
 * Object containing the Circular widgets for seconds, minutes, and hours.
 */
export interface IClockCirculars {
  /** The Circular widget for seconds. */
  seconds: Circular;
  /** The Circular widget for minutes. */
  minutes: Circular;
  /** The Circular widget for hours. */
  hours: Circular;
}

/**
 * Clock shows a customized clock with circulars displaying hours, minutes
 * and seconds. It additionally offers three freely formattable labels.
 */
export declare class Clock<
  TOptions extends IClockOptions = IClockOptions,
  TEvents extends IClockEvents = IClockEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV element. Has class .aux-clock */
  element: HTMLDivElement;
  /** The main SVG image. */
  svg: SVGElement;
  /** An object holding all three Circular as members seconds, minutes and hours. */
  circulars: IClockCirculars;
  /** The center label showing the time. Has class .aux-label */
  _label: SVGTextElement;
  /** The upper label showing the day. Has class .aux-upperlabel */
  _label_upper: SVGTextElement;
  /** The lower label showing the date. Has class .aux-lowerlabel */
  _label_lower: SVGTextElement;
}
