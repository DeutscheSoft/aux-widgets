import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ColorPicker } from './../widgets/colorpicker.js';

export const ColorPickerComponent = component_from_widget(ColorPicker);

define_component('colorpicker', ColorPickerComponent);
