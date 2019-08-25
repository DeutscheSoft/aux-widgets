import { component_from_widget } from './../component_helpers.js';
import { MultiMeter } from './../widgets/multimeter.js';

export const MultiMeterComponent = component_from_widget(MultiMeter);

customElements.define('tk-multimeter', MultiMeterComponent);
