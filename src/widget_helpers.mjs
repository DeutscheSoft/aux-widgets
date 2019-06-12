import { Base } from './implements/base.mjs';
import { toggle_class, element, warn } from './helpers.mjs';

export function add_static_event(w, event, fun) {
    var p = w.prototype, e;
    if (!p.hasOwnProperty('static_events')) {
        if (p.static_events) {
            p.static_events = e = Object.assign({}, p.static_events);
        } else {
            p.static_events = e = {};
        }
    } else e = p.static_events;
    add_event(e, event, fun);
}

export function ChildElement(widget, name, config) {
    /**
     * @function ChildElement
     *
     * Creates a HTMLElement as a child for a widget. Is used to simplify
     * widget definitions. E.g. the tiny marker used to display the back-end
     * value is a simple DIV added using ChildElement. The generic element
     * is a DIV added to Widget.element with the class
     * <code>toolkit-[name]</code>. Default creating and adding can be
     * overwritten with custom callback functions.
     * 
     * @param {Widget} widget - The {@link Widget} to add the ChildElement to.
     * @param {string} name - The identifier of the element. It will be prefixed
     *     by an underscore <code>Widget["_" + config.name]</code>.
     * @param {object} config - The configuration of the child element.
     * 
     * @property {boolean} [config.show=false] - Show/hide the child element on initialization.
     * @property {string} [config.option="show_"+config.name] - A custom option of the parent widget
     *     to determine the visibility of the child element. If this is
     *     <code>null</code>, <code>Widget.options["show_"+  config.name]</code>
     *     is used to toggle its visibility. The child element is visible, if
     *     this options is <code>!== false</code>.
     * @property {function} [config.display_check] - A function overriding the 
     *     generic <code>show_option</code> behavior. If set, this function
     *     is called with the value of <code>show_option</code> as argument
     *     as soon as it gets set and is supposed to return a boolean
     *     defining the visibility of the element.
     * @property {function} [config.append] - A function overriding the generic
     *     append mechanism. If not <code>null</code>, this function is
     *     supposed to take care of adding the child element to the parent
     *     widgets DOM.
     * @property {function} [config.create] - A function overriding the generic
     *     creation mechanism. If not <code>null</code>, this function is
     *     supposed to create and return a DOM element to be added to the
     *     parent widget.
     * @property {boolean} [config.toggle_class=false] - Defines if the parent widget
     *     receives the class <code>toolkit-has-[name]</code> as soon as
     *     the child element is shown.
     * @property {array} [config.draw_options] - A list of options of the parent
     *     widget which are supposed to trigger a check if the element has to
     *     be added or removed.
     * @property {function} [config.draw] - A function to be called on redraw.
     * 
     * @class ChildElement
     * 
     */
    var p = widget.prototype;
    var show_option = config.option || ("show_" + name);
    var index = "_"+name;

    var display_check = config.display_check;

    /* This is done to make sure that the object property is created
     * inside of the constructor. Otherwise, if we add the widget later
     * might be turned into a generic mapping.
     */
    add_static_event(widget, "initialize", function() {
        this[index] = null;
    });

    /* trigger child element creation after initialization */
    add_static_event(widget, "initialized", function() {
        this.set(show_option, this.options[show_option]);
    });

    /* clean up on destroy */
    add_static_event(widget, "destroy", function() {
        if (this[index]) {
            this[index].remove();
            this[index] = null;
        }
    });

    var append = config.append;
    var create = config.create;
    var toggle_class = !!config.toggle_class;

    if (create === void(0)) create = function() { return element("div", "toolkit-"+name); }
    if (append === void(0)) append = function() { this.element.appendChild(this[index]); }

    add_static_event(widget, "set_"+show_option, function(value) {
        var C = this[index];
        var show = display_check ? display_check(value) : (value !== false);
        if (show && !C) {
            C = create.call(this);
            this[index] = C;
            append.call(this, this.options);
        } else if (C && !show) {
            this[index] = null;
            C.remove();
        }
        if (toggle_class) toggle_class(this.element, "toolkit-has-"+name, value);
        this.trigger_resize();
    });

    if (config.draw) {
        var m = config.draw_options;

        if (!m) m = [ show_option ];
        else m.push(show_option);

        for (var i = 0; i < m.length; i++) {
            add_static_event(widget, "set_"+m[i], function() {
                if (this.options[show_option])
                    this.draw_once(config.draw);
            });
        }
    }

    if (p._options[show_option] === void(0)) {
        p._options[show_option] = "boolean";
        p.options[show_option] = !!config.show;
    }
}

