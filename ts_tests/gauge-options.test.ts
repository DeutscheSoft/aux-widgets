import { Gauge, IGaugeOptions } from '../src/index.js';

// Valid Gauge options (extends Circular).
const gauge: Partial<IGaugeOptions> = {
  min: 0,
  max: 100,
  value: 50,
  size: 100,
  width: 120,
  height: 120,
  label: 'Level',
};

const gaugeWithLabelConfig: Partial<IGaugeOptions> = {
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

// .on(event, handler) events API type-checking — event name and handler signature are typed
gaugeWidget.on('set_value', (value: number) => {
  void value;
});
// @ts-expect-error 'not_an_event' is not a valid event name
gaugeWidget.on('not_an_event', () => {});

// Invalid label type should be rejected.
const badLabel: Partial<IGaugeOptions> = {
  min: 0,
  max: 100,
  value: 50,
  // @ts-expect-error label must be string | IGaugeLabel
  label: 123,
};
