import { Panorama, IPanoramaOptions } from '../src/widgets/panorama.js';

// Valid Panorama options (extends Chart).
const panorama: IPanoramaOptions = {
  label: 'Panorama',
  mode: 'panorama',
  range: 1,
  digits: 2,
};

new Panorama(panorama);
new Panorama({ mode: 'balance' });

// Invalid mode should be rejected.
const badMode: IPanoramaOptions = {
  label: 'x',
  // @ts-expect-error mode must be 'panorama' | 'balance' | 'surround'
  mode: 'stereo',
};
