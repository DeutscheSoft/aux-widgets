/*
 * This file is part of Toolkit.
 *
 * Toolkit is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * Toolkit is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */
import { define_class, ChildElement } from './../widget_helpers.js';
import { S } from '../dom_scheduler.js';
import {
    empty, css_space, make_svg, get_style, element, add_class,
    inner_width, toggle_class, inner_height
  } from '../utils/dom.js';
import { warn } from '../utils/log.js';
import { Widget } from './widget.js';
import { Ranges } from '../implements/ranges.js';
import { Graph } from '../modules/graph.js';
import { ResponseHandle } from '../modules/responsehandle.js';
import { ChildWidget } from '../child_widget.js';
import { Grid } from '../modules/grid.js';
    
function calculate_overlap(X, Y) {
    /* no overlap, return 0 */
    if (X[2] < Y[0] || Y[2] < X[0] || X[3] < Y[1] || Y[3] < X[1]) return 0;

    return (Math.min(X[2], Y[2]) - Math.max(X[0], Y[0])) *
           (Math.min(X[3], Y[3]) - Math.max(X[1], Y[1]));
}

function show_handles() {
    var handles = this.handles;

    for (var i = 0; i < handles.length; i++) {
        this.add_child(handles[i]);
    }
}

function hide_handles() {
    var handles = this.handles;

    for (var i = 0; i < handles.length; i++) {
        this.remove_child(handles[i]);
    }
}

