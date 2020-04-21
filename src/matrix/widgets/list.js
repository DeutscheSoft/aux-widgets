import { define_class, define_child_element } from '../../widget_helpers.js';
import { inner_width, inner_height, scrollbar_size } from '../../utils/dom.js';
import { Container } from '../../widgets/container.js';
import { ListEntry } from './listentry.js';


const scroll = function (e) {
    var O = this.options;
    var size = O.size;
    var S = this._scrollbar.scrollTop;
    var micro = S % size;
    var first = ~~(S / size);
    console.log(S,first,micro)
    this._scroller.style.paddingTop = (first * size) + "px";
}

export const List = define_class({
    Extends: Container,
    
    _options: Object.assign(Object.create(Container.prototype._options), {
        size : "number",
        scroll: "number",
        entries : "array",
        entry_class: "ListEntry",
        _generate_entries: "bool",
    }),
    options: {
        size: 32,
        scroll: 0,
        entries: [],
        entry_class: ListEntry,
    },
    entries: [],
    width: 0,
    height: 0,
    static_events: {
        set_size: function (v) { this.trigger_resize(); },
    },
    initialize: function (options) {
        if (!options.element) options.element = element('div');
        Container.prototype.initialize.call(this, options);
        scrollbar_size();
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-list");
        this._scrollbar.addEventListener("scroll", scroll.bind(this));
        this.trigger_resize();
    },
    redraw: function () {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;
        
        if (I._generate_entries) {
            I._generate_entries = O._generate_entries = false;
            
            var count = ~~(this.height / O.size) + 2;
            console.log(count,this.entries.length)
            while (this.entries.length > count)
                this.remove_child(this.entries[0]);
            
            while (this.entries.length < count)
                this._scroller.appendChild((this.add_child(new this.options.entry_class())).element);
        }
        
        if (I.scroll) {
            I.scroll = false;
            
        }
        
        if (I.entries) {
            this._scroller.style.height = (O.entries.length * O.size) + "px";
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
