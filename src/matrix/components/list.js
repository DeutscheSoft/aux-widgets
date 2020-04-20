import {
    component_from_widget, define_component
  } from '../../component_helpers.js';
import { List } from '../widgets/list.js';

/**
 * WebComponent for the List widget. Available in the DOM as
 * `aux-list`.
 *
 * @class ListComponent
 * @implements Component
 */
export const ListComponent = component_from_widget(List);

define_component('list', ListComponent);
