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

/* jshint -W014 */

import { defineChildWidget } from './../child_widget.js';
import { Button } from './button.js';
import { Label } from './label.js';
import {
  element,
  addClass,
  outerWidth,
  width,
  height,
  scrollLeft,
  scrollTop,
  setStyles,
  outerHeight,
  positionTop,
  positionLeft,
  setStyle,
  getDuration,
  empty,
  removeClass,
} from '../utils/dom.js';
import { typecheckInteger } from '../utils/typecheck.js';

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the options <code>selected</code> and <code>value</code>.
 *
 * @event Select#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */

function hideList() {
  this.__transition = false;
  this.__timeout = false;
  if (!this.__open) {
    this._list.remove();
  } else {
    document.addEventListener('touchstart', this._globalTouchStart);
    document.addEventListener('mousedown', this._globalTouchStart);
  }
}
function showList(show) {
  const E = this.element;
  const O = this.options;
  if (show) {
    const ew = outerWidth(E, true);
    if (O.list_class) this._list.classList.add(O.list_class);
    document.body.appendChild(this._list);
    const cw = width();
    const ch = height();
    const sx = scrollLeft();
    const sy = scrollTop();
    setStyles(this._list, {
      opacity: '0',
      maxHeight: ch + 'px',
      maxWidth: cw + 'px',
      minWidth: ew + 'px',
    });
    const lw = outerWidth(this._list, true);
    const lh = outerHeight(this._list, true);
    setStyles(this._list, {
      top: Math.min(positionTop(E) + outerHeight(E, true), ch + sy - lh) + 'px',
      left: Math.min(positionLeft(E), cw + sx - lw) + 'px',
    });
  } else {
    document.removeEventListener('touchstart', this._globalTouchStart);
    document.removeEventListener('mousedown', this._globalTouchStart);
  }
  setStyle(this._list, 'opacity', show ? '1' : '0');
  this.__transition = true;
  this.__open = show;
  if (this.__timeout !== false) window.clearTimeout(this.__timeout);
  const dur = getDuration(this._list);
  this.__timeout = window.setTimeout(hideList.bind(this), dur);
  if (this.current())
    this._list.scrollTop =
      this.current().element.offsetTop - this._list.offsetHeight / 2;
}

/**
 * Select provides a {@link Button} with a select list to choose from
 * a list of {@link SelectEntry}.
 *
 * @class Select
 *
 * @extends Button
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Integer|Boolean} [options.selected=false] - The index of the selected {@link SelectEntry}.
 *   Set to `-1` to unselect any already selected entries.
 * @property {mixed} [options.value] - The value of the selected entry.
 * @property {SelectEntry} [options.selected_entry] - The currently selected
 *    entry.
 * @property {Boolean} [options.auto_size=true] - If `true`, the Select is
 *   auto-sized to be as wide as the widest {@link SelectEntry}.
 * @property {Array<Object>} [options.entries=[]] - The list of {@link SelectEntry}. Each member is an
 *   object with the two properties <code>label</code> and <code>value</code>, a string used
 *   as label for constructing a {@link SelectEntry} or an instance of {@link SelectEntry}.
 * @property {String|Boolean} [options.placeholder=false] - Placeholder
 *   for the button label. Set to <code>false</code> to have an empty
 *   placeholder. This placeholder is shown when no entry is selected.
 * @property {String|Boolean} [options.list_class] - A CSS class to be set on the list. This is
 *   a static option and can only be set once on initializaion.
 *
 */
export class Select extends Button {
  static get _options() {
    return Object.assign({}, Button.getOptionTypes(), {
      entries: 'array',
      selected: 'int',
      selected_entry: 'object',
      value: 'mixed',
      auto_size: 'boolean',
      show_list: 'boolean',
      sort: 'function',
      resized: 'boolean',
      placeholder: 'string|boolean',
      list_class: 'string',
    });
  }

  static get options() {
    return {
      entries: [], // A list of strings or objects {label: "Title", value: 1} or SelectEntry instance
      selected: -1,
      value: void 0,
      selected_entry: null,
      auto_size: false,
      show_list: false,
      icon: 'arrowdown',
      placeholder: false,
      list_class: '',
      label: '',
    };
  }

