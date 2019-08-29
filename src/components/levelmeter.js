import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { LevelMeter } from './../widgets/levelmeter.js';

export const LevelMeterComponent = component_from_widget(LevelMeter);

define_component('levelmeter', LevelMeterComponent);
