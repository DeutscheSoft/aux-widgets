import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Knob } from './../widgets/knob.js';

export const KnobComponent = component_from_widget(Knob);

define_component('knob', KnobComponent);
