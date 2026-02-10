import { Panorama, IPanoramaOptions } from '../src/widgets/panorama.js';

// Valid Panorama options (extends Chart).
const panorama: Partial<IPanoramaOptions> = {
  label: 'Panorama',
  mode: 'panorama',
  range: 1,
  digits: 2,
};

const panoramaWidget = new Panorama(panorama);
new Panorama({ mode: 'balance' });

// .set(key, value) API type-checking
panoramaWidget.set('mode', 'balance');
// @ts-expect-error value for 'mode' must be IPanoramaMode
panoramaWidget.set('mode', 'stereo');

// .get(key) API type-checking
const _panoramaMode: 'panorama' | 'balance' | 'surround' | undefined = panoramaWidget.get('mode');
// @ts-expect-error 'not_an_option_key' is not a valid option key
panoramaWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
panoramaWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
panoramaWidget.on('not_an_event', () => {});

// Invalid mode should be rejected.
const badMode: Partial<IPanoramaOptions> = {
  label: 'x',
  // @ts-expect-error mode must be 'panorama' | 'balance' | 'surround'
  mode: 'stereo',
};