  static get static_events() {
    return {
      click: function () {
        this.set('show_list', !this.options.show_list);
      },
      set_show_list: function (v) {
        this.set('icon', v ? 'arrowup' : 'arrowdown');
      },
      set_selected_entry: function (entry) {
        if (entry) {
          const entries = this.entries;
          this.update('selected', entries.indexOf(entry));
          this.update('value', entry.get('value'));
          this.update('label', entry.get('label'));
        } else {
          this.update('selected', -1);
          this.update('value', void 0);
          this.update('label', this.get('placeholder'));
        }
      },
      set_selected: function (index) {
        if (index === -1) {
          this.update('selected_entry', null);
          this.update('value', void 0);
        } else {
          const entries = this.entries;

          if (index >= entries.length) return;

          // this will set value
          this.update('selected_entry', entries[index]);
        }
      },
      set_value: function (value) {
        const entries = this.entries;

        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];

          if (value === entry.get('value')) {
            this.update('selected_entry', entry);
            return;
          }
        }
      },
      set_placeholder: function (label) {
        const selected_entry = this.get('selected_entry');

        if (!selected_entry) this.update('label', label);
      },
    };
  }

  initialize(options) {
    this.__open = false;

    this.__timeout = -1;

    /**
     * @member {Array} Select#entries - An array containing all entry objects with members <code>label</code> and <code>value</code>.
     */
    this.entries = [];
    this._active = null;
    super.initialize(options);
    /**
     * @member {HTMLDivElement} Select#element - The main DIV container.
     *   Has class <code>.aux-select</code>.
     */

    /**
     * @member {HTMLListElement} Select#_list - A HTML list for displaying the entry labels.
     *   Has class <code>.aux-selectlist</code>.
     */
    this._list = element('div', 'aux-selectlist');

    this._globalTouchStart = function (e) {
      if (
        this.__open &&
        !this.__transition &&
        !this._list.contains(e.target) &&
        !this.element.contains(e.target)
      ) {
        this.showList(false);
      }
    }.bind(this);

    const sel = this.options.selected;
    const val = this.options.value;
    this.set('entries', this.options.entries);

    if (sel !== -1) {
      this.set('selected', sel);
    } else if (val !== void 0) {
      this.set('value', val);
    }
  }

  destroy() {
    this.clear();
    this._list.remove();
    super.destroy();
  }

  /**
   * Show or hide the select list
   *
   * @method Select#showList
   *
   * @param {boolean} show - `true` to show and `false` to hide the list
   *   of {@link SelectEntry}.
   */
  showList(s) {
    this.set('show_list', !!s);
  }

  /**
   * Select a {@link SelectEntry} by its index.
   *
   * @method Select#select
   *
   * @param {Integer} index - The index of the {@link SelectEntry} to select.
   */
  select(id) {
    if (!Number.isInteger(id) && !id) id = -1;
    this.set('selected', id);
  }

  /**
   * Select a {@link SelectEntry} by its value.
   *
   * @method Select#selectValue
   *
   * @param {mixed} value - The value of the {@link SelectEntry} to select.
   */
  selectValue(value) {
    const id = this.indexByValue(value);
    this.set('selected', id);
  }

  /**
   * Select a {@link SelectEntry} by its label.
   *
   * @method Select#selectLabel
   *
   * @param {mixed} label - The label of the {@link SelectEntry} to select.
   */
  selectLabel(label) {
    const id = this.indexByLabel(label);
    this.set('selected', id);
  }

  /**
   * Replaces the list of {@link SelectEntry} to select from with an entirely new one.
   *
   * @method Select#setEntries
   *
   * @param {Array} entries - An array of {@link SelectEntry} to set as the new list to select from.
   *   Please refer to {@link Select#addEntry} for more details.
   */
  setEntries(entries) {
    const value = this.get('value');

    this.clear();
    this.addEntries(entries);

    if (value !== void 0) {
      const index = this.indexByValue(value);

      if (index !== -1) this.select(index);
    }
  }

  /**
   * Adds new {@link SelectEntry} to the end of the list to select from.
   *
   * @method Select#addEntries
   *
   * @param {Array} entries - An array of {@link SelectEntry} to add to the end of the list
   *   of {@link SelectEntry} to select from. Please refer to {@link Select#addEntry}
   *   for more details.
   */
  addEntries(entries) {
    for (let i = 0; i < entries.length; i++) this.addEntry(entries[i]);
  }

  /**
   * Adds a single {@link SelectEntry} to the end of the list.
   *
   * @method Select#addEntry
   *
   * @param {mixed} entry - A string to be displayed and used as the value,
   *   an object with members <code>label</code> and <code>value</code>
   *   or an instance of {@link SelectEntry}.
   * @param {integer} [position] - The position in the list to add the new
   *   entry at. If omitted, the entry is added at the end.
   *
   * @emits Select.entryadded
   */
  addEntry(ent, position) {
    let entry;

    if (position !== void 0) {
      typecheckInteger(position);

      if (position < 0 || position > this.entries.length)
        throw new TypeError('Index out of bounds.');
    }

    if (typeof ent === 'object' && ent instanceof SelectEntry) {
      entry = ent;
    } else if (typeof ent === 'string') {
      entry = new SelectEntry({
        value: ent,
        label: ent,
      });
    } else if (typeof ent === 'object' && 'value' in ent && 'label' in ent) {
      ent.element = null;
      entry = new SelectEntry(ent);
    } else {
      throw new TypeError('Unsupported type of entry.');
    }

    if (position !== void 0) {
      this.entries.splice(position, 0, entry);
    }

    this.addChild(entry);

    return entry;
  }

  addChild(child) {
    super.addChild(child);

    if (!(child instanceof SelectEntry)) return;

    const O = this.options;
    const entries = this.entries;
    const entry = child;

    if (!entries.includes(entry)) entries.push(entry);

    if (O.sort) entries.sort(O.sort);

    const index = entries.indexOf(entry);

    // invalidate entries.
    this.invalid.entries = true;

    const selected = this.options.selected;

    // adjust selected
    if (selected !== -1 && selected >= index) {
      this.set('selected', selected + 1);
    }
    this.triggerDraw();
    /**
     * Is fired when a new {@link SelectEntry} is added to the list.
     *
     * @event Select#entryadded
     *
     * @param {SelectEntry} entry - A new {@link SelectEntry}.
     */
    this.emit('entryadded', entry);
  }

  /**
   * Remove a {@link SelectEntry} from the list by its index.
   *
   * @method Select#removeIndex
   *
   * @param {Integer} index - The index of the {@link SelectEntry} to be removed from the list.
   *
   * @emits Select#entryremoved
   */
  removeIndex(index) {
    const entry = this.entries[index];

    if (!entry) {
      throw new Error('Index does not exist.');
    }

    this.removeChild(entry);
  }

  /**
   * Remove a {@link SelectEntry} from the list by its value.
   *
   * @method Select#removeValue
   *
   * @param {mixed} value - The value of the {@link SelectEntry} to be removed from the list.
   *
   * @emits Select#entryremoved
   */
  removeValue(val) {
    this.removeIndex(this.indexByValue(val));
  }

  /**
   * Remove an entry from the list by its label.
   *
   * @method Select#removeLabel
   *
   * @param {string} label - The label of the entry to be removed from the list.
   *
   * @emits Select#entryremoved
   */
  removeLabel(label) {
    this.removeIndex(this.indexByLabel(label));
  }

  /**
   * Remove an entry from the list.
   *
   * @method Select#removeEntry
   *
   * @param {SelectEntry} entry - The {@link SelectEntry} to be removed from the list.
   *
   * @emits Select#entryremoved
   */
  removeEntry(entry) {
    this.removeChild(entry);
  }

  removeEntries(a) {
    a.forEach((entry) => {
      this.removeEntry(entry);
    });
  }

  _removeEntry(entry) {
    const entries = this.entries;
    const index = entries.indexOf(entry);

    if (index === -1) throw new Error('Unknown entry.');

    const selected = this.get('selected');

    this.entries = entries.filter((_entry) => _entry !== entry);

    if (selected === index) {
      // unselect current entry
      this.set('selected_entry', null);
    } else if (selected > index) {
      this.set('selected', selected - 1);
    }

    const li = entry.element;

    // remove from DOM
    if (li.parentElement == this._list) li.remove();
    this.invalid.entries = true;
    this.triggerDraw();
    /**
     * Is fired when an entry was removed from the list.
     *
     * @event Select.entryremoved
     *
     * @param {SelectEntry} entry - The removed select entry.
     */
    this.emit('entryremoved', entry);
  }

  removeChild(child) {
    super.removeChild(child);
    if (child instanceof SelectEntry) {
      this._removeEntry(child);
    }
  }

  /**
   * Get the index of a {@link SelectEntry} by its value.
   *
   * @method Select#indexByValue
   *
   * @param {Mixed} value - The value of the {@link SelectEntry}.
   *
   * @returns {Integer|Boolean} The index of the entry or `-1`.
   */
  indexByValue(val) {
    const entries = this.entries;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].options.value === val) return i;
    }
    return -1;
  }

  /**
   * Get the index of a {@link SelectEntry} by its label/label.
   *
   * @method Select#indexByLabel
   *
   * @param {String} label - The label/label of the {@link SelectEntry}.
   *
   * @returns {Integer} The index of the entry or `-1`.
   */
  indexByLabel(label) {
    const entries = this.entries;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].options.label === label) return i;
    }
    return -1;
  }

  /**
   * Get the index of a {@link SelectEntry} by the {@link SelectEntry} itself.
   *
   * @method Select#indexByEntry
   *
   * @param {SelectEntry} entry - The {@link SelectEntry}.
   *
   * @returns {Integer|Boolean} The index of the entry or `-1`.
   */
  indexByEntry(entry) {
    return this.entries.indexOf(entry);
  }

  /**
   * Get a {@link SelectEntry} by its value.
   *
   * @method Select#entryByValue
   *
   * @param {Mixed} value - The value of the {@link SelectEntry}.
   *
   * @returns {SelectEntry|False} The {@link SelectEntry} or `null`.
   */
  entryByValue(val) {
    const entries = this.entries;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].options.value === val) return entries[i];
    }
    return null;
  }

  /**
   * Get a {@link SelectEntry} by its label/label.
   *
   * @method Select#entryByLabel
   *
   * @param {String} label - The label of the {@link SelectEntry}.
   *
   * @returns {SelectEntry|Boolean} The {@link SelectEntry} or `null`.
   */
  entryByLabel(label) {
    const entries = this.entries;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].options.label === label) return entries[i];
    }
    return null;
  }

  /**
   * Get a {@link SelectEntry} by its index.
   *
   * @method Select#entryByIndex
   *
   * @param {Integer} index - The index of the {@link SelectEntry}.
   *
   * @returns {SelectEntry|Boolean} The {@link SelectEntry} or `null`.
   */
  entryByIndex(index) {
    const entries = this.entries;
    if (index >= 0 && index < entries.length && entries[index])
      return entries[index];
    return null;
  }

  /**
   * Get a value by its {@link SelectEntry} index.
   *
   * @method Select#valueByIndex
   *
   * @param {Integer} index - The index of the {@link SelectEntry}.
   *
   * @returns {Mixed|Boolean} The value of the {@link SelectEntry} or `undefined`.
   */
  valueByIndex(index) {
    const entries = this.entries;
    if (index >= 0 && index < entries.length && entries[index]) {
      return entries[index].options.value;
    }
    return void 0;
  }

  /**
   * Get the value of a {@link SelectEntry}.
   *
   * @method Select#valueByEntry
   *
   * @param {SelectEntry} entry - The {@link SelectEntry}.
   *
   * @returns {mixed} The value of the {@link SelectEntry}.
   */
  valueByEntry(entry) {
    return entry.options.value;
  }

  /**
   * Get the value of a {@link SelectEntry} by its label/label.
   *
   * @method Select#valueByLabel
   *
   * @param {String} label - The label of the {@link SelectEntry}.
   *
   * @returns {Mixed|Boolean} The value of the {@link SelectEntry} or `undefined`.
   */
  valueByLabel(label) {
    const entries = this.entries;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].options.label === label) return entries[i].options.value;
    }
    return void 0;
  }

  /**
   * Remove all {@link SelectEntry} from the list.
   *
   * @method Select#clear
   *
   * @emits Select#cleared
   */
  clear() {
    empty(this._list);
    this.entries.forEach((entry) => {
      this.removeChild(entry);
    });
    /**
     * Is fired when the list is cleared.
     *
     * @event Select.cleared
     */
    this.emit('cleared');
  }

  draw(O, element) {
    addClass(element, 'aux-select');

    super.draw(O, element);
  }

  resize() {
    super.resize();
    this.invalidate('auto_size');
  }

  redraw() {
    super.redraw();

    const I = this.invalid;
    const O = this.options;

    if (I.entries || I.auto_size) {
      if (O.auto_size) {
        I.show_list = true;
        I.auto_size = false;

        const S = this.sizer.element;
        const v = O.entries;
        empty(S);
        const frag = document.createDocumentFragment();
        for (let i = 0, m = v.length; i < m; ++i) {
          const s = element('span', { class: 'aux-sizerentry' });
          s.textContent = typeof v[i] == 'string' ? v[i] : v[i].label;
          frag.appendChild(s);
        }
        S.appendChild(frag);

        outerWidth(
          this.label.element,
          true,
          outerWidth(this.sizer.element, true)
        );
      } else if (this.label) {
        this.label.element.style.width = null;
      }
    }

    if (I.entries) {
      I.entries = false;

      const _list = this._list;
      const entries = this.entries;

      for (let i = 0; i < entries.length; i++) {
        _list.appendChild(entries[i].element);
      }
    }

    if (I.selected || I.value) {
      I.selected = I.value = false;
      if (this._active) {
        removeClass(this._active, 'aux-active');
      }
      const entry = this.entries[O.selected];

      if (entry) {
        this._active = entry.element;
        addClass(entry.element, 'aux-active');
      } else {
        this._active = null;
      }
    }

    if (I.validate('show_list', 'resized')) {
      showList.call(this, O.show_list);
    }
  }

  /**
   * Get the currently selected {@link SelectEntry}.
   *
   * @method Select#current
   *
   * @returns {SelectEntry|Boolean} The currently selected {@link SelectEntry} or `null`.
   */
  current() {
    return this.get('selected_entry');
  }

  /**
   * Get the currently selected {@link SelectEntry}'s index. Just for the sake of completeness, this
   *   function abstracts `options.selected`.
   *
   * @method Select#currentIndex
   *
   * @returns {Integer|Boolean} The index of the currently selected {@link SelectEntry} or `-1`.
   */
  currentIndex() {
    return this.get('selected');
  }

  /**
   * Get the currently selected {@link SelectEntry}'s value.
   *
   * @method Select#currentValue
   *
   * @returns {Mixed|Boolean} The value of the currently selected {@link SelectEntry} or `undefined`.
   */
  currentValue() {
    const entry = this.current();
    return entry ? entry.get('value') : void 0;
  }

  set(key, value) {
    if (key === 'selected') {
      typecheckInteger(value);
      if (value < -1) throw new TypeError('expected Integer >= -1.');
    }

    value = super.set(key, value);

    switch (key) {
      case 'entries':
        this.setEntries(value);
        break;
    }
    return value;
  }
}

