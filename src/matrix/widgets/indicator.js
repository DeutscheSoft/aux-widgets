import { define_class } from './../../widget_helpers.js';
import { add_class } from './../../utils/dom.js';

import { Button } from './../../widgets/button.js';

function switch_class (cls) {
    const index = this.classes.indexOf(cls);
    for (let i = 0, m = this.classes.length; i < m; ++i)
        remove_class(this.element, this.classes[i]);
    add_class(this.element, cls);
    if (index < 0)
        this.classes.push(cls);
}

export const Indicator = define_class({
    Extends: Button,
    classes: [],
    static_events: {
        "status": switch_class.bind(this),
    },
    draw: function (options, element) {
        add_class(this.element, "aux-indicator");
        Button.prototype.draw.call(this, options, element);
    },
});
