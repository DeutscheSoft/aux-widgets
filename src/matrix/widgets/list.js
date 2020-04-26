import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, scrollbar_size } from './../../utils/dom.js';
import { error } from './../../utils/log.js';
import { sprintf } from '../../index.js';

import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { Container } from './../../widgets/container.js';
import { ListEntry } from './listentry.js';


const scroll = function (e) {
    var O = this.options;
    const listview = O.listview;
    var size = O.size;
    var scroll = this._scrollbar.scrollTop;
    var micro = scroll % size;
    var start = ~~(scroll / size);
    var diff = start - listview.startIndex;
    
    if (diff) {
        if (diff < this.amount) {
            // we scroll less than all entries, we reorder them
            rearrange_entries.call(this, diff);
            listview.scrollStartIndex(diff);
        } else {
            listview.setStartIndex(start);
        }
    }
    for (var i = 0, max = this.entries.length; i < max; ++i) {
        const element = this.entries[i].element;
        element.style.transform = sprintf('translateY(%.2fpx)', i * size + micro);
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

function elements_cb (index, element, treePosition) {
    const listview = this.options.listview;
    const n = index - listview.startIndex;
    const entry = this.entries[n];
    console.log('%d : %s', n, element.label);
    if (element) {
        entry.set('depth', treePosition.length);
        entry.set('label', element.label);
        entry.set("collapsable", element.isGroup);
        entry.show();
    } else {
        entry.hide();
    }
}

function start_index_cb (start, last) {
    var st = this._scrollbar.scrollTop;
    var diff = start - last;
    this._scrollbar.scrollTop = st + diff * O.size;
    rearrange_entries.call(this, diff);
}

function size_cb (size) {
    this.set("_resize_scroller", size);
}
              
function subscribe_all () {
    var O = this.options;
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
        _resize_scroller: "bool",
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
        if (!options.element) options.element = element('div');
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
        var O = this.options;
        var I = this.invalid;
        var E = this.element;
        
        if (I.resized) {
            I.resized = false; 
            
            while (this.entries.length > this.amount)
                this.remove_child(this.entries[this.entries.length - 1]);
            
            while (this.entries.length < this.amount)
                this._scroller.appendChild((this.add_child(new this.options.entry_class())).element);

            if (O.listview)
            {
              O.listview.setAmount(this.amount);
            }

            if (I.listview)
            {
                I.listview = false;
                subscribe_all.call(this);
            }
        }
        
        if (I._resize_scroller) {
            I._resize_scroller = false;
            this._scroller.style.height = (O._resize_scroller * O.size) + "px";
        }
        
        if (I.scroll) {
            I.scroll = false;
            
        }
        
        Container.prototype.redraw.call(this);
    },
    resize: function () {
        var E = this.element;
        var O = this.options;
        
        this.width = inner_width(E);
        this.height = inner_height(E);
        this.amount = 1 + Math.ceil(this.height / O.size);
        
        Container.prototype.resize.call(this);
    },
    add_child: function (child) {
        this.entries.push(child);
        Container.prototype.add_child.call(this, child);
        this.emit("entryadded", child);
        return child;
    },
    remove_child: function (child) {
        const entries = this.entries;
        const i = entries.indexOf(child);
        if (i !== -1) {
            var E = this.entries.splice(i, 1);
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
