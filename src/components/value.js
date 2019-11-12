import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Value } from './../widgets/value.js';

/**
 * WebComponent for the Value widget. Available in the DOM as `aux-value`. It is
 * a subclass of `HTMLInputElement`.
 *
 * @class ValueComponent
 * @implements Component
 */
export const ValueComponent = component_from_widget(Value, HTMLInputElement);

define_component('value', ValueComponent, { extends: 'input' });
