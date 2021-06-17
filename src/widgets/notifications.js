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

/* jshint -W079 */

import { defineClass } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { addClass } from '../utils/dom.js';
import { Container } from './container.js';
import { Button } from './button.js';
import { Icon } from './icon.js';
import { S } from '../dom_scheduler.js';

/**
 * Notifications is a {@link Container} displaying {@link Notification}
 *   popups.
 *
 * @class Notifications
 *
 * @extends Container
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {String} [options.stack="end"] - Define the position a new {@link Notification}
 *   is appended to the container, either `end` or `start`.
 */

export const Notifications = defineClass({
  Extends: Container,

  _options: Object.assign({}, Container.prototype._options, {
    stack: 'string',
  }),
  options: {
    stack: 'start',
  },

  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
  },
  draw: function (O, element) {
    addClass(element, 'aux-notifications');

    Container.prototype.draw.call(this, O, element);
  },

  notify: function (options) {
    /**
     * Create and show a new notification.
     *
     * @method Notifications#notify
     *
     * @param {Object} [options={ }] - An object containing initial options. - Options for the {@link Notification} to add
     *
     */
    let n;
    if (options instanceof Notification) n = options;
    else n = new Notification(options);
    this.addChild(n);
    if (this.options.stack == 'start')
      this.element.insertBefore(n.element, this.element.firstChild);
    else this.element.appendChild(n.element);
    n.show();
    return n;
  },

  /**
   * Remove a notification instantly.
   *
   * @method Notifications#removeNotification
   *
   * @param {Notification} [notification] - The Notification to remove.
   */
  removeNotification: function (n) {
    this.removeChild(n);
    return n;
  },
});

function closeClicked() {
  /**
   * Is fired when the user clicks on the close button.
   *
   * @event Notification#closeclicked
   */
  this.emit('closeclicked');
  close.call(this.parent);
}

function afterHide() {
  S.afterFrame(
    function () {
      if (this.isDestructed()) return;
      this.destroy();
    }.bind(this)
  );
}

function close() {
  this.on('hide', afterHide);
  this.hide();
  /**
   * Is fired when the notification was removed from the DOM after the hiding animation.
   *
   * @event Notification#closed
   */
  this.emit('closed');
}

function timeout() {
  this._timeout = void 0;
  close.call(this);
}

/**
 * Notification is a {@link Container} to be used in {@link Notifications}.
 *
 * @class Notification
 *
 * @extends Container
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Number} [options.timeout=5000] - Time in milliseconds
 *   after the notification disappears automatically.
 *   Set to 0 for permanent notification.
 * @property {String} [options.icon=false] - Show an icon. Set to
 *   <code>false</code> to hide it from the DOM.
 * @property {Boolean} [options.show_close=false] - Show a close button.
 */

export const Notification = defineClass({
  Extends: Container,

  _options: Object.assign(Object.create(Container.prototype._options), {
    timeout: 'number',
    icon: 'string',
    show_close: 'boolean',
  }),
  options: {
    timeout: 5000,
    icon: false,
    show_close: false,
  },

  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    const O = this.options;
    /**
     * @member {HTMLDivElement} Notification#element - The main DIV container.
     *   Has class <code>.aux-notification</code>.
     */
    this._timeout = void 0;
    this.set('timeout', O.timeout);
  },
  draw: function (O, element) {
    addClass(element, 'aux-notification');

    Container.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    const I = this.invalid;
    const i = I.content;
    Container.prototype.redraw.call(this);
    if (i && this.icon)
      this.element.insertBefore(this.icon.element, this.element.firstChild);
    if (i && this.close)
      this.element.insertBefore(this.close.element, this.element.firstChild);
  },

  remove: close,
  destroy: function () {
    if (this._timeout !== void 0) window.clearTimeout(this._timeout);
    Container.prototype.destroy.call(this);
  },
  set: function (key, val) {
    Container.prototype.set.call(this, key, val);
    if (key === 'timeout') {
      if (this._timeout !== void 0) window.clearTimeout(this._timeout);
      if (val > 0) this._timeout = window.setTimeout(timeout.bind(this), val);
    }
  },
});

/**
 * @member {Button} Notification#close - The Button for closing the notification.
 */
defineChildWidget(Notification, 'close', {
  create: Button,
  show: false,
  toggle_class: true,
  static_events: {
    click: closeClicked,
  },
  default_options: {
    icon: 'close',
    class: 'aux-close',
  },
});

/**
 * @member {Icon} Notification#icon - The Icon widget.
 */
defineChildWidget(Notification, 'icon', {
  create: Icon,
  show: false,
  toggle_class: true,
  option: 'icon',
  map_options: {
    icon: 'icon',
  },
});
