import { ConfirmButton, IConfirmButtonOptions } from '../src/widgets/confirmbutton.js';

// Valid ConfirmButton options.
const confirmBtn: IConfirmButtonOptions = {
  label: 'Delete',
  icon: 'trash',
  confirm: true,
  timeout: 3000,
  interrupt: 200,
  label_confirm: 'Click again to confirm',
  icon_confirm: 'check',
};

new ConfirmButton(confirmBtn);
new ConfirmButton({ label: 'Save', confirm: false });

// Invalid timeout type should be rejected.
const badTimeout: IConfirmButtonOptions = {
  label: 'x',
  // @ts-expect-error timeout must be a number
  timeout: '3000',
};
