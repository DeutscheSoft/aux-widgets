import { Graph, IGraphOptions } from '../src/index.js';

// Valid Graph options.
const graph: Partial<IGraphOptions> = {
  range_x: { min: 0, max: 100 },
  range_y: { min: 0, max: 1 },
  type: 'L',
  mode: 'line',
  dots: [
    { x: 0, y: 0 },
    { x: 100, y: 1 },
  ],
};

const graphWidget = new Graph(graph);
new Graph({ mode: 'fill', base: 0.5 });

// .set(key, value) API type-checking
graphWidget.set('mode', 'fill');
// @ts-expect-error value for 'type' must be IGraphType
graphWidget.set('type', 'X');

// .get(key) API type-checking
const _graphMode:
  | 'line'
  | 'bottom'
  | 'top'
  | 'center'
  | 'base'
  | 'fill'
  | undefined = graphWidget.get('mode');
// @ts-expect-error 'not_an_option_key' is not a valid option key
graphWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
graphWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
graphWidget.on('not_an_event', () => {});

// Invalid type should be rejected.
const badType: Partial<IGraphOptions> = {
  range_x: { min: 0, max: 1 },
  range_y: { min: 0, max: 1 },
  // @ts-expect-error type must be a valid IGraphType
  type: 'X',
};
