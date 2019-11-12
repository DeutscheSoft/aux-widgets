import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Meter } from './../widgets/meter.js';

/**
 * WebComponent for the Meter widget. Available in the DOM as `aux-meter`.
 *
 * @class MeterComponent
 * @implements Component
 */
export const MeterComponent = component_from_widget(Meter);

define_component('meter', MeterComponent);
