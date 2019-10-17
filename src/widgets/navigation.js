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

function measure () {
    var B = this.buttons.buttons;
    var O = this.options;
    var mm = {
        clip: {
            height: inner_height(this.buttons.element),
            width: inner_width(this.buttons.element),
        },
        list: {
            width: 0,
            height: 0,
        },
        buttons: [],
    };
    B.forEach(b => {
        var e = b.element;
        var b = e.getBoundingClientRect();
        mm.buttons.push({
            width: b.width,
            height: b.height,
            left: e.offsetLeft,
            top: e.offsetTop
        });
        mm.list.width = Math.max(mm.list.width, b.width + e.offsetLeft);
        mm.list.height = Math.max(mm.list.height, b.height + e.offsetTop);
    });
    
    this.measurement = mm;
}

function prev_clicked(e) {
    this.userset("select", Math.max(0, this.options.select - 1));
}
function prev_dblclicked(e) {
    this.userset("select", 0);
}

function next_clicked(e) {
    this.userset("select", Math.min(this.buttons.buttons.length-1, this.options.select + 1));
}
function next_dblclicked(e) {
    this.userset("select", this.buttons.buttons.length-1);
}

function easeInOut (t, b, c, d) {
    t /= d/2;
    if (t < 1) return c/2*t*t + b;
    t--;
    return -c/2 * (t*(t-2) - 1) + b;
}

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
 * @property {Integer} [options.scroll=500] - Duration of the scrolling animation.
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
        scroll: "int",
    }),
    options: {
        direction: "horizontal",
        arrows: false,
        auto_arrows: true,
        resized: false,
        scroll: 500,
    },
    static_events: {
        set_direction: function(value) {
            this.prev.set("icon", value === "vertical" ? "arrowup" : "arrowleft");//"\u25B2" : "\u25C0");
            this.next.set("icon", value === "vertical" ? "arrowdown" : "arrowright");//"\u25BC" : "\u25B6");
            measure.call(this);
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
        
        this.prev.on("added", measure.bind(this));
        this.prev.on("click", prev_clicked.bind(this));
        this.prev.on("doubleclick", prev_dblclicked.bind(this));
        this.next.on("added", measure.bind(this));
        this.next.on("click", next_clicked.bind(this));
        this.next.on("doubleclick", next_dblclicked.bind(this));
        
        this.add_child(this.prev);
        this.add_child(this.next);
        
        this.measurement;
        
        setTimeout((function () {
            this.set("auto_arrows", this.options.auto_arrows);
            this.set("direction", this.options.direction);
        }).bind(this), 500);
    },
    resize: function () {
        measure.call(this);
        Container.prototype.resize.call(this);
    },
    redraw: function () {
        var O = this.options;
        var I = this.invalid;
        var E = this.element;
        var B = this.buttons.buttons;
        var BE = this.buttons.element;
        
        if (I.direction) {
            remove_class(E, "aux-vertical", "aux-horizontal");
            add_class(E, "aux-"+O.direction);
            measure.call(this);
        }
        if (I.validate("arrows")) {
            if (O.arrows) {
                if (!this.prev.element.parentElement) {
                    E.appendChild(this.prev.element);
                    E.appendChild(this.next.element);
                }
                add_class(E, "aux-over");
            } else {
                if (this.prev.element.parentElement) {
                    E.removeChild(this.prev.element);
                    E.removeChild(this.next.element);
                }
                remove_class(E, "aux-over");
            }
            measure.call(this);
            I.select = true;
        }
        if (I.validate("auto_arrows") || (I.resized && O.auto_arrows)) {
            auto_arrows.call(this);
        }
        if (I.validate("select", "direction", "resized")) {
            var show = O.select;
            var M = this.measurement;
            if (show >= 0 && show < B.length) {
                var dir  = O.direction === "vertical";
                var subd = dir ? 'top' : 'left';
                var subt = dir ? 'scrollTop' : 'scrollLeft';
                var subs = dir ? 'height' : 'width';
                var butt  = M.buttons[show];
                var clip = M.clip[subs];
                var list = M.list[subs];
                var btnsize = 0;
                var btnpos = 0;
                if (M.buttons.length) {
                    btnsize  = butt[subs];
                    btnpos   = butt[subd];
                }
                var pos = (Math.max(0, Math.min(list - clip, btnpos - (clip / 2 - btnsize / 2))));
                var s = BE[subt];
                this._scroll = {to: ~~pos, from: s, dir: pos > s ? 1 : -1, diff: ~~pos - s, time: Date.now()};
                this.invalid._scroll = true;
            }
        }
        if (this.invalid._scroll) {
            var subt = O.direction === "vertical" ? 'scrollTop' : 'scrollLeft';
            var s = ~~BE[subt];
            var _s = this._scroll;
            var now = Date.now();
            if ((s >= _s.to && _s.dir > 0)
             || (s <= _s.to && _s.dir < 0)
             || now > (_s.time + O.scroll)) {
                this.invalid._scroll = false;
                BE[subt] = _s.to;
            } else {
                BE[subt] = easeInOut(Date.now() - _s.time, _s.from, _s.diff, O.scroll);
                this.trigger_draw_next();
            }
        }
        I.resized = false;
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
        //added: measure.bind(this),
        //click: prev_clicked.bind(this.parent),
        //doubleclick: prev_dblclicked.bind(this.parent,
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
        //added: measure.bind(this),
        //click: next_clicked.bind(this.parent),
        //doubleclick: next_dblclicked.bind(this.parent),
    //},
//});
