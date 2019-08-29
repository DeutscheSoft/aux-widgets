import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { MeterBase } from './../widgets/meterbase.js';

export const MeterBaseComponent = component_from_widget(MeterBase);

define_component('meterbase', MeterBaseComponent);
