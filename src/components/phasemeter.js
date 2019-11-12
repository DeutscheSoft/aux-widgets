import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { PhaseMeter } from './../widgets/phasemeter.js';

/**
 * WebComponent for the PhaseMeter widget. Available in the DOM as
 * `aux-phasemeter`.
 *
 * @class PhaseMeterComponent
 * @implements Component
 */
export const PhaseMeterComponent = component_from_widget(PhaseMeter);

define_component('phasemeter', PhaseMeterComponent);
