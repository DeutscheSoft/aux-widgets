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

import { addClass, removeClass, createID } from './../utils/dom.js';
import { Container } from './container.js';
import { Button } from './button.js';
import { warning } from '../utils/warning.js';
import { ChildWidgets } from '../utils/child_widgets.js';
import { defineRender } from '../renderer.js';

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>select</code>.
 *
 * @event Buttons#useraction
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */

function compare(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((val, i) => val === arr2[i]);
}

function updateSelect(select, position, add) {
  if (Array.isArray(select)) {
    if (add === select.includes(position)) return select;

    if (!add) {
      select = select.filter((_position) => position !== _position);
    } else {
      select = select.concat([position]);
    }
  } else {
    if (add === (select === position)) return select;

    select = add ? position : -1;
  }

  return select;
}

function enforceMultiSelect(select, multi_select) {
  const is_array = Array.isArray(select);

  if (!is_array && !multi_select) return select;

  if (multi_select) {
    if (is_array) {
      if (multi_select === 1) return select;
      if (select.length <= multi_select) return select;

      return select.slice(0, multi_select);
    } else {
      return select === -1 ? [] : [select];
    }
  } else {
    return select.length ? select[0] : -1;
  }
}

function onButtonClick() {
  this.userset('state', !this.get('state'));
}

function onButtonUserset(key, value) {
  if (key !== 'state') return;

  // make sure this is a boolean
  value = !!value;

  const parent = this.parent;

  const O = parent.options;
  const position = parent.buttons.indexOf(this);
  const select = enforceMultiSelect(
    updateSelect(O.select, position, value),
    O.multi_select
  );

  if (select === O.select || (O.multi_select && compare(select, O.select))) {
    warning(this.element, 500);
    return;
  }

  return parent.userset('select', select);
}

function onButtonSetState(value) {
  // make sure this is a boolean
  value = !!value;

  const parent = this.parent;

  const O = parent.options;
  const position = parent.buttons.indexOf(this);
  const select = enforceMultiSelect(
    updateSelect(O.select, position, value),
    O.multi_select
  );

  if (value)
    this.element.setAttribute('aria-current', 'true');
  else
    this.element.setAttribute('aria-current', 'false');

    if (select === O.select) return;

  return parent.set('select', select);
}

function onButtonAdded(button, position) {
  const buttons = this.widget;

  button.on('click', onButtonClick);
  button.on('userset', onButtonUserset);
  button.on('set_state', onButtonSetState);

  let select = buttons.get('select');
  const length = buttons.getButtons().length;

  const correctIndex = (index) => {
    if (index >= position && position < length - 1) {
      return index + 1;
    }

    return index;
  };

  if (Array.isArray(select)) {
    select = select.map(correctIndex);
    if (button.get('state') && select.indexOf(position) === -1) {
      select = [position].concat(select);
      button.element.setAttribute('aria-current', 'true');
    } else {
      button.element.setAttribute('aria-current', 'false');
    }
  } else {
    select = correctIndex(select);
    if (button.get('state')) {
      select = position;
      button.element.setAttribute('aria-current', 'true');
    } else {
      button.element.setAttribute('aria-current', 'false');
    }
  }

  buttons.set('select', select);
  buttons.emit('added', button);

  buttons.triggerResize();
}

function onButtonRemoved(button, position) {
  const buttons = this.widget;

  button.off('click', onButtonClick);
  button.off('userset', onButtonUserset);
  button.off('set_state', onButtonSetState);

  let select = buttons.get('select');
  const length = buttons.getButtons().length;

  const correctIndex = (index) => {
    if (index > position && position < length + 1) {
      return index - 1;
    }

    return index;
  };

  if (Array.isArray(select)) {
    select = select.filter((index) => index !== position).map(correctIndex);
  } else {
    if (select === position) {
      select = -1;
    } else {
      select = correctIndex(select);
    }
  }

  buttons.set('select', select);
  buttons.emit('removed', button);

  buttons.triggerResize();
}

