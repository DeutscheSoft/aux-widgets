import { component_from_widget } from './../component_helpers.js';
import { Button } from './../widgets/button.js';

export const ButtonComponent = component_from_widget(Button);

customElements.define('tk-button', ButtonComponent);