var STOP = function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}
function draw_key() {
    var __key, bb;

    var _key = this._key;
    var _key_bg = this._key_background;
    
    if (!_key || !_key_bg) return;

    while (_key.firstChild !== _key.lastChild)
        _key.removeChild(_key.lastChild);

    empty(_key.firstChild);

    var O = this.options;
    
    var disp = "none";
    var gpad = css_space(_key, "padding");
    var gmarg = css_space(_key, "margin");
    var c   = 0;
    var w   = 0;
    var top = 0;
    var lines = [];
    for (var i = 0; i < this.graphs.length; i++) {
        if (this.graphs[i].get("key") !== false) {
            var t = make_svg("tspan", {"class": "aux-label",
                                     style: "dominant-baseline: central;"
            });
            t.textContent = this.graphs[i].get("key");
            t.setAttribute("x", gpad.left);
            _key.firstChild.appendChild(t);
            
            if (!bb) bb = _key.getBoundingClientRect();
            top += c ? parseInt(get_style(t, "line-height")) : gpad.top;
            t.setAttribute("y", top + bb.height / 2);
            
            lines.push({
                x:       (parseInt(get_style(t, "margin-right")) || 0),
                y:       Math.round(top),
                width:   Math.round(bb.width),
                height:  Math.round(bb.height),
                "class": this.graphs[i].element.getAttribute("class"),
                color:   (this.graphs[i].element.getAttribute("color") || ""),
                style:   this.graphs[i].element.getAttribute("style")
            })
            w = Math.max(w, t.getComputedTextLength());
            disp = "block";
            c++;
        }
    }
    for (var i = 0; i < lines.length; i++) {
        var b = make_svg("rect", {
            "class": lines[i]["class"] + ".aux-rect",
            color:   lines[i].color,
            style:   lines[i].style,
            x:       lines[i].x + 0.5 + w + gpad.left,
            y:       lines[i].y + 0.5 + parseInt(lines[i].height / 2 - O.key_size.y / 2),
            height:  O.key_size.y,
            width:   O.key_size.x
        });
        _key.appendChild(b);
    }
    _key_bg.style.display = disp;
    _key.style.display = disp;
    
    bb = _key.getBoundingClientRect();
    var width  = this.range_x.options.basis;
    var height = this.range_y.options.basis;
    
    switch (O.key) {
        case "top-left":
            __key = {
                x1: gmarg.left,
                y1: gmarg.top,
                x2: gmarg.left + parseInt(bb.width) + gpad.left + gpad.right,
                y2: gmarg.top + parseInt(bb.height) + gpad.top + gpad.bottom
            }
            break;
        case "top-right":
            __key = {
                x1: width - gmarg.right - parseInt(bb.width) - gpad.left - gpad.right,
                y1: gmarg.top,
                x2: width - gmarg.right,
                y2: gmarg.top + parseInt(bb.height) + gpad.top + gpad.bottom
            }
            break;
        case "bottom-left":
            __key = {
                x1: gmarg.left,
                y1: height - gmarg.bottom - parseInt(bb.height) - gpad.top - gpad.bottom,
                x2: gmarg.left + parseInt(bb.width) + gpad.left + gpad.right,
                y2: height - gmarg.bottom
            }
            break;
        case "bottom-right":
            __key = {
                x1: width - gmarg.right - parseInt(bb.width) - gpad.left - gpad.right,
                y1: height -gmarg.bottom - parseInt(bb.height) - gpad.top - gpad.bottom,
                x2: width - gmarg.right,
                y2: height - gmarg.bottom
            }
            break;
        default:
            warn("Unsupported key", O.key);
    }
    _key.setAttribute("transform", "translate(" + __key.x1 + "," + __key.y1 + ")");
    _key_bg.setAttribute("x", __key.x1);
    _key_bg.setAttribute("y", __key.y1);
    _key_bg.setAttribute("width", __key.x2 - __key.x1);
    _key_bg.setAttribute("height", __key.y2 - __key.y1);
}
function draw_title() {
    var _title  = this._title;
    if (!_title) return;

    _title.textContent = this.options.title;

    /* FORCE_RELAYOUT */
    S.add(function() {
        var mtop    = parseInt(get_style(_title, "margin-top") || 0);
        var mleft   = parseInt(get_style(_title, "margin-left") || 0);
        var mbottom = parseInt(get_style(_title, "margin-bottom") || 0);
        var mright  = parseInt(get_style(_title, "margin-right") || 0);
        var bb      = _title.getBoundingClientRect();
        var x,y,anchor, range_x = this.range_x, range_y = this.range_y;
        switch (this.options.title_position) {
            case "top-left":
                anchor = "start";
                x = mleft;
                y = mtop + bb.height / 2;
                break;
            case "top":
                anchor = "middle";
                x = range_x.options.basis / 2;
                y = mtop + bb.height / 2;
                break;
            case "top-right":
                anchor = "end";
                x = range_x.options.basis - mright;
                y = mtop + bb.height / 2;
                break;
            case "left":
                anchor = "start";
                x = mleft;
                y = range_y.options.basis / 2;
                break;
            case "center":
                anchor = "middle";
                x = range_x.options.basis / 2;
                y = range_y.options.basis / 2;
                break;
            case "right":
                anchor = "end";
                x = range_x.options.basis - mright;
                y = range_y.options.basis / 2;
                break;
            case "bottom-left":
                anchor = "start";
                x = mleft;
                y = range_y.options.basis - mtop - bb.height / 2;
                break;
            case "bottom":
                anchor = "middle";
                x = range_x.options.basis / 2;
                y = range_y.options.basis - mtop - bb.height / 2;
                break;
            case "bottom-right":
                anchor = "end";
                x = range_x.options.basis - mright;
                y = range_y.options.basis - mtop - bb.height / 2;
                break;
            default:
                warn("Unsupported title_position", this.options.title_position);
        }
        S.add(function() {
            _title.setAttribute("text-anchor", anchor);
            _title.setAttribute("x", x);
            _title.setAttribute("y", y);
        }, 1);
    }.bind(this));
}

