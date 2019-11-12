import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Navigation } from './../widgets/navigation.js';

/**
 * WebComponent for the Navigation widget. Available in the DOM as
 * `aux-navigation`.
 *
 * @class NavigationComponent
 * @implements Component
 */
export const NavigationComponent = component_from_widget(Navigation);

define_component('navigation', NavigationComponent);
