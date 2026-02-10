import { Chart, IChartOptions } from '../src/widgets/chart.js';

// Valid Chart options.
const chart: IChartOptions = {
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

// Invalid label_position should be rejected.
const badPos: IChartOptions = {
  label: 'x',
  // @ts-expect-error label_position must be a valid IChartLabelPosition
  label_position: 'middle',
};
