/**
 * Native DOM events supported by Base.
 * These events are automatically delegated from the DOM element.
 */
export interface INativeDOMEvents {
  // Mouse events
  mouseenter: (event: MouseEvent) => void | false;
  mouseleave: (event: MouseEvent) => void | false;
  mousedown: (event: MouseEvent) => void | false;
  mouseup: (event: MouseEvent) => void | false;
  mousemove: (event: MouseEvent) => void | false;
  mouseover: (event: MouseEvent) => void | false;
  click: (event: MouseEvent) => void | false;
  dblclick: (event: MouseEvent) => void | false;

  // Drag events
  startdrag: (event: DragEvent) => void | false;
  stopdrag: (event: DragEvent) => void | false;
  drag: (event: DragEvent) => void | false;
  dragenter: (event: DragEvent) => void | false;
  dragleave: (event: DragEvent) => void | false;
  dragover: (event: DragEvent) => void | false;
  drop: (event: DragEvent) => void | false;
  dragend: (event: DragEvent) => void | false;

  // Touch events
  touchstart: (event: TouchEvent) => void | false;
  touchend: (event: TouchEvent) => void | false;
  touchmove: (event: TouchEvent) => void | false;
  touchenter: (event: TouchEvent) => void | false;
  touchleave: (event: TouchEvent) => void | false;
  touchcancel: (event: TouchEvent) => void | false;

  // Keyboard events
  keydown: (event: KeyboardEvent) => void | false;
  keypress: (event: KeyboardEvent) => void | false;
  keyup: (event: KeyboardEvent) => void | false;

  // Other events
  scroll: (event: Event) => void | false;
  focus: (event: FocusEvent) => void | false;
  blur: (event: FocusEvent) => void | false;
  input: (event: Event) => void | false;
  mousewheel: (event: WheelEvent) => void | false;
  DOMMouseScroll: (event: Event) => void | false;
  wheel: (event: WheelEvent) => void | false;
  submit: (event: Event) => void | false;
  contextmenu: (event: MouseEvent) => void | false;

  // Pointer events
  pointerover: (event: PointerEvent) => void | false;
  pointerenter: (event: PointerEvent) => void | false;
  pointerdown: (event: PointerEvent) => void | false;
  pointermove: (event: PointerEvent) => void | false;
  pointerup: (event: PointerEvent) => void | false;
  pointercancel: (event: PointerEvent) => void | false;
  pointerout: (event: PointerEvent) => void | false;
  pointerleave: (event: PointerEvent) => void | false;
  gotpointercapture: (event: PointerEvent) => void | false;
  lostpointercapture: (event: PointerEvent) => void | false;
}

/**
 * Base events that can be emitted by Base class.
 * Subclasses can extend this interface to add additional events.
 */
export interface IBaseEvents extends INativeDOMEvents {
  /** Fired when an instance is being initialized */
  initialize: () => void;
  /** Fired when children are being initialized */
  initialize_children: () => void;
  /** Fired when an instance is initialized */
  initialized: () => void;
  /** Fired when an option is set. Arguments: key, value, previousValue */
  set: <K extends string>(key: K, value: unknown, previousValue: unknown) => void;
  /** Fired when an option is set via user interaction. Arguments: key, value */
  userset: (key: string, value: unknown) => void | false;
  /** Fired after a user action sets an option. Arguments: key, value */
  useraction: (key: string, value: unknown) => void;
  /** Fired when an element is delegated. Arguments: element, oldElement */
  delegated: (element: HTMLElement | SVGElement | (HTMLElement | SVGElement)[], oldElement: (HTMLElement | SVGElement) | (HTMLElement | SVGElement)[] | null) => void;
}

/**
 * Synthetic events generated for each option.
 * For each option key K, a 'set_K' event is automatically created with signature:
 * (value: TOptions[K], key: K, prevValue: TOptions[K]) => void
 */
