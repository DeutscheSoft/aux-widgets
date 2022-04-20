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

import {
  element,
  addClass,
  toggleClass,
  isClassName,
  createID,
} from './../utils/dom.js';
import { defineChildWidget } from './../child_widget.js';
import { Widget } from './widget.js';
import { Icon } from './icon.js';
import { Label } from './label.js';
import { defineRender } from '../renderer.js';

function resetDelayTo() {
  window.clearTimeout(this.__delayed_to);
  this.__delayed_to = -1;
  this.removeClass('aux-delayed');
}

let _touchmoveHandler;

function pressStart(e) {
  const O = this.options;
  this.__time_stamp = e.timeStamp;
  if (O.delay && this.__delayed_to < 0) {
    this.__delayed_to = window.setTimeout(
      (function (t) {
        return function () {
          pressStart.call(t, e);
        };
      })(this),
      O.delay
    );
    this.addClass('aux-delayed');
    /**
     * Is fired after either a mousedown or a touchstart happened
     * but `delay` is set so firing `press_start` will be delayed.
     *
     * @event Button#press_delayed
     */
    this.emit('press_delayed');
    return;
  } else if (O.delay) {
    /**
     * Is fired if `delay` is set and the timeout has finished.
     *
     * @event Button#pressed
     *
     * @param {Event} event - Either the MouseEvent or the TouchEvent.
     */
    this.emit('pressed', e);
  }
  resetDelayTo.call(this);
  this.removeClass('aux-delayed');
  /**
   * Is fired after either a mousedown or a touchstart happened and
   * `delay` is set to `0`. If a delay is set, `press_delayed` is fired
   * instead on mousedown/touchstart and this event gets fired as soon
   * as the delay time is over.
   *
   * @event Button#press_start
   *
   * @param {Event} event - Either the MouseEvent or the TouchEvent.
   */
  this.emit('press_start', e);
}
function pressEnd(e) {
  const O = this.options;
  if (O.delay && this.__delayed_to >= 0) {
    resetDelayTo.call(this);
    /**
     * Is fired if a delay is set, after the pointer is released and
     * the timeout hasn't finished yet. Doesn't fire after the timeout
     * finished.
     *
     * @event Button#clicked
     *
     * @param {Event} event - Either the MouseEvent or the TouchEvent.
     */
    this.emit('clicked', e);
  }
  /**
   * Is fired after either a mouseup or a touchend happened and the
   * pointer didn't leave the button element after `press_start` or
   * `press_delayed` was fired.
   *
   * @event Button#press_end
   *
   * @param {Event} event - Either the MouseEvent or the TouchEvent.
   */
  this.emit('press_end', e);
  if (e.type.startsWith('touch') || e.type.startsWith('key')) {
    this.element.dispatchEvent(new PointerEvent('click'), {
      pointerType: e.pointerType,
      bubbles: true,
      cancelable: true,
    });
  }
  if (e.preventDefault) e.preventDefault();
}
function pressCancel(e) {
  const O = this.options;
  if (O.delay && this.__delayed_to >= 0) {
    resetDelayTo.call(this);
  }
  /**
   * Is fired after `press_start` or `press_delay` and before
   * a `press_end` was fired while the pointer is dragged outside of the
   * button element.
   *
   * @event Button#press_cancel
   *
   * @param {Event} event - Either the MouseEvent or the TouchEvent.
   */
  this.emit('press_cancel', e);
}

/* MOUSE handling */
function mouseup(e) {
  this.off('mouseup', mouseup);
  this.off('mouseleave', mouseleave);
  pressEnd.call(this, e);
}
function mouseleave(e) {
  this.off('mouseup', mouseup);
  this.off('mouseleave', mouseleave);
  pressCancel.call(this, e);
}
function mousedown(e) {
  /* only left click please */
  if (e.button) return true;
  pressStart.call(this, e);
  this.on('mouseup', mouseup);
  this.on('mouseleave', mouseleave);
}

/* TOUCH handling */
function getCurrentTouch(id, event) {
  for (let i = 0; i < event.changedTouches.length; i++) {
    if (event.changedTouches[i].identifier === id) {
      return event.changedTouches[i];
    }
  }
}
function isCurrentTouch(event) {
  const current = getCurrentTouch(this.__touch_id, event);
  return !!current;
}

