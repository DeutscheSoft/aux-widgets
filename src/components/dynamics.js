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
  componentFromWidget,
  defineComponent,
} from './../component_helpers.js';
import {
  Dynamics,
  Compressor,
  Expander,
  Gate,
  Limiter,
} from './../widgets/dynamics.js';

/**
 * WebComponent for the Dynamics widget. Available in the DOM as `aux-dynamics`.
 *
 * @class DynamicsComponent
 * @implements Component
 */
export const DynamicsComponent = componentFromWidget(Dynamics);

/**
 * WebComponent for the Compressor widget. Available in the DOM as
 * `aux-compressor`.
 *
 * @class CompressorComponent
 * @implements Component
 */
export const CompressorComponent = componentFromWidget(Compressor);

/**
 * WebComponent for the Expander widget. Available in the DOM as `aux-expander`.
 *
 * @class ExpanderComponent
 * @implements Component
 */
export const ExpanderComponent = componentFromWidget(Expander);

/**
 * WebComponent for the Gate widget. Available in the DOM as `aux-gate`.
 *
 * @class GateComponent
 * @implements Component
 */
export const GateComponent = componentFromWidget(Gate);

/**
 * WebComponent for the Limiter widget. Available in the DOM as `aux-limiter`.
 *
 * @class LimiterComponent
 * @implements Component
 */
export const LimiterComponent = componentFromWidget(Limiter);

defineComponent('dynamics', DynamicsComponent);
defineComponent('compressor', CompressorComponent);
defineComponent('expander', ExpanderComponent);
defineComponent('gate', GateComponent);
defineComponent('limiter', LimiterComponent);
