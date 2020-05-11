import { define_class } from './../../widget_helpers.js';
import { add_class, toggle_class } from './../../utils/dom.js';

import { Button } from './../../widgets/button.js';

export const Indicator = define_class({
    Extends: Button,
    _options: Object.assign(Object.create(Button.prototype._options), {
      connected: 'boolean',
      connectable: 'boolean',
      sourceisgroup: "boolean",
      sinkisgroup: "boolean",
      isgroup: "boolean",
    }),
    initialize: function (options) {
        Button.prototype.initialize.call(this, options);
        this.source = null;
        this.sink = null;
    },
    updateData: function (index1, index2, connection, source, sink) {
      this.update('connected', !!connection);
      this.update('sourceisgroup', source && source.isGroup);
      this.update('sinkisgroup', sink && sink.isGroup);
      this.update('isgroup', sink && sink.isGroup || source && source.isGroup);
      
      const connectable = source && sink && !source.isGroup && !sink.isGroup;
      this.update('connectable', connectable);

      this.source = source;
      this.sink = sink;
    },
    draw: function (options, element) {
        add_class(this.element, "aux-indicator");
        Button.prototype.draw.call(this, options, element);
    },
    redraw: function() {
        Button.prototype.redraw.call(this);

        const E = this.element;
        const I = this.invalid;
        const O = this.options;

        if (I.connected)
        {
            I.connected = false;
            toggle_class(E, 'aux-connected', O.connected);
        }

        if (I.connectable)
        {
            I.connectable = false;
            toggle_class(E, 'aux-connectable', O.connectable);
        }
        
        if (I.sourceisgroup)
        {
            I.sourceisgroup = false;
            toggle_class(E, 'aux-sourceisgroup', O.sourceisgroup);
        }
        
        if (I.sinkisgroup)
        {
            I.sinkisgroup = false;
            toggle_class(E, 'aux-sinkisgroup', O.sinkisgroup);
        }
        
        if (I.isgroup)
        {
            I.isgroup = false;
            toggle_class(E, 'aux-isgroup', O.isgroup);
        }
    },
});