export type OptionSetEvents<TOptions> = {
  [K in keyof TOptions as K extends string ? `set_${K}` : never]: (
    value: TOptions[K],
    key: K,
    prevValue: TOptions[K]
  ) => void;
};

/**
 * Effective events type that combines user-defined events with synthetic option events.
 * This is the actual event type used by Base class methods.
 */
export type EffectiveEvents<TOptions, TEvents extends IBaseEvents> = TEvents & OptionSetEvents<TOptions>;

/**
 * Base class that provides the core API for options management and event handling.
 * Base does not define any options itself - it only provides the API.
 *
 * @template TOptions - The options type for this class.
 * @template TEvents - The events type for this class. Extends IBaseEvents.
 * @template TEffectiveEvents - The effective events type (defaults to EffectiveEvents<TOptions, TEvents>).
 *   Users can override this to add additional events or customize the event type.
 */
export declare class Base<
  TOptions = Record<string, unknown>,
  TEvents extends IBaseEvents = IBaseEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> {
  /**
   * The options object containing all options.
   * Options can be accessed directly via this property or using the `get()` method.
   */
  options: TOptions;

  /**
   * Sets an option value.
   * This method fires 'set' and 'set_[key]' events.
   *
   * @param key - The option name
   * @param value - The option value
   * @returns The value that was set
   */
  set<K extends keyof TOptions>(key: K, value: TOptions[K]): TOptions[K];

  /**
   * Gets an option value.
   *
   * @param key - The option name
   * @returns The option value, or undefined if not set
   */
  get<K extends keyof TOptions>(key: K): TOptions[K] | undefined;

  /**
   * Register an event handler.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to call when the event happens
   */
  on<K extends keyof TEffectiveEvents>(
    event: K,
    func: TEffectiveEvents[K]
  ): void;

  /**
   * Register an event handler (alias for on).
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to call when the event happens
   */
  addEventListener<K extends keyof TEffectiveEvents>(
    event: K,
    func: TEffectiveEvents[K]
  ): void;

  /**
   * Remove an event handler.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to remove
   */
  off<K extends keyof TEffectiveEvents>(
    event: K,
    func: TEffectiveEvents[K]
  ): void;

  /**
   * Remove an event handler (alias for off).
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to remove
   */
  removeEventListener<K extends keyof TEffectiveEvents>(
    event: K,
    func: TEffectiveEvents[K]
  ): void;

  /**
   * Subscribe to an event. Returns an unsubscribe function.
   * Throws an error if the handler is already registered.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to call when the event happens
   * @returns A function to unsubscribe
   */
  subscribe<K extends keyof TEffectiveEvents>(
    event: K,
    func: TEffectiveEvents[K]
  ): () => void;

  /**
   * Subscribe to an event once. Automatically unsubscribes after the first call.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to call when the event happens
   * @returns A function to unsubscribe (can be called before the event fires)
   */
  once<K extends keyof TEffectiveEvents>(
    event: K,
    func: TEffectiveEvents[K]
  ): () => void;

  /**
   * Fire an event.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param args - Event arguments (type-checked based on the event handler signature)
   * @returns The return value from the event handler, or undefined
   */
  emit<K extends keyof TEffectiveEvents>(
    event: K,
    ...args: any[]
  ): any;

  /**
   * Fire an event (alias for emit).
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param args - Event arguments (type-checked based on the event handler signature)
   * @returns The return value from the event handler, or undefined
   */
  dispatchEvent<K extends keyof TEffectiveEvents>(
    event: K,
    ...args: any[]
  ): any;

  /**
   * Check if an event has listeners.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - Optional: specific function to check for
   * @returns True if the event has listeners
   */
  hasEventListener<K extends keyof TEffectiveEvents>(
    event: K,
    func?: TEffectiveEvents[K]
  ): boolean;

  /**
   * Check if an event has any listeners.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @returns True if the event has any listeners
   */
  hasEventListeners<K extends keyof TEffectiveEvents>(
    event: K
  ): boolean;
}
