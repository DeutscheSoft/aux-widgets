import { Dynamics, IDynamicsOptions } from '../src/widgets/dynamics.js';

// Valid Dynamics options (extends Chart).
const dynamics: IDynamicsOptions = {
  label: 'Dynamics',
  type: 'compressor',
  min: -48,
  max: 24,
};

const dynamicsWidget = new Dynamics(dynamics);
new Dynamics({ type: 'limiter' });

// .set(key, value) API type-checking
dynamicsWidget.set('type', 'limiter');
// @ts-expect-error value for 'type' must be IDynamicsType
dynamicsWidget.set('type', 'saturator');

// Invalid type should be rejected.
const badType: IDynamicsOptions = {
  label: 'x',
  // @ts-expect-error type must be 'compressor' | 'expander' | 'gate' | 'limiter' | false
  type: 'saturator',
};
