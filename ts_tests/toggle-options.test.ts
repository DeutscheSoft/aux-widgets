import { Toggle, IToggleOptions } from '../src/widgets/toggle.js';

// Valid Toggle options based on examples.
const simpleToggle: Partial<IToggleOptions> = {
  label: 'Toggle me',
  icon: 'warning',
  icon_active: 'success',
};

const delayedToggle: Partial<IToggleOptions> = {
  label: 'Toggle me at leisure',
  icon: 'warning',
  icon_active: 'success',
  delay: 1000,
};

const pressToggle: Partial<IToggleOptions> = {
  label: 'Press or toggle me',
  label_active: 'Release or toggle me',
  icon: 'warning',
  icon_active: 'success',
  press: 250,
};

const nonTogglePress: Partial<IToggleOptions> = {
  label: 'Press me',
  label_active: 'Release me',
  icon: 'warning',
  icon_active: 'success',
  toggle: false,
};

const toggleWidget = new Toggle(simpleToggle);
new Toggle({
  toggle: true,
  state: true,
});

// .set(key, value) API type-checking
toggleWidget.set('state', true);
// @ts-expect-error value for 'press' must be number
toggleWidget.set('press', '250');

// .get(key) API type-checking
const _toggleState: boolean | undefined = toggleWidget.get('state');
// @ts-expect-error 'not_an_option_key' is not a valid option key
toggleWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
toggleWidget.on('resize', () => {});
// @ts-expect-error 'not_an_event' is not a valid event name
toggleWidget.on('not_an_event', () => {});

// Invalid press type should be rejected.
const badPress: Partial<IToggleOptions> = {
  // @ts-expect-error press must be a number
  press: '250',
};

// Invalid icon_active type should be rejected.
const badIconActive: Partial<IToggleOptions> = {
  // @ts-expect-error icon_active must be string | false
  icon_active: true,
};

