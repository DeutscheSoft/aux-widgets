import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { ColorPicker } from './../widgets/colorpicker.js';

/**
 * WebComponent for the ColorPicker widget. Available in the DOM as
 * `aux-colorpicker`.
 *
 * @class ColorPickerComponent
 * @implements Component
 */
export const ColorPickerComponent = component_from_widget(ColorPicker);

define_component('colorpicker', ColorPickerComponent);
