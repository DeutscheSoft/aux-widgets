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

import { defineChildWidget } from '../child_widget.js';
import { LevelMeter } from './levelmeter.js';
import { Label } from './label.js';
import { Container } from './container.js';
import { addClass, removeClass, toggleClass } from '../utils/dom.js';
import { objectSub } from '../utils/object.js';
import { defineRender } from '../renderer.js';

const mapped_options = {
  labels: 'label',
  layout: 'layout',
};

function extractChildOptions(O, i) {
  const o = {};

  for (const _key in mapped_options) {
    if (!Object.prototype.hasOwnProperty.call(O, _key)) continue;
    const ckey = mapped_options[_key];
    const value = O[_key];
    const _type = LevelMeter.getOptionType(_key) || '';
    if (Array.isArray(value) && _type.search('array') === -1) {
      if (i < value.length) o[ckey] = value[i];
    } else if (value !== null) {
      o[ckey] = value;
    }
  }

  return o;
}

function addMeter() {
  const l = this.meters.length;
  const opt = extractChildOptions(this.options, this.meters.length);
  const m = new LevelMeter(opt);

  this.meters.push(m);
  this.appendChild(m);
}
function removeMeter() {
  /* meter can be int or meter instance */
  const meter = this.meters.pop();

  this.removeChild(meter);
  meter.element.remove();
}

function mapChildOptionSimple(value, key) {
  const M = this.meters;
  for (let i = 0; i < M.length; i++) M[i].set(mapped_options[key], value);
}

function mapChildOption(value, key) {
  const M = this.meters;

  if (Array.isArray(value)) {
    for (let i = 0; i < M.length && i < value.length; i++)
      M[i].set(mapped_options[key], value[i]);
  } else {
    for (let i = 0; i < M.length; i++) M[i].set(key, value);
  }
}

const multimeterOptionTypes = {
  count: 'int',
  label: 'boolean|string',
  labels: 'array|string',
  layout: 'string',
  show_scale: 'boolean',
};

const multimeterOptionDefaults = {
  count: 2,
  label: false,
  labels: null,
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
};

const multimeterStaticEvents = {
  set_labels: mapChildOption,
  set_layout: mapChildOption,
};

const levelmeterOwnOptions = objectSub(
  LevelMeter.getOptionTypes(),
  Container.getOptionTypes()
);

for (const key in levelmeterOwnOptions) {
  if (!Object.prototype.hasOwnProperty.call(levelmeterOwnOptions, key))
    continue;
  if (multimeterOptionTypes.hasOwnProperty(key)) continue;

  const type = levelmeterOwnOptions[key];

  if (type.search('array') !== -1) {
    multimeterOptionTypes[key] = type;
    mapped_options[key] = key;
    multimeterStaticEvents['set_' + key] = mapChildOptionSimple;
  } else {
    multimeterOptionTypes[key] = 'array|' + type;
    mapped_options[key] = key;
    multimeterStaticEvents['set_' + key] = mapChildOption;
  }
}

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
/* TODO: The following is not ideal cause we need to maintain it according to
  LevelMeters and Meter options. */
export class MultiMeter extends Container {
  static get _options() {
    return Object.assign({}, Container.getOptionTypes(), multimeterOptionTypes);
  }

  static get options() {
    return Object.assign(
      {},
      multimeterOptionDefaults,
      LevelMeter.getDefaultOptions()
    );
  }

  static get static_events() {
    return multimeterStaticEvents;
  }

  static get renderers() {
    return [
      defineRender('show_value', function (show_value) {
        toggleClass(this.element, 'aux-has-values', show_value !== false);
      }),
      defineRender('labels', function (labels) {
        toggleClass(this.element, 'aux-has-labels', labels !== false);
      }),
      defineRender('count', function (count) {
        const E = this.element;
        const prevCount = this.meters.length;

        if (prevCount === count) return;

        if (count > prevCount) {
          for (let i = 0; i < count - prevCount; i++) addMeter.call(this);
        } else {
          for (let i = 0; i < prevCount - count; i++) removeMeter.call(this);
        }
        removeClass(E, 'aux-count-' + prevCount);
        addClass(E, 'aux-count-' + count);
      }),
      defineRender('layout', function (layout) {
        const E = this.element;
        removeClass(
          E,
          'aux-vertical',
          'aux-horizontal',
          'aux-left',
          'aux-right',
          'aux-top',
          'aux-bottom'
        );
        switch (layout) {
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
      }),
      defineRender(['count', 'layout', 'show_scale'], function (
        count,
        layout,
        show_scale
      ) {
        const E = this.element;

        switch (layout) {
          case 'top':
          case 'left':
            this.meters.forEach((meter, i, meters) =>
              meter.set('show_scale', show_scale && i + 1 === meters.length)
            );
            break;
          case 'bottom':
          case 'right':
            this.meters.forEach((meter, i) =>
              meter.set('show_scale', show_scale && i === 0)
            );
            break;
        }
      }),
    ];
  }

  initialize(options) {
    super.initialize(options, true);
    /**
     * @member {HTMLDivElement} MultiMeter#element - The main DIV container.
     *   Has class <code>.aux-multimeter</code>.
     */
    this.meters = [];
  }

  draw(O, element) {
    addClass(element, 'aux-multimeter');

    super.draw(O, element);
  }

  destroy() {
    this.removeChildNode(this.label.element);
    this.meters.map((meter) => {
      this.removeChildNode(meter.element);
    });
  }
}

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
