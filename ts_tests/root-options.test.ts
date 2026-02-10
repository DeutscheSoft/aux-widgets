import { Root } from '../src/widgets/root.js';
import { IContainerOptions } from '../src/widgets/container.js';

// Root uses IContainerOptions.
const opts: IContainerOptions = {
  content: '<div>Root content</div>',
  visible: true,
};

new Root(opts);
new Root({ visible: 'show' });
