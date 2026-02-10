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

const confirmButtonWidget = new ConfirmButton(confirmBtn);
new ConfirmButton({ label: 'Save', confirm: false });

// .set(key, value) API type-checking
confirmButtonWidget.set('timeout', 2000);
// @ts-expect-error value for 'timeout' must be number
confirmButtonWidget.set('timeout', '2000');

// .get(key) API type-checking
const _confirmTimeout: number | undefined = confirmButtonWidget.get('timeout');
// @ts-expect-error 'not_an_option_key' is not a valid option key
confirmButtonWidget.get('not_an_option_key');

// Invalid timeout type should be rejected.
const badTimeout: IConfirmButtonOptions = {
  label: 'x',
  // @ts-expect-error timeout must be a number
  timeout: '3000',
};
