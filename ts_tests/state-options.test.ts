import { State, IStateOptions } from '../src/widgets/state.js';

// Valid State options.
const onState: IStateOptions = {
  state: true,
  color: '#00ff00',
};

const levelState: IStateOptions = {
  state: 0.5,
  color: 'red',
};

const noColor: IStateOptions = {
  state: 0,
  color: false,
};

new State(onState);
new State({ state: 1 });

// Invalid color type should be rejected.
const badColor: IStateOptions = {
  state: 1,
  // @ts-expect-error color must be string | false
  color: 0xff0000,
};
