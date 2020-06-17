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
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General
 * Public License along with this program; if not, write to the
 * Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor,
 * Boston, MA  02110-1301  USA
 */

import { defineClass, addStaticEvent } from '../widget_helpers.js';
import { defineChildWidget } from '../child_widget.js';
import { LevelMeter } from './levelmeter.js';
import { Label } from './label.js';
import { Container } from './container.js';
import { addClass, removeClass, toggleClass } from '../utils/dom.js';
import { objectSub } from '../utils/object.js';

function addMeter(options) {
  var l = this.meters.length;
  var O = options;
  var opt = extractChildOptions(O, l);
  var m = new LevelMeter(opt);

  this.meters.push(m);
  this.appendChild(m);
}
function removeMeter(meter) {
  /* meter can be int or meter instance */
  var M = this.meters;

  var m = -1;
  if (typeof meter == 'number') {
    m = meter;
  } else {
    for (var i = 0; i < M.length; i++) {
      if (M[i] == meter) {
        m = i;
        break;
      }
    }
  }
  if (m < 0 || m > M.length - 1) return;
  this.removeChild(M[m]);
  M[m].element.remove();
  // TODO: no destroy function in levelmeter at this point?
  //this.meters[m].destroy();
  M = M.splice(m, 1);
}

export const MultiMeter = defineClass({
  /**
   * MultiMeter is a collection of {@link LevelMeter}s to show levels of channels
   * containing multiple audio streams. It offers all options of {@link LevelMeter} and
   * {@link Meter} which are passed to all instantiated level meters.
   *
   * Available presets:
   *
   * <ul>
   *   <li>mono</li>
   *   <li>2.1</li>
   *   <li>3</li>
   *   <li>3.1</li>
   *   <li>4</li>
   *   <li>4.1</li>
   *   <li>5</li>
   *   <li>5.1</li>
   *   <li>7.1</li>
   *   <li>dolby_digital_1_0</li>
   *   <li>dolby_digital_2_0</li>
   *   <li>dolby_digital_3_0</li>
   *   <li>dolby_digital_2_1</li>
   *   <li>dolby_digital_2_1.1</li>
   *   <li>dolby_digital_3_1</li>
   *   <li>dolby_digital_3_1.1</li>
   *   <li>dolby_digital_2_2</li>
   *   <li>dolby_digital_2_2.1</li>
   *   <li>dolby_digital_3_2</li>
   *   <li>dolby_digital_3_2.1</li>
   *   <li>dolby_digital_ex</li>
   *   <li>dolby_stereo</li>
   *   <li>dolby_digital</li>
   *   <li>dolby_pro_logic</li>
   *   <li>dolby_pro_logic_2</li>
   *   <li>dolby_pro_logic_2x</li>
   *   <li>dolby_e_mono</li>
   *   <li>dolby_e_stereo</li>
   *   <li>dolby_e_5.1_stereo</li>
   * </ul>
   *
   * @class MultiMeter
   *
   * @extends Container
   *
   * @param {Object} [options={ }] - An object containing initial options.
   *
   * @property {Number} [options.count=2] - The number of level meters.
   * @property {String} [options.label=""] - The label of the multi meter. Set to `false` to hide the label from the DOM.
   * @property {Array<String>} [options.labels=["L", "R"]] - An Array containing labels for the level meters. Their order is the same as the meters.
   * @property {Array<Number>} [options.values=[]] - An Array containing values for the level meters. Their order is the same as the meters.
   * @property {Array<Number>} [options.value_labels=[]] - An Array containing label values for the level meters. Their order is the same as the meters.
   * @property {Array<Boolean>} [options.clips=[]] - An Array containing clippings for the level meters. Their order is the same as the meters.
   * @property {Array<Number>} [options.tops=[]] - An Array containing values for top for the level meters. Their order is the same as the meters.
   * @property {Array<Number>} [options.bottoms=[]] - An Array containing values for bottom for the level meters. Their order is the same as the meters.
   */
  Extends: Container,

  /* TODO: The following is not ideal cause we need to maintain it according to
    LevelMeters and Meter options. */
  _options: Object.assign(Object.create(Container.prototype._options), {
    count: 'int',
    label: 'boolean|string',
    labels: 'array',
    layout: 'string',
    show_scale: 'boolean',
  }),
  options: {
    count: 2,
    label: false,
    labels: ['L', 'R'],
    layout: 'left',
    show_scale: true,
    presets: {
      mono: { count: 1, labels: ['C'] },
      stereo: { count: 2, labels: ['L', 'R'] },
      '2.1': { count: 3, labels: ['L', 'R', 'LF'] },
      '3': { count: 3, labels: ['L', 'C', 'R'] },
      '3.1': { count: 4, labels: ['L', 'C', 'R', 'LF'] },
      '4': { count: 4, labels: ['L', 'R', "L'", "R'"] },
      '4.1': { count: 5, labels: ['L', 'R', "L'", "R'", 'LF'] },
      '5': { count: 5, labels: ['L', 'C', 'R', "L'", 'R'] },
      '5.1': { count: 6, labels: ['L', 'C', 'R', "L'", "R'", 'LF'] },
      '7.1': {
        count: 6,
        labels: ['L', 'C', 'R', "L'", "L''", "R''", "R'", 'LF'],
      },
      dolby_digital_1_0: { count: 1, labels: ['C'] },
      dolby_digital_2_0: { count: 2, labels: ['L', 'R'] },
      dolby_digital_3_0: { count: 3, labels: ['L', 'R', 'C'] },
      dolby_digital_2_1: { count: 3, labels: ['L', 'R', "C'"] },
      'dolby_digital_2_1.1': { count: 4, labels: ['L', 'R', "C'", 'LF'] },
      dolby_digital_3_1: { count: 4, labels: ['L', 'R', 'C', "C'"] },
      'dolby_digital_3_1.1': { count: 5, labels: ['L', 'R', 'C', "C'", 'LF'] },
      dolby_digital_2_2: { count: 4, labels: ['L', 'R', "L'", "R'"] },
      'dolby_digital_2_2.1': { count: 5, labels: ['L', 'R', "L'", "R'", 'LF'] },
      dolby_digital_3_2: { count: 5, labels: ['L', 'R', 'C', "L'", "R'"] },
      'dolby_digital_3_2.1': {
        count: 6,
        labels: ['L', 'R', 'C', "L'", "R'", 'LF'],
      },
      dolby_digital_ex: {
        count: 7,
        labels: ['L', 'R', 'C', "L'", "R'", "C'", 'LF'],
      },
      dolby_stereo: { count: 4, labels: ['L', 'R', 'C', "C'"] },
      dolby_digital: { count: 4, labels: ['L', 'R', 'C', "C'"] },
      dolby_pro_logic: { count: 4, labels: ['L', 'R', 'C', "C'"] },
      dolby_pro_logic_2: {
        count: 6,
        labels: ['L', 'R', 'C', "L'", "R'", 'LF'],
      },
      dolby_pro_logic_2x: {
        count: 8,
        labels: ['L', 'R', 'C', "L'", "L''", "R''", "R'", 'LF'],
      },
      dolby_e_mono: {
        count: 8,
        labels: ['1', '2', '3', '4', '5', '6', '7', '8'],
      },
      dolby_e_stereo: {
        count: 8,
        labels: ['1L', '1R', '2L', '2R', '3L', '3R', '4L', '4R'],
      },
      'dolby_e_5.1_stereo': {
        count: 8,
        labels: ['1L', '1R', '1C', "1L'", "1R'", '1LF', '2L', '2R'],
      },
    },
  },
  initialize: function (options) {
    Container.prototype.initialize.call(this, options, true);
    /**
     * @member {HTMLDivElement} MultiMeter#element - The main DIV container.
     *   Has class <code>.aux-multimeter</code>.
     */
    this.meters = [];
    var O = this.options;
  },
  draw: function (O, element) {
    addClass(element, 'aux-multimeter');

    Container.prototype.draw.call(this, O, element);
  },
  redraw: function () {
    var O = this.options;
    var I = this.invalid;
    var E = this.element;
    var M = this.meters;

    if (I.count) {
      while (M.length > O.count) removeMeter.call(this, M[M.length - 1]);
      while (M.length < O.count) addMeter.call(this, O);
      E.setAttribute(
        'class',
        E.getAttribute('class').replace(/aux-count-[0-9]*/g, '')
      );
      E.setAttribute('class', E.getAttribute('class').replace(/ +/g, ' '));
      addClass(E, 'aux-count-' + O.count);
    }

    if (I.layout || I.count) {
      I.count = I.layout = false;
      removeClass(
        E,
        'aux-vertical',
        'aux-horizontal',
        'aux-left',
        'aux-right',
        'aux-top',
        'aux-bottom'
      );
      switch (O.layout) {
        case 'left':
          addClass(E, 'aux-vertical', 'aux-left');
          break;
        case 'right':
          addClass(E, 'aux-vertical', 'aux-right');
          break;
        case 'top':
          addClass(E, 'aux-horizontal', 'aux-top');
          break;
        case 'bottom':
          addClass(E, 'aux-horizontal', 'aux-bottom');
          break;
        default:
          throw new Error('unsupported layout');
      }
      switch (O.layout) {
        case 'top':
        case 'left':
          for (let i = 0; i < M.length - 1; i++) M[i].set('show_scale', false);
          if (M.length)
            M[this.meters.length - 1].set('show_scale', O.show_scale);
          break;
        case 'bottom':
        case 'right':
          for (let i = 0; i < M.length; i++) M[i].set('show_scale', false);
          if (M.length) M[0].set('show_scale', O.show_scale);
          break;
      }
    }

    if (I.show_value) {
      I.show_value = false;
      toggleClass(E, 'aux-has-values', O.show_value !== false);
    }

    if (I.labels) {
      I.labels = false;
      toggleClass(E, 'aux-has-labels', O.labels !== false);
    }

    Container.prototype.redraw.call(this);
  },
});

