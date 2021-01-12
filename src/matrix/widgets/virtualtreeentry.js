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

import { defineClass } from '../../widget_helpers.js';
import { defineChildWidget } from '../../child_widget.js';
import {
  setText,
  addClass,
  removeClass,
  toggleClass,
} from '../../utils/dom.js';
import { Timer } from '../../utils/timers.js';
import { Subscriptions } from '../../utils/subscriptions.js';

import { Container } from '../../widgets/container.js';
import { Button } from '../../widgets/button.js';
import { Label } from '../../widgets/label.js';
import { Icon } from '../../widgets/icon.js';

const indent_to_glyph = {
  trunk: '',
  branch: '',
  end: '',
  none: '',
};

function composeDepth(tree_position) {
  let depth = [];

  if (tree_position.length == 1) return depth;

  for (let i = 1, m = tree_position.length - 1; i < m; ++i) {
    if (tree_position[i]) depth.push('none');
    else depth.push('trunk');
  }

  if (tree_position[tree_position.length - 1]) depth.push('end');
  else depth.push('branch');

  return depth;
}

/**
 * VirtualTreeEntry is the base class used in {@link VirtualTree}. It
 * consists of a {@link Label}, an {@link Icon}, a {@link Button} for
 * collapsing grouped entries and a {@link Label} displaying indentation
 * icons. Overload this class if you want to add more items.
 *
 * @param {Object} [options={ }] - An onject containing initial options.
 *
 * @property {String} [options.label=false] - Set to a string to display a label,
 *   set to `false` to entirely remove it from the DOM.
 * @property {String} [options.icon=false] - Set to a string to display an icon,
 *   set to `false` to entirely remove it from the DOM.
 * @property {Array|Boolean} [options.depth=false] - An array containing
 *   strings defining the indentation icons. Possible strings are
 *   `trunk`, `branch`, `end` and `none`. Set to `false` to remove the
 *   element from the DOM.
 * @property {Boolean} [options.collapsable=false] - Defines if the entry
 *   is collapsable. Collapsable items are displayed as group headers
 *   with a button to toggle collapsed state.
 * @property {Boolean}[options.collapsed=false] - Defines the collapsed
 *   state of a group header and its descendants.
 * @property {String} [options.icon_collapsed='arrowup'] - The icon to
 *   display in groups collapse button for collapsed state.
 * @property {String} [options.icon_uncollapsed='arrowdown'] - The icon to
 *   display in groups collapse button for uncollapsed (open) state.
 * @property {Boolean} [options.odd=false] - Defines the divisibility by two
 *   of the index of the entry in the list. This sets the class aux-odd
 *   to style alternating entries.
 * @property {Boolean} [options.group=false] - Define if this entry is a
 *   group header.
 *
 * @extends VirtualTreeEntryBase
 *
 * @class VirtualTreeEntry
 */

import { VirtualTreeEntryBase } from './virtualtreeentrybase.js';

