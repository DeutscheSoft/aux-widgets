import { PhaseMeter, IPhaseMeterOptions } from '../src/index.js';

// PhaseMeter extends LevelMeter options (same shape, different defaults).
const phaseMeter: Partial<IPhaseMeterOptions> = {
  min: -1,
  max: 1,
  base: 0,
  value: 0,
  layout: 'top',
  show_clip: false,
};

const phasemeterWidget = new PhaseMeter(phaseMeter);
new PhaseMeter({ value: 0.5 });

// .set(key, value) API type-checking
phasemeterWidget.set('value', 0.5);
// @ts-expect-error value for 'value' must be number
phasemeterWidget.set('value', '0.5');

// .get(key) API type-checking
const _phasemeterValue: number | undefined = phasemeterWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
phasemeterWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
phasemeterWidget.on('set_value', (value: number) => {
  void value;
});
// @ts-expect-error 'not_an_event' is not a valid event name
phasemeterWidget.on('not_an_event', () => {});
