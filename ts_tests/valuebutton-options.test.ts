import { ValueButton, IValueButtonOptions } from '../src/index.js';

// Valid ValueButton options based on examples.
const horizontalValueButton: Partial<IValueButtonOptions> = {
  min: 0,
  max: 100,
  value: 50,
  base: 50,
  label: 'MyValueButton',
  icon: 'gear',
  layout: 'horizontal',
};

const verticalValueButton: Partial<IValueButtonOptions> = {
  min: 0,
  max: 100,
  value: 50,
  base: 50,
  label: 'MyValueButton',
  icon: 'gear',
  layout: 'vertical',
};

const valuebuttonWidget = new ValueButton(horizontalValueButton);
new ValueButton({
  value: 10,
  min: 0,
  max: 20,
});

// .set(key, value) API type-checking
valuebuttonWidget.set('value', 25);
// @ts-expect-error value for 'value' must be number
valuebuttonWidget.set('value', '25');

// .get(key) API type-checking
const _valuebuttonValue: number | undefined = valuebuttonWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
valuebuttonWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
valuebuttonWidget.on('set_value', (value: number) => {
  void value;
});
// @ts-expect-error 'not_an_event' is not a valid event name
valuebuttonWidget.on('not_an_event', () => {});

// Invalid value type should be rejected.
new ValueButton({
  min: 0,
  max: 100,
  // @ts-expect-error value must be a number
  value: 'not-a-number',
});

// Invalid drag direction should be rejected.
const badDirection: Partial<IValueButtonOptions> = {
  // @ts-expect-error direction must be 'polar' | 'vertical' | 'horizontal'
  direction: 'diagonal',
};
