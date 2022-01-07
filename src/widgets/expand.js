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

import { defineChildWidget } from '../child_widget.js';
import { Container } from './container.js';
import { Toggle } from './toggle.js';
import { Timer } from './../utils/timers.js';
import { addClass, toggleClass } from '../utils/dom.js';
import { defineRender } from '../renderer.js';

function set_class(cls) {
  const classes = [
    'aux-expanding',
    'aux-expanded',
    'aux-collapsing',
    'aux-collapsed',
  ];
  for (let i = 0, m = classes.length; i < m; ++i) {
    if (classes[i] != cls) this.removeClass(classes[i]);
  }
  this.addClass(cls);
  this.triggerResize();
}

function expand_cb() {
  set_class.call(this, 'aux-expanded');
  this.emit('expanded');
}

function collapse_cb() {
  set_class.call(this, 'aux-collapsed');
  this.emit('collapsed');
}

function toggle(e) {
  const self = this.parent;
  e.preventDefault();
  e.stopPropagation();
  return collapse.call(self, !self.options.expanded);
}
function collapse(state) {
  this.userset('expanded', state);
  return false;
}
function visibleWhenExpanded(widget) {
  const v = widget.options._expanded;
  return v !== false;
}
function visibleWhenCollapsed(widget) {
  const v = widget.options._collapsed;
  return v === true;
}
function isVisible(widget) {
  const value = this.options.always_expanded || this.options.expanded;

  if (value) {
    return visibleWhenExpanded(widget);
  } else {
    return visibleWhenCollapsed(widget);
  }
}
function changedExpanded(value) {
  const group = this.options.group;
  let other_expand;
  let grp;

  if (group) {
    grp = expand_groups[group];
    if (value) {
      other_expand = grp.active;
      grp.active = this;
      if (other_expand && other_expand !== this)
        other_expand.userset('expanded', false);
    } else if (grp.active === this) {
      grp.active = false;
      if (grp.default) grp.default.userset('expanded', true);
    }
  }
  updateVisibility.call(this);
}
function addToGroup(group) {
  let grp;
  const O = this.options;
  if (!(grp = expand_groups[group]))
    expand_groups[group] = grp = { active: false, default: false };

  if (O.group_default) {
    grp.default = this;
    if (!grp.active) {
      this.set('expanded', true);
      return;
    }
  }

  if (O.expanded) changedExpanded.call(this, O.expanded);
}

function removeFromGroup(group) {
  const grp = expand_groups[group];

  if (grp.default === this) grp.default = false;
  if (grp.active === this) {
    grp.active = false;
    if (grp.default) grp.default.set('expanded', true);
  }
}
function removeGroupDefault(group) {
  if (!group) return;
  const grp = expand_groups[group];
  grp.default = false;
}
function updateVisibility() {
  const C = this.children;
  const value = this.options.always_expanded || this.options.expanded;

  if (C) {
    const test = value ? visibleWhenExpanded : visibleWhenCollapsed;
    for (let i = 0; i < C.length; i++) {
      if (test(C[i])) this.showChild(i);
      else this.hideChild(i);
    }
  }

  if (value) {
    this.emit('expand');
    /**
     * Is fired when the expand expands.
     *
     * @event Expand#expand
     */
  } else {
    /**
     * Is fired when the expand collapses.
     *
     * @event Expand#collapse
     */
    this.emit('collapse');
  }
}
const expand_groups = {};
/**
 * Expand is a container which can be toggled between two different states,
 * expanded and collapsed. It can be used to implement overlay popups, but it is
 * not limited to that application.
 * In expanded mode the container has the class <code>.aux-expanded</code>.
 * Child widgets are shown or hidden depending on the state of the two pseudo
 * options <code>_expanded</code> and <code>_collapsed</code>. If a child widget
 * of the expand has <code>_expanded</code> set to true it will be shown in
 * expanded state. If a child widget has <code>_collapsed</code> set to false, it
 * will be shown in collapsed state. This feature can be used to make interfaces
 * more reactive.
 *
 * @class Expand
 *
 * @extends Container
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Boolean} [options.expanded=false] - The state of the widget.
 * @property {Boolean} [options.always_expanded=false] - This essentially overwrites
 *   the <code>expanded</code> option. This can be used to switch this widget to be
 *   always expanded, e.g. when the screen size is big enough.
 * @property {String} [options.group=""] - If set, this expand is grouped together with
 *   all other expands of the same group name. At most one expand of the same group
 *   can be open at one time.
 * @property {Boolean} [options.group_default=false] - If set, this expand is expanded
 *   if all other group members are collapsed.
 * @property {String} [options.icon=""] - Icon of the {@link Button} which toggles expanded state.
 * @property {String} [options.icon_active=""] - Icon of the active {@link Button} which toggles expanded state.
 * @property {String} [options.label=""] - Label of the {@link Button} which toggles expanded state.
 * @property {Boolean} [options.show_button=true] - Set to `false` to hide the {@link Button} toggling expanded state.
 */
