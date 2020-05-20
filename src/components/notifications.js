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
