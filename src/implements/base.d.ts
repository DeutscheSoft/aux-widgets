/**
 * A value stream that can drive and/or observe a widget option via {@link Base.bind}.
 */
export interface BindingSource<T = unknown> {
  /** Push values into the widget option. */
  subscribe?: (callback: (value: T) => void) => () => void;
  /** Receive values from the widget option. */
  set?: (value: T) => void;
}

/**
 * Options for {@link Base.bind} / `bindOption`.
 * Directions are named from the widget’s point of view.
 */
export interface BindingOptions {
  /** Which widget event drives `source.set`. Default `'useraction'`. */
  event?: 'useraction' | 'set' | 'userset';
  /** If false, do not apply values from `subscribe`. Default true. */
  receive?: boolean;
  /** If false, do not call `source.set` from widget events. Default true. */
  send?: boolean;
  /**
   * If true (default), apply incoming values with `widget.update`;
   * if false, use `widget.set`.
   */
  update?: boolean;
  /**
   * If true, ignore `subscribe` values while `interacting` is true;
   * after interaction ends, wait `suppressTimeout` then apply the last pending value.
   */
  suppressWhileInteracting?: boolean;
  /** Grace time in ms after interaction ends (default 500). */
  suppressTimeout?: number;
}

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
 * Option-driven events (`set`, `userset`, `useraction`, `set_*`) come from
 * {@link EffectiveEvents}, not from this interface.
 */
export interface IBaseEvents extends INativeDOMEvents {
  /** Fired when an instance is being initialized */
  initialize: () => void;
  /** Fired when children are being initialized */
  initialize_children: () => void;
  /** Fired when an instance is initialized */
  initialized: () => void;
  /** Fired when an element is delegated. Arguments: element, oldElement */
  delegated: (
    element: HTMLElement | SVGElement | (HTMLElement | SVGElement)[],
    oldElement: (HTMLElement | SVGElement) | (HTMLElement | SVGElement)[] | null
  ) => void;
}

/**
 * Synthetic events generated for each option.
 * For each option key K, a 'set_K' event is automatically created with signature:
 * (value: Options[K], key: K, prevValue: Options[K]) => void
 */
export type OptionSetEvents<Options> = {
  [K in keyof Options as K extends string ? `set_${K}` : never]: (
    value: Options[K],
    key: K,
    prevValue: Options[K]
  ) => void;
};

/**
 * Union of `[key, value]` tuples for each property of `O`.
 * Used to type `userset` / `useraction` handlers.
 */
export type OptionKV<O> = {
  [K in keyof O]-?: [key: Extract<K, string>, value: O[K]];
}[keyof O];

/**
 * Union of `[key, value, previousValue]` tuples for each property of `O`.
 * Used to type the `set` event handler.
 */
export type OptionSetKV<O> = {
  [K in keyof O]-?: [key: Extract<K, string>, value: O[K], previousValue: O[K]];
}[keyof O];

/**
 * Options that may be changed through user interaction (`userset` / `useraction`).
 * Subclasses extend this the same way they extend their full options interfaces.
 */
export interface IBaseInteractiveOptions {}

/**
 * Effective events: declared events plus option-driven `set` / `set_*` /
 * `userset` / `useraction` from `Options` and `InteractiveOptions`.
 */
export type EffectiveEvents<
  Options,
  Events extends IBaseEvents,
  InteractiveOptions extends IBaseInteractiveOptions = IBaseInteractiveOptions
> = Omit<Events, 'set' | 'userset' | 'useraction'> &
  OptionSetEvents<Options> & {
    set: (...args: OptionSetKV<Options>) => void;
    userset: (...args: OptionKV<InteractiveOptions>) => void | false;
    useraction: (...args: OptionKV<InteractiveOptions>) => void;
  };

/**
 * Base class that provides the core API for options management and event handling.
 * Base does not define any options itself - it only provides the API.
 *
 * @template Options - The options type for this class.
 * @template Events - The events type for this class. Extends IBaseEvents.
 * @template InteractiveOptions - Options that may be set via user interaction.
 */
export declare class Base<
  Options = Record<string, unknown>,
  Events extends IBaseEvents = IBaseEvents,
  InteractiveOptions extends IBaseInteractiveOptions = IBaseInteractiveOptions
