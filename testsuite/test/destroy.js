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

import {
  EqBand,
  Bitstring,
  Buttons,
  Button,
  Clock,
  ColorPicker,
  ConfirmButton,
  Container,
  Crossover,
  Drag3D,
  Dynamics,
  Equalizer,
  Expand,
  Fader,
  FileSelect,
  Frame,
  FrequencyResponse,
  Gate,
  Gauge,
  Icon,
  Knob,
  Label,
  LevelMeter,
  Limiter,
  Meter,
  Marquee,
  MultiMeter,
  Navigation,
  Notifications,
  Pager,
  Pages,
  Panorama,
  PhaseMeter,
  ProgressBar,
  Reverb,
  Root,
  Scale,
  ScrollArea,
  Spread,
  State,
  Value,
  ValueButton,
  ValueKnob,
} from '../src/index.js';
import { assert, canvas, waitForDrawn } from './helpers.js';

window.__test_eq_band = new EqBand({ freq: 1000, gain: 6, type: 'parametric' });

export function assertNoChildren(node) {
  assert(
    !node.children.length,
    `${node.tagName} has ${node.children.length} child(ren)`
  );
  assert(
    !node.childNodes.length,
    `${node.tagName} has ${node.childNodes.length} childNodes`
  );
}

function interceptEventListeners(node) {
  const listeners = new Map();

  function addListener(name, callback) {
    let set = listeners.get(name);

    if (!set) {
      set = [];
      listeners.set(name, set);
    }

    set.push(callback);
  }

  function removeListener(name, callback) {
    let set = listeners.get(name);

    if (!set) {
      console.warn(
        'Trying to remove event handler',
        name,
        callback,
        'from node',
        node,
        'Does not exist.'
      );
      return;
    }

    const pos = set.indexOf(callback);

    if (pos === -1) {
      console.warn(
        'Trying to remove event handler',
        name,
        callback,
        'from node',
        node,
        'Does not exist.'
      );
      return;
    }

    set.splice(pos, 1);

    if (!set.length) listeners.delete(name);
  }

  {
    const addEventListener = node.addEventListener;
    node.addEventListener = (name, callback, ...args) => {
      addEventListener.call(node, name, callback, ...args);
      addListener(name, callback);
    };
  }

  {
    const removeEventListener = node.removeEventListener;
    node.removeEventListener = (name, callback, ...args) => {
      removeEventListener.call(node, name, callback, ...args);
      removeListener(name, callback);
    };
  }

  return listeners;
}

