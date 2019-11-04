import {
    component_from_widget, define_component, subcomponent_from_widget
  } from './../component_helpers.js';
import { Chart } from './../widgets/chart.js';
import { ChartHandle } from './../widgets/charthandle.js';
import { Graph } from './../widgets/graph.js';

export const ChartComponent = component_from_widget(Chart);
export const ChartHandleComponent = subcomponent_from_widget(ChartHandle, Chart);
export const GraphComponent = subcomponent_from_widget(Graph, Chart);

define_component('chart', ChartComponent);
define_component('chart-handle', ChartHandleComponent);
define_component('chart-graph', GraphComponent);
