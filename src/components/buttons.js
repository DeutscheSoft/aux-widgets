import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Buttons } from './../widgets/buttons.js';

export const ButtonsComponent = component_from_widget(Buttons);

define_component('buttons', ButtonsComponent);
