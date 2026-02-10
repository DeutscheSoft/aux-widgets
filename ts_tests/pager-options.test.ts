import { Pager, IPagerOptions } from '../src/widgets/pager.js';

// Valid Pager options.
const pager: IPagerOptions = {
  position: 'top',
  show: 0,
  pages: [{ label: 'One', content: '<p>Page 1</p>' }, { label: 'Two', content: '<p>Page 2</p>' }],
};

const pagerWidget = new Pager(pager);
new Pager({ position: 'bottom', show: null });

// .set(key, value) API type-checking
pagerWidget.set('position', 'bottom');
// @ts-expect-error value for 'position' must be 'top' | 'right' | 'left' | 'bottom'
pagerWidget.set('position', 'center');

// Invalid position should be rejected.
const badPosition: IPagerOptions = {
  // @ts-expect-error position must be 'top' | 'right' | 'left' | 'bottom'
  position: 'center',
};
