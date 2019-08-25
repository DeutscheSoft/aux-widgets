import { ResponseHandle } from '../src/modules/responsehandle.js';
import { EqBand } from '../src/modules/eqband.js';
import { Chart } from '../src/widgets/chart.js';
import { ResponseHandler } from '../src/widgets/responsehandler.js';
import { Equalizer } from '../src/widgets/equalizer.js';
import { Value } from '../src/widgets/value.js';
import { Knob } from '../src/widgets/knob.js';
import { State } from '../src/widgets/state.js';
import { Slider } from '../src/widgets/slider.js';
import { Gauge } from '../src/widgets/gauge.js';
import { Fader } from '../src/widgets/fader.js';
import { Select } from '../src/widgets/select.js';
import { ValueButton } from '../src/widgets/valuebutton.js';
import { ValueKnob } from '../src/widgets/valueknob.js';
import { MeterBase } from '../src/widgets/meterbase.js';
import { LevelMeter } from '../src/widgets/levelmeter.js';
import { MultiMeter } from '../src/widgets/multimeter.js';
import { Notifications } from '../src/widgets/notifications.js';
import { Clock } from '../src/widgets/clock.js';
import { Dynamics } from '../src/widgets/dynamics.js';
import { ColorPicker } from '../src/widgets/colorpicker.js';
import { ColorPickerDialog } from '../src/widgets/colorpickerdialog.js';
import { Window } from '../src/widgets/window.js';
import { ButtonArray } from '../src/widgets/buttonarray.js';
import { Crossover, CrossoverBand } from '../src/widgets/crossover.js';
import { Expander } from '../src/widgets/expander.js';
import { Pager } from '../src/widgets/pager.js';
import { List } from '../src/widgets/list.js';
import { ListItem } from '../src/widgets/listitem.js';
import { TaggableListItem } from '../src/widgets/taggablelistitem.js';
import { SortableList } from '../src/widgets/sortablelist.js';
import { SortableListItem } from '../src/widgets/sortablelistitem.js';
import { TreeItem } from '../src/widgets/treeitem.js';
import { TaggableTreeItem } from '../src/widgets/taggabletreeitem.js';
import { Tagger } from '../src/widgets/tagger.js';
import { Frame } from '../src/widgets/frame.js';
import { Root } from '../src/widgets/root.js';

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
   Gauge,
   Fader,
   Select,
   ValueButton,
   ValueKnob,
   MeterBase,
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
