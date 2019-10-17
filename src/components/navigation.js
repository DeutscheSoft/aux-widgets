import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Navigation } from './../widgets/navigation.js';

export const NavigationComponent = component_from_widget(Navigation);

define_component('navigation', NavigationComponent);
