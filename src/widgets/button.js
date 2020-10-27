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

import { element, addClass, toggleClass } from './../utils/dom.js';
import { defineClass } from './../widget_helpers.js';
import { defineChildWidget } from './../child_widget.js';
import { Widget } from './widget.js';
import { Icon } from './icon.js';
import { Label } from './label.js';

function resetDelayTo() {
  window.clearTimeout(this.__delayed_to);
  this.__delayed_to = -1;
  this.removeClass('aux-delayed');
}

let _touchmoveHandler;

function pressStart(e) {
  let O = this.options;
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
  let O = this.options;
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
  if (e instanceof TouchEvent) {
    //this.emit('click', e);
    this.element.dispatchEvent(new Event('click'));
  }
}
function pressCancel(e) {
  let O = this.options;
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
function isCurrentTouch(ev) {
  var id = this.__touch_id;
  var i;
  for (i = 0; i < ev.changedTouches.length; i++) {
    if (ev.changedTouches[i].identifier === id) {
      return true;
    }
  }

  return false;
}

function touchend(e) {
  if (!isCurrentTouch.call(this, e)) return;
  this.__touch_id = false;
  if (e.cancelable) e.preventDefault();

  this.off('touchend', touchend);
  this.off('touchcancel', touchcancel);
  document.removeEventListener('touchmove', _touchmoveHandler);

  let E = document.elementFromPoint(
    e.changedTouches[0].clientX,
    e.changedTouches[0].clientY
  );
  if (this.element !== E) return;

  pressEnd.call(this, e);
}
function touchstart(e) {
  if (this.__touch_id !== false) return;
  this.__touch_id = e.targetTouches[0].identifier;
  if (e.cancelable) {
    e.preventDefault();
    e.stopPropagation();
  }

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
  let E = document.elementFromPoint(
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

export const Button = defineClass({
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
  Extends: Widget,
  _options: Object.assign(Object.create(Widget.prototype._options), {
    label: 'string|boolean',
    icon: 'string|boolean',
    state: 'boolean',
    layout: 'string',
    delay: 'int',
  }),
  options: {
    label: false,
    icon: false,
    state: false,
    layout: 'horizontal',
    delay: 0,
  },
  static_events: {
    mousedown: mousedown,
    touchstart: touchstart,
    contextmenu: dismiss,
  },
  initialize: function (options) {
    if (!options.element) options.element = element('div');
    this.__time_stamp = 0;
    this.__touch_id = false;
    this.__delayed_to = -1;
    Widget.prototype.initialize.call(this, options);
  },
  draw: function (O, element) {
    addClass(element, 'aux-button');
    Widget.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    Widget.prototype.redraw.call(this);
    var I = this.invalid;
    var O = this.options;
    var E = this.element;

    if (I.layout) {
      I.layout = false;
      toggleClass(E, 'aux-vertical', O.layout === 'vertical');
      toggleClass(E, 'aux-horizontal', O.layout !== 'vertical');
    }

    if (I.state) {
      I.state = false;
      toggleClass(E, 'aux-active', O.state);
    }
  },
});

/**
 * @member {Icon} Button#icon - The {@link Icon} widget.
 */
defineChildWidget(Button, 'icon', {
  create: Icon,
  option: 'icon',
  inherit_options: true,
  toggleClass: true,
});

/**
 * @member {Label} Button#label - The {@link Label} of the button.
 */
defineChildWidget(Button, 'label', {
  create: Label,
  option: 'label',
  inherit_options: true,
  toggleClass: true,
});
