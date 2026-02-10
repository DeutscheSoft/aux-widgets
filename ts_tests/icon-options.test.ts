import { Icon, IIconOptions } from '../src/widgets/icon.js';

// Valid Icon options.
const withIcon: IIconOptions = {
  icon: 'gear',
};

const noIcon: IIconOptions = {
  icon: false,
  role: 'img',
};

new Icon(withIcon);
new Icon({ icon: '--my-icon-var' });

// Invalid icon type should be rejected.
const badIcon: IIconOptions = {
  // @ts-expect-error icon must be string | false
  icon: 123,
};
