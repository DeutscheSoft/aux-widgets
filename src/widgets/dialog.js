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
import { SymWindowResize } from './widget.js';
import { translateAnchor } from '../utils/anchor.js';
import {
  element,
  addClass,
  getFocusableElements,
  observeDOM,
} from '../utils/dom.js';
import { defineRender } from '../renderer.js';
import { GlobalEventHandler } from '../utils/global_events.js';

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
    }
    return false;
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
    return {
      anchor: 'string',
      x: 'string',
      y: 'string',
      auto_close: 'boolean',
      auto_remove: 'boolean',
      toplevel: 'boolean',
      modal: 'boolean',
      reset_focus: 'boolean',
      contain_focus: 'boolean',
    };
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
      set_visible: function (val) {
        if (val === true) {
          /**
           * Is fired when the dialog is opened.
           *
           * @event Dialog#open
           */
          this.emit('open');
        } else if (val === false) {
          /**
           * Is fired when the dialog is closed.
           *
           * @event Dialog#close
           */
          this.emit('close');
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
      defineRender(
        ['visible', 'container', 'toplevel'],
        function (visible, container, toplevel) {
          if (!visible) return;

          const element = this.element;
          let target = container;
          if (toplevel) {
            let p = container || element.parentElement;
            while (
              p &&
              p.tagName !== 'AWML-ROOT' &&
              p.tagName !== 'BODY'
            ) {
              p = p.parentElement;
            }
            target = p || document.body;
          }
          if (!target) return;

          const appended = element.parentNode !== target;
          if (appended) target.appendChild(element);

          if (appended || visible === true || visible === 'showing') {
            this.triggerResize();
          }
        }
      ),
      defineRender(['visible', 'modal'], function (visible, modal) {
        const _modal = this._modal;
        if (!visible || !modal) {
          _modal.remove();
          return;
        }
        const target = this.element.parentNode;
        if (target && _modal.parentNode !== target) target.appendChild(_modal);
      }),
      // Runs in the render frame after the opening/closing event, so no extra delay.
      defineRender(['visible', 'reset_focus'], function (visible, reset_focus) {
        if (visible === true) {
          const focus = this._openFocus;
          this._openFocus = void 0;
          if (focus) {
            focus.focus();
          } else if (focus === null) {
            const E = getFocusableElements(this.element);
            if (E[0]) E[0].focus();
          }
        } else if (visible === false && reset_focus && this._previousFocus) {
          this._previousFocus.focus();
        }
      }),
      // Render frame is after the opening click, so activating here is safe.
      defineRender(['visible', 'auto_close'], function (visible, auto_close) {
        this._autoclose.setActive(auto_close && visible === true);
      }),
      defineRender(['visible', 'auto_remove'], function (visible, auto_remove) {
        if (visible === false && auto_remove) {
          this.element.remove();
          this._modal.remove();
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

    this._autoclose = new GlobalEventHandler(
      document.body,
      'click',
      (e) => {
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
        this.hide(true);
      },
      { capture: false }
    );
    this._tabbing_cb = keepInside.bind(this);
    this._tabeventtargets = [];
    this.set('contain_focus', O.contain_focus);

    const mo = observeDOM(this.element, handleTabbing.bind(this));
    if (mo) this.addSubscriptions(() => mo.disconnect());
    handleTabbing.call(this);
  }

  destroy() {
    this._autoclose.destroy();
    super.destroy();
  }

  draw(O, element) {
    addClass(element, 'aux-dialog');
    super.draw(O, element);
  }

  /**
   * Open the dialog. Optionally set x and y position regarding `anchor`.
   * Goes through {@link Container#show} so `showing_duration` can animate.
   *
   * @method Dialog#open
   *
   * @param {String} [x] - New X-position of the dialog.
   * @param {String} [y] - New Y-position of the dialog.
   * @param {HTMLElement} [focus] - Element to receive focus after opening the dialog.
   */
  open(x, y, focus) {
    this._previousFocus = document.activeElement;
    // null → first focusable; element → that target. Cleared in the focus renderer.
    this._openFocus = typeof focus !== 'undefined' ? focus : null;
    if (typeof x !== 'undefined') this.set('x', x);
    if (typeof y !== 'undefined') this.set('y', y);
    return this.show();
  }

  /**
   * Close the dialog. Goes through {@link Container#hide} so `hiding_duration`
   * can animate. The node is removed from DOM if `auto_remove` is set to `true`.
   *
   * @method Dialog#close
   */
  close() {
    return this.hide();
  }
}
