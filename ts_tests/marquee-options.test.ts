import { Marquee, IMarqueeOptions } from '../src/widgets/marquee.js';

// Valid Marquee options (extends Container + Label).
const marquee: IMarqueeOptions = {
  label: 'Scrolling text',
  speed: 50,
  pause: 1000,
  easing: 'linear',
};

new Marquee(marquee);
new Marquee({ label: 'x', easing: 'ease-in-out' });

// Invalid easing type should be rejected (if we use a wrong literal).
const badSpeed: IMarqueeOptions = {
  label: 'x',
  // @ts-expect-error speed must be a number
  speed: '50',
};
