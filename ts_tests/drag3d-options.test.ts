import { Drag3D, IDrag3DOptions } from '../src/widgets/drag3d.js';

// Valid Drag3D options.
const drag3d: IDrag3DOptions = {
  x: 0,
  y: 0,
  z: 0,
  range_x: { min: 0, max: 100 },
  range_y: { min: 0, max: 100 },
  range_z: { min: 0, max: 100 },
};

new Drag3D(drag3d);
new Drag3D({ x: 0.5, content: '' });
