import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, scrollbar_size } from './../../utils/dom.js';
import { error } from './../../utils/log.js';

import { Container } from './../../widgets/container.js';
import { ListEntry } from './listentry.js';
import { ListDataView } from './../models/listdataview.js';

const scroll = function (e) {
    var O = this.options;
    var size = O.size;
    var S = this._scrollbar.scrollTop;
    var micro = S % size;
    var first = ~~(S / size);
    this._scroller.style.paddingTop = (first * size) + "px";
}

export const List = define_class({
    Extends: Container,
    
    _options: Object.assign(Object.create(Container.prototype._options), {
        _generate_entries: "bool",
        _resize_scroller: "bool",
        size : "number",
        scroll: "number",
        entry_class: "ListEntry",
        sort: "function",
        data: "ListDataView",
    }),
    options: {
        size: 32,
        scroll: 0,
        entry_class: ListEntry,
        sort: (a, b) => {
            const la = a.label;
            const lb = b.label;
            if (la === lb) return 0;
            return la > lb ? 1 : -1;
        },
    },
    entries: [],
    width: 0,
    height: 0,
    static_events: {
        set_size: function (v) { this.trigger_resize(); },
        set_sort: function (v) { this.view.sortFunction = v; },
    },
    initialize: function (options) {
        if (!options.data)
            error("No data model found.");
        this.view = options.data;
        this.view.subscribeSize((function (size) {
            this.set("_resize_scroller", true);
        }).bind(this));
        
        if (!options.element) options.element = element('div');
        Container.prototype.initialize.call(this, options);
        
        scrollbar_size();
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-list");
        this._scrollbar.addEventListener("scroll", scroll.bind(this), { passive: true });
        this.trigger_resize();
    },
    redraw: function () {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;
        
        if (I._generate_entries) {
            I._generate_entries = O._generate_entries = false;
            
            var amount = ~~(this.height / O.size) + 2;
            this.view.amount = amount;
            
            while (this.entries.length > amount)
                this.remove_child(this.entries[0]);
            
            while (this.entries.length < amount)
                this._scroller.appendChild((this.add_child(new this.options.entry_class())).element);
        }
        
        if (I._resize_scroller) {
            I._resize_scroller = O._resize_scroller = false;
            this._scroller.style.height = (this.view.getSize() * O.size) + "px";
        }
        
        if (I.scroll) {
            I.scroll = false;
            
        }
        
        
        Container.prototype.redraw.call(this);
    },
    resize: function () {
        var E = this.element;
        
        this.width = inner_width(E);
        this.height = inner_height(E);
        
        this.set("_generate_entries", true);
        
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
