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

import { Container } from './container.js';
import { translateAnchor } from '../utils/anchor.js';
import {
  element,
  addClass,
  getFocusableElements,
  observeDOM,
  setDelayedFocus,
} from '../utils/dom.js';
import { defineRender } from '../renderer.js';

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
  setTimeout(
    function () {
      document.body.addEventListener('click', this._autoclose_cb, {
        capture: false,
      });
    }.bind(this),
    50
  );
  this._autoclose_active = true;
}

function deactivateAutoclose() {
  if (!this._autoclose_active) return;
  setTimeout(
    function () {
      document.body.removeEventListener('click', this._autoclose_cb, {
        capture: false,
      });
    }.bind(this),
    50
  );
  this._autoclose_active = false;
}

function keepInside(e) {
  if (e.key === 'Tab' || e.keyCode === 9) {
    const E = getFocusableElements(this.element);
    const first = E[0];
    const last = E[E.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }return false;
  }
}

function handleTabbing() {
  if (this._tabeventtargets.length) {
    for (let i = 0, m = this._tabeventtargets.length; i < m; ++i) {
      this._tabeventtargets[i].removeEventListener('keydown', this._tabbing_cb);
    }
    this._tabeventtargets = [];
  }
  if (!this.options.contain_focus) return;
  const F = getFocusableElements(this.element);
  if (F[0]) {
    F[0].addEventListener('keydown', this._tabbing_cb);
  }
  if (F[F.length - 1]) {
    F[F.length - 1].addEventListener('keydown', this._tabbing_cb);
  }
}

function off(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
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
 * @property {Boolean} [options.auto_close=false] - Set dialog to `visible=false` if clicked outside in the document.
 * @property {Boolean} [options.auto_remove=false] - Remove the dialogs DOM node after setting `visible=false`.
 * @property {Boolean} [options.toplevel=false] - Add the dialog DOM node to the topmost position in DOM on `visible=true`. Topmost means either a parenting `AWML-ROOT` or the `BODY` node.
 * @property {Boolean} [options.reset_focus=true] - Reset the focus to the element which had the focus before opening the dialog on closing the dialog.
 * @property {Boolean} [options.contain_focus=true] - Keep focus inside the dialog.
 *
 */
export class Dialog extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), {
      anchor: 'string',
      x: 'string',
      y: 'string',
      auto_close: 'boolean',
      auto_remove: 'boolean',
      toplevel: 'boolean',
      modal: 'boolean',
      reset_focus: 'boolean',
      contain_focus: 'boolean',
    });
  }

  static get options() {
    return {
      anchor: 'top-left',
      x: undefined,
      y: undefined,
      auto_close: false,
      auto_remove: false,
      toplevel: false,
      role: 'dialog',
      modal: false,
      reset_focus: true,
      contain_focus: true,
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
        const C = O.container;

        if (val === true) {
          if (O.auto_close) activateAutoclose.call(this);
          if (O.modal) C.appendChild(this._modal);
          this.triggerResize();
        } else {
          deactivateAutoclose.call(this);
        }

        if (val === 'showing') {
          if (C) {
            C.appendChild(this.element);
            if (O.modal) C.appendChild(this._modal);
          }
          this.reposition();
        }

        if (val) {
          if (O.toplevel && C.tagName !== 'AWML-ROOT' && C.tagName !== 'BODY') {
            let p = this.element;
            while (
              (p = p.parentElement) &&
              p.tagName !== 'AWML-ROOT' &&
              p.tagName !== 'BODY'
            );
            p.appendChild(this.element);
            if (O.modal) p.appendChild(this._modal);
          }
        } else {
          O.container = this.element.parentElement;
          this._modal.remove();
        }
      },
      set_auto_close: function (val) {
        if (val) {
          if (!this.hidden()) activateAutoclose.call(this);
        } else {
          deactivateAutoclose.call(this);
        }
      },
      set_contain_focus: handleTabbing,
    };
  }

  static get renderers() {
    return [
      defineRender('anchor', function (anchor) {
        const pos = translateAnchor(anchor, 0, 0, -100, -100);
        this.element.style.transform =
          'translate(' + pos.x + '%, ' + pos.y + '%)';
      }),
      defineRender('x', function (x) {
        this.element.style.left = typeof x === 'string' ? x : x + 'px';
      }),
      defineRender('y', function (y) {
        this.element.style.top = typeof y === 'string' ? y : y + 'px';
      }),
      defineRender('modal', function (modal) {
        const element = this.element;
        if (modal) {
          element.setAttribute('aria-modal', 'true');
        } else {
          element.removeAttribute('aria-modal');
        }
      }),
      defineRender(['modal', 'visible', 'container'], function (
        modal,
        visible,
        container
      ) {
        const _modal = this._modal;
        if (modal && visible && container) {
          if (_modal.parentNode !== container) container.appendChild(_modal);
        } else {
          _modal.remove();
        }
      }),
    ];
  }

  initialize(options) {
    super.initialize(options);
    const O = this.options;
    /* This cannot be a default option because document.body
     * is not defined there */
    if (!O.container) O.container = window.document.body;

    /**
     * @member {HTMLDiv} Dialog#_modal - The container blocking user interaction
     *   Has class <code>.aux-dialog-modal</code>.
     */
    this._modal = element('div', { class: 'aux-dialog-modal' });
    this._modal.addEventListener('click', off, { capture: true });
    this._modal.addEventListener('mousedown', off, { capture: true });
    this._modal.addEventListener('touchstart', off, { capture: true });

    this._autoclose_active = false;
    this._autoclose_cb = autocloseCallback.bind(this);
    this._tabbing_cb = keepInside.bind(this);
    this._tabeventtargets = [];
    this.set('contain_focus', O.contain_focus);

    observeDOM(this.element, handleTabbing.bind(this));
    handleTabbing.call(this);
  }

  resize() {
    if (this.options.visible) this.reposition();
  }

  draw(O, element) {
    addClass(element, 'aux-dialog');
    super.draw(O, element);
  }

  /**
   * Open the dialog. Optionally set x and y position regarding `anchor`.
   *
   * @method Dialog#open
   *
   * @param {String} [x] - New X-position of the dialog.
   * @param {String} [y] - New Y-position of the dialog.
   * @param {HTMLElement} [focus] - Element to receive focus after opening the dialog.
   */
  open(x, y, focus) {
    this._previousFocus = document.activeElement;
    if (typeof x !== 'undefined') this.set('x', x);
    if (typeof y !== 'undefined') this.set('y', y);
    this.userset('visible', true);
    /**
     * Is fired when the dialog is opened.
     *
     * @event Dialog#open
     */
    this.emit('open');

    if (!focus) {
      const E = getFocusableElements(this.element);
      if (E[0]) {
        setDelayedFocus(E[0]);
      }
    } else {
      setDelayedFocus(focus);
    }
  }

  /**
   * Close the dialog. The node is removed from DOM if `auto_remove` is set to `true`.
   *
   * @method Dialog#close
   */
  close() {
    this.userset('visible', false);
    /**
     * Is fired when the dialog is closed.
     *
     * @event Dialog#close
     */
    this.emit('close');
    if (this._previousFocus && this.options.reset_focus) {
      setDelayedFocus(this._previousFocus);
    }
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
