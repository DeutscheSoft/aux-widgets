/*
 * This file is part of Toolkit.
 *
 * Toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

/* jshint -W014 */

import { define_class } from './../widget_helpers.js';
import { Button } from './button.js';
import { Label } from './label.js';
import {
    element, add_class, outer_width, width, height, scroll_left, scroll_top, set_styles,
    outer_height, position_top, position_left, set_style, get_duration, empty, remove_class
  } from '../utils/dom.js';
import { S } from '../dom_scheduler.js';
 
 /**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the options <code>selected</code> and <code>value</code>.
 *
 * @event Select#useraction
 * 
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
 
function hide_list() {
    this.__transition = false;
    this.__timeout = false;
    if (!this.__open) {
        this._list.remove();
    } else {
        document.addEventListener("touchstart", this._global_touch_start);
        document.addEventListener("mousedown", this._global_touch_start);
    }
}
function show_list(show) {
    if (show) {
        var ew = outer_width(this.element, true);
        document.body.appendChild(this._list);
        var cw = width();
        var ch = height();
        var sx = scroll_left();
        var sy = scroll_top();
        set_styles(this._list, {
            "opacity": "0",
            "maxHeight": ch+"px",
            "maxWidth": cw+"px",
            "minWidth": ew+"px"
        });
        var lw = outer_width(this._list, true);
        var lh = outer_height(this._list, true);
        set_styles(this._list, {
            "top": Math.min(position_top(this.element) + outer_height(this.element, true), ch + sy - lh) + "px",
            "left": Math.min(position_left(this.element), cw + sx - lw) + "px",
        });
    } else {
        document.removeEventListener("touchstart", this._global_touch_start);
        document.removeEventListener("mousedown", this._global_touch_start);
    }
    set_style(this._list, "opacity", show ? "1" : "0");
    this.__transition = true;
    this.__open = show;
    if (this.__timeout !== false) window.clearTimeout(this.__timeout);
    var dur = get_duration(this._list);
    this.__timeout = window.setTimeout(hide_list.bind(this), dur);
}

function low_remove_entry(entry) {
  var li = entry.element;
  var entries = this.entries;
  var id = entries.indexOf(entry);

  if (id === -1)
  {
    console.error('element %o not found in %o', entry.get('value'), entries.map((e) => e.get('value')));
    throw new Error("Entry removed twice.");
  }

  // remove from DOM
  if (li.parentElement == this._list)
      li.remove();
  // remove from list
  entries.splice(id, 1);
  // selection
  var sel = this.options.selected;
  if (sel !== false) {
      if (sel > id) {
          this.options.selected --;
      } else if (sel === id) {
          this.options.selected = false;
          this.set("label", "");
      }
  }
  this.invalid.entries = true;
  this.select(this.options.selected);
  /**
   * Is fired when a new entry is added to the list.
   * 
   * @event Select.entryremoved
   * 
   * @param {Object} entry - An object containing the members <code>label</code> and <code>value</code>.
   */
  this.emit("entryremoved", entry);
}

