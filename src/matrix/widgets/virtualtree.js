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

import { defineClass, defineChildElement } from './../../widget_helpers.js';
import {
  innerWidth,
  innerHeight,
  scrollbarSize,
  addClass,
  removeClass,
} from './../../utils/dom.js';
import { error } from './../../utils/log.js';
import { sprintf } from '../../index.js';
import { Subscriptions } from '../../utils/subscriptions.js';
import { subscribeDOMEvent } from '../../utils/events.js';

import { Container } from './../../widgets/container.js';
import { VirtualTreeEntry } from './virtualtreeentry.js';
import { Timer } from '../../utils/timers.js';
import { resizeArrayMod } from '../models.js';

const SCROLLBAR_SIZE = scrollbarSize();

function collapse(state) {
  const element = this.data;
  const parent = this.parent;
  const virtualtreeview = parent.options.virtualtreeview;
  if (!element.isGroup) return;
  virtualtreeview.collapseGroup(element, !virtualtreeview.isCollapsed(element));
}

function subscribeAll() {
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
        const entry = this.createEntry();
        this._scroller.appendChild(entry.element);
        setEntryPosition(entry, index);
        entry.on('collapse', collapse);
        this.addChild(entry);
        return entry;
      };

      const remove = (entry) => {
        entry.element.remove();
        entry.off('collapse', collapse);
        this.removeChild(entry);
        entry.destroy();
      };

      resizeArrayMod(
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
          this.showChild(entry);
        }
      } else if (!entry.hidden()) {
        entry.update('visible', false);
        this.hideChild(entry);
      }
    })
  );
}

/**
 * VirtualTree is a scrollable list of {@link VirtualTreeEntry}s. It
 * relies on a data model {@link VirtualTreeDataView}. Its purpose is
 * to reduce the amount of elements in DOM by only holding the entries
 * which fit inside the area. On scrolling the entries are re-sorted,
 * re-subscribed and micro-scrolled to give the impression of seamless
 * scrolling. It is used to display collapsable lists of hundrets or
 * even thousands of entries in a CPU-friendly way.
 *
 * @param {Object} [options={ }] - An object containing initial options.
 *
 * @property {Integer} [options.size=32] - The size of a single entry in
 *   the list.
 * @property {Object} [options.entry_class=VirtualTreeEntry] - The class
 *   to derive new entries from.
 * @property {Object} options.virtualtreeview - The {@link VirtualTreeDataView}.
 *
 * @extends Container
 *
 * @class VirtualTree
 */
export const VirtualTree = defineClass({
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
      this.triggerResize();
    },
    set_virtualtreeview: function (virtualtreeview) {
      this.virtualtreeview_subs.unsubscribe();
    },
    scrolltopchanged: function (position) {
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
      /**
       * Is fired on scrolling the list.
       *
       * @event VirtualTree#scrollTopChanged
       *
       * @param {Integer} scroll - The amount of pixels scrolled from top.
       */
      this.emit('scrollTopChanged', this._scrollbar.scrollTop);
    });
  },
  /**
   * Create and return a new entry based on `options.entry_class`.
   *
   * @method VirtualTree#createEntry
   *
   * @returns {Object} entry - The newly created entry instance.
   */
  createEntry: function () {
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
    this.triggerResize();
  },
  /**
   * Scroll the VirtualTree to this position.
   *
   * @param {Integer} position - The position to scroll to.
   *
   * @method VirtualTree#scrollTo
   */
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
        subscribeAll.call(this);
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
/**
 * @member {HTMLDiv} VirtualTree#_scrollbar - A container for hiding
 *   scrollbars. Has class <code>.aux-scrollbar</code>.
 */
defineChildElement(VirtualTree, 'scrollbar', {
  show: true,
});
/**
 * @member {HTMLDiv} VirtualTree#_scroller - A container holding the
 *   {@link VirtualTreeEntry}s. Has class <code>.aux-scroller</code>.
 */
defineChildElement(VirtualTree, 'scroller', {
  show: true,
  append: function () {
    this._scrollbar.appendChild(this._scroller);
  },
});