/**
 * Chart is an SVG image containing one or more Graphs. Chart
 * extends {@link Widget} and contains a {@link Grid} and two
 * {@link Range}s.
 *
 * @class Chart
 * @extends Widget
 *
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {String|Boolean} [options.title=""] - A title for the Chart.
 *   Set to `false` to remove the title from the DOM.
 * @property {String} [options.title_position="top-right"] - Position of the
 *   title inside of the chart. Possible values are
 *   <code>"top-left"</code>, <code>"top"</code>, <code>"top-right"</code>,
 *   <code>"left"</code>, <code>"center"</code>, <code>"right"</code>,
 *   <code>"bottom-left"</code>, <code>"bottom"</code> and
 *   <code>"bottom-right"</code>.
 * @property {Boolean|String} [options.key=false] - If set to a string
 *   a key is rendered into the chart at the given position. The key
 *   will detail names and colors of the graphs inside of this chart.
 *   Possible values are <code>"top-left"</code>, <code>"top-right"</code>,
 *   <code>"bottom-left"</code> and <code>"bottom-right"</code>. Set to `false`
 *   to remove the key from the DOM.
 * @property {Object} [options.key_size={x:20,y:10}] - Size of the colored
 *   rectangles inside of the key describing individual graphs.
 * @property {Array<Object>} [options.grid_x=[]] - An array containing
 *   objects with the following optional members to draw the grid:
 *   <code>{pos:x[, color: "colorstring"[,class: "classname"[, label:"labeltext"]]]}</code>
 * @property {Array<Object>} [options.grid_y=[]] - An array containing
 *   objects with the following optional members to draw the grid:
 *   <code>{pos:y[, color: "colorstring"[,class: "classname"[, label:"labeltext"]]]}</code>
 * @property {Boolean} [options.show_grid=true] - Set to <code>false</code> to
 *   hide the grid.
 * @property {Function|Object} [options.range_x={}] - Either a function
 *   returning a {@link Range} or an object containing options for a
 *   new {@link Range}.
 * @property {Function|Object} [options.range_y={}] - Either a function
 *   returning a {@link Range} or an object containing options for a
 *   new {@link Range}.
 * @property {Object|Function} [options.range_z={ scale: "linear", min: 0, max: 1 }] -
 *   Either a function returning a {@link Range} or an object
 *   containing options for a new {@link Range}.
 * @property {Number} [options.importance_label=4] - Multiplicator of
 *   square pixels on hit testing labels to gain importance.
 * @property {Number} [options.importance_handle=1] - Multiplicator of
 *   square pixels on hit testing handles to gain importance.
 * @property {Number} [options.importance_border=50] - Multiplicator of
 *   square pixels on hit testing borders to gain importance.
 * @property {Array<Object>} [options.handles=[]] - An array of options for
 *   creating {@link ResponseHandle} on init.
 * @property {Boolean} [options.show_handles=true] - Show or hide all
 *   handles.
 * 
 */
