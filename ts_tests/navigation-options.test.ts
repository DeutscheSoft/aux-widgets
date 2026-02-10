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

new Navigation(nav);
new Navigation({ arrows: false });
