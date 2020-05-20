/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import {
  component_from_widget,
  define_component,
  subcomponent_from_widget,
} from './../component_helpers.js';
import { Select, SelectEntry } from './../widgets/select.js';

function find_previous_entry(node) {
  node = node.previousSibling;

  while (node) {
    const widget = node.auxWidget;

    if (widget && widget instanceof SelectEntry) {
      return widget;
    }

    node = node.previousSibling;
  }
}

function find_next_entry(node) {
  node = node.nextSibling;

  while (node) {
    const widget = node.auxWidget;

    if (widget && widget instanceof SelectEntry) {
      return widget;
    }

    node = node.nextSibling;
  }
}

function add_entry(select, entry, entry_component) {
  const prev = find_previous_entry(entry_component);
  const next = find_next_entry(entry_component);

  let position;

  if (prev) {
    position = select.index_by_entry(prev) + 1;
  } else if (next) {
    position = select.index_by_entry(next);
  }

  select.add_entry(entry, position === false ? undefined : position);
}

function remove_entry(select, entry) {
  select.remove_entry(entry);
}

/**
 * WebComponent for the Select widget. Available in the DOM as `aux-select`.
 *
 * @class SelectComponent
 * @implements Component
 */
export const SelectComponent = component_from_widget(Select);

/**
 * WebComponent for the SelectEntry widget. Available in the DOM as
 * `aux-select-entry`.
 *
 * @class SelectEntryComponent
 * @implements Component
 */
export const SelectEntryComponent = subcomponent_from_widget(
  SelectEntry,
  Select,
  add_entry,
  remove_entry
);

define_component('select', SelectComponent);
define_component('select-entry', SelectEntryComponent);
