import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { DragValue } from '../modules/dragvalue.js';
import { Range, IRangeOptions } from '../modules/range.js';

/**
 * Options specific to the Drag3D widget.
 * Extends Container options.
 */
export interface IDrag3DOptions extends IContainerOptions {
  /** Value for x direction. */
  x: number;
  /** Value for y direction. */
  y: number;
  /** Value for z direction. */
  z: number;
  /** Range for x direction. */
  range_x: IRangeOptions;
  /** Range for y direction. */
  range_y: IRangeOptions;
  /** Range for z direction. */
  range_z: IRangeOptions;
  /**
   * DragValue and Range options are available via dot notation,
   * e.g. `drag_x.rotation` or `range_y.min`.
   */
}

/**
 * Events specific to the Drag3D widget.
 * Extends Container events.
 */
export interface IDrag3DEvents extends IContainerEvents {
  // No additional events beyond those inherited from Container
}

/**
 * Drag3D is a Container that provides a three-axis drag controller (x/y/z).
 * It does not draw any visuals by itself; it only captures drag gestures and
 * updates the x/y/z values, so it can be paired with custom rendering.
 */
export declare class Drag3D<
  TOptions extends IDrag3DOptions = IDrag3DOptions,
  TEvents extends IDrag3DEvents = IDrag3DEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV container. Has class .aux-drag3d */
  element: HTMLDivElement;
  /** The Range for x direction. */
  range_x: Range;
  /** The Range for y direction. */
  range_y: Range;
  /** The Range for z direction. */
  range_z: Range;
  /** The DragValue for x direction. */
  drag_x: DragValue;
  /** The DragValue for y direction. */
  drag_y: DragValue;
  /** The DragValue for z direction. */
  drag_z: DragValue;
}
