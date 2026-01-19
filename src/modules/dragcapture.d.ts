import { Module, IModuleOptions, IModuleEvents } from './module.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Capture state object returned by DragCapture.state().
 * This is an internal object with methods for calculating drag positions.
 */
export interface IDragCaptureState {
  /** The starting event. */
  start: MouseEvent | TouchEvent;
  /** The previous event. */
  prev: MouseEvent | TouchEvent;
  /** The current event. */
  current: MouseEvent | TouchEvent;
  /** Calculate the distance from the start position. */
  distance(): number;
  /** Update the current event. */
  setCurrent(ev: MouseEvent | TouchEvent): boolean;
  /** Calculate the vector distance from start. */
  vDistance(): [number, number];
  /** Calculate the vector distance from previous position. */
  prevDistance(): [number, number];
  /** Check if the event is part of this drag interaction. */
  isDraggedBy(ev: MouseEvent | TouchEvent): boolean;
  /** Clean up the capture state. */
  destroy(): void;
}

/**
 * Options specific to the DragCapture class.
 * Extends Module options.
 */
export interface IDragCaptureOptions extends IModuleOptions {
  /** The DOM element receiving the drag events. If not set the widgets element is used. */
  node?: HTMLElement | SVGElement | null;
  /** @internal Whether dragging is currently active (computed internally). */
  state?: boolean;
  /** Focus this element on drag start. Set to false if no focus should be set. */
  focus?: HTMLElement | SVGElement | boolean;
}

/**
 * Events specific to the DragCapture class.
 * Extends Module events.
 */
export interface IDragCaptureEvents extends IModuleEvents {
  /** Fired when capturing started. If an event handler returns true, the dragging is started. */
  startcapture: (state: IDragCaptureState, start: MouseEvent | TouchEvent, ev: MouseEvent | TouchEvent) => void | boolean;
  /** Fired when a movement was captured. */
  movecapture: (state: IDragCaptureState, ev: MouseEvent | TouchEvent) => void | boolean;
  /** Fired when capturing stopped. */
  stopcapture: (state: IDragCaptureState, ev?: MouseEvent | TouchEvent) => void;
}

/**
 * DragCapture is a low-level class for tracking drag interaction using both
 * touch and mouse events. It can be used for implementing drag'n'drop
 * functionality as well as value dragging e.g. Fader or Knob.
 *
 * Each drag interaction started by the user begins with the `startcapture` event.
 * If an event handler returns `true`, the dragging is started. Otherwise mouse or
 * touch events which belong to the same drag interaction are ignored.
 *
 * While the drag interaction is running, the `movecapture` is fired for each
 * underlying move event. Once the drag interaction completes, the `stopcapture`
 * event is fired.
 *
 * While the drag interaction is running, the `state()` method returns a
 * CaptureState object. This object has methods for calculating current position,
 * distance from the start position etc.
 */
export declare class DragCapture<
  TOptions extends IDragCaptureOptions = IDragCaptureOptions,
  TEvents extends IDragCaptureEvents = IDragCaptureEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Module<TOptions, TEvents, TEffectiveEvents> {
  constructor(widget: unknown, options?: Partial<TOptions>);

  /** @internal The current drag state (internal). */
  drag_state: IDragCaptureState | null;

  /**
   * Initialize the drag capture with a parent widget and options.
   * @param widget - The parent widget.
   * @param options - The drag capture options.
   */
  protected initialize(widget: unknown, options?: Partial<TOptions>): void;

  /**
   * Stop the current capture.
   * @param ev - The event that triggered the stop (optional).
   */
  stopCapture(ev?: MouseEvent | TouchEvent): void;

  /**
   * Cancel the current drag operation.
   * @param ev - The event that triggered the cancel (optional).
   */
  cancelDrag(ev?: MouseEvent | TouchEvent): void;

  /**
   * Check if currently dragging.
   * @returns True if dragging is active.
   */
  dragging(): boolean;

  /**
   * Get the current capture state.
   * @returns The capture state object, or null if not dragging.
   */
  state(): IDragCaptureState | null;

  /**
   * Check if the given event is part of the current drag interaction.
   * @param ev - The event to check.
   * @returns True if the event is part of the current drag.
   */
  isDraggedBy(ev: MouseEvent | TouchEvent): boolean;
}
