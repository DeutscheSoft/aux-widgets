import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Root } from './../widgets/root.js';

/**
 * WebComponent for the Root widget. Available in the DOM as
 * `aux-root`.
 *
 * @class RootComponent
 * @implements Component
 */
export const RootComponent = component_from_widget(Root);

define_component('root', RootComponent);
