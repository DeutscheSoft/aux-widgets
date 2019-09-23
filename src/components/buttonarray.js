import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ButtonArray } from './../widgets/buttonarray.js';

export const ButtonArrayComponent = component_from_widget(ButtonArray);

define_component('buttonarray', ButtonArrayComponent);
