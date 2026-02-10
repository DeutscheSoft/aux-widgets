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

new Clock(clock);
new Clock({ time: new Date(), label_scale: 0.8 });

// Invalid size type should be rejected.
const badSize: IClockOptions = {
  // @ts-expect-error size must be a number
  size: '200',
};
