import { define_class, define_child_element } from './../../widget_helpers.js';
import { define_child_widget } from './../../child_widget.js';
import { inner_width, inner_height, scrollbar_size, add_class, remove_class } from './../../utils/dom.js';

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
