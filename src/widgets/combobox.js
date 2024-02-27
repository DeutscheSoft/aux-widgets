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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { element, addClass } from './../utils/dom.js';
import { defineChildWidget } from './../child_widget.js';
import { Widget } from './widget.js';
import { Select } from './select.js';
import { Value } from './value.js';

/**
 * Combobox is a combination of a {@link Select} and a {@link Value}.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} [options.value] - The value of the combobox.

 * @extends Widget
 *
 * @class ComboBox
 */
/**
 * @member {HTMLDivElement} ComboBox#element - The main DIV element.
 *   Has class <code>.aux-combobox</code>.
 */
/**
 * Is fired when the user selects an entry from the list.
 *
 * @event ComboBox#select
 *
 * @param {mixed} value - The value of the {@link ComboBox}.
 * @param {number} index - The index of the selected entry.
 * @param {string} label - The label of the selected entry.
 * @param {SelectEntry} entry - The {@link SelectEntry}.
 */
export class ComboBox extends Widget {
  static get _options() {
    return {
      value: 'string',
    };
  }

  static get options() {
    return {
      value: null,
    };
  }

  static get static_events() {
    return {
      set_value: function (v) {
        this.value.update('value', v);
        this.select.update('value', v);
      },
    };
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
  }

  draw(O, element) {
    addClass(element, 'aux-combobox');
    super.draw(O, element);
    this.set('value', O.value);
  }
}

/**
 * @member {Value} ComboBox#select - The {@link Select} widget.
 */
defineChildWidget(ComboBox, 'select', {
  create: Select,
  show: true,
  map_options: {
    entries: 'entries',
    list_class: 'list_class',
  },
  static_events: {
    userset: function (key, v) {
      this.parent.userset('value', v);
    },
    select: function (value, index, label, entry) {
      this.parent.emit('select', value, index, label, entry);
    },
  },
  default_options: {},
});

/**
 * @member {Value} ComboBox#value - The {@link Value} widget.
 */
defineChildWidget(ComboBox, 'value', {
  create: Value,
  show: true,
  map_options: {
    editmode: 'editmode',
  },
  static_events: {
    userset: function (key, v) {
      this.parent.userset('value', v);
    },
  },
  default_options: {
    editmode: 'immediate',
    set: (v) => v,
  },
});
