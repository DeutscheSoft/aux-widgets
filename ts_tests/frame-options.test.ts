import { Frame, IFrameOptions } from '../src/widgets/frame.js';

// Valid Frame options (extends Container).
const frame: IFrameOptions = {
  label: 'My Frame',
  content: '<p>Content</p>',
};

new Frame(frame);
new Frame({ label: false });

// Invalid label type should be rejected.
const badLabel: IFrameOptions = {
  content: 'x',
  // @ts-expect-error label must be string | false
  label: 123,
};
