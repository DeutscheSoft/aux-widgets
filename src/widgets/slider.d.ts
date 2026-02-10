import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';
import { IRangedOptions } from '../utils/ranged.js';
import { DragValue, IDragDirection } from '../modules/dragvalue.js';
import { ScrollValue } from '../modules/scrollvalue.js';

/**
 * Alignment options for Slider frames.
 */
export type ISliderAlignment = 'horizontal' | 'vertical';

/**
 * Options specific to the Slider widget.
 * Extends Widget options with ranged options and DragValue options.
 */
export interface ISliderOptions extends IWidgetOptions, IRangedOptions {
  /** The current value. */
  value: number;
  /** The amount of frames contained in the background image. */
  frames: number;
  /** The direction of the frames in the image, next to ('horizontal') or among each other ('vertical'). */
  alignment: ISliderAlignment;
  /** The image containing all frames for the slider. Set to false to set the background image via external CSS. */
  image: string | false;
  /** Direction for changing the value. Can be 'polar', 'vertical' or 'horizontal'. */
  direction: IDragDirection;
  /** Defines the angle of the center of the positive value changes. 0 means straight upward. For instance, a value of 45 leads to increasing value when moving towards top and right. */
  rotation: number;
  /** If options.direction is 'polar', this is the angle of separation between positive and negative value changes. */
  blind_angle: number;
  /** Distance to drag between min and max in pixels. */
  basis: number;
  /** Reset to this value on double click. */
  reset?: number;
  /** @internal Width of the element (computed internally). */
  _width?: number;
  /** @internal Height of the element (computed internally). */
  _height?: number;
}

/**
 * Events specific to the Slider widget.
 * Extends Widget events.
 */
export interface ISliderEvents extends IWidgetEvents {}

/**
 * Slider is a Widget moving its background image according to its value.
 * It can be used to show strips of e.g. 3D-rendered faders or knobs.
 * Slider uses DragValue and ScrollValue for setting its value.
 * It inherits all options of DragValue and Ranged.
 */
export declare class Slider<
  TOptions extends ISliderOptions = ISliderOptions,
  TEvents extends ISliderEvents = ISliderEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-slider */
  element: HTMLDivElement;
  /** Instance of DragValue used for interaction. */
  drag: DragValue;
  /** Instance of ScrollValue used for interaction. */
  scroll: ScrollValue;

  /**
   * Get the elements that need to be resized.
   * @returns An array containing the main element.
   */
  getResizeElements(): HTMLElement[];

  /**
   * Resize the widget and update internal width/height values.
   */
  resize(): void;
}
