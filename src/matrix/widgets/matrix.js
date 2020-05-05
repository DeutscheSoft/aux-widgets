import { define_class } from './../../widget_helpers.js';
import { define_child_widget } from './../../child_widget.js';
import { inner_width, inner_height, outer_width, outer_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { Indicators } from './indicators.js';
import { Indicator } from './indicator.js';
import { Patchbay } from './patchbay.js';
import { List } from './list.js';

import { ConnectionDataView } from '../models.js';

function set_listviews () {
    var O = this.options;
    if (!O.sources || !O.sinks) return;
    switch (O.signal_flow) {
        case "top-left":
          {
            const connectionview = new ConnectionDataView(O.sinks, O.sources);
            this.list_top.set("listview", O.sources);
            this.list_left.set("listview", O.sinks);
            this.indicators.set("connectionview", connectionview);
            break;
          }
        case "left-top":
          {
            const connectionview = new ConnectionDataView(O.sources, O.sinks);
            this.list_left.set("listview", O.sources);
            this.list_top.set("listview", O.sinks);
            this.indicators.set("connectionview", connectionview);
            break;
          }
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
        
        this.list_left.on('scrollTopChanged', (position) => {
          this.indicators.scrollTopTo(position);
        });
        this.list_top.on('scrollTopChanged', (position) => {
          this.indicators.scrollLeftTo(position);
        });
        this.indicators.on('scrollChanged', (yposition, xposition) => {
          this.list_left.scrollTo(yposition);
          this.list_top.scrollTo(xposition);
        });
        this.indicators.on('indicatorClicked', (source, sink) => {
          this.emit('toggleConnection', source, sink);
        });
        
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