function geom_set(value, key) {
    this.set_style(key, value+"px");
    error("using deprecated '"+key+"' options");
}
export const Chart = define_class({
    _class: "Chart",
    Extends: Widget,
    Implements: Ranges,
    _options: Object.assign(Object.create(Widget.prototype._options), {
        width: "int",
        height: "int",
        _width: "int",
        _height: "int",
        range_x: "object",
        range_y: "object",
        range_z: "object",
        key: "string",
        key_size: "object",
        title: "string",
        title_position: "string",
        resized: "boolean",
        
        importance_label:  "number",
        importance_handle: "number",
        importance_border: "number",
        handles: "array", 
        show_handles: "boolean",
        depth: "number",
    }),
    options: {
        grid_x: [],
        grid_y: [],
        range_x: {}, // an object with options for a range for the x axis
                     // or a function returning a Range instance (only on init)
        range_y: {}, // an object with options for a range for the y axis
                     // or a function returning a Range instance (only on init)
        range_z: { scale: "linear", min: 0, max: 1 }, // Range z options
        key: false,  // key draws a description for the graphs at the given
                     // position, use false for no key
        key_size: {x:20, y:10}, // size of the key rects
        title:   "", // a title for the chart
        title_position: "top-right", // the position of the title
        resized: false,
        
        importance_label:  4,   // multiplicator of square pixels on hit testing
                                // labels to gain importance
        importance_handle: 1,   // multiplicator of square pixels on hit testing
                                // handles to gain importance
        importance_border: 50,  // multiplicator of square pixels on hit testing
                                // borders to gain importance
        handles:           [],  // list of bands to create on init
        show_handles: true,
    },
    static_events: {
        set_width: geom_set,
        set_height: geom_set,
        
        mousewheel: STOP,
        DOMMouseScroll: STOP,
        set_depth: function(value) {
            this.range_z.set("basis", value);
        },
        set_show_handles: function(value) {
            (value ? show_handles : hide_handles).call(this);
        },
    },
    initialize: function (options) {
        var E, S;
        /**
         * @member {Array} Chart#graphs - An array containing all SVG paths acting as graphs.
         */
        this.graphs = [];
        /**
         * @member {Array} Chart#handles - An array containing all {@link ResponseHandle} instances.
         */
        this.handles = [];
        Widget.prototype.initialize.call(this, options);
        
        /**
         * @member {Range} Chart#range_x - The {@link Range} for the x axis. 
         */
        /**
         * @member {Range} Chart#range_y - The {@link Range} for the y axis.
         */
        this.add_range(this.options.range_x, "range_x");
        this.add_range(this.options.range_y, "range_y");
        this.add_range(this.options.range_z, "range_z");
        this.range_y.set("reverse", true, true, true);
        
        /**
         * @member {HTMLDivElement} Chart#element - The main DIV container.
         *   Has class <code.aux-chart</code>.
         */
        if (!(E = this.element)) this.element = E = element("div");
        add_class(E, "aux-chart");
        this.widgetize(E, true, true, true);
        
        this.svg = S = make_svg("svg");

        if (!this.options.width)
            this.options.width = this.range_x.options.basis;
        if (!this.options.height)
            this.options.height = this.range_y.options.basis;
        
        /** 
         * @member {SVGGroup} Chart#_graphs - The SVG group containing all graphs.
         *      Has class <code.aux-graphs</code>.
         */
        this._graphs = make_svg("g", {"class": "aux-graphs"});
        S.appendChild(this._graphs);
        E.appendChild(S);
        
        if (this.options.width) this.set("width", this.options.width);
        if (this.options.height) this.set("height", this.options.height);
        
        /** 
         * @member {SVGGroup} Chart#_handles - The SVG group containing all handles.
         *      Has class <code.aux-handles</code>.
         */
        this._handles = make_svg("g", {"class": "aux-handles"});
        this.svg.appendChild(this._handles);
        this.svg.onselectstart = function () { return false; };
        this.add_handles(this.options.handles);
    },
    resize: function () {
        var E = this.element;
        var O = this.options;
        var S = this.svg;

        Widget.prototype.resize.call(this);

        var tmp = css_space(S, "border", "padding");
        var w = inner_width(E) - tmp.left - tmp.right;
        var h = inner_height(E) - tmp.top - tmp.bottom;

        if (w > 0 && O._width !== w) {
            this.set("_width", w);
            this.range_x.set("basis", w);
            this.invalid._width = true;
            this.trigger_draw();
        }
        if (h > 0 && O._height !== h) {
            this.set("_height", h);
            this.range_y.set("basis", h);
            this.invalid._height = true;
            this.trigger_draw();
        }
    },
    redraw: function () {
        var I = this.invalid;
        var E = this.svg;
        var O = this.options;

        Widget.prototype.redraw.call(this);

        if (I.validate("ranges", "_width", "_height", "range_x", "range_y")) {
            /* we need to redraw both key and title, because
             * they do depend on the size */
            I.title = true;
            I.key = true;
            var w = O._width;
            var h = O._height;
            if (w && h) {
                E.setAttribute("width", w + "px");
                E.setAttribute("height", h + "px");
            }
        }

        if (I.graphs) {
            for (var i = 0; i < this.graphs.length; i++) {
                this.graphs[i].redraw();
            }
        }
        if (I.validate("title", "title_position")) {
            draw_title.call(this);
        }
        if (I.validate("key", "key_size", "graphs")) {
            draw_key.call(this);
        }
        if (I.show_handles) {
            I.show_handles = false;
            if (O.show_handles) {
                this._handles.style.removeProperty("display");
            } else {
                this._handles.style.display = "none";
            }
        }
    },
    destroy: function () {
        for (var i = 0; i < this._graphs.length; i++) {
            this._graphs[i].destroy();
        }
        this._graphs.remove();
        this._handles.remove();
        Widget.prototype.destroy.call(this);
    },
    add_child: function(child) {
        if (child instanceof Graph) {
            this.add_graph(child);
            return;
        }

        Widget.prototype.add_child.call(this, child);
    },
    remove_child: function(child) {
        if (child instanceof Graph) {
            this.remove_graph(child);
            return;
        }

        Widget.prototype.remove_child.call(this, child);
    },
    /**
     * Add a graph to the chart.
     *
     * @method Chart#add_graph
     * 
     * @param {Object} graph - The graph to add. This can be either an
     *  instance of {@link Graph} or an object of options to
     *  {@link Graph}.
     * 
     * @returns {Object} The instance of {@link Graph}.
     * 
     * @emits Chart#graphadded
     */
    add_graph: function (options) {
        var g;

        if (Graph.prototype.isPrototypeOf(options)) {
            g = options;
        } else {
            g = new Graph(options);
        }

        g.set("container", this._graphs);
        if (!g.options.range_x) g.set("range_x", this.range_x);
        if (!g.options.range_y) g.set("range_y", this.range_y);

        this.graphs.push(g);
        g.add_event("set", function (key, value, obj) {
            if (key === "color" || key === "class" || key === "key") {
                this.invalid.graphs = true;
                this.trigger_draw();
            }
        }.bind(this));
        /**
         * Is fired when a graph was added. Arguments are the graph
         * and its position in the array.
         * 
         * @event Chart#graphadded
         * 
         * @param {Graph} graph - The {@link Graph} which was added.
         * @param {int} id - The ID of the added {@link Graph}.
         */
        this.fire_event("graphadded", g, this.graphs.length - 1);

        this.invalid.graphs = true;
        this.trigger_draw();
        Widget.prototype.add_child.call(this, g);
        return g;
    },
    /**
     * Remove a graph from the chart.
     *
     * @method Chart#remove_graph
     * 
     * @param {Graph} graph - The {@link Graph} to remove.
     * 
     * @emits Chart#graphremoved
     */
    remove_graph: function (g) {
        var i;
        if ((i = this.graphs.indexOf(g)) !== -1) {
            /**
             * Is fired when a graph was removed. Arguments are the graph
             * and its position in the array.
             * 
             * @event Chart#graphremoved
             * 
             * @param {Graph} graph - The {@link Graph} which was removed.
             * @param {int} id - The ID of the removed {@link Graph}.
             */
            this.fire_event("graphremoved", g, i);
            g.destroy();
            this.graphs.splice(i, 1);
            Widget.prototype.remove_child.call(this, g);
            this.invalid.graphs = true;
            this.trigger_draw();
        }
    },
    /**
     * Remove all graphs from the chart.
     *
     * @method Chart#empty
     * 
     * @emits Chart#emptied
     */
    empty: function () {
        this.graphs.map(this.remove_graph, this);
        /**
         * Is fired when all graphs are removed from the chart.
         * 
         * @event Chart#emptied
         */
        this.fire_event("emptied");
    },
    
    /*
     * Add a new handle to the widget. Options is an object containing
     * options for the {@link ResponseHandle}.
     * 
     * @method ResponseHandler#add_handle
     * 
     * @param {Object} [options={ }] - An object containing initial options. - The options for the {@link ResponseHandle}.
     * @param {Object} [type=ResponseHandle] - A widget class to be used as the new handle.
     * 
     * @emits ResponseHandler#handleadded
     */
    add_handle: function (options, type) {
        type = type || ResponseHandle;
        options.container = this._handles;
        if (options.range_x === void(0))
            options.range_x = function () { return this.range_x; }.bind(this);
        if (options.range_y === void(0))
            options.range_y = function () { return this.range_y; }.bind(this);
        if (options.range_z === void(0))
            options.range_z = function () { return this.range_z; }.bind(this);
        
        options.intersect = this.intersect.bind(this);
        
        var h = new type(options);
        this.handles.push(h);
        if (this.options.show_handles)
            this.add_child(h);
        /**
         * Is fired when a new handle was added.
         * 
         * @param {ResponseHandle} handle - The {@link ResponseHandle} which was added.
         * 
         * @event ResponseHandler#handleadded
         */
        this.fire_event("handleadded", h);
        return h;
    },
    /*
     * Add multiple new {@link ResponseHandle} to the widget. Options is an array
     * of objects containing options for the new instances of {@link ResponseHandle}.
     * 
     * @method ResponseHandler#add_handles
     * 
     * @param {Array<Object>} options - An array of options objects for the {@link ResponseHandle}.
     * @param {Object} [type=ResponseHandle] - A widget class to be used for the new handles.
     */
    add_handles: function (handles, type) {
        for (var i = 0; i < handles.length; i++)
            this.add_handle(handles[i], type);
    },
    /*
     * Remove a handle from the widget.
     * 
     * @method ResponseHandler#remove_handle
     * 
     * @param {ResponseHandle} handle - The {@link ResponseHandle} to remove.
     * 
     * @emits ResponseHandler#handleremoved
     */
    remove_handle: function (handle) {
        // remove a handle from the widget.
        for (var i = 0; i < this.handles.length; i++) {
            if (this.handles[i] === handle) {
                if (this.options.show_handles)
                    this.remove_child(handle);
                this.handles[i].destroy();
                this.handles.splice(i, 1);
                /**
                 * Is fired when a handle was removed.
                 * 
                 * @event ResponseHandler#handleremoved
                 */
                this.fire_event("handleremoved");
                break;
            }
        }
    },
    /*
     * Remove multiple or all {@link ResponseHandle}s from the widget.
     * 
     * @method ResponseHandler#remove_handles
     * 
     * @param {Array<ResponseHandle>} handles - An array of
     *   {@link ResponseHandle} instances. If the argument reveals to
     *   `false`, all handles are removed from the widget.
     */
    remove_handles: function (handles) {
        var H = handles || this.handles.slice();
        for (var i = 0; i < H.length; i++) {
            this.remove_handle(H[i]);
        }
        if (!handles) {
            this.handles = [];
            /**
             * Is fired when all handles are removed.
             * 
             * @event ResponseHandler#emptied
             */
            this.fire_event("emptied");
        }
    },
    
    intersect: function (X, handle) {
        // this function walks over all known handles and asks for the coords
        // of the label and the handle. Calculates intersecting square pixels
        // according to the importance set in options. Returns an object
        // containing intersect (the amount of intersecting square pixels) and
        // count (the amount of overlapping elements)
        var c = 0;
        var a = 0, _a;
        var O = this.options;
        var importance_handle = O.importance_handle
        var importance_label = O.importance_label

        for (var i = 0; i < this.handles.length; i++) {
            var h = this.handles[i];
            if (h === handle || !h.get("active") || !h.get("show_handle")) continue;
            _a = calculate_overlap(X, h.handle);

            if (_a) {
                c ++;
                a += _a * importance_handle;
            }
            
            _a = calculate_overlap(X, h.label);

            if (_a) {
                c ++;
                a += _a * importance_label;
            }
        }
        if (this.bands && this.bands.length) {
            for (var i = 0; i < this.bands.length; i++) {
                var b = this.bands[i];
                if (b === handle || !b.get("active") || !b.get("show_handle")) continue;
                _a = calculate_overlap(X, b.handle);

                if (_a > 0) {
                    c ++;
                    a += _a * importance_handle;
                }
                
                _a = calculate_overlap(X, b.label);
                if (_a > 0) {
                    c ++;
                    a += _a * importance_label;
                }
            }
        }
        /* calculate intersection with border */
        _a = calculate_overlap(X, [ 0, 0, this.range_x.options.basis, this.range_y.options.basis ]);
        a += ((X[2] - X[0]) * (X[3] - X[1]) - _a) * O.importance_border;
        return {intersect: a, count: c};
    },
});
/**
 * @member {Grid} Chart#grid - The grid element of the chart.
 *   Has class <code.aux-grid</code>.
 */
