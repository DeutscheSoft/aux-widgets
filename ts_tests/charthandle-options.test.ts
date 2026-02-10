import { ChartHandle, IChartHandleOptions } from '../src/widgets/charthandle.js';

// Valid ChartHandle options.
const handle: IChartHandleOptions = {
  label: 'Handle',
  mode: 'line-vertical',
  x: 0.5,
  y: 0.5,
  z: 0,
  preferences: ['top', 'right'],
  show_axis: true,
  show_handle: true,
};

const charthandleWidget = new ChartHandle(handle);
new ChartHandle({ mode: 'circular', z_handle: 'center' });

// .set(key, value) API type-checking
charthandleWidget.set('x', 0.25);
// @ts-expect-error value for 'x' must be number
charthandleWidget.set('x', '0.25');

// Invalid mode should be rejected.
const badMode: IChartHandleOptions = {
  label: 'x',
  // @ts-expect-error mode must be a valid IChartHandleMode
  mode: 'diagonal',
};
