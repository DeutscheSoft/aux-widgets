import { Window, IWindowOptions } from '../src/widgets/window.js';

// Valid Window options modeled after Dialog example usage.
const autoCloseWindow: Partial<IWindowOptions> = {
  auto_close: true,
  modal: false,
  anchor: 'center',
  content: 'This is a Dialog widget. Click anywhere outside to close.',
};

const modalWindow: Partial<IWindowOptions> = {
  modal: true,
  anchor: 'center',
  content: 'This is a modal Dialog widget.',
};

const windowWidget = new Window(autoCloseWindow);
new Window({
  width: 200,
  height: 100,
  x: 10,
  y: 20,
  header: ['title', 'close'],
  footer: false,
});

// .set(key, value) API type-checking
windowWidget.set('anchor', 'top-left');
// @ts-expect-error value for 'anchor' must be valid IWindowAnchor
windowWidget.set('anchor', 'middle');

// .get(key) API type-checking
const _windowAnchor: string | undefined = windowWidget.get('anchor');
// @ts-expect-error 'not_an_option_key' is not a valid option key
windowWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
windowWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
windowWidget.on('not_an_event', () => {});

// Invalid anchor option should be rejected.
const badAnchor: Partial<IWindowOptions> = {
  // @ts-expect-error anchor must be a valid IWindowAnchor
  anchor: 'middle',
};

