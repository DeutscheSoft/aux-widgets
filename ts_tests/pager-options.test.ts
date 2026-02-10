import { Pager, IPagerOptions } from '../src/widgets/pager.js';

// Valid Pager options.
const pager: Partial<IPagerOptions> = {
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

// .get(key) API type-checking
const _pagerPosition: 'top' | 'right' | 'left' | 'bottom' | undefined = pagerWidget.get('position');
// @ts-expect-error 'not_an_option_key' is not a valid option key
pagerWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
pagerWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
pagerWidget.on('not_an_event', () => {});

// Invalid position should be rejected.
const badPosition: Partial<IPagerOptions> = {
  // @ts-expect-error position must be 'top' | 'right' | 'left' | 'bottom'
  position: 'center',
};
