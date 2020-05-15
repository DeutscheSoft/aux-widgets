import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Toggle } from './../widgets/toggle.js';

/**
 * WebComponent for the Toggle widget. Available in the DOM as `aux-toggle`.
 *
 * @class ToggleComponent
 * @implements Component
 */
export const ToggleComponent = component_from_widget(Toggle);

define_component('toggle', ToggleComponent);
