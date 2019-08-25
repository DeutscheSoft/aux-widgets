import { component_from_widget } from './../component_helpers.js';
import { Slider } from './../widgets/slider.js';

export const SliderComponent = component_from_widget(Slider);

customElements.define('tk-slider', SliderComponent);
