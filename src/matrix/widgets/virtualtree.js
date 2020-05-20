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

import { define_class, define_child_element } from './../../widget_helpers.js';
import {
  inner_width,
  inner_height,
  scrollbar_size,
  add_class,
  remove_class,
} from './../../utils/dom.js';
import { error } from './../../utils/log.js';
import { sprintf } from '../../index.js';
import { Subscriptions } from '../../utils/subscriptions.js';
import { subscribeDOMEvent } from '../../utils/events.js';

import { Container } from './../../widgets/container.js';
import { VirtualTreeEntry } from './virtualtreeentry.js';
import { Timer } from '../../utils/timers.js';
import { resize_array_mod } from '../models.js';

const SCROLLBAR_SIZE = scrollbar_size();

function collapse(state) {
  const element = this.data;
  const parent = this.parent;
  const virtualtreeview = parent.options.virtualtreeview;
  if (!element.isGroup) return;
  virtualtreeview.collapseGroup(element, !virtualtreeview.isCollapsed(element));
}

function subscribe_all() {
  const O = this.options;
  const virtualtreeview = O.virtualtreeview;

  const setEntryPosition = (entry, index) => {
    entry.element.style.transform = sprintf(
      'translateY(%.2fpx)',
      index * O.size
    );
  };

  const subs = this.virtualtreeview_subs;

  subs.add(
    virtualtreeview.subscribeScrollView((offset) => {
      if (offset >= virtualtreeview.amount) {
        offset = -virtualtreeview.amount;
      }

      const entries = this.entries;

      if (offset > 0) {
        // scrolling down
        const tmp =
          virtualtreeview.startIndex - offset + virtualtreeview.amount;
        for (let i = 0; i < offset; i++) {
          const index = tmp + i;
          const entry = entries[index % entries.length];
          setEntryPosition(entry, index);
        }
      } else {
        // scrolling up
        offset = -offset;
        for (let i = 0; i < offset; i++) {
          const index = virtualtreeview.startIndex + i;
          const entry = entries[index % entries.length];
          setEntryPosition(entry, index);
        }
      }
    })
  );

  subs.add(
    virtualtreeview.subscribeSize((size) => {
      this.update('_scroller_size', size);
    })
  );
  subs.add(
    virtualtreeview.subscribeAmount((amount) => {
      const create = (index) => {
        const entry = this.create_entry();
        this._scroller.appendChild(entry.element);
        setEntryPosition(entry, index);
        entry.on('collapse', collapse);
        this.add_child(entry);
        return entry;
      };

      const remove = (entry) => {
        entry.element.remove();
        entry.off('collapse', collapse);
        this.remove_child(entry);
        entry.destroy();
      };

      resize_array_mod(
        this.entries,
        amount,
        virtualtreeview.startIndex,
        create,
        remove
      );
    })
  );
  subs.add(
    virtualtreeview.subscribeElements((index, element, treePosition) => {
      const virtualtreeview = this.options.virtualtreeview;
      const entry = this.entries[index % this.entries.length];

      entry.updateData(virtualtreeview, index, element, treePosition);

      if (element) {
        if (entry.hidden()) {
          entry.update('visible', true);
          this.show_child(entry);
        }
      } else if (!entry.hidden()) {
        entry.update('visible', false);
        this.hide_child(entry);
      }
    })
  );
}

export const VirtualTree = define_class({
  Extends: Container,
  _options: Object.assign(Object.create(Container.prototype._options), {
    _amount: 'number',
    _scroller_size: 'number',
    _scroll: 'number',
    _startIndex: 'number',
    size: 'number',
    entry_class: 'VirtualTreeEntry',
    virtualtreeview: 'object',
  }),
  options: {
    _amount: 0,
    _scroller_size: 0,
    _scroll: 0,
    _startIndex: 0,
    size: 32,
    entry_class: VirtualTreeEntry,
  },
  static_events: {
    set_size: function (v) {
      this.trigger_resize();
    },
    set_virtualtreeview: function (virtualtreeview) {
      this.virtualtreeview_subs.unsubscribe();
    },
    scrollTopChanged: function (position) {
      const O = this.options;
      const startIndex = Math.floor(position / O.size);

      this.update('_startIndex', startIndex);
    },
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options);
    this.virtualtreeview_subs = new Subscriptions();
    this.entries = [];
    this._scroll_event_suppressed = false;
    this._scroll_timer = new Timer(() => {
      if (!this._scroll_event_suppressed) return;

      this._scroll_event_suppressed = false;
      this.emit('scrollTopChanged', this._scrollbar.scrollTop);
    });
  },
  create_entry: function () {
    return new this.options.entry_class();
  },
  draw: function (options, element) {
    Container.prototype.draw.call(this, options, element);
    element.classList.add('aux-virtualtree');
    this.addSubscriptions(
      subscribeDOMEvent(this._scrollbar, 'scroll', (ev) => {
        if (this._scroll_timer.active) {
          this._scroll_event_suppressed = true;
        } else {
          this.emit('scrollTopChanged', this._scrollbar.scrollTop);
        }
      })
    );
    if (options.virtualtreeview)
      this.set('virtualtreeview', options.virtualtreeview);
    this.trigger_resize();
  },
  scrollTo: function (position) {
    this._scroll_timer.restart(100);
    this.update('_scroll', position);
    const O = this.options;
    const startIndex = Math.floor(position / O.size);

    this.update('_startIndex', startIndex);
  },
  redraw: function () {
    const O = this.options;
    const I = this.invalid;
    const E = this.element;

    if (I.virtualtreeview) {
      I.virtualtreeview = false;

      const virtualtreeview = O.virtualtreeview;

      if (virtualtreeview) {
        subscribe_all.call(this);
        virtualtreeview.setAmount(O._amount);
        virtualtreeview.scrollStartIndex(
          O._startIndex - virtualtreeview.startIndex
        );
      }
    }

    if (I._amount) {
      I._amount = false;

      if (O.virtualtreeview) {
        O.virtualtreeview.setAmount(O._amount);
      }
    }

    if (I._startIndex) {
      I._startIndex = false;

      const virtualtreeview = O.virtualtreeview;

      if (virtualtreeview) {
        virtualtreeview.scrollStartIndex(
          O._startIndex - virtualtreeview.startIndex
        );
      }
    }

    if (I._scroller_size) {
      I._scroller_size = false;
      this._scroller.style.height = O._scroller_size * O.size + 'px';
    }

    if (I._scroll) {
      I._scroll = false;
      this._scrollbar.scrollTop = O._scroll;
    }

    Container.prototype.redraw.call(this);
  },
  resize: function () {
    const E = this.element;
    const O = this.options;
    this.set('_amount', 1 + Math.ceil(E.offsetHeight / O.size));

    Container.prototype.resize.call(this);
  },
});

define_child_element(VirtualTree, 'scrollbar', {
  show: true,
});
define_child_element(VirtualTree, 'scroller', {
  show: true,
  append: function () {
    this._scrollbar.appendChild(this._scroller);
  },
});
