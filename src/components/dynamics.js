import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Dynamics } from './../widgets/dynamics.js';

export const DynamicsComponent = component_from_widget(Dynamics);

define_component('dynamics', DynamicsComponent);
