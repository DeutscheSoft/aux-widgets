/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

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
