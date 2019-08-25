import { component_from_widget } from './../component_helpers.js';
import { ConfirmButton } from './../widgets/confirmbutton.js';

export const ConfirmButtonComponent = component_from_widget(ConfirmButton);

customElements.define('tk-confirmbutton', ConfirmButtonComponent);
