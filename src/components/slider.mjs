import { component_from_widget } from './../component_helpers.mjs';
import { Slider } from './../widgets/slider.mjs';

export const SliderComponent = component_from_widget(Slider);

customElements.define('tk-slider', SliderComponent);
