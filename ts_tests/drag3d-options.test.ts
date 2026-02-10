import { Drag3D, IDrag3DOptions } from '../src/index.js';

// Valid Drag3D options.
const drag3d: Partial<IDrag3DOptions> = {
  x: 0,
  y: 0,
  z: 0,
  range_x: { min: 0, max: 100 },
  range_y: { min: 0, max: 100 },
  range_z: { min: 0, max: 100 },
};

const drag3dWidget = new Drag3D(drag3d);
new Drag3D({ x: 0.5, content: '' });

// .set(key, value) API type-checking
drag3dWidget.set('x', 0.5);
// @ts-expect-error value for 'x' must be number
drag3dWidget.set('x', '0.5');

// .get(key) API type-checking
const _drag3dX: number | undefined = drag3dWidget.get('x');
// @ts-expect-error 'not_an_option_key' is not a valid option key
drag3dWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
drag3dWidget.on('set_x', (value: number) => {
  void value;
});
// @ts-expect-error 'not_an_event' is not a valid event name
drag3dWidget.on('not_an_event', () => {});
