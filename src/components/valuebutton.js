import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { ValueButton } from './../widgets/valuebutton.js';

/**
 * WebComponent for the ValueButton widget. Available in the DOM as
 * `aux-valuebutton`.
 *
 * @class ValueButtonComponent
 * @implements Component
 */
export const ValueButtonComponent = component_from_widget(ValueButton);

define_component('valuebutton', ValueButtonComponent);
