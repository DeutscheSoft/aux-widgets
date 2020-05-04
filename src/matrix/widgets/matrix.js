import { define_class } from './../../widget_helpers.js';
import { define_child_widget } from './../../child_widget.js';
import { inner_width, inner_height, outer_width, outer_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { Indicators } from './indicators.js';
import { Indicator } from './indicator.js';
import { Patchbay } from './patchbay.js';
import { List } from './list.js';

function set_listviews () {
    var O = this.options;
    if (!O.sources || !O.sinks) return;
    switch (O.signal_flow) {
        case "top-left":
            this.list_top.set("listview", O.sources);
            this.list_left.set("listview", O.sinks);
            //this.indicators.set("listview_top", O.sources);
            //this.indicators.set("listview_left", O.sinks);
            break;
        case "left-top":
            this.list_left.set("listview", O.sources);
            this.list_top.set("listview", O.sinks);
            //this.indicators.set("listview_left", O.sources);
            //this.indicators.set("listview_top", O.sinks);
            break;
    }
}

export const Matrix = define_class({
    Extends: Patchbay,
    _options: Object.assign(Object.create(Patchbay.prototype._options), {
        _list_size: "number",
        indicator_class: "object",
        signal_flow: "string",
    }),
    options: {
        _list_size: 0,
        indicator_class: Indicator,
        signal_flow: "left-top",
    },
    static_events: {
        set_signal_flow: set_listviews,
        set_sources: set_listviews,
        set_sinks: set_listviews,
    },
    initialize: function (options) {
        Patchbay.prototype.initialize.call(this, options);
    },
    draw: function (options, element) {
        const O = this.options;
        add_class(this.element, "aux-matrix");
        Patchbay.prototype.draw.call(this, options, element);
        
        //this.list_left.addEventListener("useraction", (function (key, value) {
            //if (key !== "scroll") return;
            //this.indicators.set("scroll_top", value);
        //}).bind(this));
        
        //this.list_top.addEventListener("useraction", (function (key, value) {
            //if (key !== "scroll") return;
            //this.indicators.set("scroll_left", value);
        //}).bind(this));
        
        //this.indicators.addEventListener("useraction", (function (key, value) {
            //if (key === "scroll_left") {
                //this.list_top.set("scroll", value);
            //}
            //if (key === "scroll_top") {
                //this.list_left.set("scroll", value);
            //}
        //}).bind(this));
        
        set_listviews.call(this);
    },
    redraw: function () {
        const O = this.options;
        const I = this.invalid;
        const E = this.element;
        
        if (I._list_size) {
            I._list_size = false;
            const list = this.list_top;
            list.element.style.height = O._list_size + "px";
            list.trigger_resize();
        }
        
        Patchbay.prototype.redraw.call(this);
    },
    resize: function () {
        this.set("_list_size", inner_width(this.element) - outer_width(this.list_left.element));
        Patchbay.prototype.resize.call(this);
    },
});

define_child_widget(Matrix, "list_left", {
    create: List,
    show: true,
    map_options: {
        size: "size",
    },
    default_options: {
        class: "aux-listleft",
    },
});

define_child_widget(Matrix, "list_top", {
    create: List,
    show: true,
    map_options: {
        size: "size",
    },
    default_options: {
        class: "aux-listtop",
    },
});

define_child_widget(Matrix, "indicators", {
    create: Indicators,
    show: true,
    map_options: {
        size: "size",
        indicator_class: "indicator_class",
    },
});
