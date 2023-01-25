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
import { setDelayedFocus, createID } from '../utils/dom.js';
import { Timer } from '../utils/timers.js';
import { SymResize } from './widget.js';

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
  toggleClass,
} from '../utils/dom.js';
import { typecheckInteger } from '../utils/typecheck.js';
import {
  defineRender,
  defineMeasure,
  deferRender,
  deferMeasure,
} from '../renderer.js';

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the options <code>selected</code> and <code>value</code>.
 *
 * @event Select#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */

const SymEntriesChanged = Symbol('entries changes');

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
 * @property {Boolean} [options.auto_size=false] - If `true`, the Select is
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
      typing_delay: 'number',
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
      role: 'select',
      typing_delay: 250,
    };
  }

  static get static_events() {
    return {
      click: function () {
        this.set('show_list', !this.options.show_list);
      },
      set_show_list: function (v) {
        this.set('icon', v ? 'arrowup' : 'arrowdown');
        if (v) {
          const entry = this.get('selected_entry') || this.entries[0];
          if (entry) setDelayedFocus(entry.element);
        }
      },
      set_selected_entry: function (entry) {
        const entries = this.entries;
        entries.forEach((v) => v.element.removeAttribute('aria-selected'));
        if (entry) {
          this.update('selected', entries.indexOf(entry));
          this.update('value', entry.get('value'));
          this.update('label', entry.get('label'));
          this._list.setAttribute('aria-activedescendant', entry.get('id'));
          entry.element.setAttribute('aria-selected', 'true');
        } else {
          this.update('selected', -1);
          this.update('value', void 0);
          this.update('label', this.get('placeholder'));
          this._list.removeAttribute('aria-activedescendant');
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

  static get renderers() {
    return [
      defineRender(SymEntriesChanged, function () {
        const _list = this._list;

        this.entries.forEach((entry) => _list.appendChild(entry.element));
      }),
      defineMeasure(['show_list', 'list_class'], function (
        show_list,
        list_class
      ) {
        const { element, _list } = this;

        if (this.__timeout !== false) {
          window.clearTimeout(this.__timeout);
          this.__timeout = false;
        }

        if (show_list) {
          const ew = outerWidth(element, false);
          const cw = width();
          const ch = height();
          const sx = scrollLeft();
          const sy = scrollTop();

          return deferRender(() => {
            _list.className = 'aux-selectlist';
            if (list_class) addClass(_list, list_class);
            setStyles(_list, {
              opacity: '0',
              maxHeight: ch + 'px',
              maxWidth: cw + 'px',
              minWidth: ew + 'px',
            });
            this.set('_show_list', true);
            document.body.appendChild(_list);
            document.addEventListener('touchstart', this._globalTouchStart);
            document.addEventListener('mousedown', this._globalTouchStart);

            const lw = outerWidth(_list, true);
            const lh = outerHeight(_list, true);

            const top =
              Math.min(
                positionTop(element) + outerHeight(element, true),
                ch + sy - lh
              ) + 'px';
            const left = Math.min(positionLeft(element), cw + sx - lw) + 'px';

            return deferRender(() => {
              setStyles(_list, { top, left, opacity: '1' });
              element.setAttribute('aria-expanded', 'true');

              const current = this.current();

              if (!current) return;

              return deferMeasure(() => {
                const scrollTop =
                  current.element.offsetTop - _list.offsetHeight / 2;
                return deferRender(() => {
                  _list.scrollTop = scrollTop;
                });
              });
            });
          });
        } else {
          document.removeEventListener('touchstart', this._globalTouchStart);
          document.removeEventListener('mousedown', this._globalTouchStart);

          return deferRender(() => {
            element.removeAttribute('aria-expanded');
            setStyle(_list, 'opacity', '0');

            const duration = getDuration(_list);

            if (duration > 0) {
              this.__timeout = window.setTimeout(() => {
                this.set('_show_list', false);
              }, duration);
            } else {
              this.set('_show_list', false);
            }
          });
        }
      }),
      defineRender(['_show_list'], function (_show_list) {
        const { element, _list } = this;

        if (!_show_list) {
          _list.remove();
          setDelayedFocus(element);
          element.removeAttribute('aria-expanded');
        }
      }),
      defineRender(['selected', SymEntriesChanged], function (selected) {
        this.entries.forEach((entry, i) => {
          toggleClass(entry.element, 'aux-active', i === selected);
        });
      }),
      defineRender([SymResize, 'auto_size', SymEntriesChanged], function (auto_size) {
        if (auto_size) {
          const S = this.sizer.element;
          empty(S);
          const frag = document.createDocumentFragment();
          this.entries.forEach((entry) => {
            const s = element('span', { class: 'aux-sizerentry' });
            s.textContent = entry.get('label');
            frag.appendChild(s);
          });
          S.appendChild(frag);
          return deferMeasure(() => {
            const width = outerWidth(S, true);
            return deferRender(() => {
              if (this.label) outerWidth(this.label.element, true, width);
            });
          });
        } else {
          if (this.label) this.label.element.style.width = null;
        }
      }),
    ];
  }

  initialize(options) {
    this.__timeout = false;

    /**
     * @member {Array} Select#entries - An array containing all entry objects with members <code>label</code> and <code>value</code>.
     */
    this.entries = [];
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
    this._list.setAttribute('role', 'listbox');

    this._globalTouchStart = (e) => {
      if (this._list.contains(e.target) || this.element.contains(e.target))
        return;
      this.showList(false);
    };

    const sel = this.options.selected;
    const val = this.options.value;
    this.set('entries', this.options.entries);

    if (sel !== -1) {
      this.set('selected', sel);
    } else if (val !== void 0) {
      this.set('value', val);
    }

    this.__typing = '';
    this._timer = new Timer(() => {
      this.__typing = '';
    });
  }

  destroy() {
    this.clear();
    this._list.remove();
    this.removeChildNode(this.sizer?.element);
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
    this.invalidate(SymEntriesChanged);

    const selected = this.options.selected;

    // adjust selected
    if (selected !== -1 && selected >= index) {
      this.set('selected', selected + 1);
    }
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
    this.invalidate(SymEntriesChanged);
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
   * Get the index of a {@link SelectEntry} by its HTMLElement.
   *
   * @method Select#indexByElement
   *
   * @param {HTMLElement} element - The element of the {@link SelectEntry}.
   *
   * @returns {Integer} The index of the entry or `-1`.
   */
  indexByElement(element) {
    const entries = this.entries;
    for (let i = 0; i < entries.length; i++) {
      if (entries[i].element === element) return i;
    }
    return -1;
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
   * Get the next {@link SelectEntry} whose label starts with the given string.
   *
   * @method Select#nextEntryByPartialLabel
   *
   * @param {String} label - The label of the {@link SelectEntry}.
   * @param {Number} current - the current index to start searching.
   *
   * @returns {SelectEntry|Boolean} The {@link SelectEntry} or `null`.
   */
  nextEntryByPartialLabel(label, current) {
    const entries = this.entries;
    current = current || -1;
    current = Math.max(0, Math.min(this.entries.length - 1, current + 1));
    for (let i = current; i < entries.length; i++) {
      if (entries[i].options.label.toLowerCase().startsWith(label))
        return entries[i];
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
    this.element.setAttribute('aria-haspopup', 'listbox');

    super.draw(O, element);
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

  focusWhileTyping(key) {
    this._timer.restart(this.options.typing_delay);
    this.__typing += key;
    let entry;
    if (this.__typing.length > 1)
      entry = this.nextEntryByPartialLabel(this.__typing.toLowerCase());
    else
      entry = this.nextEntryByPartialLabel(
        this.__typing.toLowerCase(),
        this.indexByElement(document.activeElement)
      );
    if (entry) entry.element.focus();
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

function onFocusMove(O) {
  const { direction, speed } = O;
  const parent = this.parent;
  const last = parent.entries.length - 1;
  let i;
  if (speed === 'full') {
    if (direction === 'up' || direction === 'right') i = last;
    else i = 0;
  } else {
    i = parent.indexByEntry(this);
    if (direction === 'up' || direction === 'right') i -= 1;
    else i += 1;
    i = Math.max(0, Math.min(i, last));
  }
  setDelayedFocus(parent.entries[i].element);
}

function onKeyDown(e) {
  if (e.code === 'Tab') {
    this.parent.set('show_list', false);
    return false;
  }
  if (e.code === 'Escape') {
    this.parent.set('show_list', false);
    return false;
  }
  if (e.key.length === 1) {
    this.parent.focusWhileTyping(e.key);
    return false;
  }
  if (e.code === 'Enter' || e.code === 'Space') {
    this.element.click();
    return false;
  }
}

/**
 * SelectEntry provides a {@link Button} as an entry for {@link Select}.
 *
 * @class SelectEntry
 *
 * @extends Button
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} [options.label=""] - The label of the entry. Kept for backward compatibility, deprecated, use label instead.
 * @property {mixed} [options.value] - The value of the selected entry.
 *
 */
export class SelectEntry extends Button {
  static get _options() {
    return Object.assign({}, Button.getOptionTypes(), {
      value: 'mixed',
    });
  }

  static get options() {
    return {
      label: '',
      value: null,
      role: 'option',
    };
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    super.initialize(options);
    addClass(this.element, 'aux-selectentry');
    this.set('id', createID('aux-select-entry-'));
  }

  static get static_events() {
    return {
      click: onSelect,
      focus_move: onFocusMove,
      keydown: onKeyDown,
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
