import { Frame, IFrameOptions } from '../src/widgets/frame.js';

// Valid Frame options (extends Container).
const frame: Partial<IFrameOptions> = {
  label: 'My Frame',
  content: '<p>Content</p>',
};

const frameWidget = new Frame(frame);
new Frame({ label: false });

// .set(key, value) API type-checking
frameWidget.set('label', 'New Title');
// @ts-expect-error value for 'label' must be string | false
frameWidget.set('label', 123);

// .get(key) API type-checking
const _frameLabel: string | false | undefined = frameWidget.get('label');
// @ts-expect-error 'not_an_option_key' is not a valid option key
frameWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
frameWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
frameWidget.on('not_an_event', () => {});

// Invalid label type should be rejected.
const badLabel: Partial<IFrameOptions> = {
  content: 'x',
  // @ts-expect-error label must be string | false
  label: 123,
};
