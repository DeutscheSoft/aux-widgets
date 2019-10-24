import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Value } from './../widgets/value.js';

export const ValueComponent = component_from_widget(Value, HTMLInputElement);

define_component('value', ValueComponent, { extends: 'input' });
