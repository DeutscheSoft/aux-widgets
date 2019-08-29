import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { MultiMeter } from './../widgets/multimeter.js';

export const MultiMeterComponent = component_from_widget(MultiMeter);

define_component('multimeter', MultiMeterComponent);
