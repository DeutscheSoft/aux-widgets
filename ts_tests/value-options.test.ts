import { Value, IValueOptions } from '../src/index.js';

// Valid Value options based on examples.
const simpleValue: Partial<IValueOptions> = {};

const formattedValue: Partial<IValueOptions> = {
  format: (v) => `${v}dB`,
};

const readonlyValue: Partial<IValueOptions> = {
  readonly: true,
};

const textValue: Partial<IValueOptions> = {
  placeholder: 'foobar',
  size: 10,
  auto_select: true,
  format: (v) => `${v}`,
  set: (val) => val,
  value: '',
};

// Constructor should accept partial options.
const valueWidget = new Value({
  value: 42,
  type: 'text',
  editmode: 'onenter',
});

// .set(key, value) API type-checking
valueWidget.set('value', 100);
// @ts-expect-error value for 'type' must be 'text' | 'password'
valueWidget.set('type', 'email');

// .get(key) API type-checking
const _valueValue: string | number | undefined = valueWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
valueWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
valueWidget.on('set_value', (value: string | number) => { void value; });
// @ts-expect-error 'not_an_event' is not a valid event name
valueWidget.on('not_an_event', () => {});

// Invalid size type should be rejected.
const badSize: Partial<IValueOptions> = {
  // @ts-expect-error size must be number | null
  size: '10',
};

// Invalid input type should be rejected.
const badType: Partial<IValueOptions> = {
  // @ts-expect-error type must be 'text' | 'password'
  type: 'email',
};

