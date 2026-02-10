import { Icon, IIconOptions } from '../src/widgets/icon.js';

// Valid Icon options.
const withIcon: IIconOptions = {
  icon: 'gear',
};

const noIcon: IIconOptions = {
  icon: false,
  role: 'img',
};

const iconWidget = new Icon(withIcon);
new Icon({ icon: '--my-icon-var' });

// .set(key, value) API type-checking
iconWidget.set('icon', 'check');
// @ts-expect-error value for 'icon' must be string | false
iconWidget.set('icon', 123);

// .get(key) API type-checking
const _iconIcon: string | false | undefined = iconWidget.get('icon');
// @ts-expect-error 'not_an_option_key' is not a valid option key
iconWidget.get('not_an_option_key');

// Invalid icon type should be rejected.
const badIcon: IIconOptions = {
  // @ts-expect-error icon must be string | false
  icon: 123,
};
