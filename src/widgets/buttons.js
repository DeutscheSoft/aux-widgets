/*
 * This file is part of A.UX.
 *
 * A.UX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * A.UX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { define_class } from './../widget_helpers.js';
import { add_class, remove_class } from './../utils/dom.js';
import { Container } from './container.js';
import { Button } from './button.js';
import { Warning } from '../implements/warning.js';
import { ChildWidgets } from '../utils/child_widgets.js';

 /**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>select</code>.
 *
 * @event Buttons#useraction
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */

function calculate_select(buttons)
{
  const list = buttons.get_buttons();
  const old_select = buttons.get('select');

  const should_be_selected = list.filter((b) => b.get('state')).map((b) => list.indexOf(b));
  const are_selected = Array.isArray(old_select) ? old_select : (old_select === -1 ? [] : [ old_select ]);

  if (are_selected.length !== should_be_selected.length) return should_be_selected;

  for (let i = 0; i < are_selected.length; i++)
  {
    if (should_be_selected.indexOf(are_selected[i]) === -1)
      return should_be_selected;
  }

  return old_select;
}

function update_select(select, position, add)
{
  if (Array.isArray(select)) {
      if (add === select.includes(position)) return select;

      if (!add) {
          select = select.filter((_position) => position !== _position);
      } else {
          select = select.concat([ position ]);
      }
  } else {
      if (add === (select === position)) return select;

      select = add ? position : -1;
  }

  return select;
}

function enforce_multi_select(select, multi_select)
{
  const is_array = Array.isArray(select);

  if (!is_array && !multi_select) return select;

  if (multi_select)
  {
    if (is_array)
    {
      if (multi_select === 1) return select;
      if (select.length <= multi_select) return select;

      return select.slice(0, multi_select);
    }
    else
    {
      return select === -1 ? [] : [ select ];
    }
  }
  else
  {
    return select.length ? select[0] : -1;
  }
}

function on_button_click()
{
  this.userset('state', !this.get('state'));
}

function on_button_userset(key, value)
{
  if (key !== 'state') return;

  // make sure this is a boolean
  value = !!value;

  const parent = this.parent;

  const O = parent.options;
  const position = parent.buttons.indexOf(this);
  let select = enforce_multi_select(update_select(O.select, position, value), O.multi_select);

  if (select === O.select) return;

  return parent.userset("select", select);
}

function on_button_set_state(value)
{
  // make sure this is a boolean
  value = !!value;

  const parent = this.parent;

  const O = parent.options;
  const position = parent.buttons.indexOf(this);
  let select = enforce_multi_select(update_select(O.select, position, value), O.multi_select);

  if (select === O.select) return;

  return parent.set("select", select);
}

function on_button_added(button, position)
{
  const buttons = this.widget;

  button.on('click', on_button_click);
  button.on('userset', on_button_userset);
  button.on('set_state', on_button_set_state);

  let select = buttons.get('select');
  let length = buttons.get_buttons().length;

  const correct_index = (index) => {
    if (index >= position && position < length - 1)
    {
      return index + 1;
    }

    return index;
  };

  if (Array.isArray(select))
  {
    select = select.map(correct_index);
    if (button.get('state') && select.indexOf(position) === -1)
      select = [ position ].concat(select);
  }
  else
  {
    select = correct_index(select);
    if (button.get('state'))
      select = position;
  }

  buttons.set('select', select);
  buttons.emit('added', button);

  buttons.trigger_resize();
}

function on_button_removed(button, position)
{
  const buttons = this.widget;

  button.off('click', on_button_click);
  button.off('userset', on_button_userset);
  button.off('set_state', on_button_set_state);

  let select = buttons.get('select');
  let length = buttons.get_buttons().length;

  const correct_index = (index) => {
    if (index > position && position < length + 1)
    {
      return index - 1;
    }

    return index;
  };

  if (Array.isArray(select))
  {
    select = select.filter((index) => index !== position).map(correct_index);
  }
  else
  {
    if (select === position)
    {
      select = -1;
    }
    else
    {
      select = correct_index(select);
    }
  }

  buttons.set('select', select);
  buttons.emit('removed', button);

  buttons.trigger_resize();
}

