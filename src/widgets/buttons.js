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

import { define_class } from './../widget_helpers.js';
import { element, add_class, remove_class } from './../utils/dom.js';
import { Container } from './container.js';
import { Button } from './button.js';
import { Warning } from '../implements/warning.js';

 /**
 * The <code>useraction</code> event is emitted when a widget gets modified by user interaction.
 * The event is emitted for the option <code>select</code>.
 *
 * @event Buttons#useraction
 * @param {string} name - The name of the option which was changed due to the users action
 * @param {mixed} value - The new value of the option
 */
 
function button_clicked(button) {
    var O = this.options;
    var B = this.buttons;
    var b = B.indexOf(button);
    var sel = O.select;
    
    if (O.multi_select) {
        var s = sel.indexOf(b);
        if (s >= 0) {
            sel.splice(s, 1);
        } else {
            sel.push(b);
        }
    } else {
        if (O.de_select && sel === b)
            sel = -1;
        else
            sel = b;
    }
    this.userset("select", sel);
}

function deselect_all () {
    this.buttons.forEach(b => {
        b.set("state", false);
    });
}

function equalize_select () {
    var select = this.options.select;
    select.forEach((b, i, a) => {
        a[i] = b instanceof Button ? this.buttons.indexOf(b) : b;
    });
    select.sort((a, b) => a - b);
}

