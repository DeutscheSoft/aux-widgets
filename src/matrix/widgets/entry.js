import { define_class } from '../../widget_helpers.js';
import { define_child_widget } from '../../child_widget.js';
import { Container } from '../../widgets/container.js';
import { Label } from '../../widgets/label.js';

export const Entry = define_class({
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        label: "string|boolean",
        depth: "number|boolean",
        last: "boolean",
    }),
    options: {
        label: false,
        depth: false,
        last: false,
    },
    initialize: function (options) {
        if (!options.element) options.element = element('div');
        Container.prototype.initialize.call(this, options);
        this.datum = null;
        this.datumSubscription = null;
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-entry");
    },
    redraw: function () {
        var O = this.options;
        var E = this.element;
        var I = this.invalid;
        
        if (I.depth) {
            I.depth = false;
            var C = E.getAttribute("class");
            C = C.replace(/aux-depth-[0-9]*/mg, "");
            C = C.replace(/\s\s+/g, ' ');
            E.setAttribute("class", C);
            E.classList.add("aux-depth-" + O.depth);
            E.style.setProperty('--aux-entry-depth', O.depth)
        }
        
        if (I.last) {
            I.last = false;
            E.classList[O.last ? "add" : "remove"]("aux-last");
        }
        
        Container.prototype.redraw.call(this);
        
    },
    setDatum: function(datum) {
        if (this.datumSubscription)
        {
            this.datumSubscription();
            this.datumSubscription = null;
        }

        if (!datum)
        {
            this.hide();
        }
        else
        {
            // connect properties of the data entry with
            // our options
            this.set('label', datum.label);


            this.datumSubscription = datum.subscribe('propertyChanged',
                                                     (name, value) => this.datumPropertyChanged(name, value));
            if (!this.datum)
            {
                this.show();
            }
        }

        this.datum = datum;
    },
    datumPropertyChanged: function(name, value)
    {
        switch (name)
        {
        case 'depth':
        case 'label':
            this.set(name, value);
            break;
        }
    }
});

define_child_widget(Entry, "label", {
    create: Label,
    option: "label",
    inherit_options: true,
    toggle_class: true,
});

define_child_widget(Entry, "indent", {
    create: Container,
    option: "depth",
    toggle_class: true,
    default_options: {
        class: "aux-indent",
    },
});
