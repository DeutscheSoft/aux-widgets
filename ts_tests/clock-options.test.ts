import { Clock, IClockOptions } from '../src/widgets/clock.js';

// Valid Clock options.
const clock: IClockOptions = {
  thickness: 5,
  margin: 2,
  size: 200,
  show_seconds: true,
  show_minutes: true,
  show_hours: true,
  timeout: 1000,
  fps: 24,
};

const clockWidget = new Clock(clock);
new Clock({ time: new Date(), label_scale: 0.8 });

// .set(key, value) API type-checking
clockWidget.set('size', 150);
// @ts-expect-error value for 'size' must be number
clockWidget.set('size', '150');

// .get(key) API type-checking
const _clockSize: number | undefined = clockWidget.get('size');
// @ts-expect-error 'not_an_option_key' is not a valid option key
clockWidget.get('not_an_option_key');

// Invalid size type should be rejected.
const badSize: IClockOptions = {
  // @ts-expect-error size must be a number
  size: '200',
};
