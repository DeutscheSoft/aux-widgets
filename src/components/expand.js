import {
  component_from_widget,
  define_component,
} from './../component_helpers.js';
import { Expand } from './../widgets/expand.js';

/**
 * WebComponent for the Expand widget. Available in the DOM as `aux-expand`.
 *
 * @class ExpandComponent
 * @implements Component
 */
export const ExpandComponent = component_from_widget(Expand);

define_component('expand', ExpandComponent);
