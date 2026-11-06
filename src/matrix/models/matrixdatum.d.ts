import type { Datum, DatumInit, MatrixDatumProperties } from './datum.js';
import type { MatrixData } from './matrix.js';

export declare class MatrixDatum<
  P extends object = MatrixDatumProperties
> extends Datum<P> {
  /** The matrix this datum belongs to. */
  readonly matrix: MatrixData;

  constructor(matrix: MatrixData, o: DatumInit<P>);
}