export const Buttons = define_class({
    /**
     * Buttons is a list of ({@link Button})s, arranged
     * either vertically or horizontally. Single buttons can be selected by clicking.
     * If `multi_select` is enabled, buttons can be added and removed from
     * the selection by clicking on them. Buttons implements {@link Warning}
     * to highlight buttons which can't be selected due to `options.multi_select=n`.
     *
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Array<Object|String>} [options.buttons=[]] - A list of
     *   {@link Button} instances, button options objects or label strings
     *   which is converted to button instances on init. If `get` is called,
     *   a converted list of button instances is returned. Example:
     *  `[new Button({label:'Button#1'}), 'Button#2', {label:'Button#3'}]`
     * @property {String} [options.direction="horizontal"] - The layout
     *   of the button list, either "horizontal" or "vertical".
     * @property {Integer|Button|Array<Integer>|Array<Button>} [options.select=-1]
     *   The {@link Button} or a list of {@link Button}s, depending on
     *   `options.multi_select`, to highlight. Expects
     *   either the buttons index starting from zero or the {@link Button}
     *   instance(s) itself. Set to `-1` or `[]` to
     *   de-select any selected button.
     * @property {Object} [options.button_class=Button] - A class to
     *   be used for instantiating new buttons.
     * @property {Integer} [options.multi_select=0] - Set to `0` to disable
     *   multiple selection, `1` for unlimited and any other number for
     *   a defined maximum amount of selectable buttons. If an array is given
     *   for `options.select` while this option is `0`, the first entry
     *   will be used.
     * @property {Boolean} [options.de_select=false] - Define if single-selection
     *   (`options.multi_select=false`) can be de-selected.
     * 
     * @class Buttons
     * 
     * @extends Container
     * 
     * @mixes Warning
     * 
     */
    _class: "Buttons",
    Extends: Container,
    Implements: Warning,
    _options: Object.assign(Object.create(Container.prototype._options), {
        buttons: "array",
        direction: "string",
        select: "int",
        resized: "boolean",
        button_class: "Button",
        multi_select: "int",
        de_select: "boolean",
    }),
    options: {
        buttons: [],
        direction: "horizontal",
        select: -1,
        resized: false,
        button_class: Button,
        multi_select: 0,
        de_select: false,
    },
    static_events: {
        set_buttons: function(value) {
            for (var i = 0; i < this.buttons.length; i++)
                this.buttons[i].destroy();
            this.buttons = [];
            this.add_buttons(value);
        },
        set_select: function(value) {
            var O = this.options;
            var B = this.buttons;
            deselect_all.call(this);
            if (O.multi_select) {
                if (!Array.isArray(O.select))
                    O.select = [ O.select ];
                if (O.multi_select > 1) {
                    var w = O.select.splice(O.multi_select);
                    w.forEach(b => {
                        this.warning(this.buttons[b].element);
                    });
                }
                equalize_select.call(this);
                O.select.forEach(b => {
                    B[b].set("state", true);
                });
            } else {
                value = Math.min(B.length-1, value);
                if (value >= 0)
                    B[value].set("state", true);
            }
        },
        set_multi_select: function (value) {
            var O = this.options;
            if (!value && Array.isArray(O.select)) {
                if (O.select.length)
                    O.select = O.select[0];
                else
                    O.select = -1;
            }
            if (value && !Array.isArray(O.select)) {
                if (O.select === -1)
                    O.select = [];
                else
                    O.select = [ O.select ];
            }
        },
    },
    initialize: function (options) {
        /**
         * @member {Array} Buttons#buttons - An array holding all {@link Button}s.
         */
        this.buttons = [];
        Container.prototype.initialize.call(this, options);
        /**
         * @member {HTMLDivElement} Buttons#element - The main DIV container.
         *   Has class <code>.aux-buttons</code>.
         */
        add_class(this.element, "aux-buttons");
        
        this.set("direction", this.options.direction);
        this.set("multi_select", this.options.multi_select);
        this.add_buttons(this.options.buttons);
    },
    
    /**
     * Adds an array of buttons to the end of the list.
     *
     * @method Buttons#add_buttons
     * 
     * @param {Array.<string|object>} options - An Array containing
     *   Button instances, objects
     *   with options for the buttons (see {@link Button} for more
     *   information) or strings for the buttons labels.
     */
    add_buttons: function (options) {
        for (var i = 0; i < options.length; i++)
            this.add_button(options[i]);
    },
    
    /**
     * Adds a {@link Button} to Buttons.
     *
     * @method Buttons#add_button
     * 
     * @param {Button|Object|String} options - An alread instantiated {@link Button},
     *   an object containing options for a new {@link Button} to add
     *   or a string for the label of the newly created {@link Button}.
     * @param {integer} [position] - The position to add the {@link Button}
     *   to. If `undefined`, the {@link Button} is added to the end of the list.
     * 
     * @returns {Button} The {@link Button} instance.
     */
    add_button: function (button, position) {
        var O = this.options;
        if (button instanceof Button) {
            b = button;
        } else {
            if (typeof button === "string")
                button = {label: button};
            var b = new O.button_class(button);
        }
        var len  = this.buttons.length;
        if (position === void(0))
            position = len;
        if (position === len) {
            this.buttons.push(b);
            this.element.appendChild(b.element);
        } else {
            this.buttons.splice(position, 0, b);
            this.element.insertBefore(b.element,
                this.element.childNodes[position]);
        }
        if (O.multi_select) {
            O.select.forEach((b, a, i) => {
                if (b >= position)
                    a[i] = b+1;
            });
        } else {
            if (O.select >= position)
                O.select += 1;
        }
        this.add_child(b);

        this.trigger_resize();
        b.on("click", button_clicked.bind(this, b));
        
        /**
         * A {@link Button} was added to Buttons.
         *
         * @event Buttons#added
         * 
         * @param {Button} button - The {@link Button} which was added to Buttons.
         */
        this.emit("added", b);

        return b;
    },
    /**
     * Removes a {@link Button} from Buttons.
     *
     * @method Buttons#remove_button
     * 
     * @param {integer|Button} button - button index or the {@link Button}
     *   instance to be removed.
     * @param {Boolean} destroy - destroy the {@link Button} after removal.
     */
    remove_button: function (button, destroy) {
        var O = this.options;
        var B = this.buttons;
        if (button instanceof Button)
            button = B.indexOf(button);
        if (button < 0 || button >= B.length)
            return;
        
        if (O.multi_select) {
            if (O.select.indexOf(button)) {
                O.select.splice(button, 1);
            }
        } else {
            if (O.select === button)
                O.select = -1;
            if (button < O.select)
                O.select--;
        }
        
        var b = B[button];
        this.buttons.splice(button, 1);
        /**
         * A {@link Button} was removed from the Buttons.
         *
         * @event Buttons#removed
         * 
         * @param {Button} button - The {@link Button} instance which was removed.
         */
        this.emit("removed", b);
        if (destroy)
            b.destroy();
    },
    
    destroy: function () {
        for (var i = 0; i < this.buttons.length; i++)
            this.buttons[i].destroy();
        Container.prototype.destroy.call(this);
    },

    redraw: function() {
        Container.prototype.redraw.call(this);
        var I = this.invalid;
        var O = this.options;

        if (I.direction) {
            I.direction = false;
            var E = this.element;
            remove_class(E, "aux-vertical", "aux-horizontal");
            add_class(E, "aux-"+O.direction);
        }
    },
    
    /**
     * Checks if an index or {@link Button} is selected.
     *
     * @method Buttons#is_selected
     * 
     * @param {Integer|Button} button - button index or {@link Button} instance.
     * 
     * @returns {Boolean}
     */
    is_selected: function (probe) {
        if (probe instanceof Button) {
            probe = this.buttons.indexOf(probe);
        }
    },
    
    get: function (key) {
        if (key === "buttons") return this.buttons;
        return Container.prototype.get.call(this, key);
    }
});
