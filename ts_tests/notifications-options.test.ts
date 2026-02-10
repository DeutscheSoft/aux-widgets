import { Notifications, INotificationsOptions } from '../src/widgets/notifications.js';

// Valid Notifications options.
const opts: INotificationsOptions = {
  stack: 'end',
};

new Notifications(opts);
new Notifications({ stack: 'start' });

// Invalid stack should be rejected.
const badStack: INotificationsOptions = {
  // @ts-expect-error stack must be 'start' | 'end'
  stack: 'middle',
};
