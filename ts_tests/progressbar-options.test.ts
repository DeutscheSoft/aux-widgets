import { ProgressBar, IProgressBarOptions } from '../src/index.js';

// Valid ProgressBar options (extends Meter).
const progressBar: Partial<IProgressBarOptions> = {
  min: 0,
  max: 100,
  value: 45,
  layout: 'top',
  show_scale: false,
  format_value: (v) => `${v}%`,
};

const progressbarWidget = new ProgressBar(progressBar);
new ProgressBar({ value: 75 });

// .set(key, value) API type-checking
progressbarWidget.set('value', 50);
// @ts-expect-error value for 'value' must be number
progressbarWidget.set('value', '50');

// .get(key) API type-checking
const _progressbarValue: number | undefined = progressbarWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
progressbarWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
progressbarWidget.on('set_value', (value: number) => {
  void value;
});
// @ts-expect-error 'not_an_event' is not a valid event name
progressbarWidget.on('not_an_event', () => {});

// Invalid value type should be rejected.
const badValue: Partial<IProgressBarOptions> = {
  min: 0,
  max: 100,
  // @ts-expect-error value must be a number
  value: '50',
};