export const Buttons = define_class({
    /**
     * Buttons is a list of ({@link Button})s, arranged
     * either vertically or horizontally. Single buttons can be selected by clicking.
     * If `multi_select` is enabled, buttons can be added and removed from
     * the selection by clicking on them. Buttons implements {@link Warning}
     * to highlight buttons which can't be selected due to `options.multi_select=n`.
     *
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Array<Object|String>} [options.buttons=[]] - A list of
     *   {@link Button} instances, button options objects or label strings
     *   which is converted to button instances on init. If `get` is called,
     *   a converted list of button instances is returned. Example:
     *  `[new Button({label:'Button#1'}), 'Button#2', {label:'Button#3'}]`
     * @property {String} [options.direction="horizontal"] - The layout
     *   of the button list, either "horizontal" or "vertical".
     * @property {Integer|Button|Array<Integer>|Array<Button>} [options.select=-1]
     *   The {@link Button} or a list of {@link Button}s, depending on
     *   `options.multi_select`, to highlight. Expects
     *   either the buttons index starting from zero or the {@link Button}
     *   instance(s) itself. Set to `-1` or `[]` to
     *   de-select any selected button.
     * @property {Object} [options.button_class=Button] - A class to
     *   be used for instantiating new buttons.
     * @property {Integer} [options.multi_select=0] - Set to `0` to disable
     *   multiple selection, `1` for unlimited and any other number for
     *   a defined maximum amount of selectable buttons. If an array is given
     *   for `options.select` while this option is `0`, the first entry
     *   will be used.
     * @property {Boolean} [options.deselect=false] - Define if single-selection
     *   (`options.multi_select=false`) can be de-selected.
     * 
     * @class Buttons
     * 
     * @extends Container
     * 
     * @mixes Warning
     * 
     */
    /**
     * A {@link Button} was added to Buttons.
     *
     * @event Buttons#added
     * 
     * @param {Button} button - The {@link Button} which was added to Buttons.
     */
    /**
     * A {@link Button} was removed from the Buttons.
     *
     * @event Buttons#removed
     * 
     * @param {Button} button - The {@link Button} instance which was removed.
     */
    Extends: Container,
    Implements: Warning,
    _options: Object.assign(Object.create(Container.prototype._options), {
        buttons: "array",
        direction: "string",
        select: "int|array",
        button_class: "Button",
        multi_select: "int",
        deselect: "boolean",
    }),
    options: {
        buttons: [],
        direction: "horizontal",
        select: -1,
        button_class: Button,
        multi_select: 0,
        deselect: false,
    },
    static_events: {
        userset: function (key, value) {
          if (key !== 'select' || this.options.deselect) return;

          if (value === -1 || Array.isArray(value) && value.length === 0)
            return false;
        },
        set_select: function(value) {
            const list = this.buttons.getList();
            const selected = Array.isArray(value) ? value : (value === -1 ? [ ] : [ value ]);
            for (let i = 0; i < list.length; i++)
            {
              // we use update, it avoids changing the state if it is already
              // correct.
              list[i].update('state', selected.includes(i));
            }
        },
        set_multi_select: function (multi_select) {
            const O = this.options;

            let select = enforce_multi_select(O.select, multi_select);

            this.update('select', select);
        },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Buttons#element - The main DIV container.
         *   Has class <code>.aux-buttons</code>.
         */
        /**
         * @member {ChildWidgets} Buttons#buttons - An instance of {@link ChildWidgets} holding all
         *   {@link Button}s.
         */
        this.buttons = new ChildWidgets(this, {
          filter: Button,
        });
        this.buttons.on('child_added', on_button_added);
        this.buttons.on('child_removed', on_button_removed);

        this.set("direction", this.options.direction);
        this.set("multi_select", this.options.multi_select);

        // the set() method would otherwise try to remove initial buttons
        const buttons = options.buttons;
        this.options.buttons = [];
        this.set("buttons", buttons);
    },
    draw: function(O, element)
    {
      add_class(element, "aux-buttons");

      Container.prototype.draw.call(this, O, element);
    },
    /**
     * Adds an array of buttons to the end of the list.
     *
     * @method Buttons#add_buttons
     * 
     * @param {Array.<string|object>} list - An Array containing
     *   Button instances, objects
     *   with options for the buttons (see {@link Button} for more
     *   information) or strings for the buttons labels.
     */
    add_buttons: function (list) {
      return list.map((options) => this.add_button(options));
    },

    create_button: function (options) {
      if (options instanceof Button) {
        return options;
      } else {
        if (typeof options === "string")
        {
          options = {label: options};
        }
        else if (options === void(0))
        {
          options = {};
        }
        else if (typeof options !== 'object')
        {
          throw new TypeError('Expected object of options.');
        }

        return  new this.options.button_class(options);
      }
    },
    /**
     * Adds a {@link Button} to Buttons.
     *
     * @method Buttons#add_button
     * 
     * @param {Button|Object|String} options - An alread instantiated {@link Button},
     *   an object containing options for a new {@link Button} to add
     *   or a string for the label of the newly created {@link Button}.
     * @param {integer} [position] - The position to add the {@link Button}
     *   to. If `undefined`, the {@link Button} is added to the end of the list.
     * 
     * @returns {Button} The {@link Button} instance.
     */
    add_button: function (options, position) {
        const button = this.create_button(options);
        const buttons = this.get_buttons();
        const element = this.element;

        if (!(position >= 0 && position < buttons.length)) {
          element.appendChild(button.element);
        } else {
          element.insertBefore(button.element, buttons[position].element);
        }

        if (button.parent !== this)
        {
          // if this button is a web component, the above appendChild would have
          // already triggered a call to add_child
          this.add_child(button);
        }

        return button;
    },
    /**
     * Removes a {@link Button} from Buttons.
     *
     * @method Buttons#remove_button
     * 
     * @param {integer|Button} button - button index or the {@link Button}
     *   instance to be removed.
     * @param {Boolean} destroy - destroy the {@link Button} after removal.
     */
    remove_button: function (button, destroy) {
        const buttons = this.buttons;
        let position = -1;

        if (button instanceof Button)
        {
          position = buttons.indexOf(button);
        }
        else if (typeof(button) === 'number')
        {
          position = button;
          button = buttons.at(position);
        }

        if (!button || position === -1)
          throw new Error('Unknown button.');

        this.element.removeChild(button.element);

        if (buttons.at(position) === button)
        {
          // NOTE: if we remove a child which is a web component,
          // it will itself call remove_child
          this.remove_child(button);
        }

        if (destroy)
            button.destroy();
    },
    /**
     * @returns {Button[]} The list of {@link Button}s.
     * @method Buttons#get_buttons
     */
    get_buttons: function()
    {
      return this.buttons.getList();
    },
    /**
     * Removes all buttons.
     * 
     * @method Buttons#empty
     */
    empty: function () {
        this.buttons.forEach((button) => this.remove_button(button, true));
    },
    destroy: function () {
        this.buttons.destroy();
        this.set('buttons', []);
        Container.prototype.destroy.call(this);
    },

    redraw: function() {
        Container.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;

        if (I.direction) {
            I.direction = false;
            var E = this.element;
            remove_class(E, "aux-vertical", "aux-horizontal");
            add_class(E, "aux-"+O.direction);
        }
    },
    /**
     * Checks if an index or {@link Button} is selected.
     *
     * @method Buttons#is_selected
     * 
     * @param {Integer|Button} button - button index or {@link Button} instance.
     * 
     * @returns {Boolean}
     */
    is_selected: function (probe) {
        const button = typeof(probe) === 'number' ? this.buttons.at(probe) : probe;

        if (!button)
          throw new Error('Unknown button.');

        return button.get('state');
    },
    set: function (key, value)
    {
      if (key === 'buttons')
      {
        // remove all buttons which were added using this option
        this.options.buttons.forEach((b) => this.remove_button(b, true));
        value = this.add_buttons(value || []);
      }
      else if (key === 'select')
      {
        value = enforce_multi_select(value, this.options.multi_select);
      }

      return Container.prototype.set.call(this, key, value);
    },
});
