import { Base, IBaseEvents, EffectiveEvents } from '../implements/base.js';

/**
 * Focus movement speed.
 */
export type IFocusMoveSpeed = 'slow' | 'normal' | 'fast' | 'full';

/**
 * Focus movement direction.
 */
export type IFocusMoveDirection = 'up' | 'down' | 'left' | 'right';

/**
 * Widget-specific events that extend Base events.
 * Subclasses can extend this interface to add additional events.
 */
export interface IWidgetEvents extends IBaseEvents {
  /** Fired when an option is set via user interaction, BEFORE the option is updated.
   *  This event can be used to cancel the modification by returning false.
   *  Arguments: key, value
   */
  userset: (key: string, value: unknown) => void | false;
  /** Fired after a user action sets an option, AFTER the option has been updated.
   *  This event is triggered whenever the user changes a value, e.g. by moving a fader or similar.
   *  Arguments: key, value
   */
  useraction: (key: string, value: unknown) => void;
  /** Fired when a widget is being resized */
  resize: () => void;
  /** Fired after each rendering frame triggered by a resize event */
  resized: () => void;
  /** Fired when a widget is hidden and is not rendered anymore */
  hide: () => void;
  /** Fired when a widget is shown and is being rendered */
  show: () => void;
  /** Fired when a widget is destroyed */
  destroy: () => void;
  /** Fired when a child widget is added. Arguments: child */
  child_added: (child: Widget) => void;
  /** Fired when a child widget is removed. Arguments: child */
  child_removed: (child: Widget) => void;
  /** Fired after a double click appeared. Arguments: event */
  doubleclick: (event: MouseEvent) => void;
  /** Fired on focus movement via keyboard. Arguments: { speed, direction, event } */
  focus_move: (data: { speed: IFocusMoveSpeed; direction: IFocusMoveDirection; event: KeyboardEvent }) => void;
  /** Fired when the visibility state changes. Arguments: visibility */
  visibility: (visible: boolean) => void;
}

/**
 * Base options interface for Widget class.
 * Subclasses can extend this interface to add additional options.
 */
export interface IWidgetOptions {
  /** A CSS class to add to the main element */
  class?: string;
  /** A DOM element as container to inject the element into */
  container?: HTMLElement | SVGElement;
  /** Enable debug mode */
  debug?: boolean;
  /** An id to set on the element. If omitted a random string is generated. */
  id?: string;
  /** CSS styles to be added directly to the main element */
  styles?: Record<string, string>;
  /** Disables all pointer events on the widget via CSS */
  disabled?: boolean;
  /** An element to be used as the main element */
  element?: HTMLElement | SVGElement;
  /** Toggles the class `.aux-inactive` */
  active?: boolean;
  /** Toggles the class `.aux-hide` and `.aux-show`. This option also enables and disables rendering */
  visible?: boolean | string;
  /** Set a time in milliseconds for triggering double click event. If 0, no double click events are fired. */
  dblclick?: number;
  /** Indicates if the widget is currently being interacted with */
  interacting?: boolean;
  /** Disable CSS transitions */
  notransitions?: boolean;
  /** A time in milliseconds until transitions are activated */
  notransitions_duration?: number;
  /** A string to be set as title attribute on the main element to be displayed as tooltip */
  title?: string;
  /** Set tabindex to activate focus on widgets. Tabindex is set on the element returned by `getFocusElement`. */
  tabindex?: number | boolean;
  /** ARIA role attribute */
  role?: string;
  /** Set an array of targets for ARIA values */
  aria_targets?: boolean | (HTMLElement | SVGElement)[];
  /** Toggles the class `.aux-focus` */
  focus?: boolean;

  // ARIA attributes (converted from kebab-case to underscore_case)
  aria_activedescendant?: string;
  aria_atomic?: string;
  aria_autocomplete?: string;
  aria_busy?: string;
  aria_checked?: string;
  aria_colcount?: string;
  aria_colindex?: string;
  aria_colspan?: string;
  aria_controls?: string;
  aria_current?: string;
  aria_describedby?: string;
  aria_details?: string;
  aria_disabled?: string;
  aria_dropeffect?: string;
  aria_errormessage?: string;
  aria_expanded?: string;
  aria_flowto?: string;
  aria_grabbed?: string;
  aria_haspopup?: string;
  aria_hidden?: string;
  aria_invalid?: string;
  aria_keyshortcuts?: string;
  aria_label?: string;
  aria_labelledby?: string;
  aria_level?: string;
  aria_live?: string;
  aria_modal?: string;
  aria_multiline?: string;
  aria_multiselectable?: string;
  aria_orientation?: string;
  aria_owns?: string;
  aria_placeholder?: string;
  aria_posinset?: string;
  aria_pressed?: string;
  aria_readonly?: string;
  aria_relevant?: string;
  aria_required?: string;
  aria_roledescription?: string;
  aria_rowcount?: string;
  aria_rowindex?: string;
  aria_rowspan?: string;
  aria_selected?: string;
  aria_setsize?: string;
  aria_sort?: string;
  aria_valuemax?: string;
  aria_valuemin?: string;
  aria_valuenow?: string;
  aria_valuetext?: string;
}

/**
 * Widget is the base class for all widgets drawing DOM elements.
 * It extends Base and adds WidgetOptions. The core API (set, get, options, events) comes from Base.
 *
 * @template TOptions - The options type for this widget. Extends IWidgetOptions.
 * @template TEvents - The events type for this widget. Extends IWidgetEvents.
 * @template TEffectiveEvents - The effective events type (defaults to EffectiveEvents<TOptions, TEvents>).
 *   Users can override this to add additional events or customize the event type.
 */
export declare class Widget<
  TOptions extends IWidgetOptions = IWidgetOptions,
  TEvents extends IWidgetEvents = IWidgetEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Base<TOptions, TEvents, TEffectiveEvents> {
  /**
   * Creates a new Widget instance.
   *
   * @param options - An object containing initial options. All options are optional.
   */
  constructor(options?: Partial<NoInfer<TOptions>>);
}

export type { EffectiveEvents };