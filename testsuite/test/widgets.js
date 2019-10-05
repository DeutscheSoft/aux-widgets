import {
    Button,
    ResponseHandle,
    EqBand,
    Chart,
    ResponseHandler,
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
    ButtonArray,
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
    Root
  } from '../src/index.js';

import { compare, object_minus } from './helpers.js';

const widgets = [
   ResponseHandle,
   EqBand,
   Chart,
   ResponseHandler,
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
   ButtonArray,
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
  widgets.map((w) => {
    it('create '+ w.prototype._class, (done) => {
       new w();
       done();
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

describe('ButtonArray', () => {
    it("creating buttons via string, options and instance", (done) => {
        const ba = new ButtonArray();
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
    it ("creating buttons in right order", (done) => {
        const ba = new ButtonArray();
        const b1 = ba.add_button("1");
        const b2 = ba.add_button("2", 0);
        const b3 = ba.add_button("3", 1);
        let res = "";
        for (var i = 0; i < ba.buttons.length; i++) {
            res += ba.buttons[i].options.label;
        }
        if (res != "231") {
            console.error(res);
            throw new Error('Wrong order.');
        }
        done();
    });
});
