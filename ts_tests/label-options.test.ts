import { Label, ILabelOptions } from '../src/index.js';

// Valid Label options.
const simpleLabel: Partial<ILabelOptions> = {
  label: 'Hello',
};

const withFormat: Partial<ILabelOptions> = {
  label: 'Count',
  format: (s) => s.toUpperCase(),
};

const labelWidget = new Label(simpleLabel);
new Label({ label: 'x', format: false });

// .set(key, value) API type-checking
labelWidget.set('label', 'Updated');
// @ts-expect-error value for 'label' must be string | false
labelWidget.set('label', 123);

// .get(key) API type-checking
const _labelLabel: string | false | undefined = labelWidget.get('label');
// @ts-expect-error 'not_an_option_key' is not a valid option key
labelWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
labelWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
labelWidget.on('not_an_event', () => {});

// Invalid format type should be rejected.
const badFormat: Partial<ILabelOptions> = {
  label: 'x',
  // @ts-expect-error format must be ((label: string) => string | number) | false
  format: 123,
};
