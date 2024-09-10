/*
 * This file is part of AUX.
 *
 * AUX is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * AUX is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { element, addClass, createID } from './../utils/dom.js';
import { limitDigits } from './../utils/limit_digits.js';
import { FORMAT } from './../utils/sprintf.js';
import { Container } from './container.js';
import { Button } from './button.js';
import { Label } from './label.js';
import { defineChildWidget } from '../child_widget.js';
import { defineChildElement } from '../widget_helpers.js';
import { defineMeasure, defineRender } from '../renderer.js';

/**
 * FileSelect is a file selector widget. It inherits all options of {@link Button}.
 *
 * @class FileSelect
 *
 * @extends Container
 *
 * @property {String} [options.accept=""] - The allowed file types as suffices
 *   starting with a dot or as mime types with optional asterisk,
 *   e.g. ".txt,.zip,.png,.jpg,image/*,application/pdf"
 * @property {boolean} [options.multiple=false] - Defines if users can select multiple files.
 *   The label for the file name shows the amount of files selected instead of a single name
 *   and the label displaying the file size shows the sum of all selected files sizes.
 * @property {String} [options.placeholder='No file(s) selected'] - The label to show as file name
 *   if no file is selected.
 * @property {Function} [options.format_size=limitDigits(4, 'B', 1024)] - the formatting
 *   function for the file size label.
 * @property {Function} [options.format_multiple=FORMAT('%d files selected') - the formatting
 *   function for the file size label.
 * @property {FileList} [options.files=[]] -
 * @property {String} [options.filename=false] - The name of the selected file or `false`
 *   if no file is selected. Read-only property!
 * @property {Integer} [options.filesize=0] - The size of the selected filein bytes.
 *   Read-only property!
 */

export class FileSelect extends Container {
  static get _options() {
    return {
      accept: 'string',
      multiple: 'boolean',
      placeholder: 'string',
      files: 'object',
      filename: 'string|boolean',
      filesize: 'number',
      format_size: 'function',
      format_multiple: 'function',
    };
  }

  static get options() {
    return {
      accept: '',
      multiple: false,
      placeholder: 'No file(s) selected',
      files: [],
      filename: false,
      filesize: 0,
      format_size: limitDigits(4, 'B', 1024),
      format_multiple: FORMAT('%d files selected'),
      icon: 'open',
    };
  }

  static get renderers() {
    return [
      defineMeasure(['files', 'placeholder', 'format_multiple'], function (
        files,
        placeholder,
        format_multiple
      ) {
        let filename;
        if (!files.length) {
          filename = placeholder;
        } else if (files.length === 1) {
          filename = files[0].name;
        } else {
          filename = format_multiple(files.length);
        }

        this.set('filename', filename);
      }),
      defineMeasure('files', function (files) {
        let filesize = 0;
        [...files].forEach((file) => (filesize += file.size));
        this.set('filesize', filesize);
      }),
      defineMeasure(['filesize', 'format_size'], function (
        filesize,
        format_size
      ) {
        this.size.set('label', format_size(filesize));
      }),
      defineMeasure('filename', function (filename) {
        this.name.set('label', filename);
      }),
      defineRender('accept', function (accept) {
        this._input.setAttribute('accept', accept);
      }),
      defineRender('multiple', function (multiple) {
        const _input = this._input;
        if (multiple) _input.setAttribute('multiple', true);
        else _input.removeAttribute('multiple');
      }),
    ];
  }

  constructor(options) {
    super(options);
  }

  draw(O, element) {
    const id = createID('aux-fileinput-');
    super.draw(O, element);
    addClass(element, 'aux-fileselect');
    this._input.addEventListener('input', this._onInput.bind(this));
    this._input.setAttribute('id', id);
    this._label.setAttribute('for', id);
  }

  _onInput(e) {
    this.userset('files', this._input.files);
    /**
     * Is fired when one or more or no files were selected by the user.
     *
     * @event Fader#scalechanged
     *
     * @param {string} key - The key of the option.
     * @param {mixed} value - The value to which it was set.
     */
    this.emit('select', this.options.files);
  }
}

/** @member {HTMLFileInput} FileSelect#_input - HTMLFileInput element.
 *   Has class <code>.aux-fileinput</code>.
 */
defineChildElement(FileSelect, 'input', {
  show: true,
  create: function () {
    return element('INPUT', {
      type: 'file',
      class: 'aux-fileinput',
    });
  },
});

/** @member {HTMLLabel} FileSelect#_label - The HTMLLabel element connecting
 *   the widgets with the file input.
 *   Has class <code>.aux-filelabel</code>.
 */
defineChildElement(FileSelect, 'label', {
  show: true,
  create: function () {
    return element('LABEL', {
      type: 'file',
      class: 'aux-filelabel',
    });
  },
  option: 'foobar',
});

/**
 * @member {Button} FileSelect#button - The {@link Button} for opening the file selector.
 */
defineChildWidget(FileSelect, 'button', {
  create: Button,
  show: true,
  toggle_class: true,
  inherit_options: true,
  append: function () {
    this._label.appendChild(this.button.element);
  },
  option: 'foobar',
  static_events: {
    keydown: function (e) {
      if (e.code === 'Enter' || e.code === 'Space') {
        this.parent._input.click();
        return false;
      }
    },
  },
});
/**
 * @member {Label} FileSelect#name - The {@link Label} for displaying the file name.
 *   Has class `aux-name`.
 */
defineChildWidget(FileSelect, 'name', {
  create: Label,
  show: true,
  toggle_class: true,
  default_options: {
    class: 'aux-name',
  },
});
/**
 * @member {Label} FileSelect#size - The {@link Label} for displaying the file size.
 *   Has class `aux-size`.
 */
defineChildWidget(FileSelect, 'size', {
  create: Label,
  show: true,
  toggle_class: true,
  default_options: {
    class: 'aux-size',
  },
});
