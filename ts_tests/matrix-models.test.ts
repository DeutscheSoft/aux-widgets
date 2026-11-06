/**
 * Type-level tests for matrix data models (`src/matrix/models`).
 */
import {
  Datum,
  MatrixDatum,
  TreeNodeData,
  PortData,
  GroupData,
  ConnectionData,
  MatrixData,
  VirtualTreeDataView,
  ConnectionDataView,
  ConnectionCell,
  ConnectionDataInit,
  ConnectionProperties,
  TreeNodeProperties,
  PortProperties,
  TreePathEntry,
  VirtualTreeFilterFunction,
  VirtualTreeSortFunction,
  VirtualTreeSubscribeSortDependencies,
} from '../src/matrix/models.js';
import {
  cast,
  assertAssignable,
  assertMutualAssignable,
  Extends,
  Assert,
} from './helpers.js';

// --- Hierarchy ---

type _port_is_tree = Assert<Extends<PortData, TreeNodeData>>;
type _group_is_tree = Assert<Extends<GroupData, TreeNodeData>>;
type _tree_is_matrix_datum = Assert<Extends<TreeNodeData, MatrixDatum>>;
type _matrix_datum_is_datum = Assert<Extends<MatrixDatum, Datum>>;
type _connection_is_matrix_datum = Assert<Extends<ConnectionData, MatrixDatum>>;
type _matrix_is_datum = Assert<Extends<MatrixData, Datum>>;
type _port_props_extend_tree = Assert<
  Extends<PortProperties, TreeNodeProperties>
>;

const matrix = cast<MatrixData>();
const group = cast<GroupData>();
const port = cast<PortData>();
const port2 = cast<PortData>();
const connection = cast<ConnectionData>();
const tree = cast<TreeNodeData>();

// MatrixData public APIs
const _root: GroupData = matrix.root;
const _addedGroup: GroupData = matrix.addGroup({ label: 'G', id: 'g1' });
const _addedPort: PortData = matrix.addPort({ label: 'P', icon: 'mic' });
const _createdPort: PortData = matrix.createPort({ id: 1 });
const _createdGroup: GroupData = matrix.createGroup({ id: '2' });
const _byIdG: GroupData | undefined = matrix.getGroupById(1);
const _byIdP: PortData | undefined = matrix.getPortById('1');
const _conn: ConnectionData = matrix.connect(port, port2);
const _conn2: ConnectionData = matrix.addConnection({
  from: port,
  to: port2,
  type: '',
});
const _init: ConnectionDataInit = { from: port, to: port2 };
const _props: ConnectionProperties = _init;
const _cons: ConnectionData[] = matrix.getConnectionsOf(port);
const _from: ConnectionData[] = matrix.getConnectionsFrom(port);
const _to: ConnectionData[] = matrix.getConnectionsTo(port);
const _one: ConnectionData | undefined = matrix.getConnection(port, port2);

matrix.forEachConnection((c) => {
  const _c: ConnectionData = c;
  void _c;
});

matrix.deleteConnection(connection);
matrix.deletePort(port);
matrix.deleteGroup(group);

// GroupData
group.addChild(port);
group.deleteChild(port);
const _childPort: PortData = group.addPort({ label: 'x' });
const _childGroup: GroupData = group.addGroup({ label: 'y' });
group.forEach((child) => {
  const _n: TreeNodeData = child;
  void _n;
});
group.forEachNode((child, path) => {
  const _n: TreeNodeData = child;
  const _p: TreePathEntry[] = path;
  void _n;
  void _p;
});
const _unsubGroup = group.forEachAsync((child) => {
  const _n: TreeNodeData = child;
  void _n;
  return () => {};
});
_unsubGroup();

