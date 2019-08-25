import { component_from_widget } from './../component_helpers.js';
import { Knob } from './../widgets/knob.js';

export const KnobComponent = component_from_widget(Knob);

customElements.define('tk-knob', KnobComponent);
