import { Dialog, IDialogOptions } from '../src/index.js';

// Valid Dialog options (from examples/Dialog.html).
const autoCloseDialog: Partial<IDialogOptions> = {
  visible: false,
  toplevel: true,
  auto_close: true,
  auto_remove: false,
  anchor: 'center',
};

const modalDialog: Partial<IDialogOptions> = {
  visible: false,
  toplevel: true,
  auto_remove: false,
  modal: true,
  anchor: 'center',
  content: 'Modal content',
};

const dialogWidget = new Dialog(autoCloseDialog);
new Dialog({ x: 10, y: 20, anchor: 'top-left', reset_focus: true });

// .set(key, value) API type-checking
dialogWidget.set('anchor', 'center');
// @ts-expect-error value for 'anchor' must be valid IAnchor
dialogWidget.set('anchor', 'middle');

// .get(key) API type-checking
const _dialogAnchor: string | undefined = dialogWidget.get('anchor');
// @ts-expect-error 'not_an_option_key' is not a valid option key
dialogWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
dialogWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
dialogWidget.on('not_an_event', () => {});

// Invalid anchor should be rejected.
const badAnchor: Partial<IDialogOptions> = {
  // @ts-expect-error anchor must be a valid IAnchor
  anchor: 'middle',
};
