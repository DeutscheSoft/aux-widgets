import { define_class, define_child_element } from './../../widget_helpers.js';
import {
  inner_width,
  inner_height,
  scrollbar_size,
  add_class,
  remove_class,
} from './../../utils/dom.js';

import { Widget } from './../../widgets/widget.js';

export const Canvas = define_class({
  Extends: Widget,
  _options: Object.assign(Object.create(Widget.prototype._options), {}),
  options: {},
  initialize: function (options) {
    Widget.prototype.initialize.call(this, options);
  },
});