ChildWidget(Chart, "grid", {
    create: Grid,
    show: true,
    append: function() {
        this.svg.insertBefore(this.grid.element, this.svg.firstChild);
    },
    map_options: {
        grid_x: "grid_x",
        grid_y: "grid_y",
    },
    default_options: function () {
        return {
            range_x: this.range_x,
            range_y: this.range_y,
        };
    },
});
function key_hover_cb(ev) {
    var b = ev.type === "mouseenter";
    toggle_class(this, "aux-hover", b);
    /* this.nextSibling is the key */
    toggle_class(this.nextSibling, "aux-hover", b);
}
/**
 * @member {SVGRect} Chart#_key_background - The SVG rectangle of the key.
 *   Has class <code.aux-background</code>.
 */
ChildElement(Chart, "key_background", {
    option: "key",
    display_check: function(v) {
        return !!v;
    },
    create: function() {
        var k = make_svg("rect", {"class": "aux-background"});
        k.addEventListener("mouseenter", key_hover_cb);
        k.addEventListener("mouseleave", key_hover_cb);
        return k;
    },
    append: function() {
        this.svg.appendChild(this._key_background);
    },
});
/**
 * @member {SVGGroup} Chart#_key - The SVG group containing all descriptions.
 *   Has class <code.aux-key</code>.
 */
ChildElement(Chart, "key", {
    option: "key",
    display_check: function(v) {
        return !!v;
    },
    create: function() {
        var key = make_svg("g", {"class": "aux-key"});
        key.appendChild(make_svg("text", {"class": "aux-key-text"}));
        return key;
    },
    append: function() {
        this.svg.appendChild(this._key);
    },
});
/**
 * @member {SVGText} Chart#_title - The title of the chart.
 *   Has class <code.aux-title</code>.
 */
ChildElement(Chart, "title", {
    option: "title",
    display_check: function(v) {
        return typeof(v) === "string" && v.length;
    },
    create: function() {
        return make_svg("text", {
            "class": "aux-title",
            style: "dominant-baseline: central;"
        });
    },
    append: function() {
        var svg = this.svg;
        svg.insertBefore(this._title, svg.firstChild);
    },
});
