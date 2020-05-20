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

import {
  component_from_widget,
  define_component,
  subcomponent_from_widget,
} from './../component_helpers.js';
import { Notifications, Notification } from './../widgets/notifications.js';

function add_notification(notifications, notification) {
  notifications.notify(notification);
}

function remove_notification(notifications, notification) {
  notifications.remove_notification(notification);
}

/**
 * WebComponent for the Notifications widget. Available in the DOM as
 * `aux-notifications`.
 *
 * @class NotificationsComponent
 * @implements Component
 */
export const NotificationsComponent = component_from_widget(Notifications);

/**
 * WebComponent for the Notification widget. Available in the DOM as
 * `aux-notification`.
 *
 * @class NotificationComponent
 * @implements Component
 */
export const NotificationComponent = subcomponent_from_widget(
  Notification,
  Notifications,
  add_notification,
  remove_notification
);

define_component('notifications', NotificationsComponent);
define_component('notification', NotificationComponent);
