import { Grid, IGridOptions } from '../src/widgets/grid.js';

// Valid Grid options.
const grid: IGridOptions = {
  grid_x: [0, 0.5, 1],
  grid_y: [0, 0.5, 1],
  range_x: { min: 0, max: 100 },
  range_y: { min: 0, max: 100 },
  width: 400,
  height: 300,
};

const gridWidget = new Grid(grid);
new Grid({ grid_x: [{ pos: 50, label: '50' }] });

// .set(key, value) API type-checking
gridWidget.set('width', 500);
// @ts-expect-error value for 'width' must be number
gridWidget.set('width', '500');

// .get(key) API type-checking
const _gridWidth: number | undefined = gridWidget.get('width');
// @ts-expect-error 'not_an_option_key' is not a valid option key
gridWidget.get('not_an_option_key');

// Invalid width type should be rejected.
const badWidth: IGridOptions = {
  // @ts-expect-error width must be a number
  width: '400',
};
