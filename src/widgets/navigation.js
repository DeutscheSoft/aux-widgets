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
import { define_class } from '../widget_helpers.js';
import { define_child_widget } from '../child_widget.js';
import { add_class, remove_class, inner_height, inner_width } from '../utils/dom.js';
import { Button } from './button.js';
import { Buttons } from './buttons.js';
import { Container } from './container.js';

 /**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>select</code>.
 *
 * @event Navigation#useraction
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
 
function auto_arrows () {
    var O = this.options;
    if (!O.auto_arrows) return;
    var B = this.buttons.buttons;
    var vert = O.direction === "vertical";
    var cons = vert ? inner_height(this.buttons.element) : inner_width(this.buttons.element)
    var list;
    if (B.length) {
        var lastb = B[B.length-1].element;
        var rect = lastb.getBoundingClientRect();
        list = lastb[vert?"offsetTop":"offsetLeft"] + rect[vert?"height":"width"];
    } else {
        list = 0;
    }
    
    if (list > cons)
        this.set("arrows", true);
    else
        this.set("arrows", false);
}

function prev_clicked(e) {
    console.log(this, arguments);
    this.userset("select", Math.max(0, this.options.select - 1));
}
function prev_dblclicked(e) {
    console.log(this, arguments);
    this.userset("select", 0);
}

function next_clicked(e) {
    console.log(this, arguments);
    this.userset("select", Math.min(this.buttons.buttons.length-1, this.options.select + 1));
}
function next_dblclicked(e) {
    console.log(this, arguments);
    this.userset("select", this.buttons.buttons.length-1);
}

function easeInOut (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
}

var zero = { width: 0, height: 0};

/**
 * Navigation is a {@link Container} including a {@Buttons} widget for e.g. navigating between
 * pages inside a {@link Pager}. It keeps the currently highlighted {@link Button}
 * inside the visible area and adds previous and next {@link Button}s
 * if needed.
 * 
 * @extends Container
 * 
 * @param {Object} [options={ }] - An object containing initial options.
 * 
 * @property {String} [options.direction="horizontal"] - The layout of
 *   the Navigation, either `horizontal` or `vertical`.
 * @property {Boolean} [options.arrows=false] - Show or hide previous and next {@link Button}s.
 * @property {Boolean} [options.auto_arrows=true] - Set to false to disable
 *   automatic creation of the previous/next buttons.
 * 
 * @class Navigation
 */
