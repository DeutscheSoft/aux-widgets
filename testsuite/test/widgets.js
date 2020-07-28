import {
  Button,
  Buttons,
  Container,
  EqBand,
  Chart,
  ChartHandle,
  Equalizer,
  Graph,
  Value,
  Knob,
  State,
  Slider,
  Gauge,
  Fader,
  Select,
  Scale,
  ValueButton,
  ValueKnob,
  Meter,
  LevelMeter,
  MultiMeter,
  Notifications,
  Clock,
  Dynamics,
  ColorPicker,
  ColorPickerDialog,
  Window,
  Crossover,
  CrossoverBand,
  Expand,
  Pager,
  List,
  ListItem,
  TaggableListItem,
  SortableList,
  SortableListItem,
  TreeItem,
  TaggableTreeItem,
  Tagger,
  Frame,
  Root,
  Widget,
} from '../src/index.js';

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

import { waitForDrawn, assert, compare, objectMinus } from './helpers.js';

const widgets = [
  Container,
  ChartHandle,
  EqBand,
  Chart,
  Equalizer,
  Value,
  Knob,
  State,
  Slider,
  Scale,
  Gauge,
  Fader,
  Select,
  ValueButton,
  ValueKnob,
  Meter,
  LevelMeter,
  MultiMeter,
  Notifications,
  Clock,
  Dynamics,
  ColorPicker,
  ColorPickerDialog,
  Window,
  Buttons,
  Crossover,
  Expand,
  Pager,
  List,
  SortableList,
  Tagger,
  Frame,
  Root,
];

const standalone_widgets = [
  Chart,
  Container,
  Equalizer,
  Value,
  Knob,
  State,
  Slider,
  Scale,
  Gauge,
  Fader,
  Select,
  ValueButton,
  ValueKnob,
  Meter,
  LevelMeter,
  MultiMeter,
  Notifications,
  Clock,
  Dynamics,
  ColorPicker,
  Buttons,
  Crossover,
  Expand,
  Pager,
  List,
  SortableList,
  Tagger,
  Frame,
  Root,
];

describe('Widgets', () => {
  it('creating Widgets', () => {
    widgets.map((w) => {
      const widget = new w();
      widget.destroy();
    });
  });
  it('basic options', () => {
    widgets.map((w) => {
      const widget = new w();
      if (widget instanceof Widget) {
        assert(!widget.get('interacting'));
      }
      widget.destroy();
    });
  });

  it('additional options', async () => {
    Promise.all(
      standalone_widgets.map(async (w, i) => {
        const widget = new w({ id: 'foobar' });
        widget.show();
        await waitForDrawn(widget);
        assert(widget.element.getAttribute('id') === 'foobar');

        widget.set('title', 'foobar');
        await waitForDrawn(widget);
        assert(widget.element.getAttribute('title') === 'foobar');

        widget.destroy();
      })
    );
  });

  function assertHidden(widget) {
    assert(widget.hidden());
    assert(!widget.get('visible'));
    assert(!widget.element.classList.contains('aux-show'));
    assert(widget.element.classList.contains('aux-hide'));
  }

  function assertVisible(widget) {
    assert(!widget.hidden());
    assert(widget.get('visible'));
    assert(widget.element.classList.contains('aux-show'));
    assert(!widget.element.classList.contains('aux-hide'));
  }

  it('visible', async () => {
    Promise.all(
      standalone_widgets.map(async (w, i) => {
        const widget = new w();

        // show()
        widget.show();
        assert(widget.isDrawn());
        await waitForDrawn(widget);
        assertVisible(widget);

        // hide()
        widget.hide();
        await waitForDrawn(widget);
        assertHidden(widget);

        // set visible = true
        widget.set('visible', true);
        await waitForDrawn(widget);
        assertVisible(widget);

        // set visible = false
        widget.set('visible', false);
        await waitForDrawn(widget);
        assertHidden(widget);

        widget.forceShow();
        assertVisible(widget);

        widget.forceHide();
        assertHidden(widget);

        widget.destroy();
      })
    );
  });

  it('child_widget', async () => {
    {
      // We check that the value.format option is properly set on the
      // value child of the Fader
      function foo(v) {
        return v;
      }
      function bar(v) {
        return v;
      }

      const fader = new Fader({
        show_value: true,
        'value.format': foo,
      });
      assert(fader.value.get('format') === foo);

      fader.set('value.format', bar);
      assert(fader.value.get('format') === bar);
    }
  });
});

