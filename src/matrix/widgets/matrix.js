import { define_class } from './../../widget_helpers.js';
import { define_child_widget } from './../../child_widget.js';
import { inner_width, inner_height, outer_width, outer_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { init_subscriptions, add_subscription, unsubscribe_subscriptions } from '../../utils/subscriptions.js';

import { Indicators } from './indicators.js';
import { Indicator } from './indicator.js';
import { Patchbay } from './patchbay.js';
import { VirtualTree } from './virtualtree.js';

import { ConnectionDataView } from '../models.js';

function set_virtualtreeviews () {
    var O = this.options;
    if (!O.sources || !O.sinks) return;
    switch (O.signal_flow) {
        case "top-left":
          {
            const connectionview = new ConnectionDataView(O.sinks, O.sources);
            this.virtualtree_top.set("virtualtreeview", O.sources);
            this.virtualtree_left.set("virtualtreeview", O.sinks);
            this.indicators.set("connectionview", connectionview);
            break;
          }
        case "left-top":
          {
            const connectionview = new ConnectionDataView(O.sources, O.sinks);
            this.virtualtree_left.set("virtualtreeview", O.sources);
            this.virtualtree_top.set("virtualtreeview", O.sinks);
            this.indicators.set("connectionview", connectionview);
            break;
          }
    }
}

export const Matrix = define_class({
    Extends: Patchbay,
    _options: Object.assign(Object.create(Patchbay.prototype._options), {
        _virtualtree_size: "number",
        indicator_class: "object",
        signal_flow: "string",
    }),
    options: {
        _virtualtree_size: 0,
        indicator_class: Indicator,
        signal_flow: "left-top",
    },
    static_events: {
        set_signal_flow: set_virtualtreeviews,
        set_sources: set_virtualtreeviews,
        set_sinks: set_virtualtreeviews,
    },
    initialize: function (options) {
        Patchbay.prototype.initialize.call(this, options);
    },
    draw: function (options, element) {
        const O = this.options;
        add_class(this.element, "aux-matrix");
        Patchbay.prototype.draw.call(this, options, element);
        
        this.virtualtree_left.on('scrollTopChanged', (position) => {
          this.indicators.scrollTopTo(position);
        });
        this.virtualtree_top.on('scrollTopChanged', (position) => {
          this.indicators.scrollLeftTo(position);
        });
        this.indicators.on('scrollChanged', (yposition, xposition) => {
          this.virtualtree_left.scrollTo(yposition);
          this.virtualtree_top.scrollTo(xposition);
        });
        this.indicators.on('indicatorClicked', (source, sink) => {
          this.emit('toggleConnection', source, sink);
        });
        
        set_virtualtreeviews.call(this);
    },
    redraw: function () {
        const O = this.options;
        const I = this.invalid;
        const E = this.element;
        
        if (I._virtualtree_size) {
            I._virtualtree_size = false;
            const virtualtree = this.virtualtree_top;
            virtualtree.element.style.height = O._virtualtree_size + "px";
            virtualtree.trigger_resize();
        }
        
        Patchbay.prototype.redraw.call(this);
    },
    resize: function () {
        this.set("_virtualtree_size", inner_width(this.element) - outer_width(this.virtualtree_left.element));
        Patchbay.prototype.resize.call(this);
    },
});

define_child_widget(Matrix, "virtualtree_left", {
    create: VirtualTree,
    show: true,
    map_options: {
        size: "size",
    },
    default_options: {
        class: "aux-virtualtreeleft",
    },
});

define_child_widget(Matrix, "virtualtree_top", {
    create: VirtualTree,
    show: true,
    map_options: {
        size: "size",
    },
    default_options: {
        class: "aux-virtualtreetop",
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
