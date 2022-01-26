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

import { Widget } from './widget.js';
import { element, addClass, removeClass } from './../utils/dom.js';
import { defineRender } from '../renderer.js';

const SymEditing = Symbol('__editing changed');

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>value</code>.
 *
 * @event Value#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
function valueClicked() {
  const O = this.options;
  if (O.set === false) return;
  if (this.__editing) return false;
  this._input.setAttribute('value', O.value);
  this._input.focus();
  /**
   * Is fired when the value was clicked.
   *
   * @event Value#valueclicked
   *
   * @param {number} value - The value of the widget.
   */
  this.emit('valueclicked', O.value);
}
function valueKeydown(e) {
  const O = this.options;
  switch (e.keyCode) {
    case 9:
      // TAB
      if (!O.tab_to_set) return;
      this.userset(
        'value',
        O.set ? O.set.call(this, this._input.value) : this._input.value
      );
      valueDone.call(this, true);
      this.emit('valueset', O.value);
  }
}
function valueTyping(e) {
  const O = this.options;
  if (O.set === false) return;
  if (!this.__editing) return;
  switch (e.keyCode) {
    case 27:
      // ESC
      valueDone.call(this);
      /**
       * Is fired when the ESC key was pressed while editing the value.
       *
       * @event Value#valueescape
       *
       * @param {string} value - The new value of the widget.
       */
      this.emit('valueescape', O.value);
      break;
    case 13:
      // ENTER
      this.userset(
        'value',
        O.set ? O.set.call(this, this._input.value) : this._input.value
      );
      valueDone.call(this);
      /**
       * Is fired after the value has been set and editing has ended.
       *
       * @event Value#valueset
       *
       * @param {string} value - The new value of the widget.
       */
      this.emit('valueset', O.value);

      e.preventDefault();
      return false;
  }
  /**
   * Is fired when the user hits a key while editing the value.
   *
   * @event Value#valuetyping
   *
   * @param {DOMEvent} event - The native DOM event.
   * @param {string} value - The new value of the widget.
   */
  this.emit('valuetyping', e, O.value);
}
function valueInput() {
  const O = this.options;
  if (O.set === false) return;
  if (!this.__editing) return;
  if (O.editmode == 'immediate')
    this.userset(
      'value',
      O.set ? O.set.call(this, this._input.value) : this._input.value
    );
}
function valueDone(noblur) {
  if (!this.__editing) return;
  this.__editing = false;
  this.invalidate(SymEditing);
  removeClass(this.element, 'aux-active');
  if (!noblur) this._input.blur();
  /**
   * Is fired when editing of the value ends.
   *
   * @event Value#valuedone
   *
   * @param {string} value - The new value of the widget.
   */
  this.emit('valuedone', this.options.value);
  this.stopInteracting();
}
function valueFocus() {
  const O = this.options;
  this.__editing = true;
  this.invalidate(SymEditing);
  addClass(this.element, 'aux-active');
  if (O.auto_select) this._input.setSelectionRange(0, this._input.value.length);
  this.startInteracting();
}

function submitCallback(e) {
  e.preventDefault();
  return false;
}
/**
 * Value is a formatted and editable text field displaying values as
 *   strings or numbers.
 *
 * @class Value
 *
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.value=0] - The value.
 * @property {Function} [options.format=function (v) { return v; }] - A formatting
 *   function used to display the value.
 * @property {Null|Integer} [options.size=1] - Size attribute of the input element. `null` to unset.
 * @property {Null|Integer} [options.maxlength=null] - Maxlength attribute of the input element. `null` to unset.
 * @property {Function} [options.set=function (val) { return parseFloat(val || 0); }] -
 *   A function which is called to parse user input.
 * @property {Boolean} [options.auto_select=false] - Select the entire text if clicked .
 * @property {Boolean} [options.readonly=false] - Sets the readonly attribute.
 * @property {String} [options.placeholder=""] - Sets the placeholder attribute.
 * @property {String} [options.type="text"] - Sets the type attribute. Type can be either `text` or `password`.
 * @property {String} [options.editmode="onenter"] - Sets the event to trigger the userset event. Can be one out of `onenter` or `immediate`.
 * @property {String|Boolean} [options.autocomplete=false} - Set a unique identifier to enable browsers internal auto completion.
 * @property {Boolean} [options.tab_to_set=false} - Set the value if user hits TAB.
 */
