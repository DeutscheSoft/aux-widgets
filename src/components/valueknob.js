import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ValueKnob } from './../widgets/valueknob.js';

export const ValueKnobComponent = component_from_widget(ValueKnob);

define_component('valueknob', ValueKnobComponent);