function get_child_options(parent, name, options, config) {
    var ret = {};
    var key, pref = name+".";
    var tmp;

    var inherit_options = !!config.inherit_options;

    if (tmp = config.default_options)
        Object.assign(ret, (typeof(tmp) === "function") ?  tmp.call(parent) : tmp);

    for (key in options) {
        if (key.startsWith(pref)) {
            ret[key.substr(pref.length)] = options[key];
        }

        if (inherit_options) {
            if (key in config.create.prototype._options && !(key in TK["Widget"].prototype._options)) {
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
export function ChildWidget(widget, name, config) {
    
    /**
     * @function ChildWidget
     *
     * Defines a {@link Widget} as a child for another widget. This function
     * is used internally to simplify widget definitions. E.g. the {@link Icon} of a
     * {@link Button} is defined as a ChildWidget. ChildWidgets
     * are created/added after the initialization of the parent widget.
     * If not configured otherwise, all options of the child widget can
     * be accessed via <code>Widget.options[config.name + "." + option]</code>
     * on the parent widget.
     * 
     * @param {Widget} widget - The {@link Widget} to add the ChildWidget to.
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
     *     receives the class <code>toolkit-has-[name]</code> as soon as
     *     the child element is shown.
     * 
     * @class ChildWidget
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


    if (m = config.static_events)
        Object.assign(static_events, m);

    if (config.create === void(0)) {
      warn("'create' is undefined. Skipping ChildWidget ", name);
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
    var toggle_class = !!config.toggle_class;

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
        if (toggle_class) toggle_class(this.element, "toolkit-has-"+name, show);
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
    if (config.inherit_options) {
        set_cb = function(val, key) {
            if (this[name]) this[name].set(key, val);
        };
        for (tmp in child.prototype._options) {
            if (tmp in TK["Widget"].prototype._options) continue;
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
    if (m = config.map_options) {
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

function merge_static_events(a, b) {
    var event;
    if (!a) return b;
    if (!b) return Object.assign({}, a);
    for (event in a) {
        var tmp = a[event];
        if (b.hasOwnProperty(event)) {
            b[event] = arrayify(tmp).concat(arrayify(b[event]));
        } else {
            b[event] = Array.isArray(tmp) ? tmp.slice(0) : tmp;
        }
    }
    return Object.assign({}, a, b);
}

function mixin(dst, src) {
    var fun, key;
    for (key in src) if (!dst[key]) {
        if (key === "constructor" ||
            key === "_class" ||
            key === "Extends" ||
            key === "Implements" ||
            key === "options") continue;
        if (!src.hasOwnProperty(key)) continue;

        fun = src[key];

        dst[key] = fun;
    }

    return dst;
};

export function define_class(o) {
    var constructor;
    var methods;
    var tmp, i, c, key;

    if (tmp = o.Extends) {
        if (typeof(tmp) === "function") {
            tmp = tmp.prototype;
        }
        if (typeof(o.options) === "object" &&
            typeof(tmp.options) === "object") {
            o.options = Object.assign(Object.create(tmp.options), o.options);
        }
        if (o.static_events) o.static_events = merge_static_events(tmp.static_events, o.static_events);
        methods = Object.assign(Object.create(tmp), o);
    } else {
        methods = o;
    }

    tmp = o.Implements;
    // mixins
    if (tmp !== void(0)) {
        tmp = arrayify(tmp);
        for (i = 0; i < tmp.length; i++) {
            if (typeof(tmp[i]) === "function") {
                c = tmp[i].prototype;
            } else c = tmp[i];

            if (typeof(c.options) === "object") {
                if (!methods.hasOwnProperty("options")) {
                    methods.options = Object.create(methods.options || null);
                }
                methods.options = Object.assign({}, c.options, methods.options);
            }
            if (c.static_events) {
              if (methods.static_events) {
                methods.static_events = merge_static_events(c.static_events,
                                                            Object.assign({}, methods.static_events));
              } else {
                methods.static_events = c.static_events;
              }
            }

            methods = mixin(methods, c, true);
        }
    }

    var init = methods.initialize;
    var post_init = methods.initialized;

    if (post_init) {
        constructor = function() {
            init.apply(this, arguments);
            post_init.call(this);
        };
    } else constructor = init || (function() {});

    constructor.prototype = methods;
    methods.constructor = constructor;
    return constructor;
};
