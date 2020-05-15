import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { State } from './../widgets/state.js';

/**
 * WebComponent for the State widget. Available in the DOM as `aux-state`.
 *
 * @class StateComponent
 * @implements Component
 */
export const StateComponent = component_from_widget(State);

define_component('state', StateComponent);
