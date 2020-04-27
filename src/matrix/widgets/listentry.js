import { define_class } from '../../widget_helpers.js';
import { define_child_widget } from '../../child_widget.js';
import { set_text, add_class, remove_class } from '../../utils/dom.js';
import { Container } from '../../widgets/container.js';
import { Button } from '../../widgets/button.js';
import { Label } from '../../widgets/label.js';
import { Icon } from '../../widgets/icon.js';

const indent_to_glyph = {
    "trunk" : "",
    "branch" : "",
    "end" : "",
    "none" : "",
}

function set_datum (datum) {
    const O = this.options;
    if (this.datum_subscription) {
        this.datum_subscription();
        this.datum_subscription = null;
    }
    if (!datum) {
        this.hide();
    } else {
        const props = datum.properties;
        for (let i in props) {
            if (props.hasOwnProperty(i) && i !== "id" && i.substr(0, 1) !== "_")
                this.set(i, props[i]);
        }
        this.datum_subscription = datum.subscribe('propertyChanged',
                                                 (name, value) => datum_property_changed.call(this, name, value));
        if (!O.datum) {
            this.show();
        }
    }
}

function datum_property_changed (name, value) {
    console.log(name, value)
    if (name !== "id" && name.substr(0, 1) !== "_")
        this.set(name, value);
}

export const ListEntry = define_class({
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        datum: "object",
        label: "string|boolean",
        depth: "array|boolean",
        collapsable: "boolean",
        collapsed: "boolean",
        icon_collapsed: "string",
        icon_uncollaped: "string",
        icon: "string|boolean",
    }),
    options: {
        label: false,
        depth: false,
        collapsable: false,
        collapsed: false,
        icon_collapsed: "arrowdown",
        icon_uncollapsed: "arrowup",
        icon: false,
    },
    static_events: {
        set_datum: function (datum) { set_datum.call(this, datum); },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        this.datum_subscription = null;
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-listentry");
        if (options.datum)
            this.set("datum", options.datum);
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
        
        if (I.collapsable) {
            I.collapsable = false;
            if (O.collapsable)
                add_class(E, "aux-collapsable");
            else
                remove_class(E, "aux-collapsable");
        }
        
        if (I.collapsed) {
            I.collapsed = false;
            this.collapse.set("icon", O[O.collapsed ? "icon_collapsed" : "icon_uncollapsed"]);
        }
    },
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
    create: Button,
    show: true,
    toggle_class: true,
    default_options: {
        class: "aux-collapse",
    },
    static_events: {
        click: function () {
            this.parent.emit("collapse");
        },
    },
});
