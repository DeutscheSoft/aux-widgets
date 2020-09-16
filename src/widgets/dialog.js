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

import { defineClass } from '../widget_helpers.js';
import { Container } from './container.js';
import { translateAnchor } from '../utils/anchor.js';
import { addClass } from '../utils/dom.js';

function autocloseCallback(e) {
  var curr = e.target;
  while (curr) {
    // TODO: if a dialog is opened out of a dialog both should avoid
    // closing any of those on click. former version:
    //if (curr === this.element) return;
    // this closes tagger in Cabasa Dante Tagger when interacting
    // with the colorpicker.
    // workaround for the moment:
    // don't close on click on any dialog
    if (curr.classList.contains('aux-dialog')) return;
    curr = curr.parentElement;
  }
  this.close();
}

function activateAutoclose() {
  if (this._autoclose_active) return;
  document.body.addEventListener('click', this._autoclose_cb);
  this._autoclose_active = true;
}

function deactivateAutoclose() {
  if (!this._autoclose_active) return;
  document.body.removeEventListener('click', this._autoclose_cb);
  this._autoclose_active = false;
}

export const Dialog = defineClass({
  /**
   * Dialog provides a hovering area which can be closed by clicking/tapping
   * anywhere on the screen. It can be automatically pushed to the topmost
   * DOM position as a child of an AWML-ROOT or the BODY element. On close
   * it can be removed from the DOM. The {@link Anchor}-functionality
   * makes positioning the dialog window straight forward.
   *
   * @class Dialog
   *
   * @extends Container
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {String} [options.anchor="top-left"] - Origin of `x` and `y` coordinates. See {@link Anchor} for more information.
   * @property {Number} [options.x=0] - X-position of the dialog.
   * @property {Number} [options.y=0] - Y-position of the dialog.
   * @property {boolean} [options.auto_close=false] - Set dialog to `visible=false` if clicked outside in the document.
   * @property {boolean} [options.auto_remove=false] - Remove the dialogs DOM node after setting `visible=false`.
   * @property {boolean} [options.toplevel=false] - Add the dialog DOM node to the topmost position in DOM on `visible=true`. Topmost means either a parenting `AWML-ROOT` or the `BODY` node.
   *
   */
  Extends: Container,
  _options: Object.assign(Object.create(Container.prototype._options), {
    anchor: 'string',
    x: 'number',
    y: 'number',
    auto_close: 'boolean',
    auto_remove: 'boolean',
    toplevel: 'boolean',
  }),
  options: {
    anchor: 'top-left',
    x: 0,
    y: 0,
    auto_close: false,
    auto_remove: false,
    toplevel: false,
  },
  static_events: {
    hide: function () {
      deactivateAutoclose.call(this);
      if (this.options.auto_remove) this.element.remove();
      this.emit('close');
    },
    set_visible: function (val) {
      var O = this.options;

      if (val === true) {
        if (O.auto_close) activateAutoclose.call(this);
        this.triggerResize();
      } else {
        deactivateAutoclose.call(this);
      }

      if (val === 'showing') {
        var C = O.container;
        if (C) C.appendChild(this.element);
        this.reposition();
      }

      if (val) {
        if (
          O.toplevel &&
          O.container.tagName !== 'AWML-ROOT' &&
          O.container.tagName !== 'BODY'
        ) {
          var p = this.element;
          while (
            (p = p.parentElement) &&
            p.tagName !== 'AWML-ROOT' &&
            p.tagName !== 'BODY'
          );
          this.element.appendChild(p.element);
        }
      } else {
        O.container = this.element.parentElement;
      }
    },
    set_auto_close: function (val) {
      if (val) {
        if (!this.hidden()) activateAutoclose.call(this);
      } else {
        deactivateAutoclose.call(this);
      }
    },
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    var O = this.options;
    /* This cannot be a default option because document.body
     * is not defined there */
    if (!O.container) O.container = window.document.body;
    this._autoclose_active = false;
    this._autoclose_cb = autocloseCallback.bind(this);
    this.set('visible', O.visible);
  },
  resize: function () {
    if (this.options.visible) this.reposition();
  },
  draw: function (O, element) {
    addClass(element, 'aux-dialog');

    Container.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    Container.prototype.redraw.call(this);
    var I = this.invalid;
    var O = this.options;
    var E = this.element;
    if (I.x) {
      I.x = false;
      E.style.left = O.x + 'px';
    }
    if (I.y) {
      I.y = false;
      E.style.top = O.y + 'px';
    }
    if (I.anchor) {
      var pos = translateAnchor(O.anchor, 0, 0, -100, -100);
      this.element.style.transform =
        'translate(' + pos.x + '%, ' + pos.y + '%)';
    }
  },
  /**
   * Open the dialog. Optionally set x and y position regarding `anchor`.
   *
   * @method Dialog#open
   *
   * @param {Number} [x] - New X-position of the dialog.
   * @param {Number} [y] - New Y-position of the dialog.
   */
  open: function (x, y) {
    this.emit('open');
    this.userset('visible', true);
    if (typeof x !== 'undefined') this.set('x', x);
    if (typeof y !== 'undefined') this.set('y', y);
  },
  /**
   * Close the dialog. The node is removed from DOM if `auto_remove` is set to `true`.
   *
   * @method Dialog#close
   */
  close: function () {
    this.userset('visible', false);
  },
  /**
   * Reposition the dialog to the current `x` and `y` position.
   *
   * @method Dialog#reposition
   */
  reposition: function () {
    var O = this.options;
    this.set('x', O.x);
    this.set('y', O.y);
  },
});