export const Select = define_class({
    /**
     * Select provides a {@link Button} with a select list to choose from
     * a list of {@SelectEntry}.
     *
     * @class Select
     * 
     * @extends Button
     *
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Integer|Boolean} [options.selected=false] - The index of the selected {@SelectEntry}.
     *   Set to `false` to unselect any already selected entries.
     * @property {mixed} [options.value] - The value of the selected entry.
     * @property {Boolean} [options.auto_size=true] - If `true`, the Select is
     *   auto-sized to be as wide as the widest {@SelectEntry}.
     * @property {Array<Object>} [options.entries=[]] - The list of {@SelectEntry}. Each member is an
     *   object with the two properties <code>label</code> and <code>value</code>, a string used
     *   as label for constructing a {@SelectEntry} or an instance of {@SelectEntry}.
     * @property {String|Boolean} [options.placeholder=false] - Placeholder test
     *   for the button label. Set to <code>false</code> to have an empty
     *   placeholder. This placeholder is shown when no entry is selected.
     *
     */
    Extends: Button,
    _options: Object.assign(Object.create(Button.prototype._options), {
        entries: "array",
        selected: "int",
        value: "mixed",
        auto_size: "boolean",
        show_list: "boolean",
        sort: "function",
        resized: "boolean",
        placeholder: "string|boolean",
    }),
    options: {
        entries: [], // A list of strings or objects {label: "Title", value: 1} or SelectEntry instance
        selected: false,
        value: false,
        auto_size: true,
        show_list: false,
        icon: "arrowdown",
        placeholder: false,
    },
    static_events: {
        click: function() { this.set("show_list", !this.options.show_list); },
        set_show_list: function (v) {this.set("icon", (v ? "arrowup" : "arrowdown"));},
    },
    initialize: function (options)  {
        this.__open = false;

        this.__timeout = -1;
        
        /**
         * @member {Array} Select#entries - An array containing all entry objects with members <code>label</code> and <code>value</code>.
         */
        this.entries = [];
        this._active = null;
        Button.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Select#element - The main DIV container.
         *   Has class <code>.aux-select</code>.
         */
        
        /**
         * @member {HTMLListElement} Select#_list - A HTML list for displaying the entry labels.
         *   Has class <code>.aux-selectlist</code>.
         */
        this._list = element("div", "aux-selectlist");
        this._global_touch_start = function (e) {
            if (this.__open && !this.__transition &&
                !this._list.contains(e.target) &&
                !this.element.contains(e.target)) {

                this.show_list(false);
            }
        }.bind(this);
        var sel = this.options.selected;
        var val = this.options.value; 
        this.set("entries",  this.options.entries);
        if (sel === false && val !== false) {
            this.set("value", val);
        } else {
            this.set("selected", sel);
        }
    },
    destroy: function () {
        this.clear();
        this._list.remove();
        Button.prototype.destroy.call(this);
    },
    
    /**
     * Show or hide the select list
     * 
     * @method Select#show_list
     * 
     * @param {boolean} show - `true` to show and `false` to hide the list
     *   of {@link SelectEntry}.
     */
    show_list: function (s) {
        this.set("show_list", !!s);
    },
    
    /**
     * Select a {@link SelectEntry} by its index.
     * 
     * @method Select#select
     * 
     * @param {Integer} index - The index of the {@link SelectEntry} to select.
     */
    select: function (id) {
        this.set("selected", id);
    },
    /**
     * Select a {@link SelectEntry} by its value.
     * 
     * @method Select#select_value
     * 
     * @param {mixed} value - The value of the {@link SelectEntry} to select.
     */
    select_value: function (value) {
        var id = this.index_by_value.call(this, value);
        this.set("selected", id);
    },
    /**
     * Select a {@link SelectEntry} by its label.
     * 
     * @method Select#select_label
     * 
     * @param {mixed} label - The label of the {@link SelectEntry} to select.
     */
    select_label: function (label) {
        var id = this.index_by_label.call(this, label);
        this.set("selected", id);
    },
    /**
     * Replaces the list of {@link SelectEntry} to select from with an entirely new one.
     * 
     * @method Select#set_entries
     * 
     * @param {Array} entries - An array of {@link SelectEntry} to set as the new list to select from.
     *   Please refer to {@link Select#add_entry} for more details.
     */
    set_entries: function (entries) {
        // Replace all entries with a new options list
        this.clear();
        this.add_entries(entries);
        this.select(this.index_by_value.call(this, this.options.value));
    },
    /**
     * Adds new {@link SelectEntry} to the end of the list to select from.
     * 
     * @method Select#add_entries
     * 
     * @param {Array} entries - An array of {@link SelectEntry} to add to the end of the list
     *   of {@link SelectEntry} to select from. Please refer to {@link Select#add_entry}
     *   for more details.
     */
    add_entries: function (entries) {
        for (var i = 0; i < entries.length; i++)
            this.add_entry(entries[i]);
    },
    /**
     * Adds a single {@link SelectEntry} to the end of the list.
     * 
     * @method Select#add_entry
     * 
     * @param {mixed} entry - A string to be displayed and used as the value,
     *   an object with members <code>label</code> and <code>value</code>
     *   or an instance of {@link SelectEntry}.
     * @param {integer} [position] - The position in the list to add the new
     *   entry at. If omitted, the entry is added at the end.
     * 
     * @emits Select.entryadded
     */
    add_entry: function (ent, position) {
        var entry;

        if (typeof(ent) === 'object' && ent instanceof SelectEntry)
        {
            entry = ent;
        }
        else if (typeof ent === 'string')
        {
            entry = new SelectEntry({
                value: ent,
                label: ent,
            });
        }
        else if (typeof ent === 'object' && 'value' in ent && 'label' in ent)
        {
            entry = new SelectEntry({
                value: ent.value,
                label: ent.label,
            });
        }
        else
        {
          throw new TypeError('Unsupported type of entry.');
        }

        if (position !== void(0))
        {
          if (typeof(position) !== 'number')
            throw new TypeError('Expected integer.');

          if (position < 0 || position > this.entries.length)
            throw new TypeError('Index out of bounds.');

          this.entries.splice(position, 0, entry);
        }

        this.add_child(entry);
    },
    add_child: function(child)
    {
        Button.prototype.add_child.call(this, child);

        if (!(child instanceof SelectEntry)) return;

        const O = this.options;
        const entries = this.entries;
        const entry = child;

        if (!entries.includes(entry))
          entries.push(entry);

        if (O.sort)
          entries.sort(O.sort);

        const index = entries.indexOf(entry);
        
        // invalidate entries.
        this.invalid.entries = true;

        const selected = this.options.selected;

        // adjust selected
        if (selected !== false && selected >= index)
        {
            this.set("selected", selected+1);
        }
        this.trigger_draw();
        /**
         * Is fired when a new {@link SelectEntry} is added to the list.
         * 
         * @event Select#entryadded
         * 
         * @param {SelectEntry} entry - A new {@link SelectEntry}.
         */
        this.emit("entryadded", entry);
    },
    /**
     * Remove a {@link SelectEntry} from the list by its index.
     * 
     * @method Select#remove_id
     * 
     * @param {Integer} index - The index of the {@link SelectEntry} to be removed from the list.
     * 
     * @emits Select#entryremoved
     */
    remove_index: function (index) {
        var entry = this.entries[index];
        this.remove_child(entry);
    },
    /**
     * Remove a {@link SelectEntry} from the list by its value.
     * 
     * @method Select#remove_value
     * 
     * @param {mixed} value - The value of the {@link SelectEntry} to be removed from the list.
     * 
     * @emits Select#entryremoved
     */
    remove_value: function (val) {
        this.remove_id(this.index_by_value.call(this, val));
    },
    /**
     * Remove an entry from the list by its label.
     * 
     * @method Select#remove_label
     * 
     * @param {string} label - The label of the entry to be removed from the list.
     * 
     * @emits Select#entryremoved
     */
    remove_label: function (label) {
        this.remove_id(this.index_by_label.call(this, label));
    },
    /**
     * Remove an entry from the list.
     * 
     * @method Select#remove_entry
     * 
     * @param {SelectEntry} entry - The {@link SelectEntry} to be removed from the list.
     * 
     * @emits Select#entryremoved
     */
    remove_entry: function (entry) {
        this.remove_child(entry);
    },
    remove_entries: function (a) {
        for (var i = 0; i < a.length; i++)
            this.remove_entry(a[i]);
    },
    remove_child: function(child) {
      Button.prototype.remove_child.call(this, child);
      if (SelectEntry.prototype.isPrototypeOf(child)) {
        low_remove_entry.call(this, child);
      }
    },
    /**
     * Get the index of a {@link SelectEntry} by its value.
     * 
     * @method Select#index_by_value
     * 
     * @param {Mixed} value - The value of the {@link SelectEntry}.
     * 
     * @returns {Integer|Boolean} The index of the entry or `false`.
     */
    index_by_value: function (val) {
        var entries = this.entries;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].options.value === val)
                return i;
        }
        return false;
    },
    /**
     * Get the index of a {@link SelectEntry} by its label/label.
     * 
     * @method Select#index_by_label
     * 
     * @param {String} label - The label/label of the {@link SelectEntry}.
     * 
     * @returns {Integer|Boolean} The index of the entry or `false`.
     */
    index_by_label: function (label) {
        var entries = this.entries;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].options.label === label)
                return i;
        }
        return false;
    },
    /**
     * Get the index of a {@link SelectEntry} by the {@link SelectEntry} itself.
     * 
     * @method Select#index_by_entry
     * 
     * @param {SelectEntry} entry - The {@link SelectEntry}.
     * 
     * @returns {Integer|Boolean} The index of the entry or `false`.
     */
    index_by_entry: function (entry) {
        var pos = this.entries.indexOf(entry);
        return pos === -1 ? false : pos;
    },
    /**
     * Get a {@link SelectEntry} by its value.
     * 
     * @method Select#entry_by_value
     * 
     * @param {Mixed} value - The value of the {@link SelectEntry}.
     * 
     * @returns {SelectEntry|False} The {@link SelectEntry} or `false`.
     */
    entry_by_value: function (val) {
        var entries = this.entries;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].options.value === val)
                return entries[i];
        }
        return false;
    },
    /**
     * Get a {@link SelectEntry} by its label/label.
     * 
     * @method Select#entry_by_label
     * 
     * @param {String} label - The label of the {@link SelectEntry}.
     * 
     * @returns {SelectEntry|Boolean} The {@link SelectEntry} or `false`.
     */
    entry_by_label: function (label) {
        var entries = this.entries;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].options.label === label)
                return entries[i];
        }
        return false;
    },
    /**
     * Get a {@link SelectEntry} by its index.
     * 
     * @method Select#entry_by_index
     * 
     * @param {Integer} index - The index of the {@link SelectEntry}.
     * 
     * @returns {SelectEntry|Boolean} The {@link SelectEntry} or `false`.
     */
    entry_by_index: function (index) {
        var entries = this.entries;
        if (index >= 0 && index < entries.length && entries[index])
            return entries[index];
        return false;
    },
    /**
     * Get a value by its {@link SelectEntry} index.
     * 
     * @method Select#value_by_index
     * 
     * @param {Integer} index - The index of the {@link SelectEntry}.
     * 
     * @returns {Mixed|Boolean} The value of the {@link SelectEntry} or `false`.
     */
    value_by_index: function(index) {
        var entries = this.entries;
        if (index >= 0 && index < entries.length && entries[index]) {
          return entries[index].options.value;
        }
        return false;
    },
    /**
     * Get the value of a {@link SelectEntry}.
     * 
     * @method Select#value_by_entry
     * 
     * @param {SelectEntry} entry - The {@link SelectEntry}.
     * 
     * @returns {mixed} The value of the {@link SelectEntry}.
     */
    value_by_entry: function(entry) {
        return entry.options.value;
    },
    /**
     * Get the value of a {@link SelectEntry} by its label/label.
     * 
     * @method Select#value_by_label
     * 
     * @param {String} label - The label of the {@link SelectEntry}.
     * 
     * @returns {Mixed|Boolean} The value of the {@link SelectEntry} or `false`.
     */
    value_by_label: function (label) {
        var entries = this.entries;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].options.label === label)
                return entries[i].options.value;
        }
        return false;
    },
    /**
     * Remove all {@link SelectEntry} from the list.
     * 
     * @method Select#clear
     * 
     * @emits Select#cleared
     */
    clear: function () {
        empty(this._list);
        this.select(false);
        var entries = this.entries.slice(0);
        for (var i = 0; i < entries.length; i++) {
          this.remove_child(entries[i]);
        }
        /**
         * Is fired when the list is cleared.
         * 
         * @event Select.cleared
         */
        this.emit("cleared");
    },
    draw: function(O, element)
    {
      add_class(element, "aux-select");

      Button.prototype.draw.call(this, O, element);
    },

    redraw: function() {
        Button.prototype.redraw.call(this);

        var I = this.invalid;
        var O = this.options;
        var E = this.element;

        if (I.entries)
        {
          I.entries = false;

          const _list = this._list;
          const entries = this.entries;

          for (let i = 0; i < entries.length; i++)
          {
            _list.appendChild(entries[i].element);
          }
        }

        if (I.selected || I.value) {
            I.selected = I.value = false;
            if (this._active) {
                remove_class(this._active, "aux-active");
            }
            var entry = this.entries[O.selected];

            if (entry) {
                this._active = entry.element;
                add_class(entry.element, "aux-active");
            } else {
                this._active = null;
            }
        }

        if (I.validate("entries", "auto_size")) {

            I.show_list = true;

            var L;

            if (O.auto_size && (L = this._label)) {
                var width = 0;
                E.style.width = "auto";
                var orig_content = document.createDocumentFragment();
                while (L.firstChild) orig_content.appendChild(L.firstChild);
                var entries = this.entries;
                for (var i = 0; i < entries.length; i++) {
                    L.appendChild(document.createTextNode(entries[i].options.label));
                    L.appendChild(document.createElement("BR"));
                }
                S.add(function() {
                    width = outer_width(E, true);
                    S.add(function() {
                        while (L.firstChild) L.removeChild(L.firstChild);
                        L.appendChild(orig_content);
                        outer_width(E, true, width);
                    }, 1);
                });
            }
        }

        if (I.validate("show_list", "resized")) {
            show_list.call(this, O.show_list);
        }
    },
    /**
     * Get the currently selected {@link SelectEntry}.
     * 
     * @method Select#current
     * 
     * @returns {SelectEntry|Boolean} The currently selected {@link SelectEntry} or `false`.
     */
    current: function() {
        if (this.options.selected !== false)
            return this.entries[this.options.selected];
        return false;
    },
    /**
     * Get the currently selected {@link SelectEntry}'s index. Just for the sake of completeness, this
     *   function abstracts `options.selected`.
     * 
     * @method Select#current_index
     * 
     * @returns {Integer|Boolean} The index of the currently selected {@link SelectEntry} or `false`.
     */
    current_index: function() {
        return this.options.selected;
    },
    /**
     * Get the currently selected {@link SelectEntry}'s value.
     * 
     * @method Select#current_value
     * 
     * @returns {Mixed|Boolean} The value of the currently selected {@link SelectEntry} or `false`.
     */
    current_value: function() {
        var w = this.current();
        if (w) return w.get("value");
        return false;
    },
    set: function (key, value) {
        if (key === "value") {
            this.set("selected", this.index_by_value.call(this, value));
            return;
        }
        
        value = Button.prototype.set.call(this, key, value);

        switch (key) {
            case "selected":
                var entry = this.current();
                if (entry !== false) {
                    Button.prototype.set.call(this, "value", entry.options.value); 
                    this.set("label", entry.options.label);
                } else {
                    Button.prototype.set.call(this, "value", void 0); 
                    this.set("label", this.get('placeholder'));
                }
                break;
            case "entries":
                this.set_entries(value);
                break;
        }
        return value;
    }
});


function on_select(e) {
    var w = this.parent;
    var id = w.index_by_entry(this);
    var entry = this;
    e.stopPropagation();
    e.preventDefault();

    if (w.userset("selected", id) === false) return false;
    w.userset("value", this.options.value);
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
    w.emit("select", entry.options.value, id, entry.options.label);
    w.show_list(false);

    return false;
}

export const SelectEntry = define_class({
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
    Extends: Label,
    
    _options: Object.assign(Object.create(Label.prototype._options), {
        value: "mixed",
    }),
    options: {
        value: null
    },
    initialize: function (options) {
        if (!options.element) options.element = element("div");
        Label.prototype.initialize.call(this, options);
        add_class(this.element, "aux-selectentry");
    },
    static_events: {
      click: on_select
    }
});
