import { component_from_widget } from './../component_helpers.mjs';
import { MultiMeter } from './../widgets/multimeter.mjs';

export const MultiMeterComponent = component_from_widget(MultiMeter);

customElements.define('tk-multimeter', MultiMeterComponent);
