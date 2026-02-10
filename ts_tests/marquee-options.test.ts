import { Marquee, IMarqueeOptions } from '../src/widgets/marquee.js';

// Valid Marquee options (extends Container + Label).
const marquee: Partial<IMarqueeOptions> = {
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

// .on(event, handler) events API type-checking — event name and handler signature are typed
marqueeWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
marqueeWidget.on('not_an_event', () => {});

// Invalid easing type should be rejected (if we use a wrong literal).
const badSpeed: Partial<IMarqueeOptions> = {
  label: 'x',
  // @ts-expect-error speed must be a number
  speed: '50',
};
