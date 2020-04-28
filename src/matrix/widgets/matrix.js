import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, outer_width, outer_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { sprintf } from '../../index.js';
import { Patchbay } from './patchbay.js';

function scroll (e) {
    const O = this.options;
    const ignore = this._ignore_scroll_x || this._ignore_scroll_y;
    this._ignore_scroll_x = this._ignore_scroll_y = false;
    
    O.scroll_x = this._scrollbar.scrollLeft;
    O.scroll_y = this._scrollbar.scrollTop;
    
    this.list_a.set("scroll", O.scroll_y);
    this.list_b.set("scroll", O.scroll_x);
    
    draw.call(this);
    this.emit("useraction", "scroll", O.scroll);
    
    if (ignore) return false;
}

function draw () {
    const O = this.options;
    const size = O.size;
    
    const list_x = this.list_b;
    const listview_x = list_x.get("listview");
    const scroll_x = O.scroll_x;
    const micro_x = scroll_x % size;
    const start_x = Math.floor(scroll_x / size);
    const diff_x = start_x - listview_x.startIndex;
    
    const list_y = this.list_a;
    const listview_y = list_y.get("listview");
    const scroll_y = O.scroll_y;
    const micro_y = scroll_y % size;
    const start_y = Math.floor(scroll_x / size);
    const diff_y = start_y - listview_x.startIndex;
    
    if (diff_x || diff_y) {
        rearrange_indicators.call(this, diff_x, diff_y);
    }
    
    this._indicators.style.transform = sprintf('translate(%.2fpx, %.2fpx)', scroll_x - micro_x, scroll_y - micro_y);
}

function rearrange_indicators (diff_x, diff_y) {
    
}

export const Matrix = define_class({
    Extends: Patchbay,
    
    width: 0,
    height: 0,
    amount_a: 0,
    amount_b: 0,
    
    _options: Object.assign(Object.create(Patchbay.prototype._options), {
        _list_size: "number",
        _scroller_size: "object",
        _scroller_width: "number",
        _scroller_height: "number",
        scroll_x: "number",
        scroll_y: "number",
    }),
    options: {
        _list_size: 0,
        _scroller_size: {width: 0, height: 0},
        _scroller_width: 0,
        _scroller_height: 0,
        scroll_x: 0,
        scroll_y: 0,
    },
    initialize: function (options) {
        Patchbay.prototype.initialize.call(this, options);
        this._scrollbar_size = scrollbar_size();
    },
    draw: function (options, element) {
        const O = this.options;
        add_class(this.element, "aux-matrix");
        Patchbay.prototype.draw.call(this, options, element);
        
        this.list_a.addEventListener("set__scroller_size", (function (value) {
            this.set("_scroller_height", value);
        }).bind(this));
        this.list_b.addEventListener("set__scroller_size", (function (value) {
            this.set("_scroller_width", value);
        }).bind(this));
        
        this.list_a.addEventListener("useraction", (function (key, value) {
            if (key !== "scroll") return;
            this.set("scroll_y", value);
        }).bind(this));
        this.list_b.addEventListener("useraction", (function (key, value) {
            if (key !== "scroll") return;
            this.set("scroll_x", value);
        }).bind(this));
        
        this.list_a.addEventListener("resized", (function () {
            let a = {width: O._scroller_size.width, height: this.list_a.amount * O.size};
            this.set("_scroller_size", a);
        }).bind(this));
        this.list_b.addEventListener("resized", (function () {
            let a = {width: this.list_b.amount * O.size, height: O._scroller_size.height};
            this.set("_scroller_size", a);
        }).bind(this));
        
        this._scrollbar.addEventListener("scroll", scroll.bind(this), { passive: true });
    },
    redraw: function () {
        const O = this.options;
        const I = this.invalid;
        const E = this.element;
        
        if (I._list_size) {
            I._list_size = false;
            const list = this.list_b;
            list.element.style.height = O._list_size + "px";
            list.trigger_resize();
        }
        
        if (I._scroller_size) {
            I._scroller_size = false;
            this._indicators.style.width = O._scroller_size.width + "px";
            this._indicators.style.height = O._scroller_size.height + "px";
        }
        
        if (I._scroller_width) {
            I._scroller_width = false;
            this._scroller.style.width = (O._scroller_width * O.size) + "px";
        }
        if (I._scroller_height) {
            I._scroller_height = false;
            this._scroller.style.height = (O._scroller_height * O.size) + "px";
        }
        
        if (I.scroll_x) {
            I.scroll_x = false;
            this._ignore_scroll_x = true;
            this._scrollbar.scrollLeft = O.scroll_x;
        }
        if (I.scroll_y) {
            I.scroll_y = false;
            this._ignore_scroll_y = true;
            this._scrollbar.scrollTop = O.scroll_y;
        }
        
        Patchbay.prototype.redraw.call(this);
    },
    resize: function () {
        this.set("_scroller_size", {
            width: this._scrollbar.offsetWidth - this._scrollbar_size,
            height: this._scrollbar.offsetHeight - this._scrollbar_size
        });
        this.set("_list_size", inner_width(this.element) - outer_width(this.list_a.element));
        Patchbay.prototype.resize.call(this);
    },
});

define_child_element(Matrix, "indicators", {
    show: true,
    append: function () { this._scroller.appendChild(this._indicators); },
});