/**
 * @member {HTMLDivElement} MultiMeter#label - The {@link Label} widget displaying the meters title.
 */
defineChildWidget(MultiMeter, 'label', {
  create: Label,
  show: false,
  option: 'label',
  default_options: { class: 'aux-label' },
  map_options: { label: 'label' },
  toggle_class: true,
});

/*
 * This could be moved into defineChildWidgets(),
 * which could in similar ways be used in the navigation,
 * pager, etc.
 *
 */

var mapped_options = {
  labels: 'label',
  layout: 'layout',
};

addStaticEvent(MultiMeter, 'set_labels', mapChildOption);
addStaticEvent(MultiMeter, 'set_layout', mapChildOption);

MultiMeter.prototype._options.labels = 'array|string';

function mapChildOptionSimple(value, key) {
  var M = this.meters,
    i;
  for (i = 0; i < M.length; i++) M[i].set(mapped_options[key], value);
}

function mapChildOption(value, key) {console.log("mapChildOption",key, value)
  const M = this.meters;

  if (Array.isArray(value)) {
    for (let i = 0; i < M.length && i < value.length; i++)
      M[i].set(mapped_options[key], value[i]);
  } else {
    for (let i = 0; i < M.length; i++) M[i].set(key, value);
  }
}

let obj = objectSub(
  LevelMeter.prototype._options,
  Container.prototype._options
);

for (var key in obj) {
  if (!obj.hasOwnProperty(key)) continue;
  if (MultiMeter.prototype._options[key]) continue;
  var type = LevelMeter.prototype._options[key];
  if (type.search('array') !== -1) {
    MultiMeter.prototype._options[key] = type;
    mapped_options[key] = key;
    addStaticEvent(MultiMeter, 'set_' + key, mapChildOptionSimple);
  } else {
    MultiMeter.prototype._options[key] = 'array|' + type;
    mapped_options[key] = key;
    addStaticEvent(MultiMeter, 'set_' + key, mapChildOption);
  }
  if (key in LevelMeter.prototype.options)
    MultiMeter.prototype.options[key] = LevelMeter.prototype.options[key];
}

function extractChildOptions(O, i) {
  var o = {},
    value,
    _type;

  for (var _key in mapped_options) {
    if (!O.hasOwnProperty(_key)) continue;
    var ckey = mapped_options[_key];
    value = O[_key];
    _type = LevelMeter.prototype._options[_key] || '';
    if (Array.isArray(value) && _type.search('array') === -1) {
      if (i < value.length) o[ckey] = value[i];
    } else {
      o[ckey] = value;
    }
  }

  return o;
}
