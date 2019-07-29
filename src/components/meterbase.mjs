import { component_from_widget } from './../component_helpers.mjs';
import { MeterBase } from './../widgets/meterbase.mjs';

export const MeterBaseComponent = component_from_widget(MeterBase);

customElements.define('tk-meterbase', MeterBaseComponent);
