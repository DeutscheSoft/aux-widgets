import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Buttons } from './../widgets/buttons.js';

/**
 * WebComponent for the Buttons widget. Available in the DOM as `aux-buttons`.
 *
 * @class ButtonsComponent
 * @implements Component
 */
export const ButtonsComponent = component_from_widget(Buttons);

define_component('buttons', ButtonsComponent);
