import { Pages, IPagesOptions } from '../src/widgets/pages.js';

// Valid Pages options.
const pages: IPagesOptions = {
  pages: ['<p>Page 1</p>', '<p>Page 2</p>'],
  show: 0,
  animation: 'horizontal',
  direction: 'forward',
};

new Pages(pages);
new Pages({ show: -1 });

// Invalid animation should be rejected.
const badAnimation: IPagesOptions = {
  pages: [],
  // @ts-expect-error animation must be 'horizontal' | 'vertical'
  animation: 'fade',
};