> {
  /**
   * The options object containing all options.
   * Options can be accessed directly via this property or using the `get()` method.
   */
  options: Options;

  /** @internal Anchors `Events` for inference (not used at runtime). */
  protected readonly __eventsType: Events;
  /** @internal Anchors `InteractiveOptions` for inference (not used at runtime). */
  protected readonly __interactiveOptionsType: InteractiveOptions;

  /**
   * Sets an option value.
   * This method fires 'set' and 'set_[key]' events.
   *
   * @param key - The option name
   * @param value - The option value
   * @returns The value that was set
   */
  set<K extends keyof Options>(key: K, value: Options[K]): Options[K];

  /**
   * Conditionally sets an option unless it already has the requested value.
   *
   * @param key - The option name
   * @param value - The option value
   */
  update<K extends keyof Options>(key: K, value: Options[K]): void;

  /**
   * Gets an option value.
   *
   * @param key - The option name
   * @returns The option value, or undefined if not set
   */
  get<K extends keyof Options>(key: K): Options[K] | undefined;

  /**
   * Install a binding between an option and a value stream.
   * Directions are named from the widget’s point of view
   * (`receive` = source → widget, `send` = widget → source).
   * `name` may be a declared option or a `_`-prefixed name.
   *
   * @param name - The option name
   * @param source - Object with optional `subscribe` and/or `set`
   * @param options - Binding options
   * @returns Unsubscribe function
   */
  bind<K extends (keyof Options & string) | `_${string}`>(
    name: K,
    source: BindingSource<K extends keyof Options ? Options[K] : unknown>,
    options?: BindingOptions
  ): () => void;

  /**
   * Sets an option by user interaction. Emits `userset` (cancelable) then
   * updates the option and emits `useraction`.
   *
   * @returns `false` if a `userset` handler cancelled the change, otherwise `true`
   */
  protected userset<K extends keyof InteractiveOptions & string>(
    key: K,
    value: InteractiveOptions[K]
  ): boolean;

  /**
   * Register an event handler.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to call when the event happens
   */
  on<K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>>(
    event: K,
    func: EffectiveEvents<Options, Events, InteractiveOptions>[K]
  ): void;

  /**
   * Register an event handler (alias for on).
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to call when the event happens
   */
  addEventListener<
    K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>
  >(
    event: K,
    func: EffectiveEvents<Options, Events, InteractiveOptions>[K]
  ): void;

  /**
   * Remove an event handler.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to remove
   */
  off<K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>>(
    event: K,
    func: EffectiveEvents<Options, Events, InteractiveOptions>[K]
  ): void;

  /**
   * Remove an event handler (alias for off).
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to remove
   */
  removeEventListener<
    K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>
  >(
    event: K,
    func: EffectiveEvents<Options, Events, InteractiveOptions>[K]
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
  subscribe<
    K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>
  >(
    event: K,
    func: EffectiveEvents<Options, Events, InteractiveOptions>[K]
  ): () => void;

  /**
   * Subscribe to an event once. Automatically unsubscribes after the first call.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - The function to call when the event happens
   * @returns A function to unsubscribe (can be called before the event fires)
   */
  once<K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>>(
    event: K,
    func: EffectiveEvents<Options, Events, InteractiveOptions>[K]
  ): () => void;

  /**
   * Fire an event.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param args - Event arguments (type-checked based on the event handler signature)
   * @returns The return value from the event handler, or undefined
   */
  emit<K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>>(
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
  dispatchEvent<
    K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>
  >(event: K, ...args: any[]): any;

  /**
   * Check if an event has listeners.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @param func - Optional: specific function to check for
   * @returns True if the event has listeners
   */
  hasEventListener<
    K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>
  >(
    event: K,
    func?: EffectiveEvents<Options, Events, InteractiveOptions>[K]
  ): boolean;

  /**
   * Check if an event has any listeners.
   * Supports both user-defined events and synthetic 'set_${key}' events for each option.
   *
   * @param event - The event name
   * @returns True if the event has any listeners
   */
  hasEventListeners<
    K extends keyof EffectiveEvents<Options, Events, InteractiveOptions>
  >(event: K): boolean;
}
