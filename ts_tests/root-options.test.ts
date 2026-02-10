import { Root } from '../src/widgets/root.js';
import { IContainerOptions } from '../src/widgets/container.js';

// Root uses IContainerOptions.
const opts: IContainerOptions = {
  content: '<div>Root content</div>',
  visible: true,
};

const rootWidget = new Root(opts);
new Root({ visible: 'show' });

// .set(key, value) API type-checking
rootWidget.set('visible', true);
// @ts-expect-error value for 'visible' must be boolean | 'hiding' | 'showing' | 'show' | 'hide'
rootWidget.set('visible', 'fade');
