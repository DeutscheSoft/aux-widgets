import { Dialog, IDialogOptions } from '../src/widgets/dialog.js';

// Valid Dialog options (from examples/Dialog.html).
const autoCloseDialog: IDialogOptions = {
  visible: false,
  toplevel: true,
  auto_close: true,
  auto_remove: false,
  anchor: 'center',
};

const modalDialog: IDialogOptions = {
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

// Invalid anchor should be rejected.
const badAnchor: IDialogOptions = {
  // @ts-expect-error anchor must be a valid IAnchor
  anchor: 'middle',
};
