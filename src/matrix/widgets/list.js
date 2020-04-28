import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { error } from './../../utils/log.js';
import { sprintf } from '../../index.js';

import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { Container } from './../../widgets/container.js';
import { ListEntry } from './listentry.js';

function collapse (state) {
    const list = this.parent;
    const listview = list.options.listview;
    const index = list.entries.indexOf(this);
    const element = listview.at(listview.startIndex + index);
    if (!element.isGroup) return;
    listview.collapseGroup(element, !listview.isCollapsed(element));
}

function scroll (e) {
    const O = this.options;
    O.scroll = this._scrollbar.scrollTop;
    draw.call(this);
    this.emit("useraction", "scroll", O.scroll);
}

function draw () {
    const O = this.options;
    
    const listview = O.listview;
    const size = O.size;
    const scroll = O.scroll;
    
    const micro = scroll % size;
    const start = Math.floor(scroll / size);
    const diff = start - listview.startIndex;
    
    if (diff) {
        if (diff < this.amount) {
            // we scroll less than all entries, we reorder them
            rearrange_entries.call(this, diff);
            listview.scrollStartIndex(diff);
        } else {
            listview.setStartIndex(start);
        }
    }
    for (let i = 0, max = this.entries.length; i < max; ++i) {
        const element = this.entries[i].element;
        element.style.transform = sprintf('translateY(%.2fpx)', i * size + scroll - micro);
    }
}

function rearrange_entries (diff) {
    if (diff > 0) {
        //console.log('Moving %d entries to the back.', diff);
        const tmp = this.entries.slice(0, diff);
        this.entries.splice(0, diff);
        this.entries = this.entries.concat(tmp);
    } else {
        //console.log('Moving %d entries to the front.', -diff);
        const tmp = this.entries.slice(this.entries.length + diff);
        this.entries = tmp.concat(this.entries.slice(0, this.entries.length + diff));
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
    const n = index - listview.startIndex;
    const entry = this.entries[n];
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

function start_index_cb (start, last) {
    const O = this.options;
    const diff = start - last;
    this._scrollbar.scrollTop = (1 + start) * O.size;
    rearrange_entries.call(this, diff);
}

function size_cb (size) {
    this.set("_scroller_size", size);
}
              
function subscribe_all () {
    const O = this.options;
    const listview = O.listview;

    let sub = listview.subscribeStartIndexChanged(start_index_cb.bind(this));
    sub = add_subscription(sub, listview.subscribeSize(size_cb.bind(this)));
    sub = add_subscription(sub, listview.subscribeElements(elements_cb.bind(this)));
    
    this.subscriptions = sub;
}

export const List = define_class({
    Extends: Container,
    
    _options: Object.assign(Object.create(Container.prototype._options), {
        _generate_entries: "bool",
        _scroller_size: "bool",
        size : "number",
        scroll: "number",
        entry_class: "ListEntry",
        listview: "object",
        resized: "boolean",
    }),
    options: {
        size: 32,
        scroll: 0,
        entry_class: ListEntry,
        data_factory: function () {},
    },
    width: 0,
    height: 0,
    amount: 0,
    data: null,
    static_events: {
        set_size: function (v) { this.trigger_resize(); },
        set_listview: function (listview) {
          this.subscriptions = unsubscribe_subscriptions(this.subscriptions);
        },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);

        this.subscriptions = null;
        this.entries = [];
        
        scrollbar_size();
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-list");
        this._scrollbar.addEventListener("scroll", scroll.bind(this), { passive: true });
        this.set("listview", options.listview);
        this.trigger_resize();
    },
    redraw: function () {
        const O = this.options;
        const I = this.invalid;
        const E = this.element;
        
        if (I.resized) {
            I.resized = false; 
            while (this.entries.length > this.amount)
                this.remove_child(this.entries[this.entries.length - 1]);
            
            while (this.entries.length < this.amount)
                this._scroller.appendChild((this.add_child(new this.options.entry_class())).element);

            if (I.listview)
            {
                I.listview = false;
                subscribe_all.call(this);
            }
            if (O.listview) {
                O.listview.setAmount(this.amount);
            }
            draw.call(this);
        }
        
        if (I._scroller_size) {
            I._scroller_size = false;
            this._scroller.style.height = (O._scroller_size * O.size) + "px";
        }
        
        if (I.scroll) {
            I.scroll = false;
            this._scrollbar.scrollTop = O.scroll;
        }
        
        Container.prototype.redraw.call(this);
    },
    resize: function () {
        const E = this.element;
        const O = this.options;
        
        this.width = E.offsetWidth;
        this.height = E.offsetHeight;
        this.amount = 1 + Math.floor(this.height / O.size);

        Container.prototype.resize.call(this);
    },
    add_child: function (child) {
        this.entries.push(child);
        Container.prototype.add_child.call(this, child);
        child.addEventListener("collapse", collapse.bind(child));
        this.emit("entryadded", child);
        return child;
    },
    remove_child: function (child) {
        const entries = this.entries;
        const i = entries.indexOf(child);
        if (i !== -1) {
            let E = this.entries.splice(i, 1);
            this.emit("entryremoved", E[0]);
            this._scroller.removeChild(E.element);
        }
        Container.prototype.remove_child.call(this, child);
    },
});


define_child_element(List, "scrollbar", {
    show: true,
});
define_child_element(List, "scroller", {
    show: true,
    append: function () { this._scrollbar.appendChild(this._scroller); },
});
