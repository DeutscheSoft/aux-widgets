import { Marquee, IMarqueeOptions } from '../src/widgets/marquee.js';

// Valid Marquee options (extends Container + Label).
const marquee: IMarqueeOptions = {
  label: 'Scrolling text',
  speed: 50,
  pause: 1000,
  easing: 'linear',
};

const marqueeWidget = new Marquee(marquee);
new Marquee({ label: 'x', easing: 'ease-in-out' });

// .set(key, value) API type-checking
marqueeWidget.set('speed', 100);
// @ts-expect-error value for 'speed' must be number
marqueeWidget.set('speed', '100');

// .get(key) API type-checking
const _marqueeSpeed: number | undefined = marqueeWidget.get('speed');
// @ts-expect-error 'not_an_option_key' is not a valid option key
marqueeWidget.get('not_an_option_key');

// Invalid easing type should be rejected (if we use a wrong literal).
const badSpeed: IMarqueeOptions = {
  label: 'x',
  // @ts-expect-error speed must be a number
  speed: '50',
};
