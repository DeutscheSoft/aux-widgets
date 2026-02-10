import { Circular, ICircularOptions } from '../src/index.js';

// Valid Circular options (used by Knob/Gauge).
const circular: Partial<ICircularOptions> = {
  min: 0,
  max: 100,
  value: 50,
  size: 100,
  thickness: 10,
  start: 135,
  angle: 270,
  show_hand: true,
  show_dots: true,
  dots: [0, 25, 50, 75, 100],
  markers: [{ from: 75, to: 100 }],
  labels: [0, 50, 100],
};

const circularWidget = new Circular(circular);
new Circular({ value: 0, base: false });

// .set(key, value) API type-checking
circularWidget.set('value', 75);
// @ts-expect-error value for 'value' must be number
circularWidget.set('value', '75');

// .get(key) API type-checking
const _circularValue: number | undefined = circularWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
circularWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
circularWidget.on('set_value', (value: number) => {
  void value;
});
// @ts-expect-error 'not_an_event' is not a valid event name
circularWidget.on('not_an_event', () => {});

// Invalid value type should be rejected.
const badValue: Partial<ICircularOptions> = {
  min: 0,
  max: 100,
  // @ts-expect-error value must be a number
  value: '50',
};
