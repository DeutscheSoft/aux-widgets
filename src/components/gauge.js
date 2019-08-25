import { component_from_widget } from './../component_helpers.js';
import { Gauge } from './../widgets/gauge.js';

export const GaugeComponent = component_from_widget(Gauge);

customElements.define('tk-gauge', GaugeComponent);
