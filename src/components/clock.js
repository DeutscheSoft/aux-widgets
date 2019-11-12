import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Clock } from './../widgets/clock.js';

/**
 * WebComponent for the Clock widget. Available in the DOM as `aux-clock`.
 *
 * @class ClockComponent
 * @implements Component
 */
export const ClockComponent = component_from_widget(Clock);

define_component('clock', ClockComponent);
