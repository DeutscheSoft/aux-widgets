import { Value, IValueOptions } from '../src/widgets/value.js';

// Valid Value options based on examples.
const simpleValue: IValueOptions = {};

const formattedValue: IValueOptions = {
  format: (v) => `${v}dB`,
};

const readonlyValue: IValueOptions = {
  readonly: true,
};

const textValue: IValueOptions = {
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

// Invalid size type should be rejected.
const badSize: IValueOptions = {
  // @ts-expect-error size must be number | null
  size: '10',
};

// Invalid input type should be rejected.
const badType: IValueOptions = {
  // @ts-expect-error type must be 'text' | 'password'
  type: 'email',
};

