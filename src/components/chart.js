import {
    component_from_widget, define_component, subcomponent_from_widget
  } from './../component_helpers.js';
import { Chart } from './../widgets/chart.js';
import { ResponseHandle } from './../modules/responsehandle.js';
import { Graph } from './../widgets/graph.js';

function add_handle(chart, handle)
{
  chart.add_handle(handle);
}

function remove_handle(chart, handle)
{
  chart.remove_handle(handle);
}

function add_graph(chart, graph)
{
  chart.add_graph(graph);
}

function remove_graph(chart, graph)
{
  chart.remove_graph(graph);
}

export const ChartComponent = component_from_widget(Chart);
export const ResponseHandleComponent = subcomponent_from_widget(ResponseHandle, Chart, add_handle, remove_handle);
export const GraphComponent = subcomponent_from_widget(Graph, Chart, add_graph, remove_graph);

define_component('chart', ChartComponent);
define_component('responsehandle', ResponseHandleComponent)
define_component('graph', GraphComponent)
