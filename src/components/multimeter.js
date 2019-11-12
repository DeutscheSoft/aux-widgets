import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { MultiMeter } from './../widgets/multimeter.js';

/**
 * WebComponent for the MultiMeter widget. Available in the DOM as
 * `aux-multimeter`.
 *
 * @class MultiMeterComponent
 * @implements Component
 */
export const MultiMeterComponent = component_from_widget(MultiMeter);

define_component('multimeter', MultiMeterComponent);
