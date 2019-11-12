import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Dynamics, Compressor, Expander, Gate, Limiter } from './../widgets/dynamics.js';

/**
 * WebComponent for the Dynamics widget. Available in the DOM as `aux-dynamics`.
 *
 * @class DynamicsComponent
 * @implements Component
 */
export const DynamicsComponent = component_from_widget(Dynamics);

/**
 * WebComponent for the Compressor widget. Available in the DOM as
 * `aux-compressor`.
 *
 * @class CompressorComponent
 * @implements Component
 */
export const CompressorComponent = component_from_widget(Compressor);

/**
 * WebComponent for the Expander widget. Available in the DOM as `aux-expander`.
 *
 * @class ExpanderComponent
 * @implements Component
 */
export const ExpanderComponent = component_from_widget(Expander);

/**
 * WebComponent for the Gate widget. Available in the DOM as `aux-gate`.
 *
 * @class GateComponent
 * @implements Component
 */
export const GateComponent = component_from_widget(Gate);

/**
 * WebComponent for the Limiter widget. Available in the DOM as `aux-limiter`.
 *
 * @class LimiterComponent
 * @implements Component
 */
export const LimiterComponent = component_from_widget(Limiter);

define_component('dynamics', DynamicsComponent);
define_component('compressor', CompressorComponent);
define_component('expander', ExpanderComponent);
define_component('gate', GateComponent);
define_component('limiter',LimiterComponent);
