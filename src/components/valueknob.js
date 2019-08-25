import { component_from_widget } from './../component_helpers.js';
import { ValueKnob } from './../widgets/valueknob.js';

export const ValueKnobComponent = component_from_widget(ValueKnob);

customElements.define('tk-valueknob', ValueKnobComponent);
