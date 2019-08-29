import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Slider } from './../widgets/slider.js';

export const SliderComponent = component_from_widget(Slider);

define_component('slider', SliderComponent);
