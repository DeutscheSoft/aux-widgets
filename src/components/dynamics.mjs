import { component_from_widget } from './../component_helpers.mjs';
import { Dynamics } from './../widgets/dynamics.mjs';

export const DynamicsComponent = component_from_widget(Dynamics);

customElements.define('tk-dynamics', DynamicsComponent);