describe('Chart', () => {
  it('creating graphs', (done) => {
    const chart = new Chart();

    const g1 = chart.addGraph({});
    const g2 = chart.addGraph(new Graph());

    const o1 = objectMinus(g1.options, ['id']);
    const o2 = objectMinus(g2.options, ['id']);

    if (!compare(o1, o2)) {
      console.error(g1.options, g2.options);
      throw new Error('Graph options mismatch.');
    }

    done();
  });
  it('switching graphs position', (done) => {
    const chart = new Chart();

    const g1 = chart.addGraph({});
    const g2 = chart.addGraph({});
    g2.redraw();
    
    g2.toBack();
    g2.redraw();
    
    if (g2.element !== g2.element.parentElement.firstChild)
      throw new Error('Graph.toBack() failed.');
      
    g2.toFront();
    g2.redraw();
    
    if (g2.element !== g2.element.parentElement.lastChild)
      throw new Error('Graph.toFront() failed.');

    done();
  });
  it('creating handles', (done) => {
    const chart = new Chart();

    const h1 = chart.addHandle({});
    const h2 = chart.addHandle(new ChartHandle());

    const o1 = objectMinus(h1.options, ['id']);
    const o2 = objectMinus(h2.options, ['id']);

    if (!compare(o1, o2)) {
      console.error(h1.options, h2.options);
      throw new Error('Handle options mismatch.');
    }

    done();
  });
  it('switching handles position', (done) => {
    const chart = new Chart();

    const h1 = chart.addHandle({});
    const h2 = chart.addHandle({});
    chart.redraw();
    
    h2.toBack();
    h2.redraw();
    
    if (h2.element !== h2.element.parentElement.firstChild)
      throw new Error('ChartHandle.toBack() failed.');
      
    h2.toFront();
    h2.redraw();
    
    if (h2.element !== h2.element.parentElement.lastChild)
      throw new Error('ChartHandle.toFront() failed.');

    done();
  });
});

describe('Equalizer', () => {
  it('creating bands', (done) => {
    const eq = new Equalizer();

    const b1 = eq.addBand({});
    const b2 = eq.addBand(new EqBand());

    const o1 = objectMinus(b1.options, ['id']);
    const o2 = objectMinus(b2.options, ['id']);

    if (!compare(o1, o2)) {
      console.error(b1.options, b2.options);
      throw new Error('Options mismatch.');
    }

    done();
  });
});

describe('Crossover', () => {
  it('creating bands', (done) => {
    const eq = new Crossover();

    const b1 = eq.addBand({});
    const b2 = eq.addBand(new CrossoverBand());

    const o1 = objectMinus(b1.options, ['id']);
    const o2 = objectMinus(b2.options, ['id']);

    if (!compare(o1, o2)) {
      console.error(b1.options, b2.options);
      throw new Error('Options mismatch.');
    }

    done();
  });
});

describe('Clock', () => {
  it('clock labels', (done) => {
    const c = new Clock({
      label: function (date, fps, days, months) {
        return 'label';
      },
      label_upper: function (date, fps, days, months) {
        return 'upper';
      },
      label_lower: function (date, fps, days, months) {
        return 'lower';
      },
    });
    c.invalid.time = true;
    c.redraw();
    var l =
      c._label.innerHTML + c._label_upper.innerHTML + c._label_lower.innerHTML;
    if (l !== 'labelupperlower')
      throw new Error(
        "Wrong label content: '" + l + "' - should be 'labelupperlower'"
      );
    done();
  });
});
