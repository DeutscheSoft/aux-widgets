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

new Chart(chart);
new Chart({ label: false });

// Invalid label_position should be rejected.
const badPos: IChartOptions = {
  label: 'x',
  // @ts-expect-error label_position must be a valid IChartLabelPosition
  label_position: 'middle',
};
