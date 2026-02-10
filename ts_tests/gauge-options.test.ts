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

const gaugeWidget = new Gauge(gauge);
new Gauge({ value: 75 });

// .set(key, value) API type-checking
gaugeWidget.set('value', 75);
// @ts-expect-error value for 'value' must be number
gaugeWidget.set('value', '75');

// .get(key) API type-checking
const _gaugeValue: number | undefined = gaugeWidget.get('value');
// @ts-expect-error 'not_an_option_key' is not a valid option key
gaugeWidget.get('not_an_option_key');

// Invalid label type should be rejected.
const badLabel: IGaugeOptions = {
  min: 0,
  max: 100,
  value: 50,
  // @ts-expect-error label must be string | IGaugeLabel
  label: 123,
};
