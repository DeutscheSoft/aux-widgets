import { Widget, IWidgetOptions, IWidgetEvents } from '../src/widgets/widget.js';

// Basic valid widget options should typecheck.
const widget = new Widget<IWidgetOptions, IWidgetEvents>({
  class: 'my-widget',
  debug: true,
  id: 'my-id',
  styles: { color: 'red' },
  disabled: false,
  visible: true,
  aria_label: 'Accessible label',
  tabindex: 0,
});

// Partial options are allowed because the constructor takes Partial<TOptions>.
new Widget({
  visible: false,
  focus: true,
});

// Invalid ARIA attribute type should fail typechecking.
const badOptions: IWidgetOptions = {
  // @ts-expect-error aria_* fields must be strings when present.
  aria_label: 123,
};

