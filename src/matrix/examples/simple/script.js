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

import { MatrixData } from '../../models/matrix.js';
import { ListDataView } from '../../models/listdataview.js';
import {
  ConnectionDataView,
  resizeArrayMod,
} from '../../models/connectiondataview.js';
import { sprintf } from '../../../utils/sprintf.js';
import { Subscribers } from '../../../utils/subscribers.js';
import { Timer } from '../../../utils/timers.js';

function treePositionToShapes(treePosition) {
  let text = '';
  const TRUNK = '';
  const BRANCH = '';
  const NONE = '';
  const END = '';

  // we ignore the top level
  if (treePosition.length === 1) return text;

  for (let i = 1; i < treePosition.length - 1; i++) {
    const isLastChild = treePosition[i];

    if (isLastChild) {
      text += NONE;
    } else {
      text += TRUNK;
    }
  }

  if (treePosition[treePosition.length - 1]) {
    text += END;
  } else {
    text += BRANCH;
  }

  return text;
}

function createEntry() {
  const entry = document.createElement('div');
  entry.className = 'entry';

  const indent = document.createElement('span');
  indent.className = 'indent';

  entry.appendChild(indent);

  const label = document.createElement('span');
  label.className = 'label';

  entry.appendChild(label);

  return entry;
}

const matrix = new MatrixData();

const sorter = (a, b) => {
  const labela = a.label;
  const labelb = b.label;

  if (labela < labelb) return -1;
  if (labela === labelb) return 0;
  return 1;
};

const AMOUNT = 10;
const GROUPS = 10;
const PORTS = 4;

const outputs = matrix.addGroup({ label: 'Outputs' });

for (let i = 0; i < GROUPS; i++) {
  const group = outputs.addGroup({ label: 'Group ' + i });

  for (let j = 0; j < PORTS; j++) {
    const port = group.addPort({ label: 'Sink ' + (i * 10 + j) });
  }
}

const inputs = matrix.addGroup({ label: 'Inputs' });

for (let i = 0; i < GROUPS; i++) {
  const group = inputs.addGroup({ label: 'Group ' + i });

  for (let j = 0; j < PORTS; j++) {
    const port = group.addPort({ label: 'Source ' + (i * 10 + j) });
  }
}

const ITEM_HEIGHT = 30;

