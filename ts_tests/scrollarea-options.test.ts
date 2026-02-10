import { ScrollArea, IScrollAreaOptions } from '../src/widgets/scrollarea.js';

// ScrollArea only extends IWidgetOptions (no extra options).
const opts: IScrollAreaOptions = {
  class: 'my-scrollarea',
  visible: true,
};

new ScrollArea(opts);
new ScrollArea({ id: 'scroller' });
