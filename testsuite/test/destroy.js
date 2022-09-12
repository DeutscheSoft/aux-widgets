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

import { EqBand } from '../src/index.js';
import { assertChildren, canvas, waitForDrawn } from './helpers.js';

window.__test_eq_band = new EqBand({ freq: 1000, gain: 6, type: 'parametric' });

describe.only('Empty Widgets on destroy()', () => {
  const C = canvas();
  const widgets = [
    //{ name: 'Bitstring', tag: 'bitstring', options: { length: 8 } },
    { name: 'Button', tag: 'button', options: { label: 'Foobar', icon: 'speaker' } },
    //{ tag: 'buttons', options: { buttons: 'js:["Foobar", "Barfoo"]' } },
    { name: 'Chart and ChartHandle', tag: 'chart', options: {
      label: 'Foobar',
      key: 'top-left',
      'grid-x': 'js:[1,2]',
      'grid-y': 'js:[1,2]',
      'range-x': 'js:[{min: 0, max: 3}]',
      'range-y': 'js:[{min: 0, max: 3}]',
      handles: 'js:[{ label: "Foobar" }]',
    } },
    { name: 'Clock', tag: 'clock', options: { } },
    { name: 'ColorPicker', tag: 'colorpicker', options: { } },
    { name: 'ComboBox', tag: 'combobox', options: { value: 'Foobar', entries: 'js:["Foobar", "Barfoo"]' } },
    { name: 'ConfirmButton', tag: 'confirmbutton', options: { label: 'Foobar', icon: 'speaker' } },
    { name: 'Container', tag: 'container', options: { } },
    { name: 'Crossover', tag: 'crossover', options: { } },
    { name: 'Drag3D', tag: 'drag3d', options: { } },
    { name: 'Dynamics', tag: 'dynamics', options: { type: 'compressor' } },
    { name: 'Equalizer and EqBand', tag: 'equalizer', options: { bands: 'js:[ window.__test_eq_band ]' } },
    { name: 'Expand', tag: 'expand', options: { label: 'Foobar', icon: 'speaker' } },
    { name: 'Fader', tag: 'fader', options: { label: 'Foobar', show_value: true } },
    { name: 'FileSelect', tag: 'fileselect', options: { } },
    { name: 'Frame', tag: 'frame', options: { label: 'Foobar' } },
    { name: 'FrequencyResponse', tag: 'frequencyresponse', options: { } },
    { name: 'Gauge', tag: 'gauge', options: { } },
    { name: 'Icon', tag: 'icon', options: { icon: 'speaker' } },
  ];

  widgets.map((widget) => {
    it(`${widget.name}`, async () => {
      const node = document.createElement('aux-' + widget.tag);
      Object.keys(widget.options).map((option) => {
        node.setAttribute(option, widget.options[option]);
      })
      C.appendChild(node);
      await waitForDrawn(node.auxWidget);
      node.auxWidget.destroy();
      assertChildren(node);
    });
  });
});