function createList(into, listview) {
  const ScrollEvent = new Subscribers();

  const scrollarea = document.createElement('div');
  scrollarea.className = 'scrollarea';
  const list = document.createElement('div');
  list.className = 'list';

  list.appendChild(scrollarea);
  into.appendChild(list);

  let entries = [];
  let startIndex = 0;

  const setEntryPosition = (entry, index) => {
    entry.style.transform = sprintf('translateY(%dpx)', index * ITEM_HEIGHT);
    entry._index = index;
  };

  const getEntryPosition = (entry) => {
    return entry._index;
  };

  const updateEntryPosition = (index) => {
    const entry = entries[index % entries.length];

    //console.log('updateEntryPosition', index);

    setEntryPosition(entry, index);
  };

  listview.subscribeStartIndexChanged((new_value, old_value) => {
    if (startIndex === new_value) return;

    startIndex = new_value;

    //console.log('startIndexChanged', new_value - old_value);
  });

  listview.subscribeScrollView((diff) => {
    //console.log('scrollView', diff);
    // We have to scroll our entries by the given offset

    // if we scrolled more than all entries, we update all positions
    if (Math.abs(diff) >= listview.amount) {
      diff = -listview.amount;
    }

    if (diff > 0) {
      // we have to update diff entries at the end
      for (let i = 0; i < diff; i++) {
        const index = startIndex - diff + listview.amount + i;
        updateEntryPosition(index);
      }
    } else {
      // we have to update -diff entries at the end
      diff = -diff;
      for (let i = 0; i < diff; i++) {
        const index = i + startIndex;
        updateEntryPosition(index);
      }
    }
  });

  const onScroll = (offset) => {
    const startIndex = Math.floor(offset / ITEM_HEIGHT);
    //console.log('onScroll', offset, startIndex, listview.startIndex);

    const diff = startIndex - listview.startIndex;

    if (diff) {
      listview.scrollStartIndex(diff);
    }
  };

  const onClick = (ev) => {
    const index = getEntryPosition(ev.currentTarget);

    const element = listview.at(index);

    if (!element.isGroup) return;

    listview.collapseGroup(element, !listview.isCollapsed(element));
  };

  listview.subscribeAmount((amount) => {
    const create = (index) => {
      const entry = createEntry();
      entry.addEventListener('click', onClick);
      scrollarea.appendChild(entry);
      setEntryPosition(entry, index);

      return entry;
    };

    const remove = (entry) => {
      entry.remove();
      entry.removeEventListener('click', onClick);
    };

    resizeArrayMod(entries, amount, startIndex, create, remove);
  });

  // connect entries with our list entries
  listview.subscribeElements((index, element, treePosition) => {
    //console.log('element %d: %s', n, element && element.label);
    const entry = entries[index % entries.length];

    /*
    console.log('startIndex: %d, index: %d, n: %d',
                listview.startIndex, index, n);
                */

    if (element) {
      entry.children[0].textContent = treePositionToShapes(treePosition);
      entry.children[1].textContent = element.label;
      entry.style.removeProperty('display');
      entry.classList.toggle('group', element.isGroup);
    } else {
      entry.style.display = 'none';
    }
  });

  // give the fake scroll area the right size
  listview.subscribeSize((size) => {
    //console.log('size', size);
    scrollarea.style.height = size * ITEM_HEIGHT + 'px';
  });

  ScrollEvent.subscribe(onScroll);

  let got_scroll_event = false;
  let send_scroll_timer = new Timer(() => {
    if (!got_scroll_event) return;

    ScrollEvent.call(list.scrollTop);
  });

  list.addEventListener(
    'scroll',
    (ev) => {
      if (send_scroll_timer.active) {
        got_scroll_event = true;
        return;
      }
      ScrollEvent.call(list.scrollTop);
    },
    { passive: true }
  );

  const onHeightChanged = (height) => {
    listview.setAmount(Math.ceil(height / ITEM_HEIGHT) + 1);
  };

  window.addEventListener('resize', () => {
    onHeightChanged(list.clientHeight);
  });
  onHeightChanged(list.clientHeight);

  return {
    subscribeOnScroll: function (cb) {
      return ScrollEvent.subscribe(cb);
    },
    setScrollTop: function (value) {
      if (list.scrollTop === value) return;
      send_scroll_timer.restart(200);
      got_scroll_event = false;
      onScroll(value);
      list.scrollTop = value;
    },
  };
}

