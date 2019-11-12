import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Gauge } from './../widgets/gauge.js';

/**
 * WebComponent for the Gauge widget. Available in the DOM as `aux-gauge`.
 *
 * @class GaugeComponent
 * @implements Component
 */
export const GaugeComponent = component_from_widget(Gauge);

define_component('gauge', GaugeComponent);
