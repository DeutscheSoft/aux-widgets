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
import { define_class } from './../widget_helpers.js';
import { Widget } from './widget.js';
import { element, add_class, remove_class } from './../utils/dom.js';

/**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>value</code>.
 *
 * @event Value#useraction
 *
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
function value_clicked() {
  var O = this.options;
  if (O.set === false) return;
  if (this.__editing) return false;
  add_class(this.element, 'aux-active');
  this._input.setAttribute('value', O.value);
  this.__editing = true;
  this._input.focus();
  if (O.auto_select) this._input.setSelectionRange(0, this._input.value.length);
  /**
   * Is fired when the value was clicked.
   *
   * @event Value#valueclicked
   *
   * @param {number} value - The value of the widget.
   */
  this.emit('valueclicked', O.value);
}
function value_typing(e) {
  var O = this.options;
  if (O.set === false) return;
  if (!this.__editing) return;
  switch (e.keyCode) {
    case 27:
      // ESC
      value_done.call(this);
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
        O.set ? O.set(this._input.value) : this._input.value
      );
      value_done.call(this);
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
function value_input() {
  var O = this.options;
  if (O.set === false) return;
  if (!this.__editing) return;
  if (O.editmode == 'immediate')
    this.userset('value', O.set ? O.set(this._input.value) : this._input.value);
}
function value_done() {
  if (!this.__editing) return;
  this.__editing = false;
  remove_class(this.element, 'aux-active');
  this._input.blur();
  /**
   * Is fired when editing of the value ends.
   *
   * @event Value#valuedone
   *
   * @param {string} value - The new value of the widget.
   */
  this.emit('valuedone', this.options.value);
  this.invalid.value = true;
  this.stopInteracting();
  this.trigger_draw();
}
function value_focus() {
  this.startInteracting();
}

function submit_cb(e) {
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
 * @property {boolean} [options.auto_select=false] - Select the entire text if clicked .
 * @property {boolean} [options.readonly=false] - Sets the readonly attribute.
 * @property {string} [options.placeholder=""] - Sets the placeholder attribute.
 * @property {string} [options.type="text"] - Sets the type attribute. Type can be either `text` or `password`.
 * @property {string} [options.editmode="onenter"] - Sets the event to trigger the userset event. Can be one out of `onenter` or `immediate`.
 *
 */
export const Value = define_class({
  Extends: Widget,
  _options: Object.assign(Object.create(Widget.prototype._options), {
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
  }),
  options: {
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
      return parseFloat(val || 0);
    },
    auto_select: true,
    readonly: false,
    placeholder: '',
    type: 'text',
    editmode: 'onenter',
  },
  initialize: function (options) {
    if (!options.element) options.element = element('div');
    /**
     * @member {HTMLDivElement} Value#element - The main DIV container.
     *   Has class <code>aux-value</code>.
     */
    Widget.prototype.initialize.call(this, options);

    /**
     * @member {HTMLInputElement} Value#_input - The input element.
     *   Has class <code>aux-input</code>.
     */
    this._input = element('input');
    this.element.appendChild(this._input);

    this._value_typing = value_typing.bind(this);
    this._value_done = value_done.bind(this);
    this._value_input = value_input.bind(this);
    this._value_clicked = value_clicked.bind(this);
    this._value_focus = value_focus.bind(this);

    this.__editing = false;
  },

  draw: function (O, elmnt) {
    add_class(elmnt, 'aux-value');
    add_class(this._input, 'aux-input');

    this._input.addEventListener('keyup', this._value_typing);
    this._input.addEventListener('input', this._value_input);
    this._input.addEventListener('blur', this._value_done);
    this._input.addEventListener('focus', this._value_focus);
    this._input.addEventListener('click', this._value_clicked);
    this._input.addEventListener('submit', submit_cb);

    Widget.prototype.draw.call(this, O, elmnt);
  },

  redraw: function () {
    var I = this.invalid;
    var O = this.options;
    var E = this._input;

    Widget.prototype.redraw.call(this);

    if (I.size) {
      I.size = false;
      E.setAttribute('size', O.size);
    }

    if (I.maxlength) {
      I.maxlength = false;
      if (O.maxlength) E.setAttribute('maxlength', O.maxlength);
      else E.removeAttribute('maxlength');
    }

    if (I.placeholder) {
      I.placeholder = false;
      if (O.placeholder) E.setAttribute('placeholder', O.placeholder);
      else E.removeAttribute('placeholder');
    }

    if ((I.value || I.format) && !this.__editing) {
      I.format = I.value = false;
      E.value = O.format(O.value);
    }

    if (I.readonly) {
      I.readonly = false;
      if (O.readonly) E.setAttribute('readonly', 'readonly');
      else E.removeAttribute('readonly');
    }

    if (I.type) {
      I.type = false;
      E.setAttribute('type', O.type);
    }
  },
  destroy: function () {
    this._input.removeEventListener('keyup', this._value_typing);
    this._input.removeEventListener('blur', this._value_done);
    this._input.removeEventListener('input', this._value_input);
    this._input.removeEventListener('focus', this._value_focus);
    this._input.removeEventListener('click', this._value_clicked);
    this._input.removeEventListener('submit', submit_cb);
    Widget.prototype.destroy.call(this);
  },
});
