import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Slider } from './../widgets/slider.js';

/**
 * WebComponent for the Slider widget. Available in the DOM as `aux-slider`.
 *
 * @class SliderComponent
 * @implements Component
 */
export const SliderComponent = component_from_widget(Slider);

define_component('slider', SliderComponent);
