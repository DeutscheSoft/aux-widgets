import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { ConfirmButton } from './../widgets/confirmbutton.js';

/**
 * WebComponent for the ConfirmButton widget. Available in the DOM as
 * `aux-confirmbutton`.
 *
 * @class ConfirmButtonComponent
 * @implements Component
 */
export const ConfirmButtonComponent = component_from_widget(ConfirmButton);

define_component('confirmbutton', ConfirmButtonComponent);
