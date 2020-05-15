import {
  component_from_widget,
  define_component,
  subcomponent_from_widget,
} from './../component_helpers.js';
import { Chart } from './../widgets/chart.js';
import { ChartHandle } from './../widgets/charthandle.js';
import { Graph } from './../widgets/graph.js';

/**
 * WebComponent for the Chart widget. Available in the DOM as `aux-chart`.
 *
 * @class ChartComponent
 * @implements Component
 */
export const ChartComponent = component_from_widget(Chart);

/**
 * WebComponent for the ChartHandle widget. Available in the DOM as
 * `aux-chart-handle`.
 *
 * @class ChartHandleComponent
 * @implements Component
 */
export const ChartHandleComponent = subcomponent_from_widget(
  ChartHandle,
  Chart
);

/**
 * WebComponent for the Graph widget. Available in the DOM as `aux-chart-graph`.
 *
 * @class GraphComponent
 * @implements Component
 */
export const GraphComponent = subcomponent_from_widget(Graph, Chart);

define_component('chart', ChartComponent);
define_component('chart-handle', ChartHandleComponent);
define_component('chart-graph', GraphComponent);
