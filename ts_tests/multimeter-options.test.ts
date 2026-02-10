import { MultiMeter, IMultiMeterOptions } from '../src/index.js';

// Valid MultiMeter options (extends Container, levelmeter options as arrays/singles).
const multimeter: Partial<IMultiMeterOptions> = {
  preset: 'stereo',
  layout: 'right',
};

const multimeterWidget = new MultiMeter(multimeter);
new MultiMeter({ preset: 'mono' });

// .set(key, value) API type-checking
multimeterWidget.set('preset', 'mono');
// @ts-expect-error value for 'preset' must be IMultiMeterPresetName
multimeterWidget.set('preset', 'quad');

// .get(key) API type-checking
const _multimeterPreset: string | undefined = multimeterWidget.get('preset');
// @ts-expect-error 'not_an_option_key' is not a valid option key
multimeterWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
multimeterWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
multimeterWidget.on('not_an_event', () => {});

// Invalid preset should be rejected.
const badPreset: Partial<IMultiMeterOptions> = {
  // @ts-expect-error preset must be a valid IMultiMeterPresetName
  preset: 'quad',
};
