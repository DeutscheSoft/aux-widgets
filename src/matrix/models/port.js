import { TreeNodeData } from './treenode.js';

export class PortData extends TreeNodeData
{
    set type(value) { return this.set('type', value); }
    get type() { return this.get('type'); }
}
