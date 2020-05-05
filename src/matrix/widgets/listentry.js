import { define_class } from '../../widget_helpers.js';
import { define_child_widget } from '../../child_widget.js';
import { set_text, add_class, remove_class, toggle_class } from '../../utils/dom.js';
import { Timer } from '../../utils/timers.js';
import { Subscriptions } from '../../utils/subscriptions.js';

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

function compose_depth (tree_position) {
    let depth = [];

    if (tree_position.length == 1)
        return depth;

    for (let i = 1, m = tree_position.length - 1; i < m; ++i) {
        if (tree_position[i])
            depth.push("none");
        else
            depth.push("trunk");
    }

    if (tree_position[tree_position.length - 1])
        depth.push("end");
    else
        depth.push("branch");

    return depth;
}

export const ListEntry = define_class({
    Extends: Container,
    _options: Object.assign(Object.create(Container.prototype._options), {
        label: "string|boolean",
        depth: "array|boolean",
        collapsable: "boolean",
        collapsed: "boolean",
        icon_collapsed: "string",
        icon_uncollaped: "string",
        icon: "string|boolean",
        odd: "boolean",
        group: "boolean",
    }),
    options: {
        label: false,
        depth: false,
        collapsable: false,
        collapsed: false,
        icon_collapsed: "arrowdown",
        icon_uncollapsed: "arrowup",
        icon: false,
        odd: false,
        group: false,
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        this.data_subscriptions = new Subscriptions();
        this.data = null;
        this.data_subscription_timer = new Timer(() => {
          this.subscribeData();
        });
    },
    draw: function (options, element) {
        Container.prototype.draw.call(this, options, element);
        element.classList.add("aux-listentry");
    },
    // overload this to subscribe to other properties
    subscribeData: function () {
        const subs = this.data_subscriptions;
        const element = this.data;

        if (!element) return;

        subs.add(element.subscribe('propertyChanged', (key, value) => {
          switch (key)
          {
          case 'label': this.update('label', value); break;
          case 'icon': this.update('icon', value); break;
          }
        }));
    },
    // overload this to subscribe to other properties
    updateData: function (listview, index, element, treePosition) {
        this.data_subscriptions.unsubscribe();

        if (element)
        {
          this.update('depth', compose_depth(treePosition));
          this.update('collapsable', element.isGroup);
          this.update('group', element.isGroup);
          this.update('odd', (index & 1) === 0);
          this.update('collapsed', element.isGroup && listview.isCollapsed(element));
          this.update('label', element.label);
          this.update('icon', element.icon);

          // start listening to changes after 500ms
          this.data_subscription_timer.restart(500);
        }
        this.data = element;

    },
    redraw: function () {
        Container.prototype.redraw.call(this);
        
        const O = this.options;
        const E = this.element;
        const I = this.invalid;
        
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

        if (I.odd)
        {
          I.odd = false;
          remove_class(E, "aux-even");
          remove_class(E, "aux-odd");
          add_class(E, O.odd ? "aux-odd" : "aux-even");
        }
        
        if (I.collapsable) {
            I.collapsable = false;
            toggle_class(E, "aux-collapsable", O.collapsable);
        }

        if (I.group) {
            I.group = false;
            toggle_class(E, "aux-group", O.group);
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
