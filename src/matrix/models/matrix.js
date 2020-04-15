import { Datum } from './datum.js';
import { PortData } from './portdata.js';
import { GroupData } from './groupdata.js';
import { ConnectionData } from './connectiondata.js';
import { ListDataView } from './listdataview.js';

export class MatrixData extends Datum
{
    // APIs for managing groups

    addGroup(group)
    {
        if (!(group instanceof Group))
        {
            group = new Group(this, group);
        }
    }

    deleteGroup(group)
    {
    }

    getGroupById(id)
    {
    }

    // APIs for managing ports

    // adds a port to this matrix (not into a group)
    addPort(port)
    {
    }

    deletePort(port)
    {
    }

    // APIs for managing connections

    addConnection(connection)
    {
    }

    deleteConnection(connection)
    {
    }

    createListDataView(filterFunction, amount)
    {
        return new ListDataView(this, filterFunction, amount);
    }
}
