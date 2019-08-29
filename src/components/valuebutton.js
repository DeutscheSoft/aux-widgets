import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ValueButton } from './../widgets/valuebutton.js';

export const ValueButtonComponent = component_from_widget(ValueButton);

define_component('valuebutton', ValueButtonComponent);
