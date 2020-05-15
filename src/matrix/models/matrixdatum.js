/**
 * @module matrix
 */

import { Datum } from './datum.js';
import { typecheck_object } from '../../utils/typecheck.js';

export class MatrixDatum extends Datum {
  constructor(matrix, o) {
    typecheck_object(matrix);
    typecheck_object(o);
    super(o);

    this.matrix = matrix;
  }
}
