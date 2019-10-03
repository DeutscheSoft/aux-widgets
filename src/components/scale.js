import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Scale } from './../widgets/scale.js';

export const ScaleComponent = component_from_widget(Scale);

define_component('scale', ScaleComponent);
