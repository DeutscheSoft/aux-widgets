import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Knob } from './../widgets/knob.js';

/**
 * WebComponent for the Knob widget. Available in the DOM as `aux-knob`.
 *
 * @class KnobComponent
 * @implements Component
 */
export const KnobComponent = component_from_widget(Knob);

define_component('knob', KnobComponent);
