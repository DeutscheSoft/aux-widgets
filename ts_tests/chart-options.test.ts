import { Chart, IChartOptions } from '../src/index.js';

// Valid Chart options.
const chart: Partial<IChartOptions> = {
  label: 'Chart',
  label_position: 'top',
  range_x: { min: 0, max: 1 },
  range_y: { min: 0, max: 1 },
  show_handles: true,
  square: true,
};

const chartWidget = new Chart(chart);
new Chart({ label: false });

// .set(key, value) API type-checking
chartWidget.set('label', 'My Chart');
// @ts-expect-error value for 'label_position' must be IChartLabelPosition
chartWidget.set('label_position', 'middle');

// .get(key) API type-checking
const _chartLabel: string | false | undefined = chartWidget.get('label');
// @ts-expect-error 'not_an_option_key' is not a valid option key
chartWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
chartWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
chartWidget.on('not_an_event', () => {});

// Invalid label_position should be rejected.
const badPos: Partial<IChartOptions> = {
  label: 'x',
  // @ts-expect-error label_position must be a valid IChartLabelPosition
  label_position: 'middle',
};
