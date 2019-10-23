import {
    component_from_widget, define_component
  } from './../component_helpers.js';
import { Root } from './../widgets/root.js';

export const RootComponent = component_from_widget(Root);

define_component('root', RootComponent);
