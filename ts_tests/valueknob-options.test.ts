import { ValueKnob, IValueKnobOptions } from '../src/widgets/valueknob.js';

// Valid ValueKnob options should typecheck.
const valueKnobOptions: IValueKnobOptions = {
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

// Partial options via constructor are allowed.
new ValueKnob({
  label: false,
  show_knob: false,
});

// Invalid layout should be rejected.
const badLayout: IValueKnobOptions = {
  // @ts-expect-error layout must be 'vertical' | 'horizontal' | 'left' | 'right'
  layout: 'center',
};

// Invalid value type should be rejected.
new ValueKnob({
  // @ts-expect-error value must be a number
  value: 'not-a-number',
});

