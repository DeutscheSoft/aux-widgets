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

import { defineClass } from '../widget_helpers.js';
import { ListItem } from './listitem.js';
import { List } from './list.js';
import { Container } from './container.js';
import { Button } from './button.js';
import { hasClass, toggleClass, addClass, getDuration } from '../utils/dom.js';
import { S } from '../dom_scheduler.js';

function toggleCollapsed() {
  setCollapsed.call(this, !hasClass(this.element, 'aux-collapsed'));
}
function setCollapsed(c) {
  this.set('collapsed', c);
}

export const TreeItem = defineClass({
  Extends: ListItem,

  _options: Object.assign(Object.create(ListItem.prototype._options), {
    collapsed: 'boolean',
    collapsable: 'boolean',
    force_collapsable: 'boolean',
  }),
  options: {
    collapsed: false,
    collapsable: true,
    force_collapsable: false,
  },
  initialize: function (options) {
    this.list = new List({});
    this.flex = new Container({ class: 'aux-flex' });

    ListItem.prototype.initialize.call(this, options);
    ListItem.prototype.addChild.call(this, this.list);
    this.flex.show();

    this.collapse = new Button({ class: 'aux-collapse' });
    this.appendChild(this.collapse);
    this.collapse.on('click', toggleCollapsed.bind(this));

    if (this.options.collapsable && this.options.collapsed) {
      this.list.element.style.height = '0px';
      this.list.hide();
    }
  },
  appendChild: function (child) {
    this.invalid._list = true;
    this.triggerResize();
    if (Object.prototype.isPrototypeOf.call(ListItem.prototype, child)) {
      return this.list.appendChild(child);
    } else {
      return this.flex.appendChild(child);
    }
  },
  addChild: function (child) {
    this.triggerResize();
    if (Object.prototype.isPrototypeOf.call(ListItem.prototype, child)) {
      return this.list.addChild(child);
    } else {
      return this.flex.addChild(child);
    }
  },
  removeChild: function (child) {
    if (Object.prototype.isPrototypeOf.call(ListItem.prototype, child)) {
      var r = this.list.removeChild(child);
      return r;
    } else {
      this.flex.removeChild(child);
    }
    this.invalid._list = true;
    this.triggerResize();
  },
  draw: function (O, element) {
    addClass(element, 'aux-treeitem');

    this.element.appendChild(this.flex);
    ListItem.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    ListItem.prototype.redraw.call(this);
    var I = this.invalid;
    var O = this.options;
    var E = this.element;
    var F = this.flex.element;
    if (I._list) {
      I.collapsed = true;
      if (this.list.children && this.list.children.length) {
        if (this.list.element.parentElement != E)
          E.appendChild(this.list.element);
        this.addClass('aux-has-tree');
      } else {
        if (this.list.element.parentElement == E)
          E.removeChild(this.list.element);
        this.removeClass('aux-has-tree');
      }
    }
    if (I._list || I.collapsable || I.force_collapsable) {
      if (
        (this.list.children && this.list.children.length && O.collapsable) ||
        O.force_collapsable
      )
        F.appendChild(this.collapse.element);
      else if (this.collapse.element.parentElement == E)
        F.removeChild(this.collapse.element);
      toggleClass(E, 'aux-force-collapsable', O.force_collapsable);
    }
    if (I.collapsed) {
      I.collapsed = false;
      var s = this.list.element.style;
      if (O.collapsed) {
        var h = this.list.element.offsetHeight;
        s.height = h + 'px';
        window.requestAnimationFrame(function () {
          s.height = '0px';
        });
      } else {
        var list = this.list.element;
        /* This is a train */
        S.add(function () {
          var h0 = list.offsetHeight;
          var duration = getDuration(list);
          S.add(function () {
            s.height = 'auto';
            S.add(function () {
              var _h = list.offsetHeight;
              S.add(function () {
                s.height = h0 + 'px';
                S.addNext(function () {
                  s.height = _h + 'px';

                  setTimeout(function () {
                    s.height = null;
                  }, duration);
                });
              }, 1);
            });
          }, 1);
        });
      }
      toggleClass(E, 'aux-collapsed', O.collapsed);
    }
    I._list = I.collapsable = I.force_collapsable = false;
  },
  set: function (key, value) {
    switch (key) {
      case 'collapsed':
        if (!this.list) break;
        if (!value) this.list.show();
        else this.list.hide();
        break;
    }
    return ListItem.prototype.set.call(this, key, value);
  },
});
