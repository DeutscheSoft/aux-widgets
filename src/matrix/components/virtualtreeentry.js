import {
  component_from_widget,
  define_component,
} from './../../component_helpers.js';
import { VirtualTreeEntry } from './../widgets/virtualtreeentry.js';

/**
 * WebComponent for the VirtualTreeEntry widget. Available in the DOM as
 * `aux-virtualtreeentry`.
 *
 * @class VirtualTreeEntryComponent
 * @implements Component
 */
export const VirtualTreeEntryComponent = component_from_widget(
  VirtualTreeEntry
);

define_component('virtualtreeentry', VirtualTreeEntryComponent);
