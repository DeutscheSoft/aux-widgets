import { Graph, IGraphOptions } from '../src/widgets/graph.js';

// Valid Graph options.
const graph: IGraphOptions = {
  range_x: { min: 0, max: 100 },
  range_y: { min: 0, max: 1 },
  type: 'L',
  mode: 'line',
  dots: [{ x: 0, y: 0 }, { x: 100, y: 1 }],
};

const graphWidget = new Graph(graph);
new Graph({ mode: 'fill', base: 0.5 });

// .set(key, value) API type-checking
graphWidget.set('mode', 'fill');
// @ts-expect-error value for 'type' must be IGraphType
graphWidget.set('type', 'X');

// Invalid type should be rejected.
const badType: IGraphOptions = {
  range_x: { min: 0, max: 1 },
  range_y: { min: 0, max: 1 },
  // @ts-expect-error type must be a valid IGraphType
  type: 'X',
};
