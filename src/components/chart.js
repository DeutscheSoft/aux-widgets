/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

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
