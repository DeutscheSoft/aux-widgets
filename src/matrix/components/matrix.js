import {
    component_from_widget, define_component
  } from './../../component_helpers.js';
import { Matrix } from './../widgets/matrix.js';

/**
 * WebComponent for the Matrix widget. Available in the DOM as
 * `aux-matrix`.
 *
 * @class MatrixComponent
 * @implements Component
 */
export const MatrixComponent = component_from_widget(Matrix);

define_component('matrix', MatrixComponent);
