/**
 * @module matrix
 */

import {
  init_subscriptions,
  add_subscription,
  unsubscribe_subscriptions,
} from '../../utils/subscriptions.js';

export function call_continuation_if(node, subscribe_predicate, continuation) {
  let active = false;
  let inner_subscription = init_subscriptions();

  let subscription = subscribe_predicate(node, (value) => {
    // nothing todo
    if (active === value) return;

    active = value;

    if (value) {
      inner_subscription = continuation(node);
    } else {
      inner_subscription = unsubscribe_subscriptions(inner_subscription);
    }
  });

  return () => {
    subscription = unsubscribe_subscriptions(subscription);
    inner_subscription = unsubscribe_subscriptions(inner_subscription);
  };
}
