/*
 * This file is part of Toolkit.
 *
 * Toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */
import { define_class } from '../widget_helpers.js';
import { Container } from './container.js';
import { Notification } from './notification.js';
import { add_class } from '../utils/dom.js';

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

export const Notifications = define_class({
    
    _class: "Notifications",
    Extends: Container,
    
    _options: Object.assign(Container.prototype._options, {
      stack: "string",
    }),
    options: {
      stack: "start",
    },
    
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        add_class(this.element, "aux-notifications");
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
      var n = new Notification(options);
      this.add_child(n);
      if (this.options.stack == "start")
        this.element.insertBefore(n.element, this.element.firstChild);
      else
        this.element.appendChild(n.element);
      return n;
    }
});
