import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { error } from './../../utils/log.js';
import { sprintf } from '../../index.js';
import { Subscriptions } from '../../utils/subscriptions.js';
import { subscribeDOMEvent } from '../../utils/events.js';

import { Container } from './../../widgets/container.js';
import { ListEntry } from './listentry.js';
import { Timer } from '../../utils/timers.js';
import { resize_array_mod } from '../models.js';

const SCROLLBAR_SIZE = scrollbar_size();

function collapse (state) {
    const element = this.data;
    const list = this.parent;
    const listview = list.options.listview;
    if (!element.isGroup) return;
    listview.collapseGroup(element, !listview.isCollapsed(element));
}

function elements_cb (index, element, tree_position) {
    const listview = this.options.listview;
    const entry = this.entries[index % this.entries.length];
    if (element) {
        entry.updateData(listview, index, element, tree_position);

        if (entry.hidden())
        {
          entry.update('visible', true);
          this.show_child(entry);
        }
    } else if (!entry.hidden()) {
        entry.update('datum', void(0));
        entry.update('visible', false);
        this.hide_child(entry);
    }
}

function subscribe_all () {
    const O = this.options;
    const listview = O.listview;

    const setEntryPosition = (entry, index) => {
      entry.element.style.transform = sprintf('translateY(%.2fpx)', index * O.size);
    };

    const subs = this.listview_subs;

    subs.add(listview.subscribeScrollView((offset) => {
      if (offset >= listview.amount)
      {
        offset = -listview.amount;
      }

      const entries = this.entries;

      if (offset > 0)
      {
        // scrolling down
        const tmp = listview.startIndex - offset + listview.amount;
        for (let i = 0; i < offset; i++)
        {
          const index = tmp + i;
          const entry = entries[index % entries.length];
          setEntryPosition(entry, index);
        }
      }
      else
      {
        // scrolling up
        offset = -offset
        for (let i = 0; i < offset; i++)
        {
          const index = listview.startIndex + i;
          const entry = entries[index % entries.length];
          setEntryPosition(entry, index);
        }
      }
    }));

    subs.add(listview.subscribeSize((size) => {
      this.update('_scroller_size', size);
    }));
    subs.add(listview.subscribeElements(elements_cb.bind(this)));
    subs.add(listview.subscribeAmount((amount) => {
      const create = (index) => {
        const entry = this.create_entry();
        this._scroller.appendChild(entry.element);
        setEntryPosition(entry, index);
        entry.on("collapse", collapse);
        this.add_child(entry);
        return entry;
      };

      const remove = (entry) => {
        entry.element.remove();
        entry.off("collapse", collapse);
        this.remove_child(entry);
        entry.destroy();
      };

      resize_array_mod(this.entries, amount, listview.startIndex, create, remove);
    }));
}

export const List = define_class({
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        _amount: "number",
        _scroller_size: "number",
        _scroll: "number",
        _startIndex: 'number',
        size : "number",
        entry_class: "ListEntry",
        listview: "object",
    }),
    options: {
        _amount: 0,
        _scroller_size: 0,
        _scroll: 0,
        _startIndex: 0,
        size: 32,
        entry_class: ListEntry,
    },
    static_events: {
        set_size: function (v) { this.trigger_resize(); },
        set_listview: function (listview) {
            this.listview_subs.unsubscribe();
        },
        scrollTopChanged: function(position) {
          const O = this.options;
          const startIndex = Math.floor(position / O.size);

          this.update('_startIndex', startIndex);
        },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        this.listview_subs = new Subscriptions();
        this.entries = [];
        this._scroll_event_suppressed = false;
        this._scroll_timer = new Timer(() => {
          if (!this._scroll_event_suppressed)
            return;

          this._scroll_event_suppressed = false;
          this.emit('scrollTopChanged', this._scrollbar.scrollTop);
        });
    },
    create_entry: function()
    {
        return new this.options.entry_class();
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-list");
        this.addSubscriptions(
          subscribeDOMEvent(this._scrollbar, 'scroll', (ev) => {
            if (this._scroll_timer.active)
            {
              this._scroll_event_suppressed = true;
            }
            else
            {
              this.emit('scrollTopChanged', this._scrollbar.scrollTop);
            }
          })
        );
        if (options.listview)
            this.set("listview", options.listview);
        this.trigger_resize();
    },
    scrollTo: function(position)
    {
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

        if (I.listview)
        {
            I.listview = false;

            const listview = O.listview;

            if (listview)
            {
              subscribe_all.call(this);
              listview.setAmount(O._amount);
              listview.scrollStartIndex(O._startIndex - listview.startIndex);
            }
        }

        if (I._amount) {
            I._amount = false;

            if (O.listview) {
                O.listview.setAmount(O._amount);
            }
        }

        if (I._startIndex) {
            I._startIndex = false;

            const listview = O.listview;

            if (listview) {
                listview.scrollStartIndex(O._startIndex - listview.startIndex);
            }
        }

        if (I._scroller_size) {
            I._scroller_size = false;
            this._scroller.style.height = (O._scroller_size * O.size) + "px";
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
        this.set("_amount", 1 + Math.ceil(E.offsetHeight / O.size));

        Container.prototype.resize.call(this);
    },
});


define_child_element(List, "scrollbar", {
    show: true,
});
define_child_element(List, "scroller", {
    show: true,
    append: function () { this._scrollbar.appendChild(this._scroller); },
});
