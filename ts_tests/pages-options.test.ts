import { Pages, IPagesOptions } from '../src/widgets/pages.js';

// Valid Pages options.
const pages: IPagesOptions = {
  pages: ['<p>Page 1</p>', '<p>Page 2</p>'],
  show: 0,
  animation: 'horizontal',
  direction: 'forward',
};

const pagesWidget = new Pages(pages);
new Pages({ show: -1 });

// .set(key, value) API type-checking
pagesWidget.set('show', 1);
// @ts-expect-error value for 'animation' must be 'horizontal' | 'vertical'
pagesWidget.set('animation', 'fade');

// .get(key) API type-checking
const _pagesShow: number | undefined = pagesWidget.get('show');
// @ts-expect-error 'not_an_option_key' is not a valid option key
pagesWidget.get('not_an_option_key');

// Invalid animation should be rejected.
const badAnimation: IPagesOptions = {
  pages: [],
  // @ts-expect-error animation must be 'horizontal' | 'vertical'
  animation: 'fade',
};
