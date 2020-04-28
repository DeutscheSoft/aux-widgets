import { define_class, define_child_element } from './../../widget_helpers.js';
import { define_child_widget } from './../../child_widget.js';
import { inner_width, inner_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { List } from './list.js';
import { Container } from './../../widgets/container.js';

export const Patchbay = define_class({
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        sources: "object",
        sinks: "object",
        size: "number",
    }),
    options: {
        size: 32,
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
    },
    draw: function (options, element) {
        add_class(this.element, "aux-patchbay");
        Container.prototype.draw.call(this, options, element);
    },
});

define_child_widget(Patchbay, "list_a", {
    create: List,
    show: true,
    map_options: {
        sources: "listview",
        size: "size",
    },
    default_options: {
        class: "aux-lista",
    },
});

define_child_widget(Patchbay, "list_b", {
    create: List,
    show: true,
    map_options: {
        sinks: "listview",
        size: "size",
    },
    default_options: {
        class: "aux-listb",
    },
});

define_child_element(Patchbay, "scrollbar", {
    show: true,
});

define_child_element(Patchbay, "scroller", {
    show: true,
    append: function () { this._scrollbar.appendChild(this._scroller); },
});
