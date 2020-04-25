import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, scrollbar_size } from './../../utils/dom.js';
import { error } from './../../utils/log.js';

import { Container } from './../../widgets/container.js';
import { ListEntry } from './listentry.js';


const scroll = function (e) {
    var O = this.options;
    var size = O.size;
    var scroll = this._scrollbar.scrollTop;
    var micro = scroll % size;
    var start = ~~(scroll / size);
    var diff = start - this.data.startIndex;
    
    if (diff) {
        if (diff < this.amount) {
            // we scroll less than all entries, we reorder them
            rearrange_entries.call(this, diff);
            this.data.scrollStartIndex(diff);
        } else {
            this.data.setStartIndex(start);
        }
    }
    for (var i = 0, max = this.entries.length; i < max; ++i) {
        this.entries[i].style.transform = sprintf('translateY(%.2fpx)', i * size + micro);
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

function elements_cb (index, element) {
    const entry = this.entries[index - this.data.startIndex];
    if (element) {
        for (var i in element) {
            if (!element.hasOwnPorperty(i)) continue;
            if (i.substr(0, 1) !== "_")
                entry.set(i, element[i]);
        }
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
              
function data_factory (amount) {
    var O = this.options;
    this.data = O.data_factory(amount);
    
    this.data.subscribeStartIndexChanged(start_index_cb.bind(this));
    this.data.subscribeSize(size_cb.bind(this));
    this.data.subscribeElements(elements_cb.bind(this));
    
    this.set("_generate_entries", true);
}

export const List = define_class({
    Extends: Container,
    
    _options: Object.assign(Object.create(Container.prototype._options), {
        _generate_entries: "bool",
        _resize_scroller: "bool",
        size : "number",
        scroll: "number",
        entry_class: "ListEntry",
        data_factory: "function",
    }),
    options: {
        size: 32,
        scroll: 0,
        entry_class: ListEntry,
        data_factory: function () {},
    },
    entries: [],
    width: 0,
    height: 0,
    amount: 0,
    data: null,
    static_events: {
        set_size: function (v) { this.trigger_resize(); },
        set_data_factory: function (v) { console.log("set_data_factory",v) },
    },
    initialize: function (options) {
        if (!options.element) options.element = element('div');
        Container.prototype.initialize.call(this, options);
        
        scrollbar_size();
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-list");
        this._scrollbar.addEventListener("scroll", scroll.bind(this), { passive: true });
        this.set("data_factory", options.data_factory);
        this.trigger_resize();
    },
    redraw: function () {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;
        
        if (I._generate_entries) {
            I._generate_entries = O._generate_entries = false;
            
            while (this.entries.length > this.amount)
                this.remove_child(this.entries[0]);
            
            while (this.entries.length < this.amount)
                this._scroller.appendChild((this.add_child(new this.options.entry_class())).element);
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
        this.amount = ~~(this.height / O.size) + 2;
        
        if (O.data_factory)
            this.data = O.data_factory(this.amount);
        
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
