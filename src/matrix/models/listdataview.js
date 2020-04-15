import { Events } from '../../events.js';

export class ListDataView extends Events
{
    constructor(matrix, filterFunction, amount)
    {
        super();
        this.matrix = matrix;
        this.filterFunction = filterFunction;
        this.startIndex = 0;
        this.amount = amount;
    }

    setStartIndex(index)
    {
    }

    scrollStartIndex(offset)
    {
    }

    collapseGroup(group, collapsed)
    {
    }

    destroy()
    {
    }
}
