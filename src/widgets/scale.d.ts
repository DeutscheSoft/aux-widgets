import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { IRangedOptions } from '../utils/ranged.js';

/**
 * Scale layout options.
 */
export type IScaleLayout = 'left' | 'right' | 'top' | 'bottom';

/**
 * Interface for dots passed to the fixed_dots option of Scale.
 */
export interface IScaleDot {
  /** The value where the dot is located at. */
  value: number;
  /** An optional class for the generated div.aux-dot element. */
  class?: string | string[];
}

/**
 * Interface for labels passed to the fixed_labels option of Scale.
 */
export interface IScaleLabel {
  /** The value where the label is located at. */
  value: number;
  /** An optional class string for the generated span.aux-label element. */
  class?: string | string[];
  /** The label string. If omitted, the options.labels(value) is used. */
  label?: string;
}

/**
 * Options specific to the Scale widget.
 * Extends Widget and Ranged options.
 */
export interface IScaleOptions extends IWidgetOptions, Omit<IRangedOptions, 'base'> {
  /** The layout of the Scale. 'right' and 'left' are vertical layouts with the labels being drawn right and left of the scale, respectively. 'top' and 'bottom' are horizontal layouts for which the labels are drawn on top and below the scale, respectively. */
  layout?: IScaleLayout;
  /** Minimal step size of the markers. */
  division?: number;
  /** Array of steps for labels and markers. */
  levels?: number[];
  /** Array of steps for labels only. */
  levels_labels?: number[];
  /** Base of the scale. If set to false it will default to the minimum value. Overrides IRangedOptions.base to allow boolean. */
  base?: number | boolean;
  /** Formatting function for the labels. */
  labels?: (value: number) => string;
  /** Minimum gap in pixels between two adjacent markers. */
  gap_dots?: number;
  /** Minimum gap in pixels between two adjacent labels. */
  gap_labels?: number;
  /** If true, labels are drawn. */
  show_labels?: boolean;
  /** If true, display a label and a dot for the 'max' value. */
  show_max?: boolean;
  /** If true, display a label and a dot for the 'min' value. */
  show_min?: boolean;
  /** If true, display a label and a dot for the 'base' value. */
  show_base?: boolean;
  /** This option can be used to specify fixed positions for the markers to be drawn at. false disables fixed dots. */
  fixed_dots?: IScaleDot[] | number[] | false;
  /** This option can be used to specify fixed positions for the labels to be drawn at. false disables fixed labels. */
  fixed_labels?: IScaleLabel[] | number[] | false;
  /** If true, every dot which is located at the same position as a label has the .aux-marker class set. */
  show_markers?: boolean;
  /** The value to set the pointers position to. Set to false to hide the pointer. */
  pointer?: number | false;
  /** The value to set the bars height to. Set to false to hide the bar. */
  bar?: number | false;
  /** If true, avoid collisions between labels and dots. */
  avoid_collisions?: boolean;
  /** @internal Bar element (computed internally) */
  _bar?: HTMLDivElement;
  /** @internal Pointer element (computed internally) */
  _pointer?: HTMLDivElement;
}

/**
 * Events specific to the Scale widget.
 * Extends Widget events.
 */
export interface IScaleEvents extends IWidgetEvents {
  /** Gets fired when an option the rendering depends on was changed. */
  scalechanged: (key: string, value: unknown) => void;
}

/**
 * Scale can be used to draw scales. It is used in Meter and
 * Fader. Scale draws labels and markers based on its parameters
 * and the available space. Scales can be drawn both vertically and horizontally.
 * Scale mixes in Ranged and inherits all its options.
 */
export declare class Scale<
  TOptions extends IScaleOptions = IScaleOptions,
  TEvents extends IScaleEvents = IScaleEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV element. Has class .aux-scale */
  element: HTMLDivElement;
  /** The DIV element of the pointer. It can be used to e.g. visualize the value set in the backend. */
  _pointer?: HTMLDivElement;
  /** The DIV element of the bar. It can be used to e.g. visualize the value set in the backend or to draw a simple levelmeter. */
  _bar?: HTMLDivElement;
}
