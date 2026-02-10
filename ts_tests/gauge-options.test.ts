import { Gauge, IGaugeOptions } from '../src/widgets/gauge.js';

// Valid Gauge options (extends Circular).
const gauge: IGaugeOptions = {
  min: 0,
  max: 100,
  value: 50,
  size: 100,
  width: 120,
  height: 120,
  label: 'Level',
};

const gaugeWithLabelConfig: IGaugeOptions = {
  min: 0,
  max: 360,
  value: 180,
  label: { pos: 0, margin: 10, align: 'inner', label: '°' },
};

new Gauge(gauge);
new Gauge({ value: 75 });

// Invalid label type should be rejected.
const badLabel: IGaugeOptions = {
  min: 0,
  max: 100,
  value: 50,
  // @ts-expect-error label must be string | IGaugeLabel
  label: 123,
};
