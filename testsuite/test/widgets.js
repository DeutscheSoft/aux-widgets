import {
    Button,
    Buttons,
    ResponseHandle,
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
    Expander,
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

import { assert, compare, object_minus } from './helpers.js';

const widgets = [
   ResponseHandle,
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
   Expander,
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

describe('Buttons', () => {
    it("creating buttons via string, options and instance", (done) => {
        const ba = new Buttons();
        const label = "testing";
        const b1 = ba.add_button(label);
        const b2 = ba.add_button({label:label});
        const b3 = ba.add_button(new Button({label:label}));
        const o1 = object_minus(ba.buttons[0].options, ['id']);
        const o2 = object_minus(ba.buttons[1].options, ['id']);
        const o3 = object_minus(ba.buttons[2].options, ['id']);
        if (!compare(o1, o2) || !compare(o1, o3)) {
            console.error(b1.options, b2.options, b3.options);
            throw new Error('Labels mismatch.');
        }
        done();
    });
    it("creating buttons in right order", (done) => {
        const ba = new Buttons();
        const b1 = ba.add_button("1");
        const b2 = ba.add_button("2", 0);
        const b3 = ba.add_button("3", 1);
        let res = "";
        for (var i = 0; i < ba.buttons.length; i++) {
            res += ba.buttons[i].options.label;
        }
        if (res != "231")
            throw new Error('Wrong order: '+res+' - should be 231');
        done();
    });
    it("multi-selection unlimited", (done) => {
        const comp_array = function (a1, a2) {
            return a1.length === a2.length && a1.sort().every(function(v, i) { return v === a2.sort()[i]});
        }
        const ba = new Buttons({multi_select:1, buttons:['1','2','3']});
        var sel = [];
        var test = [];
        for (var i = 0; i < ba.buttons.length; i++) {
            sel.push(i);
            test.push(i);
            ba.set("select", sel);
            if (!comp_array(ba.get("select"), test))
                throw new Error('Selection went wrong: '+JSON.stringify(ba.get('select'))+' should be ' + JSON.stringify(test));
        }
        done();
    });
    it("multi-selection limit", (done) => {
        const comp_array = function (a1, a2) {
            return a1.length === a2.length && a1.sort().every(function(v, i) { return v === a2.sort()[i]});
        }
        const ba = new Buttons({multi_select:2, buttons:['1','2','3']});
        var sel = [];
        for (var i = 0; i < ba.buttons.length; i++) {
            sel.push(i);
            ba.set("select", sel);
            if (ba.get("select").length > 2)
                throw new Error('Selection went wrong. Limit was 2 but got '+sel.length+' items selected.');
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
