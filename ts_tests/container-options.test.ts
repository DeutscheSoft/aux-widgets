import { Container, IContainerOptions } from '../src/widgets/container.js';

// Valid Container options.
const withContent: IContainerOptions = {
  content: '<p>Hello</p>',
};

const withVisible: IContainerOptions = {
  visible: true,
  hiding_duration: 200,
  showing_duration: 300,
  render_while_hiding: false,
};

const containerWidget = new Container(withContent);
new Container({ visible: 'show', content: 'x' });

// .set(key, value) API type-checking
containerWidget.set('visible', true);
// @ts-expect-error value for 'visible' must be boolean | 'hiding' | 'showing' | 'show' | 'hide'
containerWidget.set('visible', 'fade');

// .get(key) API type-checking
const _containerVisible: boolean | 'hiding' | 'showing' | 'show' | 'hide' | undefined = containerWidget.get('visible');
// @ts-expect-error 'not_an_option_key' is not a valid option key
containerWidget.get('not_an_option_key');

// Invalid visible value should be rejected.
const badVisible: IContainerOptions = {
  // @ts-expect-error visible must be boolean | 'hiding' | 'showing' | 'show' | 'hide'
  visible: 'fade',
};
