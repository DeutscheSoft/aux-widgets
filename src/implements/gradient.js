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
import { Ranged } from './ranged.js';
import { sprintf } from '../utils/sprintf.js';
import { browser } from '../utils/browser_detection.js';

export const Gradient = define_class({
    /**
     * Gradient provides a function to set the background of a
     * DOM element to a CSS gradient according to a {@link Range}.
     *
     * @mixin Gradient
     * 
     * @param {Object} [options={ }] - An object containing initial options.
     * 
     * @property {Object|Boolean} options.gradient - Gradient definition for the background.
     *   Keys are ints or floats as string corresponding to the widgets scale.
     *   Values are valid css color strings like <code>#ff8000</code> or <code>rgb(0,56,103)</code>.
     *   If set to false the css style color is used.
     * @property {String|Boolean} [options.background="#000000"] - Background color if no gradient is used.
     *   Values are valid css color strings like <code>#ff8000</code> or <code>rgb(0,56,103)</code>.
     *   If set to false the css style color is used.
     */
    _class: "Gradient",
    Implements: Ranged,
    _options: Object.assign(Ranged.prototype._options, {
        gradient: "mixed",
        background: "mixed",
    }),
    options: {
        gradient:        false,
        background:      false
    },
    draw_gradient: function (element, gradient, fallback, range) {
        /**
         * This function generates a string from a given
         * gradient object to set as a CSS background for a DOM element.
         * If element is given, the function automatically sets the
         * background. If gradient is omitted, the gradient is taken from
         * options. Fallback is used if no gradient can be created.
         * If fallback is omitted, <code>options.background</code> is used. if no range
         * is set Gradient assumes that the implementing instance has
         * {@link Range} functionality.
         *
         * @method Gradient#draw_gradient
         * 
         * @param {DOMNode} element - The DOM node to apply the gradient to.
         * @param {Object} [gradient=this.options.gradient] - Gradient definition for the background, e.g. <code>{"-96": "rgb(30,87,153)", "-0.001": "rgb(41,137,216)", "0": "rgb(32,124,202)", "24": "rgb(125,185,232)"}</code>.
         * @param {string} [fallback=this.options.background] - If no gradient can be applied, use this as background color string.
         * @param {Range} [range=this] - If a specific range is set, it is used for the calculations. If not, we expect the widget itself provides {@link Ranged} functionality.
         * 
         * @returns {string} A string to be used as background CSS.
         *
         * @mixes Ranged
         * 
         * @emits Gradient#backgroundchanged
         */
        
        //  {"-96": "rgb(30,87,153)", "-0.001": "rgb(41,137,216)", "0": "rgb(32,124,202)", "24": "rgb(125,185,232)"}
        // becomes:
        // background: linear-gradient(to bottom, rgb(30,87,153) 0%,rgb(41,137,216) 50%,rgb(32,124,202) 51%,rgb(125,185,232) 100%);
        
        var bg = "";
        range = range || this;
        if (!gradient && !this.options.gradient)
            bg = fallback || this.options.background;
        else {
            gradient = gradient || this.options.gradient;
            
            var m_regular  = "";
            var s_regular  = "linear-gradient(%s, %s)";
            var c_regular  = "%s %s%%, ";
            
            var d_w3c = {};
            d_w3c["s"+"left"]       = "to top";
            d_w3c["s"+"right"]      = "to top";
            d_w3c["s"+"top"]        = "to right";
            d_w3c["s"+"bottom"]     = "to right";
            
            var keys = Object.keys(gradient);
            for (var i = 0; i < keys.length; i++) {
                keys[i] = parseFloat(keys[i]);
            }
            keys = keys.sort(this.options.reverse ?
                function (a,b) { return b-a } : function (a,b) { return a-b });
            
            for (var i = 0; i < keys.length; i++) {
                var ps = (100*range.val2coef(range.snap(keys[i]))).toFixed(2);
                m_regular += sprintf(c_regular, gradient[keys[i] + ""], ps);
            }
            m_regular = m_regular.substr(0, m_regular.length -2);
            bg = (sprintf(s_regular, d_w3c["s"+this.options.layout], m_regular));
        }
        
        if (element) {
            element.style.background = bg ? bg : void 0;
            /**
             * Is fired when the gradient was created.
             *
             * @event Gradient#backgroundchanged
             * 
             * @param {HTMLElement} element - The element which background has changed.
             * @param {string} background - The background of the element as CSS color string.
             */
            this.emit("backgroundchanged", element, bg);
        }
        return bg;
    }
});
