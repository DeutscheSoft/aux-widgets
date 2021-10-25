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

import { defineChildElement } from './../widget_helpers.js';
import { Container } from './container.js';
import { translateAnchor } from '../utils/anchor.js';
import { addClass } from '../utils/dom.js';

function autocloseCallback(e) {
  let curr = e.target;
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
export class Dialog extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), {
      anchor: 'string',
      x: 'number',
      y: 'number',
      auto_close: 'boolean',
      auto_remove: 'boolean',
      toplevel: 'boolean',
      modal: 'boolean',
    });
  }

  static get options() {
    return {
      anchor: 'top-left',
      x: 0,
      y: 0,
      auto_close: false,
      auto_remove: false,
      toplevel: false,
      role: 'dialog',
      modal: false,
    };
  }

  static get static_events() {
    return {
      hide: function () {
        deactivateAutoclose.call(this);
        if (this.options.auto_remove) {
          this.element.remove();
          this._modal.remove();
        }
        this.emit('close');
      },
      set_visible: function (val) {
        const O = this.options;

        if (val === true) {
          if (O.auto_close) activateAutoclose.call(this);
          if (O.modal)
            O.container.appendChild(this._modal);
          this.triggerResize();
        } else {
          deactivateAutoclose.call(this);
        }

        if (val === 'showing') {
          const C = O.container;
          if (C) {
            C.appendChild(this.element);
            if (O.modal)
              C.appendChild(this._modal);
          }
          this.reposition();
        }

        if (val) {
          if (
            O.toplevel &&
            O.container.tagName !== 'AWML-ROOT' &&
            O.container.tagName !== 'BODY'
          ) {
            let p = this.element;
            while (
              (p = p.parentElement) &&
              p.tagName !== 'AWML-ROOT' &&
              p.tagName !== 'BODY'
            );
            p.appendChild(this.element);
            if (O.modal)
              p.appendChild(this._modal);
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
    };
  }

  initialize(options) {
    super.initialize(options);
    const O = this.options;
    /* This cannot be a default option because document.body
     * is not defined there */
    if (!O.container) O.container = window.document.body;
    this._autoclose_active = false;
    this._autoclose_cb = autocloseCallback.bind(this);
    this.set('visible', O.visible);
  }

  resize() {
    if (this.options.visible) this.reposition();
  }

  draw(O, element) {
    addClass(element, 'aux-dialog');
    super.draw(O, element);
  }

  redraw() {
    super.redraw();
    const I = this.invalid;
    const O = this.options;
    const E = this.element;
    if (I.anchor) {
      const pos = translateAnchor(O.anchor, 0, 0, -100, -100);
      this.element.style.transform =
        'translate(' + pos.x + '%, ' + pos.y + '%)';
    }
    if (I.x) {
      I.x = false;
      E.style.left = O.x + 'px';
    }
    if (I.y) {
      I.y = false;
      E.style.top = O.y + 'px';
    }
  }

  /**
   * Open the dialog. Optionally set x and y position regarding `anchor`.
   *
   * @method Dialog#open
   *
   * @param {Number} [x] - New X-position of the dialog.
   * @param {Number} [y] - New Y-position of the dialog.
   */
  open(x, y) {
    if (typeof x !== 'undefined') this.set('x', x);
    if (typeof y !== 'undefined') this.set('y', y);
    this.userset('visible', true);
    this.emit('open');
  }

  /**
   * Close the dialog. The node is removed from DOM if `auto_remove` is set to `true`.
   *
   * @method Dialog#close
   */
  close() {
    this.userset('visible', false);
  }

  /**
   * Reposition the dialog to the current `x` and `y` position.
   *
   * @method Dialog#reposition
   */
  reposition() {
    const O = this.options;
    this.set('anchor', O.anchor);
    this.set('x', O.x);
    this.set('y', O.y);
  }
}

/**
 * @member {HTMLDiv} Dialog#_modal - The container blocking user interaction
 *   Has class <code>.aux-modal</code>.
 */
defineChildElement(Dialog, 'modal', {
  show: false,
});
