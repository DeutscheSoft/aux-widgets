import { State, IStateOptions } from '../src/index.js';

// Valid State options.
const onState: Partial<IStateOptions> = {
  state: true,
  color: '#00ff00',
};

const levelState: Partial<IStateOptions> = {
  state: 0.5,
  color: 'red',
};

const noColor: Partial<IStateOptions> = {
  state: 0,
  color: false,
};

const stateWidget = new State(onState);
new State({ state: 1 });

// .set(key, value) API type-checking
stateWidget.set('state', 0.5);
// @ts-expect-error value for 'color' must be string | false
stateWidget.set('color', 0xff0000);

// .get(key) API type-checking
const _stateState: number | boolean | undefined = stateWidget.get('state');
// @ts-expect-error 'not_an_option_key' is not a valid option key
stateWidget.get('not_an_option_key');

// .on(event, handler) events API type-checking — event name and handler signature are typed
stateWidget.on('set_state', (value: number | boolean) => { void value; });
// @ts-expect-error 'not_an_event' is not a valid event name
stateWidget.on('not_an_event', () => {});

// Invalid color type should be rejected.
const badColor: Partial<IStateOptions> = {
  state: 1,
  // @ts-expect-error color must be string | false
  color: 0xff0000,
};
