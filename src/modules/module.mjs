import { define_class } from './../widget_helpers.mjs';
import { Base } from './../implements/base.mjs';

export const Module = define_class({
    Extends: Base,
    initialize: function(widget, options) {
        this.parent = widget;
        Base.prototype.initialize.call(this, options);
    },
    destroy: function() {
        this.parent = null;
        Base.prototype.destroy.call(this);
    },
});
