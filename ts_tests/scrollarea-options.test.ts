import { ScrollArea, IScrollAreaOptions } from '../src/widgets/scrollarea.js';

// ScrollArea only extends IWidgetOptions (no extra options).
const opts: IScrollAreaOptions = {
  class: 'my-scrollarea',
  visible: true,
};

const scrollareaWidget = new ScrollArea(opts);
new ScrollArea({ id: 'scroller' });

// .set(key, value) API type-checking
scrollareaWidget.set('visible', true);
// @ts-expect-error value for 'visible' must be boolean | string
scrollareaWidget.set('visible', 123);
