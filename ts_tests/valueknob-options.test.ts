import { ValueKnob, IValueKnobOptions } from '../src/index.js';

// Valid ValueKnob options should typecheck.
const valueKnobOptions: Partial<IValueKnobOptions> = {
  layout: 'vertical',
  label: 'Gain',
  show_value: true,
  show_knob: true,
  value: 0,
};

const valueKnob = new ValueKnob(valueKnobOptions);

// .set(key, value) API type-checking
valueKnob.set('value', 0.5);
// @ts-expect-error value for 'value' must be number
valueKnob.set('value', '0.5');

// .get(key) API type-checking
const _valueknobValue: number | undefined = valueKnob.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
valueKnob.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
valueKnob.on('set_value', (value: number) => {
  void value;
});
// @ts-expect-error 'not_an_event' is not a valid event name
valueKnob.on('not_an_event', () => {});

// Partial options via constructor are allowed.
new ValueKnob({
  label: false,
  show_knob: false,
});

// Invalid layout should be rejected.
const badLayout: Partial<IValueKnobOptions> = {
  // @ts-expect-error layout must be 'vertical' | 'horizontal' | 'left' | 'right'
  layout: 'center',
};

// Invalid value type should be rejected.
new ValueKnob({
  // @ts-expect-error value must be a number
  value: 'not-a-number',
});