function touchend(e) {
  const current = getCurrentTouch(this.__touch_id, e);
  if (!current) return;
  this.__touch_id = false;

  if (e.cancelable) e.preventDefault();

  this.off('touchend', touchend);
  this.off('touchcancel', touchcancel);
  document.removeEventListener('touchmove', _touchmoveHandler);

  const E = document.elementFromPoint(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );
  if (this.element !== E) return;

  const rect = current.target.getBoundingClientRect();
  if (rect.x != this.__init_target.x || rect.y != this.__init_target.y) {
    return;
  }

  pressEnd.call(this, e);
}
function touchstart(e) {
  if (this.__touch_id !== false) return;
  this.__touch_id = e.targetTouches[0].identifier;
  this.__init_target = e.targetTouches[0].target.getBoundingClientRect();

  this.on('touchend', touchend);
  this.on('touchcancel', touchcancel);
  _touchmoveHandler = touchmove.bind(this);
  document.addEventListener('touchmove', _touchmoveHandler);

  pressStart.call(this, e);
  return false;
}
function touchcancel(e) {
  if (!isCurrentTouch.call(this, e)) return;
  this.__touch_id = false;

  this.off('touchend', touchend);
  this.off('touchcancel', touchcancel);
  document.removeEventListener('touchmove', _touchmoveHandler);

  pressCancel.call(this, e);
}
function touchmove(e) {
  const E = document.elementFromPoint(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );
  if (this.element !== E) {
    touchcancel.call(this, e);
  }
}
function dismiss(e) {
  if (e.cancelable) e.preventDefault();
  return false;
}

/* Keyboard handling */

const KEYS = ['Space', 'Enter'];
function keyDown(e) {
  if (KEYS.indexOf(e.code) < 0) return;
  if (this.__keydown) return;
  this.__keydown = true;
  pressStart.call(this, e);
}
function keyUp(e) {
  if (!this.__keydown) return;
  if (KEYS.indexOf(e.code) < 0) return;
  this.__keydown = false;
  pressEnd.call(this, e);
}

/**
 * Button is a simple, clickable widget containing an
 * {@link Icon} and a {@link Label} to trigger functions.
 * Button serves as base for other widgets, too, e.g.
 * {@link Toggle}, {@link ConfirmButton} and {@link Select}.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String|Boolean} [options.label=false] - Text for the
 *   button label. Set to <code>false</code> to remove the label
 *   from DOM.
 * @property {String|Boolean} [options.icon=false] - URL to an image
 *   file or an icon class (see styles/fonts/AUX.html). If set
 *   to <code>false</code>, the icon is removed from DOM.
 * @property {Boolean} [options.state=false] - State of the button,
 *   reflected as class <code>.aux-active</code>.
 * @property {String} [options.layout="horizontal"] - Define the
 *   arrangement of label and icon. <code>vertical</code> means icon
 *   above the label, <code>horizontal</code> places the icon left
 *   to the label.
 * @property {Integer} [options.delay=0] - Enable delayed events. The
 *   value is set in milliseconds. If
 *   this is set to >0, Button fires some additional events, most importantly
 *   `press_start` after the delay has finished without the user leaving
 *   the button or lifting the pointer.
 *
 * @extends Widget
 *
 * @class Button
 */
/**
 * @member {HTMLDivElement} Button#element - The main DIV element.
 *   Has class <code>.aux-button</code>.
 */
export class Button extends Widget {
  static get _options() {
    return Object.assign({}, Widget.getOptionTypes(), {
      label: 'string|boolean',
      icon: 'string|boolean',
      state: 'boolean',
      layout: 'string',
      delay: 'int',
    });
  }

  static get options() {
    return {
      label: false,
      icon: false,
      state: false,
      layout: 'horizontal',
      delay: 0,
      role: 'button',
      tabindex: 0,
    };
  }

  static get static_events() {
    return {
      mousedown: mousedown,
      touchstart: touchstart,
      contextmenu: dismiss,
      keydown: keyDown,
      keyup: keyUp,
    };
  }

  initialize(options) {
    if (!options.element) options.element = element('div');
    this.__time_stamp = 0;
    this.__touch_id = false;
    this.__init_target = null;
    this.__delayed_to = -1;
    super.initialize(options);
    this._labelID = createID('aux-label-');
  }

  draw(O, element) {
    addClass(element, 'aux-button');
    super.draw(O, element);
  }

  static get renderers() {
    return [
      defineRender('layout', function (layout) {
        const E = this.element;
        toggleClass(E, 'aux-vertical', layout === 'vertical');
        toggleClass(E, 'aux-horizontal', layout !== 'vertical');
      }),
      defineRender('state', function (state) {
        const E = this.element;
        toggleClass(E, 'aux-active', state);
      }),
      defineRender(['label', 'icon'], function (label, icon) {
        const E = this.element;

        if (label !== false) {
          const labelID = this._labelID;

          this.label.set('id', labelID);
          E.setAttribute('aria-labelledby', labelID);
          E.removeAttribute('aria-label');
        } else if (icon && isClassName(icon)) {
          E.setAttribute('aria-label', icon + ' icon');
          E.removeAttribute('aria-labelledby');
        } else {
          E.setAttribute('aria-label', 'Button');
          E.removeAttribute('aria-labelledby');
        }
      }),
    ];
  }
}

/**
 * @member {Icon} Button#icon - The {@link Icon} widget.
 */
defineChildWidget(Button, 'icon', {
  create: Icon,
  option: 'icon',
  inherit_options: true,
  toggle_class: true,
  default_options: {
    role: 'presentation',
  },
});

/**
 * @member {Label} Button#label - The {@link Label} of the button.
 */
defineChildWidget(Button, 'label', {
  create: Label,
  option: 'label',
  inherit_options: true,
  toggle_class: true,
});
