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

import { defineClass, defineChildElement } from './../../widget_helpers.js';
import { scrollbarSize } from './../../utils/dom.js';
import { sprintf } from '../../utils/sprintf.js';
import { Subscriptions } from '../../utils/subscriptions.js';
import { subscribeDOMEvent } from '../../utils/events.js';

import { Container } from './../../widgets/container.js';
import { VirtualTreeEntry } from './virtualtreeentry.js';
import { Timer } from '../../utils/timers.js';
import { resizeArrayMod } from '../models.js';

scrollbarSize();

function collapse(state) {
  const element = this.get('data');
  const parent = this.parent;
  const virtualtreeview = parent.options.virtualtreeview;
  if (!element.isGroup) return;
  virtualtreeview.collapseGroup(element, !virtualtreeview.isCollapsed(element));
}

function subscribeAll() {
  const O = this.options;
  const virtualtreeview = O.virtualtreeview;

  const setEntryPosition = (entry, index) => {
    const pos = this.calculateEntryPosition(index);
    entry.element.style.transform = 'translateY(' + pos.toFixed(1) + 'px)';
  };

  const subs = this.virtualtreeview_subs;

  subs.add(
    virtualtreeview.subscribeScrollView((offset) => {
      if (Math.abs(offset) >= virtualtreeview.amount) {
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
      // jshint -W123
      const virtualtreeview = this.options.virtualtreeview;
      // jshint +W123
      const entry = this.entries[index % this.entries.length];

      this.updateEntry(entry, virtualtreeview, index, element, treePosition);
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
  /**
   * Calculates the pixel position of the entry at the given
   * index.
   */
  calculateEntryPosition: function (index) {
    return index * this.options.size;
  },
  /**
   * Update the given entry with the new data.
   *
   * @param {VirtualTreeEntry} entry
   *    The entry widget.
   * @param {VirtualTreeView} virtualtreeview
   *    The tree data.
   * @param {number} index
   *    The index of the element in the list.
   * @param {Datum} element
   *    The data model of the entry.
   * @param {Array} treePosition
   *    The tree position of the entry.
   */
  updateEntry: function (entry, virtualtreeview, index, element, treePosition) {
    entry.updateData(virtualtreeview, index, element, treePosition);

    if (element) {
      if (this.isChildHidden(entry)) {
        this.showChild(entry);
      }
    } else if (!this.isChildHidden(entry)) {
      this.hideChild(entry);
    }
  },
  /**
   * Return the entry for the given index. Returns null if there is currently
   * no entry assigned to that index.
   *
   * @param {number index
   *    The element index.
   * @returns {VirtualTreeEntryBase}
   *    The element with the given id or null.
   */
  getEntry: function (index) {
    const { virtualtreeview } = this.options;

    if (!virtualtreeview) return null;

    if (index < virtualtreeview.startIndex) return null;

    if (index >= virtualtreeview.startIndex + virtualtreeview.amount)
      return null;

    const entries = this.entries;

    return entries[index % entries.length];
  },
  /**
   * Returns the index of the element with the given id. If no element with the
   * given id can be found or is currently not in the list, -1 is returned.
   *
   * @param {*} id
   *    The element id.
   * @returns {number}
   *    The index of the element with the given id.
   */
  getIndexById: function (id) {
    const { virtualtreeview } = this.options;

    if (!virtualtreeview) return -1;

    const port = virtualtreeview.matrix.getPortById(id);

    if (!port || !virtualtreeview.includes(port))
      return -1;

    return virtualtreeview.indexOf(port);
  },
  /**
   * Returns the entry for a given id. If no element with the given id can be
   * found or if it is not in view, null will be returned.
   *
   * @param {*} id
   *    The element id.
   * @returns {VirtualTreeEntryBase}
   *    The element with the given id or null.
   */
  getEntryById: function (id) {
    return this.getEntry(this.getIndexById(id));
  },
  triggerReposition: function () {
    this.set('size', this.get('size'));
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

    const scrollTarget = document.createElement('div');

    scrollTarget

    this._scrollTarget = scrollTarget;

    this.triggerResize();
  },
  /**
   * Scroll the VirtualTree to this position.
   *
   * @param {Integer|object} options
   *    The position to scroll to or a scrollTo() options with
   *    `top` entry.
   *
   * @method VirtualTree#scrollTo
   */
  scrollTo: function (options) {
    if (typeof options !== 'object') {
      options = {
        top: options,
      };
    }
    this._scrollbar.scrollTo(options);
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

    if (I._scroller_size || I.size) {
      I._scroller_size = false;
      this._scroller.style.height =
        this.calculateEntryPosition(O._scroller_size) + 'px';
    }

    if (I.size) {
      I.size = false;

      const virtualtreeview = O.virtualtreeview;

      if (virtualtreeview) {
        const entries = this.entries;

        for (
          let index = virtualtreeview.startIndex, i = 0;
          i < entries.length;
          i++, index++
        ) {
          const entry = entries[index % entries.length];
          entry.element.style.transform =
            'translateY(' + this.calculateEntryPosition(index) + 'px)';
        }
      }
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
    this.update('_view_height', E.offsetHeight);
    this.update('_amount', 1 + Math.ceil(E.offsetHeight / O.size));

    Container.prototype.resize.call(this);
  },
  /**
   * Uses the native Element.scrollTo() function to scroll the entry with
   * the given index into view.
   *
   * @param {number} index
   *    The index of the entry in the list.
   * @param {object|boolean} [options]
   *    Similar to the options of Element.scrollIntoView(). Currently
   *    interpreted are `options.block` and `options.behavior`.
   * @param {string} [options.block='top']
   * @param {string} [options.behavior='auto']
   */
  scrollEntryIntoView: function(index, options) {
    if (!options) options = { };

    let position = this.calculateEntryPosition(index);

    if (options.block === 'bottom') {
      const O = this.options;
      position -= O._view_height - O.size;
      if (position < 0) position = 0;
    }

    this.scrollTo({
      top: position,
      behavior: options.behavior || 'auto',
    });
  },
  /**
   * Returns the indices of those entries which are currently in view.
   */
  getVisibleRange: function() {
    const virtualtreeview = this.get('virtualtreeview');

    if (!virtualtreeview)
      return [-1, -1];

    const startIndex = virtualtreeview.startIndex;

    return [ startIndex, startIndex + virtualtreeview.amount ];
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
