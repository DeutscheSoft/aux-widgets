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

new Container(withContent);
new Container({ visible: 'show', content: 'x' });

// Invalid visible value should be rejected.
const badVisible: IContainerOptions = {
  // @ts-expect-error visible must be boolean | 'hiding' | 'showing' | 'show' | 'hide'
  visible: 'fade',
};