function createMatrix(dst, listview1, listview2) {
  const ScrollEvent = new Subscribers();
  let rows = listview1.amount;
  let columns = listview2.amount;

  const cells = [];

  const connectionview = new ConnectionDataView(listview1, listview2);

  const scrollarea = document.createElement('div');
  scrollarea.className = 'scrollarea';

  connectionview.subscribeSize((rows, columns) => {
    scrollarea.style.height = rows * ITEM_HEIGHT + 'px';
    scrollarea.style.width = columns * ITEM_HEIGHT + 'px';
  });

  const mayConnect = (source, sink) => {
    return source && sink && !source.isGroup && !sink.isGroup;
  };

  const setCellPosition = (cell, index1, index2) => {
    cell.style.transform = sprintf(
      'translateY(%dpx) translateX(%dpx)',
      index1 * ITEM_HEIGHT,
      index2 * ITEM_HEIGHT
    );
    cell._index1 = index1;
    cell._index2 = index2;
  };

  const getCellPosition = (cell, index1, index2) => {
    return [cell._index1, cell._index2];
  };

  const updateCellPosition = (index1, index2) => {
    const cell = cells[index1 % rows][index2 % columns];
    setCellPosition(cell, index1, index2);
  };

  const onClick = (ev) => {
    const cell = ev.currentTarget;

    const [index1, index2] = getCellPosition(cell);

    const source = listview1.at(index1);
    const sink = listview2.at(index2);

    if (mayConnect(source, sink)) {
      const connection = matrix.getConnection(source, sink);

      if (connection) {
        matrix.deleteConnection(connection);
      } else {
        matrix.connect(source, sink);
      }
    }
  };

  //console.log('creating %d x %d matrix', rows, columns);

  const createCell = (index1, index2) => {
    const i = index1 % rows;
    const j = index2 % columns;
    const cell = document.createElement('div');

    cell.className = 'cell';
    cell.addEventListener('click', onClick);
    setCellPosition(cell, index1, index2);
    scrollarea.appendChild(cell);

    return cell;
  };

  const destroyCell = (cell) => {
    cell.removeEventListener('click', onClick);
    cell.remove();
  };

  connectionview.subscribeAmount((_rows, _columns) => {
    rows = _rows;
    columns = _columns;

    const createRow = (index1) => {
      const row = new Array(columns);

      for (let i = 0; i < columns; i++) {
        const index2 = connectionview.startIndex2 + i;
        row[index2 % columns] = createCell(index1, index2);
      }

      return row;
    };

    const destroyRow = (row) => {
      row.forEach(destroyCell);
    };

    resizeArrayMod(
      cells,
      rows,
      connectionview.startIndex1,
      createRow,
      destroyRow
    );

    for (let i = 0; i < rows; i++) {
      const index1 = connectionview.startIndex1 + i;
      const row = cells[index1 % rows];
      resizeArrayMod(
        row,
        columns,
        connectionview.startIndex2,
        (index2) => createCell(index1, index2),
        destroyCell
      );
    }
  });

  const formatCell = (source, sink) => {
    let source_label = (source && source.label) || '<none>';
    let sink_label = (sink && sink.label) || '<none>';

    source_label = source_label
      .replace('Group', 'Grp')
      .replace('Source', 'Src');
    sink_label = sink_label.replace('Group', 'Grp').replace('Sink', 'Snk');

    return '\n' + source_label + '\n->\n' + sink_label;
  };

  connectionview.subscribeElements(
    (index1, index2, connection, source, sink) => {
      const i = index1 % rows;
      const j = index2 % columns;

      const cell = cells[i][j];

      cell.textContent = formatCell(source, sink);

      cell.classList.toggle('connected', !!connection);

      const mayConnect = source && sink && !source.isGroup && !sink.isGroup;

      cell.classList.toggle('connectable', mayConnect);
    }
  );

  connectionview.subscribeScrollView((offset_rows, offset_columns) => {
    const startIndex1 = connectionview.startIndex1;
    const startIndex2 = connectionview.startIndex2;

    //if (Math.abs(offset_rows) > rows || Math.abs(offset_columns) > columns)
    {
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          updateCellPosition(startIndex1 + i, startIndex2 + j);
        }
      }
    }
  });

  let got_scroll_event = false;
  let send_scroll_timer = new Timer(() => {
    if (!got_scroll_event) return;

    ScrollEvent.call(dst.scrollTop, dst.scrollLeft);
  });

  dst.appendChild(scrollarea);

  dst.addEventListener(
    'scroll',
    function (ev) {
      if (send_scroll_timer.active) {
        got_scroll_event = true;
        return;
      }

      ScrollEvent.call(dst.scrollTop, dst.scrollLeft);
    },
    { passive: true }
  );

  // public API
  return {
    setScrollTop: function (value) {
      if (dst.scrollTop === value) return;
      send_scroll_timer.restart(200);
      got_scroll_event = false;
      dst.scrollTop = value;
    },
    setScrollLeft: function (value) {
      if (dst.scrollLeft === value) return;
      send_scroll_timer.restart(200);
      got_scroll_event = false;
      dst.scrollLeft = value;
    },
    subscribeOnScroll: function (cb) {
      return ScrollEvent.subscribe(cb);
    },
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const filter_sources = (node, cb) => {
    cb(node !== outputs);
    return null;
  };
  const sources = matrix.createListDataView(AMOUNT + 1, filter_sources, sorter);
  const ListWidget1 = createList(document.querySelector('#list1'), sources);

  const filter_sinks = (node, cb) => {
    cb(node !== inputs);
    return null;
  };
  const sinks = matrix.createListDataView(AMOUNT + 1, filter_sinks, sorter);
  const ListWidget2 = createList(document.querySelector('#list2'), sinks);

  const MatrixWidget = createMatrix(
    document.querySelector('#matrix'),
    sources,
    sinks
  );

  ListWidget1.subscribeOnScroll((position) => {
    //console.log('ListWidget1.OnScroll %d', position);
    MatrixWidget.setScrollTop(position);
  });
  ListWidget2.subscribeOnScroll((position) => {
    //console.log('ListWidget2.OnScroll %d', position);
    MatrixWidget.setScrollLeft(position);
  });

  MatrixWidget.subscribeOnScroll((yposition, xposition) => {
    //console.log('MatrixWidget.OnScroll %d %d', yposition, xposition);
    ListWidget1.setScrollTop(yposition);
    ListWidget2.setScrollTop(xposition);
  });
});
