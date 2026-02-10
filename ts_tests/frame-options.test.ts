import { Frame, IFrameOptions } from '../src/widgets/frame.js';

// Valid Frame options (extends Container).
const frame: IFrameOptions = {
  label: 'My Frame',
  content: '<p>Content</p>',
};

const frameWidget = new Frame(frame);
new Frame({ label: false });

// .set(key, value) API type-checking
frameWidget.set('label', 'New Title');
// @ts-expect-error value for 'label' must be string | false
frameWidget.set('label', 123);

// Invalid label type should be rejected.
const badLabel: IFrameOptions = {
  content: 'x',
  // @ts-expect-error label must be string | false
  label: 123,
};
