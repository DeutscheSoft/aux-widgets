import { component_from_widget } from './../component_helpers.js';
import { State } from './../widgets/state.js';

export const StateComponent = component_from_widget(State);

customElements.define('tk-state', StateComponent);
