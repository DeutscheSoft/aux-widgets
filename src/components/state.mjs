import { component_from_widget } from './../component_helpers.mjs';
import { State } from './../widgets/state.mjs';

export const StateComponent = component_from_widget(State);

customElements.define('tk-state', StateComponent);
