import { Root } from '../src/index.js';
import { IContainerOptions } from '../src/index.js';

// Root uses IContainerOptions.
const opts: Partial<IContainerOptions> = {
  content: '<div>Root content</div>',
  visible: true,
};

const rootWidget = new Root(opts);
new Root({ visible: 'show' });

// .set(key, value) API type-checking
rootWidget.set('visible', true);
// @ts-expect-error value for 'visible' must be boolean | 'hiding' | 'showing' | 'show' | 'hide'
rootWidget.set('visible', 'fade');

// .get(key) API type-checking
const _rootVisible:
  | boolean
  | 'hiding'
  | 'showing'
  | 'show'
  | 'hide'
  | undefined = rootWidget.get('visible');
// @ts-expect-error 'not_an_option_key' is not a valid option key
rootWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
rootWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
rootWidget.on('not_an_event', () => {});
