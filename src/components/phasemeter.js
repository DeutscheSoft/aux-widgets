import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { PhaseMeter } from './../widgets/phasemeter.js';

export const PhaseMeterComponent = component_from_widget(PhaseMeter);

define_component('phasemeter', PhaseMeterComponent);
