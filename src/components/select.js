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
  componentFromWidget,
  defineComponent,
  subcomponentFromWidget,
} from './../component_helpers.js';
import { Select, SelectEntry } from './../widgets/select.js';

function findPreviousEntry(node) {
  node = node.previousSibling;

  while (node) {
    const widget = node.auxWidget;

    if (widget && widget instanceof SelectEntry) {
      return widget;
    }

    node = node.previousSibling;
  }
}

function findNextEntry(node) {
  node = node.nextSibling;

  while (node) {
    const widget = node.auxWidget;

    if (widget && widget instanceof SelectEntry) {
      return widget;
    }

    node = node.nextSibling;
  }
}

function addEntry(select, entry, entry_component) {
  const prev = findPreviousEntry(entry_component);
  const next = findNextEntry(entry_component);

  let position;

  if (prev) {
    position = select.indexByEntry(prev) + 1;
  } else if (next) {
    position = select.indexByEntry(next);
  }

  select.addEntry(entry, position === false ? undefined : position);
}

function removeEntry(select, entry) {
  select.removeEntry(entry);
}

/**
 * WebComponent for the Select widget. Available in the DOM as `aux-select`.
 *
 * @class SelectComponent
 * @implements Component
 */
export const SelectComponent = componentFromWidget(Select);

/**
 * WebComponent for the SelectEntry widget. Available in the DOM as
 * `aux-select-entry`.
 *
 * @class SelectEntryComponent
 * @implements Component
 */
export const SelectEntryComponent = subcomponentFromWidget(
  SelectEntry,
  Select,
  addEntry,
  removeEntry
);

defineComponent('select', SelectComponent);
defineComponent('select-entry', SelectEntryComponent);
