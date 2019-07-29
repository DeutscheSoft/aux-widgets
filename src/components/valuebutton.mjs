import { component_from_widget } from './../component_helpers.mjs';
import { ValueButton } from './../widgets/valuebutton.mjs';

export const ValueButtonComponent = component_from_widget(ValueButton);

customElements.define('tk-valuebutton', ValueButtonComponent);
