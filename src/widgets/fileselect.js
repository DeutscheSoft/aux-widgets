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

function getFileName() {
  const O = this.options;
  const files = O.files;
  if (!files.length) return O.placeholder;
  if (files.length == 1) return files[0].name;
  return O.format_multiple(files.length);
}

function getFileSize() {
  const O = this.options;
  const files = O.files;
  if (!files.length) return 0;
  if (files.length == 1) return files[0].size;
  let sum = 0;
  for (let i = 0, m = files.length; i < m; ++i) {
    sum += files[i].size;
  }
  return sum;
}

export class FileSelect extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), {
      accept: 'string',
      multiple: 'boolean',
      placeholder: 'string',
      files: 'object',
      filename: 'string|boolean',
      filesize: 'number',
      format_size: 'function',
      format_multiple: 'function',
    });
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

  static get static_events() {
    return {
      set_files: function (files) {
        this.set('filename', getFileName.call(this));
        this.set('filesize', getFileSize.call(this));
      },
    };
  }

  initialize(options) {
    super.initialize(options);
  }

  draw(O, element) {
    const id = createID('aux-fileinput-');
    super.draw(O, element);
    addClass(element, 'aux-fileselect');
    this._input.addEventListener('input', this._onInput.bind(this));
    this._input.setAttribute('id', id);
    this._label.setAttribute('for', id);
    this.set('filename', getFileName.call(this));
    this.set('filesize', getFileSize.call(this));
  }

  redraw() {
    const I = this.invalid;
    const O = this.options;

    if (I.validate('filesize')) {
      this.size.set('label', O.format_size(O.filesize));
    }
    if (I.validate('filename')) {
      this.name.set('label', O.filename);
    }
    if (I.validate('format_size')) {
      this.set('filesize', getFileSize.call(this));
    }
    if (I.validate('format_multiple')) {
      this.set('filename', getFileName.call(this));
    }
    if (I.validate('accept')) {
      this._input.setAttribute('accept', O.accept);
    }

    if (I.validate('multiple')) {
      if (O.multiple) this._input.setAttribute('multiple', true);
      else this._input.removeAttribute('multiple');
    }

    super.redraw();
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
