import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Button } from './../widgets/button.js';

/**
 * WebComponent for the Button widget. Available in the DOM as `aux-button`.
 *
 * @class ButtonComponent
 * @implements Component
 */
export const ButtonComponent = component_from_widget(Button);

define_component('button', ButtonComponent);
