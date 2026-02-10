import { EqBand, IEqBandOptions } from '../src/widgets/eqband.js';

// Valid EqBand options (extends ChartHandle).
const eqband: IEqBandOptions = {
  label: 'Band',
  mode: 'line-vertical',
  x: 1000,
  y: 0,
  z: 1,
  type: 'parametric',
  freq: 1000,
  gain: 0,
  q: 1,
  active: true,
};

const eqbandWidget = new EqBand(eqband);
new EqBand({ gain: -6, active: false });

// .set(key, value) API type-checking
eqbandWidget.set('gain', -3);
// @ts-expect-error value for 'gain' must be number
eqbandWidget.set('gain', '-3');

// Invalid gain type should be rejected.
const badEqband: IEqBandOptions = {
  // @ts-expect-error gain must be a number
  gain: '-6',
};
