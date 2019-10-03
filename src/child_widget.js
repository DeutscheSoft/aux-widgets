import { define_class, add_static_event } from './widget_helpers.js';
import { toggle_class } from './utils/dom.js';
import { warn } from './utils/log.js';
import { Widget } from './widgets/widget.js';

function get_child_options(parent, name, options, config) {
    var ret = {};
    var key, pref = name+".";
    var tmp;

    var inherit_options = !!config.inherit_options;
    var blacklist_options = config.blacklist_options || [];

    if ((tmp = config.default_options))
        Object.assign(ret, (typeof(tmp) === "function") ?  tmp.call(parent) : tmp);

    for (key in options) {
        if (key.startsWith(pref)) {
            ret[key.substr(pref.length)] = options[key];
        }

        if (inherit_options && blacklist_options.indexOf(tmp) < 0) {
            if (key in config.create.prototype._options && !(key in Widget.prototype._options)) {
                ret[key] = options[key];
            }
        }
    }

    var map_options = config.map_options;

    if (map_options) for (key in map_options) {
        if (options[key]) {
            ret[map_options[key]] = options[key];
        }
    }

    return ret;
}

export function define_child_widget(widget, name, config) {
    
    /**
     * @function define_child_widget
     *
     * Defines a {@link Widget} as a child for another widget. This function
     * is used internally to simplify widget definitions. E.g. the {@link Icon} of a
     * {@link Button} is defined as a child widget. Child widgets
     * are created/added after the initialization of the parent widget.
     * If not configured otherwise, all options of the child widget can
     * be accessed via <code>Widget.options[config.name + "." + option]</code>
     * on the parent widget.
     * 
     * @param {Widget} widget - The {@link Widget} to add the child widget to.
     * @param {string} name - The identifier of the element, <code>Widget[config.name]</code>.
     * @param {object} config - The configuration of the child element.
     * 
     * @property {Widget} config.create - A Widget class derivate to be used as child widget.
     * @property {boolean} [config.fixed] - A fixed child widget cannot be removed after initialization.
     * @property {boolean} [config.show=false] - Show/hide a non-fixed child widget on initialization.
     * @property {string} [config.option="show_"+config.name] - A custom option of the parent widget
     *     to determine the visibility of the child element. If this is
     *     <code>null</code>, <code>Widget.options["show_"+  config.name]</code>
     *     is used to toggle its visibility. The child element is visible, if
     *     this options is <code>!== false</code>.
     * @property {function} [config.append] - A function overriding the generic
     *     append mechanism. If not <code>null</code>, this function is
     *     supposed to take care of adding the child widget to the parent
     *     widgets DOM. Otherwise the element of the child widget is added
     *     to the element of the parent widget.
     * @property {boolean} [config.inherit_options=false] - Defines if both widgets share the
     *     same set of options. If <code>true</code>, Setting an option on the
     *     parent widget also sets the same option on the child widget. If <code>false</code>,
     *     the options of the child widget can be accessed via <code>options[config.name + "." + option]</code>
     *     in the parent widget.
     * @property {array} [config.map_options=[]] - An array containing option names to be
     *     mapped between parent and child widget. If one of these options is set
     *     on the parent widget, it also gets set on the child widget. This is
     *     a fine-grained version of <code>config.inherit-options</code>.
     * @property {boolean} [config.userset_ignore=false] - Do not care about the <code>userset</code>
     *     event of the parent widget, only keep track of <code>set</code>.
     * @property {boolean} [config.userset_delegate=false] - Delegates all user interaction from
     *     the child to the parent element. If the user triggers an event on
     *     the child widget, the <code>userset</code> function of the parent
     *     element is called.
     * @property {array} [config.static_events=[]] - An array of static events to be
     *     added to the parent widget. Each entry is a mapping between
     *     the name of the event and the callback function.
     * @property {boolean} [config.toggle_class=false] - Defines if the parent widget
     *     receives the class <code.aux-has-[name]</code> as soon as
     *     the child element is shown.
     * @property {array<string>} [config.blacklist_options] - Array containing options names
     *     which are skipped on `inherit_options`.
     * 
     */
     
    var p = widget.prototype;
    var key = config.option || "show_"+name;
    var tmp, m;
    var static_events = { };
    
    if (!config.userset_ignore)
      static_events.userset = (config.inherit_options || config.userset_delegate)
          ? function(key, value) { this.parent.userset(key, value); return false; }
          : function(key, value) { this.parent.userset(name+"."+key, value); return false; };


    if ((m = config.static_events))
        Object.assign(static_events, m);

    if (config.create === void(0)) {
      warn("'create' is undefined. Skipping child widget ", name);
      return;
    }

    var child = define_class({
        Extends: config.create,
        static_events: static_events,
    });


    /* trigger child widget creation after initialization */
    add_static_event(widget, "initialized", function() {
        /* we do not want to trash the class cache */
        if (!this[name])
        {
          this[name] = null;
          this.set(key, this.options[key]);
        }
    });

    /* clean up on destroy */
    add_static_event(widget, "destroy", function() {
        if (this[name]) {
            this[name].destroy();
            this[name] = null;
        }
    });
    
    var fixed = config.fixed;
    var append = config.append;

    if (append === void(0)) append = true;

    /* child widget creation */
    add_static_event(widget, "set_"+key, function(val) {
        var C = this[name];
        var show = fixed || !!val;
        if (show && !C) {
            var O = get_child_options(this, name, this.options, config);
            if (append === true)
                O.container = this.element;
            var w = new child(O);
            this.add_child(w);
            this[name] = w;
            if (typeof(append) === "function")
                append.call(this);
        } else if (!show && C) {
            C.destroy();
            this[name] = null;
        }
        if (config.toggle_class) toggle_class(this.element, "aux-has-"+name, show);
        this.trigger_resize();
    });
    var set_cb = function(val, key) {
        if (this[name]) this[name].set(key.substr(name.length+1), val);
    };

    for (tmp in child.prototype._options) {
        add_static_event(widget, "set_"+name+"."+tmp, set_cb);
        p._options[name+"."+tmp] = child.prototype._options[tmp];
    }

    /* direct option inherit */
    var blacklist_options = config.blacklist_options || [];
    if (config.inherit_options) {
        set_cb = function(val, key) {
            if (this[name]) this[name].set(key, val);
        };
        for (tmp in child.prototype._options) {
            if (tmp in Widget.prototype._options) continue;
            if (blacklist_options.indexOf(tmp) > -1) continue;
            add_static_event(widget, "set_"+tmp, set_cb);
            if (!p._options[tmp])
                p._options[tmp] = child.prototype._options[tmp];
        }
    }
    set_cb = function(key) {
        return function(val) {
            if (this[name]) this[name].set(key, val);
        };
    };
    if ((m = config.map_options)) {
        for (tmp in m) {
            p._options[tmp] = child.prototype._options[m[tmp]];
            if (!p.options[tmp])
                p.options[tmp] = child.prototype.options[m[tmp]];
            add_static_event(widget, "set_"+tmp, set_cb(m[tmp]));
        }
    }
    if (!config.options) {
        if (!p._options[key])
            p._options[key] = "boolean";
        p.options[key] = fixed || !!config.show;
    }
}