function onSelect(e) {
  const w = this.parent;
  const id = w.indexByEntry(this);
  const entry = this;
  e.stopPropagation();
  e.preventDefault();

  if (w.userset('selected', id) === false) return false;
  w.userset('value', this.options.value);
  /**
   * Is fired when a selection was made by the user. The arguments
   * are the value of the currently selected {@link SelectEntry}, its index, its label and the {@link SelectEntry} instance.
   *
   * @event Select#select
   *
   * @param {mixed} value - The value of the selected entry.
   * @param {number} value - The ID of the selected entry.
   * @param {string} value - The label of the selected entry.
   */
  w.emit('select', entry.options.value, id, entry.options.label);
  w.showList(false);

  return false;
}

/**
 * SelectEntry provides a {@link Label} as an entry for {@link Select}.
 *
 * @class SelectEntry
 *
 * @extends Label
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} [options.label=""] - The label of the entry. Kept for backward compatibility, deprecated, use label instead.
 * @property {mixed} [options.value] - The value of the selected entry.
 *
 */
export class SelectEntry extends Label {
  static get _options() {
    return Object.assign({}, Label.getOptionTypes(), {
      value: 'mixed',
    });
  }

  static get options() {
    return {
      value: null,
    };
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    addClass(this.element, 'aux-selectentry');
  }

  static get static_events() {
    return {
      click: onSelect,
    };
  }
}

/**
 * @member {Select} Select#sizer - A blind element for `auto_size`.
 */
defineChildWidget(Select, 'sizer', {
  create: Label,
  option: 'auto_size',
  toggle_class: true,
  default_options: {
    class: 'aux-sizer',
  },
});
