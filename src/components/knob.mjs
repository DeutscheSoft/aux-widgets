import { component_from_widget } from './../component_helpers.mjs';
import { Knob } from './../widgets/knob.mjs';

export const KnobComponent = component_from_widget(Knob);

customElements.define('tk-knob', KnobComponent);
