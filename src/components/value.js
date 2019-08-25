import { component_from_widget } from './../component_helpers.js';
import { Value } from './../widgets/value.js';

export const ValueComponent = component_from_widget(Value);

customElements.define('tk-value', ValueComponent);
