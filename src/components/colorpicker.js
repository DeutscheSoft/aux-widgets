import { component_from_widget } from './../component_helpers.js';
import { ColorPicker } from './../widgets/colorpicker.js';

export const ColorPickerComponent = component_from_widget(ColorPicker);

customElements.define('tk-colorpicker', ColorPickerComponent);
