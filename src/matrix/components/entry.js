import {
    component_from_widget, define_component
  } from '../../component_helpers.js';
import { Entry } from '../widgets/entry.js';

/**
 * WebComponent for the ConfirmButton widget. Available in the DOM as
 * `aux-enry`.
 *
 * @class EntryComponent
 * @implements Component
 */
export const EntryComponent = component_from_widget(Entry);

define_component('entry', EntryComponent);
