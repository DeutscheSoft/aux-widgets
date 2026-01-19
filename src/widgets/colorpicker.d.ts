import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { Value } from './value.js';
import { ValueKnob } from './valueknob.js';
import { Button } from './button.js';
import { Range } from '../modules/range.js';
import { DragValue } from '../modules/dragvalue.js';

/**
 * HSL color object.
 */
export interface IHSLColor {
  /** Hue value (0..1). */
  h: number;
  /** Saturation value (0..1). */
  s: number;
  /** Lightness value (0..1). */
  l: number;
}

/**
 * RGB color object.
 */
export interface IRGBColor {
  /** Red value (0..255). */
  r: number;
  /** Green value (0..255). */
  g: number;
  /** Blue value (0..255). */
  b: number;
}

/**
 * Color object containing all color representations.
 */
export interface IColorObject {
  /** RGB color object. */
  rgb: IRGBColor;
  /** HSL color object. */
  hsl: IHSLColor;
  /** HEX color string. */
  hex: string;
  /** Hue value (0..1). */
  hue: number;
  /** Saturation value (0..1). */
  saturation: number;
  /** Lightness value (0..1). */
  lightness: number;
  /** Red value (0..255). */
  red: number;
  /** Green value (0..255). */
  green: number;
  /** Blue value (0..255). */
  blue: number;
}

/**
 * Options specific to the ColorPicker widget.
 * Extends Container options.
 */
export interface IColorPickerOptions extends IContainerOptions {
  /** An object containing members h(ue), s(aturation) and l(ightness) as numerical values. */
  hsl?: IHSLColor;
  /** An object containing members r(ed), g(reen) and b(lue) as numerical values. */
  rgb?: IRGBColor;
  /** A HEX color value, either with or without leading #. */
  hex?: string;
  /** A numerical value 0..1 for the hue. */
  hue?: number;
  /** A numerical value 0..1 for the saturation. */
  saturation?: number;
  /** A numerical value 0..1 for the lightness. */
  lightness?: number;
  /** A numerical value 0..255 for the amount of red. */
  red?: number;
  /** A numerical value 0..255 for the amount of green. */
  green?: number;
  /** A numerical value 0..255 for the amount of blue. */
  blue?: number;
  /** Set to false to hide the ValueKnob for hue. */
  show_hue?: boolean;
  /** Set to false to hide the ValueKnob for saturation. */
  show_saturation?: boolean;
  /** Set to false to hide the ValueKnob for lightness. */
  show_lightness?: boolean;
  /** Set to false to hide the ValueKnob for red. */
  show_red?: boolean;
  /** Set to false to hide the ValueKnob for green. */
  show_green?: boolean;
  /** Set to false to hide the ValueKnob for blue. */
  show_blue?: boolean;
  /** Set to false to hide the Value for the HEX color. */
  show_hex?: boolean;
  /** Set to false to hide the Button to apply. */
  show_apply?: boolean;
  /** Set to false to hide the Button to cancel. */
  show_cancel?: boolean;
  /** Set to false to hide the color canvas. */
  show_canvas?: boolean;
  /** Set to false to hide the grayscale. */
  show_grayscale?: boolean;
  /** Set to false to hide the color indicator. */
  show_indicator?: boolean;
}

/**
 * Events specific to the ColorPicker widget.
 * Extends Container events.
 */
export interface IColorPickerEvents extends IContainerEvents {
  /** Fired whenever the cancel button gets clicked or ESC is hit on input. */
  cancel: () => void;
  /** Fired whenever the apply button gets clicked or return is hit on input. Arguments: colors - Object containing all color objects. */
  apply: (colors: IColorObject) => void;
}

/**
 * ColorPicker provides a collection of widgets to select a color in
 * RGB or HSL color space.
 */
export declare class ColorPicker<
  TOptions extends IColorPickerOptions = IColorPickerOptions,
  TEvents extends IColorPickerEvents = IColorPickerEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main DIV container. Has class .aux-colorpicker */
  element: HTMLDivElement;
  /** The color background. Has class .aux-canvas */
  _canvas: HTMLDivElement;
  /** The grayscale background. Has class .aux-grayscale */
  _grayscale: HTMLDivElement;
  /** The indicator element. Has class .aux-indicator */
  _indicator: HTMLDivElement;
  /** The Range for the x axis. */
  range_x: Range;
  /** The Range for the y axis. */
  range_y: Range;
  /** The DragValue for the x axis. */
  drag_x: DragValue;
  /** The DragValue for the y axis. */
  drag_y: DragValue;
  /** The Value for the HEX color. Has class .aux-hex */
  hex: Value;
  /** The ValueKnob for the hue. Has class .aux-hue */
  hue: ValueKnob;
  /** The ValueKnob for the saturation. Has class .aux-saturation */
  saturation: ValueKnob;
  /** The ValueKnob for the lightness. Has class .aux-lightness */
  lightness: ValueKnob;
  /** The ValueKnob for the red color. Has class .aux-red */
  red: ValueKnob;
  /** The ValueKnob for the green color. Has class .aux-green */
  green: ValueKnob;
  /** The ValueKnob for the blue color. Has class .aux-blue */
  blue: ValueKnob;
  /** The Button to apply. Has class .aux-apply */
  apply: Button;
  /** The Button to cancel. Has class .aux-cancel */
  cancel: Button;
}
