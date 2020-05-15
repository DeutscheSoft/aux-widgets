import { define_class } from './../widget_helpers.js';
import { Base } from './../implements/base.js';

export const Module = define_class({
  Extends: Base,
  initialize: function (widget, options) {
    this.parent = widget;
    Base.prototype.initialize.call(this, options);
  },
  destroy: function () {
    this.parent = null;
    Base.prototype.destroy.call(this);
  },
});
