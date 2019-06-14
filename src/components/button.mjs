import { component_from_widget } from './../component_helpers.mjs';
import { Button } from './../widgets/button.mjs';

export const ButtonComponent = component_from_widget(Button);

customElements.define('tk-button', ButtonComponent);
