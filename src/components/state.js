import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { State } from './../widgets/state.js';

export const StateComponent = component_from_widget(State);

define_component('state', StateComponent);
