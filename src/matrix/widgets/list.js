import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { error } from './../../utils/log.js';
import { sprintf } from '../../index.js';
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { Container } from './../../widgets/container.js';
import { ListEntry } from './listentry.js';
import { resize_array_mod } from '../models.js';

const SCROLLBAR_SIZE = scrollbar_size();

function collapse (state) {
    const element = this.get('datum');
    const list = this.parent;
    const listview = list.options.listview;
    if (!element.isGroup) return;
    listview.collapseGroup(element, !listview.isCollapsed(element));
}

function scroll (e) {
    const O = this.options;
    
    const internal = this._internal_scroll;
    this._internal_scroll = false;
    
    O.scroll = this._scrollbar.scrollTop;
    this.emit("useraction", "scroll", O.scroll);

    const listview = O.listview;

    if (listview)
    {
      const startIndex = Math.floor(O.scroll / O.size);
      listview.scrollStartIndex(startIndex - listview.startIndex);
    }
}

function compose_depth (tree_position) {
    let depth = [];
    
    if (tree_position.length == 1)
        return depth;
        
    for (let i = 1, m = tree_position.length - 1; i < m; ++i) {
        if (tree_position[i])
            depth.push("none");
        else
            depth.push("trunk");
    }
    
    if (tree_position[tree_position.length - 1])
        depth.push("end");
    else
        depth.push("branch");
        
    return depth;
}

function elements_cb (index, element, tree_position) {
    const listview = this.options.listview;
    const entry = this.entries[index % this.entries.length];
    if (element) {
        entry.set("depth", compose_depth(tree_position));
        entry.set("collapsable", element.isGroup);
        remove_class(entry.element, "aux-even");
        remove_class(entry.element, "aux-odd");
        add_class(entry.element, index % 2 ? "aux-odd" : "aux-even");
        if (element.isGroup) {
            entry.set("collapsed", listview.isCollapsed(element));
        }
        for (let i in element.properties) {
            if (element.properties.hasOwnProperty(i) && i !== "id" && i.substr(0, 1) !== "_")
                entry.set(i, element.properties[i]);
        }
        entry.show();
    } else {
        entry.hide();
    }
    entry.set("datum", element);
}

function size_cb (size) {
    this.set("_scroller_size", size);
}
              
function subscribe_all () {
    const O = this.options;
    const listview = O.listview;

    const setEntryPosition = (entry, index) => {
      entry.element.style.transform = sprintf('translateY(%.2fpx)', index * O.size);
    };

    let sub = listview.subscribeScrollView((offset) => {
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
    });

    sub = add_subscription(sub, listview.subscribeSize(size_cb.bind(this)));
    sub = add_subscription(sub, listview.subscribeElements(elements_cb.bind(this)));
    sub = add_subscription(sub, listview.subscribeAmount((amount) => {
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
    
    this.subscriptions = sub;
}

export const List = define_class({
    Extends: Container,
    
    _options: Object.assign(Object.create(Container.prototype._options), {
        _amount: "number",
        _scroller_size: "number",
        
        size : "number",
        scroll: "number",
        entry_class: "ListEntry",
        listview: "object",
        resized: "boolean",
    }),
    options: {
        _amount: 0,
        _scroller_size: 0,
        
        size: 32,
        scroll: 0,
        entry_class: ListEntry,
        data_factory: function () {},
    },
    static_events: {
        set_size: function (v) { this.trigger_resize(); },
        set_listview: function (listview) {
            if (this.subscriptions)
                this.subscriptions = unsubscribe_subscriptions(this.subscriptions);
            subscribe_all.call(this);
        },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        this.subscriptions = null;
        this.entries = [];
        this._internal_scroll = false;
    },
    create_entry: function()
    {
        return new this.options.entry_class();
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-list");
        this._scrollbar.addEventListener("scroll", scroll.bind(this), { passive: true });
        if (options.listview)
            this.set("listview", options.listview);
        this.trigger_resize();
    },
    redraw: function () {
        const O = this.options;
        const I = this.invalid;
        const E = this.element;
        
        if (I.resized) {
            I.resized = false; 

            if (O.listview) {
                O.listview.setAmount(O._amount);
            }
        }
        
        if (I._scroller_size) {
            I._scroller_size = false;
            this._scroller.style.height = (O._scroller_size * O.size) + "px";
        }
        
        if (I.scroll) {
            I.scroll = false;
            //this._scrollbar.scrollTop = O.scroll;
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