export const Navigation = define_class({
    Extends: Container,
    _class: "Navigation",
    _options: Object.assign(Object.create(Container.prototype._options), {
        direction: "string",
        arrows: "boolean",
        auto_arrows: "boolean",
        resized: "boolean",
    }),
    options: {
        direction: "horizontal",
        arrows: false,
        auto_arrows: true,
        resized: false,
    },
    static_events: {
        set_direction: function(value) {
            this.prev.set("label", value === "vertical" ? "\u25B2" : "\u25C0");
            this.next.set("label", value === "vertical" ? "\u25BC" : "\u25B6");
            auto_arrows.call(this);
        },
        set_auto_arrows: function (value) {
            auto_arrows.call(this);
        },
    },
    initialize: function (options) {
        Container.prototype.initialize.call(this, options);
        var O = this.options;
        /**
         * @member {HTMLDivElement} Navigation#element - The main DIV container.
         *   Has class <code>.aux-navigation</code>.
         */
        add_class(this.element, "aux-navigation");
        
        /**
         * @member {Button} ButtonArray#prev - The previous arrow {@link Button} instance.
         */
        this.prev = new Button({class: "aux-previous", dblclick:400});
        /**
         * @member {Button} ButtonArray#next - The next arrow {@link Button} instance.
         */
        this.next = new Button({class: "aux-next", dblclick:400});
        
        this.prev.on("click", prev_clicked.bind(this));
        this.prev.on("doubleclick", prev_dblclicked.bind(this));
        this.next.on("click", next_clicked.bind(this));
        this.next.on("doubleclick", next_dblclicked.bind(this));
    },
    resize: function () {
        var B = this.buttons.buttons;
        var O = this.options;
        var mm = {
            clip: {
                height: inner_height(this.buttons.element),
                width: inner_width(this.buttons.element),
            },
            buttons: [],
        };
        B.forEach(b => {
            e = b.element;
            b = e.getBoundingClientRect();
            mm.buttons.push({
                width: b.width,
                height: b.height,
                left: e.offsetLeft,
                top: e.offsetTop
            });
        });
        this.measurement = mm;
        Container.prototype.resize.call(this);
    },
    redraw: function () {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;
        var B = this.buttons.buttons;
        var S = this._sizes;
        
        if (I.direction) {
            remove_class(E, "aux-vertical", "aux-horizontal");
            add_class(E, "aux-"+O.direction);
        }
        console.log(I)
        if (I.validate("arrows")) {
            console.log("a")
            if (O.arrows) {
                this.prev.set("container", E);
                this.next.set("container", E);
                add_class(E, "aux-over");
            } else {
                this.prev.set("container", false);
                this.next.set("container", false);
                remove_class(E, "aux-over");
            }
        }
        if (I.validate("auto_arrows") || (I.resized && O.auto_arrows)) {
            console.log("aa")
            auto_arrows.call(this);
        }
        //if (I.validate("select", "direction", "resized")) {
            //if (O.resized && !O.needs_resize) {
                //var show = O.show
                //if (show >= 0 && show < this.buttons.length) {
                    ///* move the container so that the requested button is shown */
                    //var dir      = O.direction === "vertical";
                    //var subd     = dir ? 'top' : 'left';
                    //var subt     = dir ? 'scrollTop' : 'scrollLeft';
                    //var subs     = dir ? 'height' : 'width';

                    //var btnrect  = S.buttons[show];
                    //var clipsize = S.clip[subs];
                    //var listsize = 0;
                    //var btnsize = 0;
                    //var btnpos = 0;
                    //if (S.buttons.length) {
                        //listsize = S.buttons_pos[this.buttons.length-1][subd] +
                                   //S.buttons[this.buttons.length-1][subs];
                        //btnsize  = S.buttons[show][subs];
                        //btnpos   = S.buttons_pos[show][subd];
                    //}
                    
                    //var p = (Math.max(0, Math.min(listsize - clipsize, btnpos - (clipsize / 2 - btnsize / 2))));
                    //if (this.options.scroll) {
                        //var s = this._clip[subt];
                        //this._scroll = {to: ~~p, from: s, dir: p > s ? 1 : -1, diff: ~~p - s, time: Date.now()};
                        //this.invalid.scroll = true;
                        //if (this._container.style[subd])
                            //this._container.style[subd] = null;
                    //} else {
                        //this._container.style[subd] = -p + "px";
                        //this._clip[subt] = 0;
                    //}
                //}
            //}
        //}
        //if (this.invalid.scroll && this._scroll) {
            //var subt = O.direction === "vertical" ? 'scrollTop' : 'scrollLeft';
            //var s = ~~this._clip[subt];
            //var _s = this._scroll;
            //var now = Date.now();
            //if ((s >= _s.to && _s.dir > 0)
             //|| (s <= _s.to && _s.dir < 0)
             //|| now > (_s.time + O.scroll)) {
                //this.invalid.scroll = false;
                //this._clip[subt] = _s.to;
            //} else {
                //this._clip[subt] = easeInOut(Date.now() - _s.time, _s.from, _s.diff, O.scroll);
                //this.trigger_draw_next();
            //}
        //}
    },
    /* TODO: The following three members could be formalized by API in define_child_widget */
    add_button: function (button, position) {
        return this.buttons.add_button(button, position);
    },
    add_buttons: function (buttons) {
        return this.buttons.add_buttons(buttons);
    },
    remove_button: function (button, destroy) {
        return this.buttons.remove_button(button, destroy);
    },
});
/**
 * @member {Buttons} Navigation#buttons - The {@link Buttons} of the Navigation.
 */
define_child_widget(Navigation, "buttons", {
    create: Buttons,
    show: true,
    inherit_options: true,
    userset_delegate: true,
});
///**
 //* @member {Button} Navigation#prev - The {@link Button} to switch to the previous selection.
 //*/
//define_child_widget(Navigation, "prev", {
    //create: Button,
    //default_options: {
        //class: "aux-prev",
    //},
    //static_events: {
        //click: prev_clicked,
        //doubleclick: prev_dblclicked,
    //},
//});
///**
 //* @member {Button} Navigation#next - The {@link Button} to switch to the next selection.
 //*/
//define_child_widget(Navigation, "next", {
    //create: Button,
    //default_options: {
        //class: "aux-next",
    //},
    //static_events: {
        //click: next_clicked,
        //doubleclick: next_dblclicked,
    //},
//});
