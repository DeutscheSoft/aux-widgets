import { component_from_widget } from './../component_helpers.mjs';
import { Gauge } from './../widgets/gauge.mjs';

export const GaugeComponent = component_from_widget(Gauge);

customElements.define('tk-gauge', GaugeComponent);
