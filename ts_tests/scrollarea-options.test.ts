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

// .get(key) API type-checking
const _scrollareaVisible: boolean | string | undefined = scrollareaWidget.get('visible');
// @ts-expect-error 'not_an_option_key' is not a valid option key
scrollareaWidget.get('not_an_option_key');
