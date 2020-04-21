import {
    Button,
    Buttons,
    Container,
    ChartHandle,
    EqBand,
    Chart,
    Equalizer,
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
    Crossover, CrossoverBand,
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
    Widget
  } from '../src/index.js';

import { wait_for_drawn, assert, compare, object_minus } from './helpers.js';

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
   Root
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
      if (widget instanceof Widget)
      {
        assert(!widget.get('interacting'));
      }
      widget.destroy();
    });
  });
  
  it('additional options', async () => {
    Promise.all(standalone_widgets.map(async (w, i) => {
      const widget = new w({id:"foobar"});
      widget.show();
      await wait_for_drawn(widget);
      assert(widget.element.getAttribute("id") === "foobar");
      
      widget.set("title", "foobar");
      await wait_for_drawn(widget);
      assert(widget.element.getAttribute("title") === "foobar");
      
      widget.destroy();
    }));
  });
  
  function assert_hidden(widget)
  {
    assert(widget.hidden());
    assert(!widget.get('visible'));
    assert(!widget.element.classList.contains('aux-show'));
    assert(widget.element.classList.contains('aux-hide'));
  }

  function assert_visible(widget)
  {
    assert(!widget.hidden());
    assert(widget.get('visible'));
    assert(widget.element.classList.contains('aux-show'));
    assert(!widget.element.classList.contains('aux-hide'));
  }

  it('visible', async () => {
    Promise.all(standalone_widgets.map(async (w, i) => {
      const widget = new w();

      // show()
      widget.show();
      assert(widget.is_drawn());
      await wait_for_drawn(widget);
      assert_visible(widget);

      // hide()
      widget.hide();
      await wait_for_drawn(widget);
      assert_hidden(widget);

      // set visible = true
      widget.set('visible', true);
      await wait_for_drawn(widget);
      assert_visible(widget);

      // set visible = false
      widget.set('visible', false);
      await wait_for_drawn(widget);
      assert_hidden(widget);

      widget.force_show();
      assert_visible(widget);

      widget.force_hide();
      assert_hidden(widget);

      widget.destroy();
    }));
  });

  it('child_widget', async () => {
    {
      // We check that the value.format option is properly set on the
      // value child of the Fader
      function foo(v) { return v; }
      function bar(v) { return v; }

      const fader = new Fader({
        show_value: true,
        "value.format": foo,
      });
      assert(fader.value.get('format') === foo);

      fader.set('value.format', bar);
      assert(fader.value.get('format') === bar);
    }
  });
});

describe('Equalizer', () => {
  it('creating bands', (done) => {
    const eq = new Equalizer();

    const b1 = eq.add_band({});
    const b2 = eq.add_band(new EqBand());

    const o1 = object_minus(b1.options, [ "id" ]);
    const o2 = object_minus(b2.options, [ "id" ]);

    if (!compare(o1, o2))
    {
      console.error(b1.options, b2.options);
      throw new Error('Options mismatch.');
    }

    done();
  });
});

describe('Crossover', () => {
  it('creating bands', (done) => {
    const eq = new Crossover();

    const b1 = eq.add_band({});
    const b2 = eq.add_band(new CrossoverBand());

    const o1 = object_minus(b1.options, [ "id" ]);
    const o2 = object_minus(b2.options, [ "id" ]);

    if (!compare(o1, o2))
    {
      console.error(b1.options, b2.options);
      throw new Error('Options mismatch.');
    }

    done();
  });
});

describe ("Clock", () => {
    it("clock labels", (done) => {
        const c = new Clock({
            label: function (date, fps, days, months) { return "label"; },
            label_upper: function (date, fps, days, months) { return "upper"; },
            label_lower: function (date, fps, days, months) { return "lower"; }
        });
        c.invalid.time = true;
        c.redraw();
        var l = c._label.innerHTML + c._label_upper.innerHTML + c._label_lower.innerHTML;
        if (l !== "labelupperlower")
            throw new Error("Wrong label content: '"+l+"' - should be 'labelupperlower'");
        done();
    });
});
