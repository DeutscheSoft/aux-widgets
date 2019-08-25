import { component_from_widget } from './../component_helpers.js';
import { ValueButton } from './../widgets/valuebutton.js';

export const ValueButtonComponent = component_from_widget(ValueButton);

customElements.define('tk-valuebutton', ValueButtonComponent);
