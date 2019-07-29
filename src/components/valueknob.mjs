import { component_from_widget } from './../component_helpers.mjs';
import { ValueKnob } from './../widgets/valueknob.mjs';

export const ValueKnobComponent = component_from_widget(ValueKnob);

customElements.define('tk-valueknob', ValueKnobComponent);
