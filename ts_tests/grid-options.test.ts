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

new Grid(grid);
new Grid({ grid_x: [{ pos: 50, label: '50' }] });

// Invalid width type should be rejected.
const badWidth: IGridOptions = {
  // @ts-expect-error width must be a number
  width: '400',
};
