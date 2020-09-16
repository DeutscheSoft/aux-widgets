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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import {
  componentFromWidget,
  defineComponent,
  subcomponentFromWidget,
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
export const ChartComponent = componentFromWidget(Chart);

/**
 * WebComponent for the ChartHandle widget. Available in the DOM as
 * `aux-chart-handle`.
 *
 * @class ChartHandleComponent
 * @implements Component
 */
export const ChartHandleComponent = subcomponentFromWidget(ChartHandle, Chart);

/**
 * WebComponent for the Graph widget. Available in the DOM as `aux-chart-graph`.
 *
 * @class GraphComponent
 * @implements Component
 */
export const GraphComponent = subcomponentFromWidget(Graph, Chart);

defineComponent('chart', ChartComponent);
defineComponent('chart-handle', ChartHandleComponent);
defineComponent('chart-graph', GraphComponent);
