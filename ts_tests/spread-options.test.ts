import { Spread, ISpreadOptions } from '../src/widgets/spread.js';

// Valid Spread options.
const spread: Partial<ISpreadOptions> = {
  min: 0,
  max: 100,
  lower: 25,
  upper: 75,
  layout: 'right',
  bind_dblclick: true,
  reset_lower: 0,
  reset_upper: 100,
  show_scale: true,
};

const spreadWidget = new Spread(spread);
new Spread({ lower: 10, upper: 90 });

// .set(key, value) API type-checking
spreadWidget.set('lower', 30);
// @ts-expect-error value for 'layout' must be 'left' | 'right' | 'top' | 'bottom'
spreadWidget.set('layout', 'center');

// .get(key) API type-checking
const _spreadLower: number | undefined = spreadWidget.get('lower');
// @ts-expect-error 'not_an_option_key' is not a valid option key
spreadWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
spreadWidget.on('set_lower', (value: number) => { void value; });
// @ts-expect-error 'not_an_event' is not a valid event name
spreadWidget.on('not_an_event', () => {});

// Invalid layout should be rejected.
const badLayout: Partial<ISpreadOptions> = {
  min: 0,
  max: 100,
  // @ts-expect-error layout must be 'left' | 'right' | 'top' | 'bottom'
  layout: 'center',
};
