import { Widget, IWidgetOptions, IWidgetEvents } from '../src/widgets/widget.js';

// Basic valid widget options should typecheck.
const widget = new Widget({
  class: 'my-widget',
  debug: true,
  id: 'my-id',
  styles: { color: 'red' },
  disabled: false,
  visible: true,
  aria_label: 'Accessible label',
  tabindex: 0,
});

// .set(key, value) API type-checking
widget.set('visible', false);
// @ts-expect-error value for 'aria_label' must be string
widget.set('aria_label', 123);

// .get(key) API type-checking
const _widgetVisible: boolean | string | undefined = widget.get('visible');
// @ts-expect-error 'not_an_option_key' is not a valid option key
widget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
widget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
widget.on('not_an_event', () => {});

// Partial options are allowed because the constructor takes Partial<TOptions>.
new Widget({
  visible: false,
  focus: true,
});

// Invalid ARIA attribute type should fail typechecking.
const badOptions: Partial<IWidgetOptions> = {
  // @ts-expect-error aria_* fields must be strings when present.
  aria_label: 123,
};

