import { component_from_widget } from './../component_helpers.mjs';
import { ColorPicker } from './../widgets/colorpicker.mjs';

export const ColorPickerComponent = component_from_widget(ColorPicker);

customElements.define('tk-colorpicker', ColorPickerComponent);
