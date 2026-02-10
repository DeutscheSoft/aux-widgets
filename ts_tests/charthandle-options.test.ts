import { ChartHandle, IChartHandleOptions } from '../src/widgets/charthandle.js';

// Valid ChartHandle options.
const handle: Partial<IChartHandleOptions> = {
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

// .get(key) API type-checking
const _charthandleX: number | undefined = charthandleWidget.get('x');
// @ts-expect-error 'not_an_option_key' is not a valid option key
charthandleWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
charthandleWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
charthandleWidget.on('not_an_event', () => {});

// Invalid mode should be rejected.
const badMode: Partial<IChartHandleOptions> = {
  label: 'x',
  // @ts-expect-error mode must be a valid IChartHandleMode
  mode: 'diagonal',
};
