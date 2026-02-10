import { Window, IWindowOptions } from '../src/widgets/window.js';

// Valid Window options modeled after Dialog example usage.
const autoCloseWindow: IWindowOptions = {
  auto_close: true,
  modal: false,
  anchor: 'center',
  content: 'This is a Dialog widget. Click anywhere outside to close.',
};

const modalWindow: IWindowOptions = {
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

// Invalid anchor option should be rejected.
const badAnchor: IWindowOptions = {
  // @ts-expect-error anchor must be a valid IWindowAnchor
  anchor: 'middle',
};