export class Expand extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), {
      expanded: 'boolean',
      always_expanded: 'boolean',
      group: 'string',
      group_default: 'boolean',
      label: 'string',
      icon: 'string',
      icon_active: 'string',
    });
  }

  static get options() {
    return {
      expanded: false,
      always_expanded: false,
      group_default: false,
      label: '',
      icon: '',
      icon_active: '',
      role: 'region',
    };
  }

  static get static_events() {
    return {
      set_expanded: changedExpanded,
      set_always_expanded: updateVisibility,
      set_group: function (value) {
        if (value) addToGroup.call(this, value);
      },
    };
  }

  static get renderers() {
    return [
      defineRender('always_expanded', function (always_expanded) {
        toggleClass(this.element, 'aux-always-expanded', always_expanded);
      }),
      defineRender(
        [ 'expanded', 'showing_duration', 'hiding_duration' ],
        function (expanded, showing_duration, hiding_duration) {
          if (expanded) {
            if (this.timer_collapse.active) this.timer_collapse.stop();
            if (showing_duration && !this.timer_expand.active) {
              set_class.call(this, 'aux-expanding');
              this.timer_expand.start(showing_duration);
            } else if (showing_duration && this.timer_expand.active) {
              return;
            } else {
              set_class.call(this, 'aux-expanded');
              /**
               * Is fired after the expand was expanded
               *
               * @event Expand#expanded
               */
              this.emit('expanded');
            }
          } else {
            if (this.timer_expand.active) this.timer_expand.stop();
            if (hiding_duration && !this.timer_collapse.active) {
              set_class.call(this, 'aux-collapsing');
              this.timer_collapse.start(hiding_duration);
            } else if (showing_duration) {
              return;
            } else {
              set_class.call(this, 'aux-collapsed');
              /**
               * Is fired after the expand was collapsed
               *
               * @event Expand#collapsed
               */
              this.emit('collapsed');
            }
          }
        }),
    ];
  }

  /**
   * Toggles the collapsed state of the widget.
   *
   * @method Expand#toggle
   */
  toggle() {
    toggle.call(this);
  }

  initialize(options) {
    super.initialize(options);

    this.timer_expand = new Timer(expand_cb.bind(this));
    this.timer_collapse = new Timer(collapse_cb.bind(this));

    this._update_visibility = updateVisibility.bind(this);

    if (this.options.group) addToGroup.call(this, this.options.group);

    this.set('expanded', this.options.expanded);
    this.set('always_expanded', this.options.always_expanded);
  }

  draw(O, element) {
    /**
     * @member {HTMLDivElement} Expand#element - The main DIV container.
     *   Has class <code>.aux-expand</code>.
     */
    addClass(element, 'aux-expand');

    super.draw(O, element);
  }

  addChild(child) {
    super.addChild(child);
    if (!isVisible.call(this, child)) this.hideChild(child);
    child.on('set__expanded', this._update_visibility);
    child.on('set__collapsed', this._update_visibility);
  }

  removeChild(child) {
    super.removeChild(child);
    child.off('set__expanded', this._update_visibility);
    child.off('set__collapsed', this._update_visibility);
  }

  set(key, value) {
    let group;
    if (key === 'group') {
      group = this.options.group;
      // this is reached from init, where this element was never added
      // to the group.
      if (group && value !== group) removeFromGroup.call(this, group);
    } else if (key === 'group_default') {
      if (!value && this.options.group_default)
        removeGroupDefault.call(this, this.options.group);
    }
    return super.set(key, value);
  }
}
/**
 * @member {Toggle} Expand#button - The button for toggling the state of the expand.
 */
defineChildWidget(Expand, 'button', {
  create: Toggle,
  show: true,
  map_options: {
    expanded: 'state',
    label: 'label',
    icon: 'icon',
    icon_active: 'icon_active',
  },
  default_options: {
    _expanded: true,
    _collapsed: true,
    class: 'aux-toggleexpand',
  },
  static_events: {
    click: toggle,
  },
});
