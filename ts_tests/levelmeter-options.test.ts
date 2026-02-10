import { LevelMeter, ILevelMeterOptions } from '../src/widgets/levelmeter.js';

// Valid LevelMeter options (extends Meter).
const levelMeter: ILevelMeterOptions = {
  min: -96,
  max: 24,
  value: 0,
  layout: 'right',
  show_clip: true,
  clipping: 0,
  auto_clip: 500,
  show_hold: true,
  hold_size: 2,
  auto_hold: 1000,
  falling: 12,
  falling_duration: 300,
};

const levelmeterWidget = new LevelMeter(levelMeter);
new LevelMeter({ value: -6, clip: true });

// .set(key, value) API type-checking
levelmeterWidget.set('value', -12);
// @ts-expect-error value for 'value' must be number
levelmeterWidget.set('value', '-12');

// .get(key) API type-checking
const _levelmeterValue: number | undefined = levelmeterWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
levelmeterWidget.get('not_an_option_key');

// Invalid clipping type should be rejected.
const badClipping: ILevelMeterOptions = {
  min: 0,
  max: 100,
  value: 50,
  // @ts-expect-error clipping must be a number
  clipping: '0',
};
