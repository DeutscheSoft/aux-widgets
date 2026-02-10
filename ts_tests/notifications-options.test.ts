import { Notifications, INotificationsOptions } from '../src/widgets/notifications.js';

// Valid Notifications options.
const opts: Partial<INotificationsOptions> = {
  stack: 'end',
};

const notificationsWidget = new Notifications(opts);
new Notifications({ stack: 'start' });

// .set(key, value) API type-checking
notificationsWidget.set('stack', 'end');
// @ts-expect-error value for 'stack' must be 'start' | 'end'
notificationsWidget.set('stack', 'middle');

// .get(key) API type-checking
const _notificationsStack: 'start' | 'end' | undefined = notificationsWidget.get('stack');
// @ts-expect-error 'not_an_option_key' is not a valid option key
notificationsWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
notificationsWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
notificationsWidget.on('not_an_event', () => {});

// Invalid stack should be rejected.
const badStack: Partial<INotificationsOptions> = {
  // @ts-expect-error stack must be 'start' | 'end'
  stack: 'middle',
};
