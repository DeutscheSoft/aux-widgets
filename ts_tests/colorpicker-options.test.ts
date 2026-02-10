import { ColorPicker, IColorPickerOptions } from '../src/widgets/colorpicker.js';

// Valid ColorPicker options.
const colorpicker: IColorPickerOptions = {
  hex: '#ff0000',
  hue: 0,
  saturation: 1,
  lightness: 0.5,
  show_hex: true,
};

const colorpickerWidget = new ColorPicker(colorpicker);
new ColorPicker({ rgb: { r: 255, g: 0, b: 0 } });

// .set(key, value) API type-checking
colorpickerWidget.set('hue', 0.5);
// @ts-expect-error value for 'hue' must be number
colorpickerWidget.set('hue', '0.5');

// Invalid hue type should be rejected.
const badHue: IColorPickerOptions = {
  // @ts-expect-error hue must be a number 0..1
  hue: '0',
};