// TreeNodeData property types
const _label: string | undefined = tree.label;
tree.label = 'a';
const _icon: string | undefined = tree.icon;
tree.icon = 'speaker';
const _id: string | number | undefined = tree.id;
const _isGroup: boolean = tree.isGroup;
const _parent: GroupData | null = tree.parent;
const _path: GroupData[] = tree.getPath();
const _childOf: boolean = tree.isChildOf(group);
const _matrixFromNode: MatrixData = tree.matrix;

tree.set('label', 'typed');
const _getLabel: string | undefined = tree.get('label');
tree.observe('label', (v) => {
  const _v: string | undefined = v;
  void _v;
});

// Arbitrary application payload (no custom P required)
tree.set('appMeta', { trackId: 12 });
const _appMeta: unknown = tree.get('appMeta');
tree.observe('appMeta', (v) => {
  const _v: unknown = v;
  void _v;
});
const _portWithExtra: PortData = matrix.addPort({
  label: 'carry',
  userRef: { id: 'x' },
});

// PortData / ConnectionData
port.type = 'audio';
const _ptype: string | undefined = port.type;
const _cfrom: TreeNodeData = connection.from;
const _cto: TreeNodeData = connection.to;
const _ctype: string = connection.type;

// Extending PortData properties via the generic (typed extras)
interface GainPortProperties extends PortProperties {
  gain: number;
}
const gainPort = cast<PortData<GainPortProperties>>();
const _gain: number = gainPort.get('gain');
gainPort.set('gain', 0.5);
gainPort.observe('gain', (v) => {
  const _v: number = v;
  void _v;
});

// VirtualTreeDataView
const sort: VirtualTreeSortFunction = (a, b) =>
  (a.label ?? '').localeCompare(b.label ?? '');
const filter: VirtualTreeFilterFunction = (_node, cb) => {
  cb(true);
  return () => {};
};
const subscribeSortDeps: VirtualTreeSubscribeSortDependencies = (
  _node,
  callback
) => {
  callback();
  return () => {};
};
const view: VirtualTreeDataView = matrix.createVirtualTreeDataView(
  10,
  filter,
  sort
);
const view2 = new VirtualTreeDataView(
  group,
  5,
  undefined,
  sort,
  subscribeSortDeps
);
const _m: MatrixData = view.matrix;
const _g: GroupData = view.group;
const _size: number = view.size;
const _start: number = view.startIndex;
const _amount: number = view.amount;
const _sortFn: VirtualTreeSortFunction = view.sortFunction;
view.sortFunction = sort;
view.triggerSort();
const _depth: number = view.getDepth(port);
const _subtree: number = view.getSubtreeSize(group);
view.setStartIndex(0);
view.setAmount(8);
view.scrollStartIndex(1);
view.scrollStartIndexTo(0);
view.collapseGroup(group, true);
const _collapsed: boolean = view.isCollapsed(group);
const _idx: number = view.indexOf(port);
const _incl: boolean = view.includes(port);
const _at: TreeNodeData | undefined = view.at(0);
const _get: TreeNodeData | undefined = view.get(0);
view.forEach((n) => {
  const _n: TreeNodeData = n;
  void _n;
});
view.forEachElement((n) => {
  const _n: TreeNodeData | undefined = n;
  void _n;
});
const _stopEl = view.subscribeElements(
  (index, element, treePosition) => {
    const _i: number = index;
    const _e: TreeNodeData | undefined = element;
    const _tp: boolean[] = treePosition;
    void _i;
    void _e;
    void _tp;
  },
  () => {}
);
_stopEl();
const _stopSize = view.subscribeSize((n) => {
  const _n: number = n;
  void _n;
});
_stopSize();
const _stopAmount = view.subscribeAmount((n) => {
  const _n: number = n;
  void _n;
});
_stopAmount();
const _stopStart = view.subscribeStartIndexChanged((startIndex, previous) => {
  const _s: number = startIndex;
  const _p: number | undefined = previous;
  void _s;
  void _p;
});
_stopStart();
const _stopScroll = view.subscribeScrollView((offset) => {
  const _o: number = offset;
  void _o;
});
_stopScroll();
const _stopCollapsed = view.subscribeCollapsed(group, (isCollapsed) => {
  const _c: boolean = isCollapsed;
  void _c;
});
_stopCollapsed();
const _stopSorted = view.subscribeSorted(() => {});
_stopSorted();

