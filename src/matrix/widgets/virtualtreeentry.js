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

import { defineChildWidget } from '../../child_widget.js';
import { setText, toggleClass } from '../../utils/dom.js';
import { Subscriptions } from '../../utils/subscriptions.js';

import { Container } from '../../widgets/container.js';
import { Button } from '../../widgets/button.js';
import { Label } from '../../widgets/label.js';
import { Icon } from '../../widgets/icon.js';
import { defineRender, defineMeasure } from '../../renderer.js';

import { VirtualTreeEntryBase } from './virtualtreeentrybase.js';

const indent_to_glyph = {
  trunk: '',
  branch: '',
  end: '',
  none: '',
};

function composeDepth(tree_position) {
  const depth = [];

  if (tree_position.length === 1) return depth;

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
 * @property {Boolean} [options.connected=false] - Sets class aux-connected.
 * @property {Boolean} [options.hovered=false] - Sets class aux-hovered.
 *
 * @extends VirtualTreeEntryBase
 *
 * @class VirtualTreeEntry
 */

export class VirtualTreeEntry extends VirtualTreeEntryBase {
  static get _options() {
    return {
      label: 'string|boolean',
      depth: 'array|boolean',
      collapsable: 'boolean',
      collapsed: 'boolean',
      icon_collapsed: 'string',
      icon_uncollaped: 'string',
      icon: 'string|boolean',
      odd: 'boolean',
      group: 'boolean',
      connected: 'boolean',
      hovered: 'boolean',
    };
  }

  static get options() {
    return {
      label: false,
      depth: false,
      collapsable: false,
      collapsed: false,
      icon_collapsed: 'arrowdown',
      icon_uncollapsed: 'arrowup',
      icon: false,
      odd: false,
      group: false,
      role: 'treeitem',
      connected: false,
      hovered: false,
    };
  }

  static get renderers() {
    return [
      defineRender('depth', function (depth) {
        const { element } = this;

        let C = element.getAttribute('class');
        C = C.replace(/aux-depth-[0-9]*/gm, '');
        C = C.replace(/\s\s+/g, ' ');
        element.setAttribute('class', C);

        if (!depth) return;

        const d = depth.length;
        element.classList.add('aux-depth-' + d);
        element.style.setProperty('--aux-entry-depth', d);

        const s = depth.map((indent) => indent_to_glyph[indent]).join('');
        setText(this.indent.element, s);
      }),
      defineRender('odd', function (odd) {
        const { element } = this;

        toggleClass(element, 'aux-even', !odd);
        toggleClass(element, 'aux-odd', odd);
      }),
      defineRender('collapsable', function (collapsable) {
        toggleClass(this.element, 'aux-collapsable', collapsable);
      }),
      defineRender('group', function (group) {
        toggleClass(this.element, 'aux-group', group);
      }),
      defineRender('connected', function (connected) {
        toggleClass(this.element, 'aux-connected', connected);
      }),
      defineRender('hovered', function (hovered) {
        toggleClass(this.element, 'aux-hovered', hovered);
      }),
      defineMeasure(
        ['collapsed', 'icon_collapsed', 'icon_uncollapsed'],
        function (collapsed, icon_collapsed, icon_uncollapsed) {
          this.collapse.set(
            'icon',
            collapsed ? icon_collapsed : icon_uncollapsed
          );
        }
      ),
    ];
  }

  initialize(options) {
    super.initialize(options);
    this.data_subscriptions = new Subscriptions();
  }

  draw(options, element) {
    super.draw(options, element);
    element.classList.add('aux-virtualtreeentry');
  }

  _onDataChanged(key, value) {
    switch (key) {
      case 'label':
        this.update('label', value);
        break;
      case 'icon':
        this.update('icon', value);
        break;
      case 'connected':
        this.update('connected', value);
        break;
      case 'hovered':
        this.update('hovered', value);
        break;
    }
  }
  /**
   * This function is called internally to subscribe to properties
   * Overload in order to handle additional data being displayed
   * on custom entry classes.
   *
   * @method VirtualTree#subscribeData
   */
  subscribeData() {
    const subs = this.data_subscriptions;
    const element = this.get('data');

    if (!element) return;

    this.update('label', element.label);
    this.update('icon', element.icon);
    this.update('connected', element.connected);
    this.update('hovered', element.hovered);

    subs.add(
      element.subscribe('propertyChanged', (key, value) =>
        this._onDataChanged(key, value)
      )
    );
  }

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
  updateData(virtualtreeview, index, element, treePosition) {
    super.updateData(virtualtreeview, index, element, treePosition);

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
      this.update('connected', element.connected);
      this.update('hovered', element.hovered);

      this.subscribeData();
    }
  }

  destroy() {
    this.data_subscriptions.unsubscribe();
    super.destroy();
  }
}

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
