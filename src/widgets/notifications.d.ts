import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { Button } from './button.js';
import { Icon } from './icon.js';

/**
 * Stack position for new notifications.
 */
export type INotificationsStack = 'start' | 'end';

/**
 * Options specific to the Notifications widget.
 * Extends Container options.
 */
export interface INotificationsOptions extends IContainerOptions {
  /** Define the position a new Notification is appended to the container. */
  stack: INotificationsStack;
}

/**
 * Events specific to the Notifications widget.
 * Extends Container events.
 */
export interface INotificationsEvents extends IContainerEvents {
  // No additional events beyond those inherited from Container
}

/**
 * Notifications is a Container displaying Notification popups.
 */
export declare class Notifications<
  TOptions extends INotificationsOptions = INotificationsOptions,
  TEvents extends INotificationsEvents = INotificationsEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /**
   * Create and show a new notification.
   */
  notify(options?: Partial<INotificationOptions> | Notification): Notification;

  /**
   * Remove a notification instantly.
   */
  removeNotification(notification: Notification): Notification;
}

/**
 * Options specific to the Notification widget.
 * Extends Container options.
 */
export interface INotificationOptions extends IContainerOptions {
  /** Time in milliseconds after the notification disappears automatically. Set to 0 for permanent notification. */
  timeout: number;
  /** Show an icon. Set to false to hide it from the DOM. */
  icon: string | false;
  /** Show a close button. */
  show_close: boolean;
}

/**
 * Events specific to the Notification widget.
 * Extends Container events.
 */
export interface INotificationEvents extends IContainerEvents {
  /** Fired when the user clicks on the close button. */
  closeclicked: () => void;
  /** Fired when the notification was removed from the DOM after the hiding animation. */
  closed: () => void;
}

/**
 * Notification is a Container to be used in Notifications.
 */
export declare class Notification<
  TOptions extends INotificationOptions = INotificationOptions,
  TEvents extends INotificationEvents = INotificationEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<
    TOptions,
    TEvents
  >
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-notification */
  element: HTMLDivElement;
  /** The Button for closing the notification. */
  close: Button;
  /** The Icon widget. */
  icon: Icon;

  /**
   * Remove the notification (hides and destroys it).
   */
  remove(): void;
}
