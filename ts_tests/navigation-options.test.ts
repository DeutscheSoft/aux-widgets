import { Navigation, INavigationOptions } from '../src/widgets/navigation.js';

// Valid Navigation options (extends Buttons).
const nav: INavigationOptions = {
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
