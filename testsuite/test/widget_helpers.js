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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { addEvent, mergeStaticEvents } from '../../src/widget_helpers.js';
import { hasSubscriber } from '../../src/utils/subscribers.js';
import { Base } from '../../src/index.js';
import { assert } from './utils/helpers.js';

describe('mergeStaticEvents', () => {
  it('does not share mutable subscriber lists with the parent', () => {
    const parentHandlerA = () => {};
    const parentHandlerB = () => {};
    const childHandler = () => {};

    // Parent already has an array for this event. Subclass merge must
    // clone it so later addEvent cannot push onto the parent list.
    const parent = {
      initialize_children: [parentHandlerA, parentHandlerB],
    };

    const child = mergeStaticEvents(parent, {});

    assert(child !== parent);
    assert(child.initialize_children !== parent.initialize_children);
    assert(Array.isArray(child.initialize_children));
    assert(child.initialize_children.length === 2);

    addEvent(child, 'initialize_children', childHandler);

    assert(parent.initialize_children.length === 2);
    assert(!hasSubscriber(parent.initialize_children, childHandler));
    assert(hasSubscriber(child.initialize_children, childHandler));
    assert(child.initialize_children.length === 3);
  });

  it('clones single-handler parent entries', () => {
    const parentHandler = () => {};
    const childHandler = () => {};
    const parent = { foo: parentHandler };

    const child = mergeStaticEvents(parent, {});

    assert(child.foo === parentHandler);

    addEvent(child, 'foo', childHandler);

    assert(child.foo !== parent.foo);
    assert(parent.foo === parentHandler);
    assert(hasSubscriber(child.foo, parentHandler));
    assert(hasSubscriber(child.foo, childHandler));
  });

  it('merges overlapping events without mutating inputs', () => {
    const a1 = () => {};
    const a2 = () => {};
    const b1 = () => {};
    const a = { foo: [a1, a2], bar: a1 };
    const b = { foo: b1, baz: b1 };

    const merged = mergeStaticEvents(a, b);

    assert(a.foo.length === 2);
    assert(a.bar === a1);
    assert(b.foo === b1);
    assert(hasSubscriber(merged.foo, a1));
    assert(hasSubscriber(merged.foo, a2));
    assert(hasSubscriber(merged.foo, b1));
    assert(merged.bar === a1);
    assert(merged.baz === b1);
  });
});

describe('static event inheritance', () => {
  it('subclass addStaticEvent does not mutate parent handlers', () => {
    class Parent extends Base {}
    class Child extends Parent {}

    const parentA = () => {};
    const parentB = () => {};
    const childHandler = () => {};

    // Build an array on the parent before the child merges static events.
    // Pollution only happens once the shared list is already an array;
    // addSubscriber then pushes in place.
    Parent.addStaticEvent('foo', parentA);
    Parent.addStaticEvent('foo', parentB);

    const parentBefore = Parent.getStaticEvents().foo;
    assert(Array.isArray(parentBefore));
    assert(parentBefore.length === 2);

    Child.addStaticEvent('foo', childHandler);

    const parentAfter = Parent.getStaticEvents().foo;
    const childEvents = Child.getStaticEvents().foo;

    assert(parentAfter === parentBefore);
    assert(parentAfter.length === 2);
    assert(!hasSubscriber(parentAfter, childHandler));
    assert(hasSubscriber(childEvents, parentA));
    assert(hasSubscriber(childEvents, parentB));
    assert(hasSubscriber(childEvents, childHandler));
  });
});
