import { component_from_widget } from './../component_helpers.mjs';
import { Value } from './../widgets/value.mjs';

export const ValueComponent = component_from_widget(Value);

customElements.define('tk-value', ValueComponent);