export class Value extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), {
      value: 'number|string',
      format: 'function',
      size: 'number',
      maxlength: 'int',
      set: 'object|function|boolean',
      auto_select: 'boolean',
      readonly: 'boolean',
      placeholder: 'string',
      type: 'string',
      editmode: 'string',
      autocomplete: 'string|boolean',
      tab_to_set: 'boolean',
    });
  }

  static get options() {
    return {
      value: 0,
      format: function (v) {
        return v;
      },
      size: 3,
      maxlength: null,
      container: false,
      // set a callback function if value is editable or
      // false to disable editing. A function has to return
      // the value treated by the parent widget.
      set: function (val) {
        val = parseFloat(val);
        if (isNaN(val)) return this.get('value');
        return parseFloat(val || 0);
      },
      auto_select: true,
      readonly: false,
      placeholder: '',
      type: 'text',
      editmode: 'onenter',
      autocomplete: false,
      presets: {
        string: {
          format: (v) => v + '',
          set: (v) => v + '',
          value: '',
        },
      },
      tab_to_set: false,
      role: 'textbox',
    };
  }

  static get renderers() {
    return [
      defineRender('size', function (size) {
        this._input.setAttribute('size', size);
      }),
      defineRender('maxlength', function (maxlength) {
        const E = this._input;
        if (maxlength) E.setAttribute('maxlength', maxlength);
        else E.removeAttribute('maxlength');
      }),
      defineRender('placeholder', function (placeholder) {
        const E = this._input;
        if (placeholder) E.setAttribute('placeholder', placeholder);
        else E.removeAttribute('placeholder');
      }),
      defineRender(['value', 'format', SymEditing], function (value, format) {
        if (this.__editing) return;
        this._input.value = format(value);
      }),
      defineRender('readonly', function (readonly) {
        const E = this._input;
        if (readonly) E.setAttribute('readonly', 'readonly');
        else E.removeAttribute('readonly');
      }),
      defineRender('type', function (type) {
        this._input.setAttribute('type', type);
      }),
      defineRender('autocomplete', function (autocomplete) {
        const E = this._input;
        if (autocomplete) {
          E.setAttribute('name', autocomplete);
          E.setAttribute('autocomplete', 'on');
        } else {
          E.removeAttribute('name');
          E.removeAttribute('autocomplete');
        }
      }),
    ];
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    /**
     * @member {HTMLDivElement} Value#element - The main DIV container.
     *   Has class <code>aux-value</code>.
     */
    super.initialize(options);

    /**
     * @member {HTMLInputElement} Value#_input - The input element.
     *   Has class <code>aux-input</code>.
     */
    this._input = element('input');
    this.element.appendChild(this._input);

    this._value_typing = valueTyping.bind(this);
    this._value_keydown = valueKeydown.bind(this);
    this._value_done = valueDone.bind(this);
    this._value_input = valueInput.bind(this);
    this._value_clicked = valueClicked.bind(this);
    this._value_focus = valueFocus.bind(this);

    this.__editing = false;
  }

  getEventTarget() {
    return this._input;
  }

  getFocusTargets() {
    return [this._input];
  }

  getRoleTarget() {
    return this._input;
  }

  draw(O, elmnt) {
    addClass(elmnt, 'aux-value');
    addClass(this._input, 'aux-input');

    this._input.addEventListener('keyup', this._value_typing);
    this._input.addEventListener('keydown', this._value_keydown);
    this._input.addEventListener('input', this._value_input);
    this._input.addEventListener('blur', this._value_done);
    this._input.addEventListener('focus', this._value_focus);
    this._input.addEventListener('click', this._value_clicked);
    this._input.addEventListener('submit', submitCallback);

    super.draw(O, elmnt);
  }

  destroy() {
    this._input.removeEventListener('keyup', this._value_typing);
    this._input.removeEventListener('keydown', this._value_keydown);
    this._input.removeEventListener('blur', this._value_done);
    this._input.removeEventListener('input', this._value_input);
    this._input.removeEventListener('focus', this._value_focus);
    this._input.removeEventListener('click', this._value_clicked);
    this._input.removeEventListener('submit', submitCallback);
    super.destroy();
  }
}
