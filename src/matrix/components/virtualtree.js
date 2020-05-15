import {
  component_from_widget,
  define_component,
} from './../../component_helpers.js';
import { VirtualTree } from './../widgets/virtualtree.js';

/**
 * WebComponent for the VirtualTree widget. Available in the DOM as
 * `aux-virtualtree`.
 *
 * @class VirtualTreeComponent
 * @implements Component
 */
export const VirtualTreeComponent = component_from_widget(VirtualTree);

define_component('virtualtree', VirtualTreeComponent);
