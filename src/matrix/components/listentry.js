import {
    component_from_widget, define_component
  } from './../../component_helpers.js';
import { ListEntry } from './../widgets/listentry.js';

/**
 * WebComponent for the ListEntry widget. Available in the DOM as
 * `aux-listentry`.
 *
 * @class ListEntryComponent
 * @implements Component
 */
export const ListEntryComponent = component_from_widget(ListEntry);

define_component('listentry', ListEntryComponent);
