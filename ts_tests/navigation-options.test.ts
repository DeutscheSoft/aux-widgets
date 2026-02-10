import { Navigation, INavigationOptions } from '../src/index.js';

// Valid Navigation options (extends Buttons).
const nav: Partial<INavigationOptions> = {
  buttons: ['Prev', 'Next'],
  direction: 'horizontal',
  icons: true,
  arrows: true,
  auto_arrows: true,
  scroll: 300,
};

const navigationWidget = new Navigation(nav);
new Navigation({ arrows: false });

// .set(key, value) API type-checking
navigationWidget.set('direction', 'vertical');
// @ts-expect-error value for 'direction' must be 'horizontal' | 'vertical'
navigationWidget.set('direction', 'grid');

// .get(key) API type-checking
const _navDirection: 'horizontal' | 'vertical' | undefined = navigationWidget.get('direction');
// @ts-expect-error 'not_an_option_key' is not a valid option key
navigationWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
navigationWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
navigationWidget.on('not_an_event', () => {});