export const VirtualTreeEntry = defineClass({
  Extends: VirtualTreeEntryBase,
  _options: Object.assign(
    Object.create(VirtualTreeEntryBase.prototype._options),
    {
      label: 'string|boolean',
      depth: 'array|boolean',
      collapsable: 'boolean',
      collapsed: 'boolean',
      icon_collapsed: 'string',
      icon_uncollaped: 'string',
      icon: 'string|boolean',
      odd: 'boolean',
      group: 'boolean',
    }
  ),
  options: {
    label: false,
    depth: false,
    collapsable: false,
    collapsed: false,
    icon_collapsed: 'arrowdown',
    icon_uncollapsed: 'arrowup',
    icon: false,
    odd: false,
    group: false,
  },
  initialize: function (options) {
    VirtualTreeEntryBase.prototype.initialize.call(this, options);
    this.data_subscriptions = new Subscriptions();
    this.data_subscription_timer = new Timer(() => {
      this.subscribeData();
    });
  },
  draw: function (options, element) {
    VirtualTreeEntryBase.prototype.draw.call(this, options, element);
    element.classList.add('aux-virtualtreeentry');
  },
  /**
   * This function is called internally to subscribe to properties
   * Overload in order to handle additional data being displayed
   * on custom entry classes.
   *
   * @method VirtualTree#subscribeData
   */
  subscribeData: function () {
    const subs = this.data_subscriptions;
    const element = this.get('data');

    if (!element) return;

    subs.add(
      element.subscribe('propertyChanged', (key, value) => {
        switch (key) {
          case 'label':
            this.update('label', value);
            break;
          case 'icon':
            this.update('icon', value);
            break;
        }
      })
    );
  },
  /**
   * This function is called internally on scroll to update the entries'
   * content. Overload in order to handle additional data being displayed
   * on custom entry classes.
   *
   * @method VirtualTree#subscribeData
   *
   * @param {Object} virtualtreeview - The VirtualTreeViewData object.
   * @param {Integer} index - the index of the entry inside the list.
   * @param {Object} data - The data model holding the properties values.
   * @param {Integer} treeposition - An array containing information
   *   about the entries indentation inside the tree.
   */
  updateData: function (virtualtreeview, index, element, treePosition) {
    this.data_subscriptions.unsubscribe();

    if (element) {
      this.update('depth', composeDepth(treePosition));
      this.update('collapsable', element.isGroup);
      this.update('group', element.isGroup);
      this.update('odd', (index & 1) === 0);
      this.update(
        'collapsed',
        element.isGroup && virtualtreeview.isCollapsed(element)
      );
      this.update('label', element.label);
      this.update('icon', element.icon);

      // start listening to changes after 500ms
      this.data_subscription_timer.restart(500);
    }
  },
  redraw: function () {
    VirtualTreeEntryBase.prototype.redraw.call(this);

    const O = this.options;
    const E = this.element;
    const I = this.invalid;

    if (I.depth) {
      I.depth = false;
      var C = E.getAttribute('class');
      C = C.replace(/aux-depth-[0-9]*/gm, '');
      C = C.replace(/\s\s+/g, ' ');
      E.setAttribute('class', C);

      if (O.depth) {
        var d = O.depth.length;
        E.classList.add('aux-depth-' + d);
        E.style.setProperty('--aux-entry-depth', d);
        var s = '';
        for (var i = 0; i < d; ++i) {
          s += indent_to_glyph[O.depth[i]];
        }
        setText(this.indent.element, s);
      }
    }

    if (I.odd) {
      I.odd = false;
      removeClass(E, 'aux-even');
      removeClass(E, 'aux-odd');
      addClass(E, O.odd ? 'aux-odd' : 'aux-even');
    }

    if (I.collapsable) {
      I.collapsable = false;
      toggleClass(E, 'aux-collapsable', O.collapsable);
    }

    if (I.group) {
      I.group = false;
      toggleClass(E, 'aux-group', O.group);
    }

    if (I.collapsed) {
      I.collapsed = false;
      this.collapse.set(
        'icon',
        O[O.collapsed ? 'icon_collapsed' : 'icon_uncollapsed']
      );
    }
  },
});

defineChildWidget(VirtualTreeEntry, 'label', {
  create: Label,
  option: 'label',
  inherit_options: true,
  toggle_class: true,
});

defineChildWidget(VirtualTreeEntry, 'icon', {
  create: Icon,
  option: 'icon',
  inherit_options: true,
  toggle_class: true,
});

defineChildWidget(VirtualTreeEntry, 'indent', {
  create: Container,
  option: 'depth',
  toggle_class: true,
  default_options: {
    class: 'aux-indent',
  },
});

defineChildWidget(VirtualTreeEntry, 'collapse', {
  create: Button,
  show: true,
  toggle_class: true,
  default_options: {
    class: 'aux-collapse',
  },
  static_events: {
    click: function () {
      this.parent.emit('collapse');
    },
  },
});
