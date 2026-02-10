import { PhaseMeter, IPhaseMeterOptions } from '../src/widgets/phasemeter.js';

// PhaseMeter extends LevelMeter options (same shape, different defaults).
const phaseMeter: IPhaseMeterOptions = {
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
