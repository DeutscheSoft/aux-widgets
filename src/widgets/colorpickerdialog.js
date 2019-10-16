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
import { Dialog } from './dialog.js';
import { ColorPicker } from './colorpicker.js';
import { add_class } from '../utils/dom.js';

function cancel () {
    var self = this.parent;
    self.emit.call(self, "cancel");
    self.close();
}

function apply (color) {
    var self = this.parent;
    self.emit.call(self, "apply", color);
    self.close();
}

export const ColorPickerDialog = define_class({
    /**
     * A {@link Dialog} window containing a {@link ColorPicker}. It can be opened
     * programatically and closes automatically on the appropriate user
     * interactions like hitting ESC or clicking `apply`. ColorPickerDialog
     * inherits all options of ColorPicker.
     * 
     * @class ColorPickerDialog
     * 
     * @extends Dialog
     * 
     */
    
    Extends: Dialog,
    
    initialize: function (options) {
        Dialog.prototype.initialize.call(this, options);
        /** @member {HTMLDivElement} ColorPickerDialog#element - The main DIV container.
         * Has class <code>.aux-color-picker-dialog</code>.
         */
        add_class(this.element, "aux-color-picker-dialog");
    },
});
    
/**
 * @member {ColorPicker} ColorPickerDialog#colorpicker - The {@link ColorPicker} widget.
 */
define_child_widget(ColorPickerDialog, "colorpicker", {
    create: ColorPicker,
    show: true,
    inherit_options: true,
    userset_delegate: true,
    static_events: {
        cancel: cancel,
        apply: apply,
    },
});
