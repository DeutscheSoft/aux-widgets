import {
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
