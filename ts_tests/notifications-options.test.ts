import { Notifications, INotificationsOptions } from '../src/widgets/notifications.js';

// Valid Notifications options.
const opts: INotificationsOptions = {
  stack: 'end',
};

const notificationsWidget = new Notifications(opts);
new Notifications({ stack: 'start' });

// .set(key, value) API type-checking
notificationsWidget.set('stack', 'end');
// @ts-expect-error value for 'stack' must be 'start' | 'end'
notificationsWidget.set('stack', 'middle');

// Invalid stack should be rejected.
const badStack: INotificationsOptions = {
  // @ts-expect-error stack must be 'start' | 'end'
  stack: 'middle',
};