// ConnectionDataView
const cv = new ConnectionDataView(view, view2);
const cell: ConnectionCell = cv.getConnectionFor(port, port2);
assertAssignable<ConnectionData, ConnectionCell>();
assertAssignable<Set<ConnectionData>, ConnectionCell>();
assertAssignable<undefined, ConnectionCell>();
const _si1: number = cv.startIndex1;
const _si2: number = cv.startIndex2;
const _amt1: number = cv.amount1;
const _amt2: number = cv.amount2;
const _stopCells = cv.subscribeElements(
  (i1, i2, connectionCell, row, column) => {
    const _a: number = i1;
    const _b: number = i2;
    const _c: ConnectionCell = connectionCell;
    const _r: TreeNodeData | undefined = row;
    const _col: TreeNodeData | undefined = column;
    void _a;
    void _b;
    void _c;
    void _r;
    void _col;
  }
);
_stopCells();
const _stopCvSize = cv.subscribeSize((rows, columns) => {
  const _r: number = rows;
  const _c: number = columns;
  void _r;
  void _c;
});
_stopCvSize();
const _stopCvAmount = cv.subscribeAmount((rows, columns) => {
  const _r: number = rows;
  const _c: number = columns;
  void _r;
  void _c;
});
_stopCvAmount();
const _stopCvScroll = cv.subscribeScrollView((rowOffset, columnOffset) => {
  const _r: number = rowOffset;
  const _c: number = columnOffset;
  void _r;
  void _c;
});
_stopCvScroll();
const _stopRow = cv.observeConnectionsForRow(port, (connections) => {
  const _set: Set<ConnectionData> = connections;
  void _set;
});
_stopRow();
const _stopCol = cv.observeConnectionsForColumn(port2, (connections) => {
  const _set: Set<ConnectionData> = connections;
  void _set;
});
_stopCol();
cv.destroy();
view.destroy();

// --- Intentional misuse ---

// @ts-expect-error PortData is not a GroupData
const _notGroup: GroupData = port;

// @ts-expect-error connect requires tree nodes, not plain objects
matrix.connect({ id: 1 }, { id: 2 });

// @ts-expect-error sortFunction is required
matrix.createVirtualTreeDataView(10, filter);

// @ts-expect-error ConnectionDataView needs VirtualTreeDataView instances
new ConnectionDataView(matrix, matrix);

// @ts-expect-error label is a string
tree.label = 1;

// @ts-expect-error gain is a number on GainPortProperties
gainPort.set('gain', 'loud');

void _root;
void _addedGroup;
void _addedPort;
void _createdPort;
void _createdGroup;
void _byIdG;
void _byIdP;
void _conn;
void _conn2;
void _init;
void _props;
void _cons;
void _from;
void _to;
void _one;
void _childPort;
void _childGroup;
void _label;
void _icon;
void _id;
void _isGroup;
void _parent;
void _path;
void _childOf;
void _matrixFromNode;
void _getLabel;
void _appMeta;
void _portWithExtra;
void _ptype;
void _cfrom;
void _cto;
void _ctype;
void _gain;
void _m;
void _g;
void _size;
void _start;
void _amount;
void _sortFn;
void _depth;
void _subtree;
void _collapsed;
void _idx;
void _incl;
void _at;
void _get;
void cell;
void _si1;
void _si2;
void _amt1;
void _amt2;
void _notGroup;

assertMutualAssignable<PortData['isGroup'], boolean>();
assertAssignable<string | undefined, PortData['label']>();
assertAssignable<string | number | undefined, TreeNodeData['id']>();
