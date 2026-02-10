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

// Invalid icon type should be rejected.
const badIcon: IIconOptions = {
  // @ts-expect-error icon must be string | false
  icon: 123,
};
