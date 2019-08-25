import { component_from_widget } from './../component_helpers.js';
import { Dynamics } from './../widgets/dynamics.js';

export const DynamicsComponent = component_from_widget(Dynamics);

customElements.define('tk-dynamics', DynamicsComponent);
