import { Subscription, Subscriptions } from '../src/utils/subscriptions.js';
import { assert } from './helpers.js';

describe('Subscriptions', () => {
  it('basics', () => {
    {
      let called = 0;

      const subs = new Subscriptions();

      subs.add(() => called++);

      assert(!subs.closed);
      subs.unsubscribe();
      assert(subs.closed);
      subs.unsubscribe();

      assert(called === 1);
    }

    {
      let called = 0;
      const subs1 = new Subscriptions();

      subs1.add(() => called++);

      const subs2 = new Subscriptions(subs1);

      subs1.add(() => called++);

      subs2.unsubscribe();

      assert(called === 2);
    }

    {
      let called = 0;
      const subs1 = new Subscriptions();

      subs1.add(() => called++);

      const subs2 = new Subscriptions();

      subs2.add(subs1);

      subs1.add(() => called++);

      subs2.unsubscribe();

      assert(called === 2);
    }
  });
});
