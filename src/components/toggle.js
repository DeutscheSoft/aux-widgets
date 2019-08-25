import { component_from_widget } from './../component_helpers.js';
import { Toggle } from './../widgets/toggle.js';

export const ToggleComponent = component_from_widget(Toggle);

customElements.define('tk-toggle', ToggleComponent);
