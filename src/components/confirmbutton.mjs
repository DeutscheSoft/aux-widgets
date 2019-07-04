import { component_from_widget } from './../component_helpers.mjs';
import { ConfirmButton } from './../widgets/confirmbutton.mjs';

export const ConfirmButtonComponent = component_from_widget(ConfirmButton);

customElements.define('tk-confirmbutton', ConfirmButtonComponent);
