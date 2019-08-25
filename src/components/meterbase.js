import { component_from_widget } from './../component_helpers.js';
import { MeterBase } from './../widgets/meterbase.js';

export const MeterBaseComponent = component_from_widget(MeterBase);

customElements.define('tk-meterbase', MeterBaseComponent);