describe('Empty Widgets on destroy()', () => {
  const C = canvas();
  const widgets = [
    {
      widget: Bitstring,
      name: 'Bitstring',
      tag: 'bitstring',
      options: { length: 8 },
    },
    {
      widget: Button,
      name: 'Button',
      tag: 'button',
      options: { label: 'Foobar', icon: 'speaker' },
    },
    {
      widget: Buttons,
      name: 'Buttons',
      tag: 'buttons',
      options: { buttons: ['Foobar', 'Barfoo'] },
    },
    {
      name: 'Chart and ChartHandle',
      tag: 'chart',
      options: {
        label: 'Foobar',
        key: 'top-left',
        'grid-x': [1, 2],
        'grid-y': [1, 2],
        'range-x': [{ min: 0, max: 3 }],
        'range-y': [{ min: 0, max: 3 }],
        handles: [{ label: 'Foobar' }],
      },
    },
    { widget: Clock, name: 'Clock', tag: 'clock', options: {} },
    {
      widget: ColorPicker,
      name: 'ColorPicker',
      tag: 'colorpicker',
      options: {},
    },
    {
      widget: null,
      name: 'ComboBox',
      tag: 'combobox',
      options: { value: 'Foobar', entries: ['Foobar', 'Barfoo'] },
    },
    {
      widget: ConfirmButton,
      name: 'ConfirmButton',
      tag: 'confirmbutton',
      options: { label: 'Foobar', icon: 'speaker' },
    },
    { widget: Container, name: 'Container', tag: 'container', options: {} },
    { widget: Crossover, name: 'Crossover', tag: 'crossover', options: {} },
    { widget: Drag3D, name: 'Drag3D', tag: 'drag3d', options: {} },
    {
      widget: Dynamics,
      name: 'Dynamics',
      tag: 'dynamics',
      options: { type: 'compressor' },
    },
    {
      widget: Equalizer,
      name: 'Equalizer and EqBand',
      tag: 'equalizer',
      options: { bands: [window.__test_eq_band] },
    },
    {
      widget: Expand,
      name: 'Expand',
      tag: 'expand',
      options: { label: 'Foobar', icon: 'speaker' },
    },
    {
      widget: Fader,
      name: 'Fader',
      tag: 'fader',
      options: { label: 'Foobar', show_value: true },
    },
    { widget: FileSelect, name: 'FileSelect', tag: 'fileselect', options: {} },
    {
      widget: Frame,
      name: 'Frame',
      tag: 'frame',
      options: { label: 'Foobar' },
    },
    {
      widget: FrequencyResponse,
      name: 'FrequencyResponse',
      tag: 'frequencyresponse',
      options: {},
    },
    { widget: Gate, name: 'Gate', tag: 'gate', options: {} },
    { widget: Gauge, name: 'Gauge', tag: 'gauge', options: {} },
    { widget: Icon, name: 'Icon', tag: 'icon', options: { icon: 'speaker' } },
    { widget: Knob, name: 'Knob', tag: 'knob', options: {} },
    {
      widget: Label,
      name: 'Label',
      tag: 'label',
      options: { label: 'Foobar' },
    },
    {
      widget: LevelMeter,
      name: 'LevelMeter',
      tag: 'levelmeter',
      options: {
        label: 'Foobar',
        show_clip: true,
        show_hold: true,
        peak_value: -1,
      },
    },
    { widget: Limiter, name: 'Limiter', tag: 'limiter', options: {} },
    {
      widget: Marquee,
      name: 'Marquee',
      tag: 'marquee',
      options: { label: 'Foobar' },
    },
    {
      widget: Meter,
      name: 'Meter',
      tag: 'meter',
      options: { label: 'Foobar', show_label: true },
    },
    {
      widget: MultiMeter,
      name: 'MultiMeter',
      tag: 'multimeter',
      options: {
        count: 2,
        label: 'Foobar',
        show_label: true,
        show_clip: true,
        show_hold: true,
        peak_value: -1,
      },
    },
    {
      widget: Navigation,
      name: 'Navigation',
      tag: 'navigation',
      options: { arrows: true },
    },
    {
      widget: Notifications,
      name: 'Notifications',
      tag: 'notifications',
      options: {},
    },
    {
      widget: Pager,
      name: 'Pager',
      tag: 'pager',
      options: { pages: [{ label: 'Foobar', content: 'Foobar' }] },
    },
    {
      widget: Pages,
      name: 'Pages',
      tag: 'pages',
      options: { pages: ['Foobar', 'Barfoo'] },
    },
    { widget: Panorama, name: 'Panorama', tag: 'panorama', options: {} },
    { widget: PhaseMeter, name: 'PhaseMeter', tag: 'phasemeter', options: {} },
    {
      widget: ProgressBar,
      name: 'ProgressBar',
      tag: 'progressbar',
      options: {},
    },
    {
      widget: Reverb,
      name: 'Reverb',
      tag: 'reverb',
      options: {
        show_input: true,
        show_input_handle: true,
        show_rlevel_handle: true,
        show_rtime_handle: true,
      },
    },
    { widget: Root, name: 'Root', tag: 'root', options: {} },
    {
      widget: Scale,
      name: 'Scale',
      tag: 'scale',
      options: {
        min: 0,
        max: 1,
        fixed_dots: [0, 0.5, 1],
        fixed_labels: [0, 0.5, 1],
        pointer: 0.5,
        bar: 0.5,
      },
    },
    { widget: ScrollArea, name: 'ScrollArea', tag: 'scrollarea', options: {} },
    {
      widget: Spread,
      name: 'Spread',
      tag: 'spread',
      options: { label: 'Foobar' },
    },
    { widget: State, name: 'State', tag: 'state', options: {} },
    { widget: Value, name: 'Value', tag: 'value', options: {} },
    {
      widget: ValueButton,
      name: 'ValueButton',
      tag: 'valuebutton',
      options: { label: 'Foobar', icon: 'speaker' },
    },
    {
      widget: ValueKnob,
      name: 'ValueKnob',
      tag: 'valueknob',
      options: { label: 'Foobar' },
    },
  ];

  widgets.map((entry) => {
    it(`${entry.name}`, async () => {
      {
        const node = document.createElement('aux-' + entry.tag);
        Object.keys(entry.options).map((option) => {
          node[option] = entry.options[option];
        });
        C.appendChild(node);
        await waitForDrawn(node.auxWidget);
        node.auxWidget.destroy();
        assertNoChildren(node);
        node.remove();
      }
      if (!entry.widget) return;
      {
        const element = document.createElement('div');
        const widget = new entry.widget({
          ...entry.options,
          element,
        });

        C.appendChild(element);
        widget.show();
        await waitForDrawn(widget);
        widget.destroy();
        assertNoChildren(element);
        element.remove();
      }
      {
        const element = document.createElement('div');
        const listeners = interceptEventListeners(element);
        const widget = new entry.widget({
          ...entry.options,
          element,
        });

        C.appendChild(element);
        widget.show();
        await waitForDrawn(widget);
        widget.destroy();
        assertNoChildren(element);
        element.remove();
        assert(
          !listeners.size,
          ` ${entry.name} leaks event listeners ${Array.from(
            listeners.keys()
          ).join(', ')}.`
        );
      }
      {
        const widget = new entry.widget({
          ...entry.options,
        });
        widget.destroy();
        assert(widget.isDestructed());
      }
    });
  });
});
