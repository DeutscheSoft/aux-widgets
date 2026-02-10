import { ColorPicker, IColorPickerOptions } from '../src/widgets/colorpicker.js';

// Valid ColorPicker options.
const colorpicker: Partial<IColorPickerOptions> = {
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

// .get(key) API type-checking
const _colorpickerHue: number | undefined = colorpickerWidget.get('hue');
// @ts-expect-error 'not_an_option_key' is not a valid option key
colorpickerWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
colorpickerWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
colorpickerWidget.on('not_an_event', () => {});

// Invalid hue type should be rejected.
const badHue: Partial<IColorPickerOptions> = {
  // @ts-expect-error hue must be a number 0..1
  hue: '0',
};
