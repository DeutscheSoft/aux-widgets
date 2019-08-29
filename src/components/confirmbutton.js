import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ConfirmButton } from './../widgets/confirmbutton.js';

export const ConfirmButtonComponent = component_from_widget(ConfirmButton);

define_component('confirmbutton', ConfirmButtonComponent);