/**
 * Buttons is a list of ({@link Button})s, arranged
 * either vertically or horizontally. Single buttons can be selected by clicking.
 * If `multi_select` is enabled, buttons can be added and removed from
 * the selection by clicking on them. Buttons uses {@link warning}
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
export class Buttons extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), {
      buttons: 'array',
      direction: 'string',
      select: 'int|array',
      button_class: 'Button',
      multi_select: 'int',
      deselect: 'boolean',
    });
  }

  static get options() {
    return {
      buttons: [],
      direction: 'horizontal',
      select: -1,
      button_class: Button,
      multi_select: 0,
      deselect: false,
      role: 'listbox',
    };
  }

  static get static_events() {
    return {
      userset: function (key, value) {
        if (key !== 'select' || this.options.deselect) return;

        if (value === -1 || (Array.isArray(value) && value.length === 0))
          return false;
      },
      set_select: function (value) {
        const list = this.buttons.getList();
        const current = []
        const selected = Array.isArray(value)
          ? value
          : value === -1
          ? []
          : [value];
        for (let i = 0; i < list.length; i++) {
          // we use update, it avoids changing the state if it is already
          // correct.
          const state = selected.includes(i);
          list[i].update('state', state);
          if (state)
            current.push(list[i].get('id'));
          list[i].set('aria_current', state ? 'true' : 'false');
        }
        this.set('aria_current', current.join(' '));
      },
      set_multi_select: function (multi_select) {
        const O = this.options;

        const select = enforceMultiSelect(O.select, multi_select);

        this.update('select', select);

        this.set('aria_multiselectable', multi_select ? 'true' : 'false');
      },
      set_direction: function (direction) {
        this.set('aria_orientation', direction);
      },
    };
  }

  static get renderers() {
    return [
      defineRender('direction', function (direction) {
        const E = this.element;
        removeClass(E, 'aux-vertical', 'aux-horizontal');
        addClass(E, 'aux-' + direction);
      }),
    ];
  }

  initialize(options) {
    super.initialize(options);
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
    this.buttons.on('child_added', onButtonAdded);
    this.buttons.on('child_removed', onButtonRemoved);

    this.set('direction', this.options.direction);
    this.set('multi_select', this.options.multi_select);

    // the set() method would otherwise try to remove initial buttons
    const buttons = options.buttons;
    this.options.buttons = [];
    this.set('buttons', buttons);
  }

  draw(O, element) {
    addClass(element, 'aux-buttons');

    super.draw(O, element);
  }

  /**
   * Adds an array of buttons to the end of the list.
   *
   * @method Buttons#addButtons
   *
   * @param {Array.<string|object>} list - An Array containing
   *   Button instances, objects
   *   with options for the buttons (see {@link Button} for more
   *   information) or strings for the buttons labels.
   */
  addButtons(list) {
    return list.map((options) => this.addButton(options));
  }

  createButton(options) {
    if (options instanceof Button) {
      if (!options.get('id')) {
        options.set('id', createID('aux-button-'));
      }
      return options;
    } else {
      if (typeof options === 'string') {
        options = { label: options };
      } else if (options === void 0) {
        options = {};
      } else if (typeof options !== 'object') {
        throw new TypeError('Expected object of options.');
      }
      if (!options.id)
        options.id = createID('aux-button-');

      return new this.options.button_class(options);
    }
  }

  /**
   * Adds a {@link Button} to Buttons.
   *
   * @method Buttons#addButton
   *
   * @param {Button|Object|String} options - An alread instantiated {@link Button},
   *   an object containing options for a new {@link Button} to add
   *   or a string for the label of the newly created {@link Button}.
   * @param {integer} [position] - The position to add the {@link Button}
   *   to. If `undefined`, the {@link Button} is added to the end of the list.
   *
   * @returns {Button} The {@link Button} instance.
   */
  addButton(options, position) {
    const button = this.createButton(options);
    const buttons = this.getButtons();
    const element = this.element;

    if (!(position >= 0 && position < buttons.length)) {
      element.appendChild(button.element);
    } else {
      element.insertBefore(button.element, buttons[position].element);
    }

    if (button.parent !== this) {
      // if this button is a web component, the above appendChild would have
      // already triggered a call to addChild
      this.addChild(button);
    }
    button.addEventListener('keydown', function (e) {
      let sibling, self;
      const siblings = this.element.parentNode.querySelectorAll('.aux-button');
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i] === this.element) {
          self = i;
          break;
        }
      }
      if (e.code === 'ArrowLeft' || e.code === 'ArrowUp') {
        sibling = siblings[Math.max(0, self - 1)];
      } else if (e.code === 'ArrowRight' || e.code === 'ArrowDown') {
        sibling = siblings[Math.min(siblings.length - 1, self + 1)];
      } else if (e.code === 'Home' || e.code === 'PageUp') {
        sibling = siblings[0];
      } else if (e.code === 'End' || e.code === 'PageDown') {
        sibling = siblings[siblings.length - 1];
      }
      if (sibling) sibling.focus();
    });

    return button;
  }

  /**
   * Removes a {@link Button} from Buttons.
   *
   * @method Buttons#removeButton
   *
   * @param {integer|Button} button - button index or the {@link Button}
   *   instance to be removed.
   * @param {Boolean} destroy - destroy the {@link Button} after removal.
   */
  removeButton(button, destroy) {
    const buttons = this.buttons;
    let position = -1;

    if (button instanceof Button) {
      position = buttons.indexOf(button);
    } else if (typeof button === 'number') {
      position = button;
      button = buttons.at(position);
    }

    if (!button || position === -1) throw new Error('Unknown button.');

    this.element.removeChild(button.element);

    if (buttons.at(position) === button) {
      // NOTE: if we remove a child which is a web component,
      // it will itself call removeChild
      this.removeChild(button);
    }

    if (destroy) button.destroy();
  }

  /**
   * @returns {Button[]} The list of {@link Button}s.
   * @method Buttons#getButtons
   */
  getButtons() {
    return this.buttons.getList();
  }

  /**
   * Removes all buttons.
   *
   * @method Buttons#empty
   */
  empty() {
    this.buttons.forEach((button) => this.removeButton(button, true));
  }

  destroy() {
    this.buttons.destroy();
    this.set('buttons', []);
    super.destroy();
  }

  /**
   * Checks if an index or {@link Button} is selected.
   *
   * @method Buttons#isSelected
   *
   * @param {Integer|Button} button - button index or {@link Button} instance.
   *
   * @returns {Boolean}
   */
  isSelected(probe) {
    const button = typeof probe === 'number' ? this.buttons.at(probe) : probe;

    if (!button) throw new Error('Unknown button.');

    return button.get('state');
  }

  set(key, value) {
    if (key === 'buttons') {
      // remove all buttons which were added using this option
      this.options.buttons.forEach((b) => this.removeButton(b, true));
      value = this.addButtons(value || []);
    } else if (key === 'select') {
      value = enforceMultiSelect(value, this.options.multi_select);
    }

    return super.set(key, value);
  }
}
