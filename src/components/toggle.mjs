import { component_from_widget } from './../component_helpers.mjs';
import { Toggle } from './../widgets/toggle.mjs';

export const ToggleComponent = component_from_widget(Toggle);

customElements.define('tk-toggle', ToggleComponent);
