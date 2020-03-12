import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Icon } from './../widgets/icon.js';

/**
 * WebComponent for the Icon widget. Available in the DOM as `aux-icon`.
 *
 * @class IconComponent
 * @implements Component
 */
export const IconComponent = component_from_widget(Icon);

define_component('icon', IconComponent);
