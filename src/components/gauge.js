import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Gauge } from './../widgets/gauge.js';

export const GaugeComponent = component_from_widget(Gauge);

define_component('gauge', GaugeComponent);
