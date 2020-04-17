import { Datum } from './datum.js';

export class MatrixDatum extends Datum
{
    constructor(matrix, o)
    {
        super(o);

        if (!matrix)
          throw new TypeError('Expected MatrixData argument.');

        this.matrix = matrix;
    }
}
