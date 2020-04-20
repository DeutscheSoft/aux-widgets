import { define_class } from '../../widget_helpers.js';
import { define_child_widget } from '../../child_widget.js';
import { set_text, add_class, remove_class } from '../../utils/dom.js';
import { Container } from '../../widgets/container.js';
import { Toggle } from '../../widgets/toggle.js';
import { Label } from '../../widgets/label.js';
import { Icon } from '../../widgets/icon.js';

const indent_to_glyph = {
    "trunk" : "",
    "branch" : "",
    "end" : "",
    "none" : "",
}

export const ListEntry = define_class({
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        label: "string|boolean",
        depth: "array|boolean",
        last: "boolean",
        collapsable: "boolean",
        icon: "string|boolean",
    }),
    options: {
        label: false,
        depth: false,
        last: false,
        collapsable: false,
        icon: false,
    },
    initialize: function (options) {
        if (!options.element) options.element = element('div');
        Container.prototype.initialize.call(this, options);
        this.datum = null;
        this.datumSubscription = null;
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-listentry");
    },
    redraw: function () {
        Container.prototype.redraw.call(this);
        
        var O = this.options;
        var E = this.element;
        var I = this.invalid;
        
        if (I.depth) {
            I.depth = false;
            var C = E.getAttribute("class");
            C = C.replace(/aux-depth-[0-9]*/mg, "");
            C = C.replace(/\s\s+/g, ' ');
            E.setAttribute("class", C);
            
            if (O.depth) {
                var d = O.depth.length;
                E.classList.add("aux-depth-" + d);
                E.style.setProperty('--aux-entry-depth', d);
                var s = "";
                for (var i = 0; i < d; ++i) {
                    s += indent_to_glyph[O.depth[i]];
                }
                set_text(this.indent.element, s);
            }
        }
        
        if (I.last) {
            I.last = false;
            E.classList[O.last ? "add" : "remove"]("aux-last");
        }
        
        if (I.collapsable) {
            I.collapsable = false;
            if (O.collapsable)
                add_class(E, "aux-collapsable");
            else
                remove_class(E, "aux-collapsable");
        }
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

define_child_widget(ListEntry, "label", {
    create: Label,
    option: "label",
    inherit_options: true,
    toggle_class: true,
});

define_child_widget(ListEntry, "icon", {
    create: Icon,
    option: "icon",
    inherit_options: true,
    toggle_class: true,
});

define_child_widget(ListEntry, "indent", {
    create: Container,
    option: "depth",
    toggle_class: true,
    default_options: {
        class: "aux-indent",
    },
});

define_child_widget(ListEntry, "collapse", {
    create: Toggle,
    show: true,
    toggle_class: true,
    default_options: {
        class: "aux-collapse",
        icon: "arrowdown",
        icon_active: "arrowup",
    },
});
