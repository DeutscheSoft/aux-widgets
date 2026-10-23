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

import { Container, defineRecalculation } from '../../src/index.js';
import { waitForDrawn, assert, assertEqual } from './utils/helpers.js';

/**
 * Fresh class hierarchy per test: static `_renderers` / `_renderer` are
 * cached on the constructor, so cases cannot share classes.
 */
function defineHierarchy() {
  class Parent extends Container {
    static get _options() {
      return { parent_opt: 'number' };
    }

    static get options() {
      return { parent_opt: 1 };
    }

    static get static_events() {
      return {
        set_parent_opt: function (value) {
          this.parentOptSeen = value;
        },
      };
    }

    static get child_widgets() {
      return [{ name: 'head', create: Container, show: true }];
    }

    static get child_elements() {
      return [{ name: 'grip', show: true }];
    }
  }

  class Child extends Parent {
    static get _options() {
      return {
        size: 'number',
        _amount: 'number',
      };
    }

    static get options() {
      return {
        size: 32,
        _amount: 0,
      };
    }

    static get renderers() {
      return [
        defineRecalculation(['size'], function (size) {
          this.update('_amount', size);
        }),
      ];
    }

    static get child_widgets() {
      return [{ name: 'body', create: Container, show: true }];
    }
  }

  class Grandchild extends Child {
    static get renderers() {
      return [
        defineRecalculation(['size'], function (size) {
          this.update('_amount', size * 2);
        }),
      ];
    }
  }

  return { Parent, Child, Grandchild };
}

function dummyTask() {
  return defineRecalculation(['size'], function () {});
}

async function assertChildInit(widget, amountAfterSize16 = 16) {
  await waitForDrawn(widget);

  assert(widget.head, 'missing inherited child widget `head`');
  assert(
    widget.head.element.parentNode === widget.element,
    '`head` is not attached'
  );

  assert(widget.body, 'missing own child widget `body`');
  assert(
    widget.body.element.parentNode === widget.element,
    '`body` is not attached'
  );

  assert(widget._grip, 'missing inherited child element `grip`');
  assert(widget._grip.parentNode === widget.element, '`grip` is not attached');

  const Class = widget.constructor;

  assert(Class.hasOption('show_head'), 'missing show_head');
  assert(Class.hasOption('show_body'), 'missing show_body');
  assert(Class.hasOption('show_grip'), 'missing show_grip');
  assert(Class.hasOption('parent_opt'), 'missing inherited parent_opt');

  widget.set('parent_opt', 7);
  assert(widget.parentOptSeen === 7, 'inherited static event did not run');

  widget.set('size', 16);
  await waitForDrawn(widget);
  assertEqual(widget.get('_amount'), amountAfterSize16);

  assertEqual(Class.getRenderer().taskCount, Class.getRenderers().length);
}

const earlyAccess = [
  ['no prior access', () => {}],
  ['getOptionTypes()', (Class) => Class.getOptionTypes()],
  ['getDefaultOptions()', (Class) => Class.getDefaultOptions()],
  ['hasOption()', (Class) => Class.hasOption('parent_opt')],
  ['getStaticEvents()', (Class) => Class.getStaticEvents()],
  ['getRenderers()', (Class) => Class.getRenderers()],
  ['getRenderer()', (Class) => Class.getRenderer()],
  ['addTask()', (Class) => Class.addTask(dummyTask())],
];

describe('Widget class initialization', () => {
  describe('Child after early static access', () => {
    earlyAccess.forEach(([label, access]) => {
      it(label, async () => {
        const { Child } = defineHierarchy();
        access(Child);
        const widget = new Child();
        await assertChildInit(widget);
        widget.destroy();
      });
    });
  });

  it('Parent.getRenderers() before constructing Child', async () => {
    const { Parent, Child } = defineHierarchy();
    Parent.getRenderers();
    const widget = new Child();
    await assertChildInit(widget);
    widget.destroy();
  });

  it('Grandchild after getRenderers() keeps both ancestors’ children', async () => {
    const { Grandchild } = defineHierarchy();
    Grandchild.getRenderers();
    const widget = new Grandchild();
    await assertChildInit(widget, 32);
    widget.destroy();
  });

  it('addTask() after getRenderer() throws', () => {
    const { Child } = defineHierarchy();
    Child.getRenderer();

    let threw = false;
    try {
      Child.addTask(dummyTask());
    } catch (err) {
      threw = true;
    }
    assert(threw, 'expected addTask() to throw');
  });
});
