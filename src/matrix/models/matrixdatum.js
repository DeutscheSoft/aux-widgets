import { Datum } from './datum.js';

class MatrixDatum extends Datum
{
    constructor(matrix, o)
    {
        super(o);
        this.matrix = matrix;
    }
}
