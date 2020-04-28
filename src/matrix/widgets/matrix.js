import { define_class, define_child_element } from './../../widget_helpers.js';
import { inner_width, inner_height, outer_width, outer_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';
import { Patchbay } from './patchbay.js';

export const Matrix = define_class({
    Extends: Patchbay,
    _options: Object.assign(Object.create(Patchbay.prototype._options), {
        _list_size: "number",
    }),
    options: {
        _list_size: 0,
    },
    initialize: function (options) {
        Patchbay.prototype.initialize.call(this, options);
    },
    draw: function (options, element) {
        add_class(this.element, "aux-matrix");
        Patchbay.prototype.draw.call(this, options, element);
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
        Patchbay.prototype.redraw.call(this);
    },
    resize: function () {
        this.set("_list_size", inner_width(this.element) - outer_width(this.list_a.element));
        Patchbay.prototype.resize.call(this);
    },
});
