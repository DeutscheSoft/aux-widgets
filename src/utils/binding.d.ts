import { Widget, WidgetOptionsOf } from '../widgets/widget.js';
import type {
  BindingOptions,
  ReceiveOnlyBindingOptions,
  SendOnlyBindingOptions,
  BindingOptionsForValue,
  ValueForBindingOptions,
} from '../implements/base.js';
import type {
  ReadableValue,
  WritableValue,
  ReadwriteValue,
} from '../values.interface.js';

export type {
  BindingOptions,
  ReceiveOnlyBindingOptions,
  SendOnlyBindingOptions,
  BindingOptionsForValue,
  ValueForBindingOptions,
  ReadableValue,
  WritableValue,
  ReadwriteValue,
};

/**
 * Option names for bindings: a declared option key, or a `_`-prefixed name.
 */
type OptionName<Options> = keyof Options | `_${string}`;

/**
 * Value type for an option name; `unknown` for `_`-prefixed names.
 */
type OptionValue<
  Options,
  K extends OptionName<Options>
> = K extends keyof Options ? Options[K] : unknown;

/**
 * This function subscribes to those changes to option `name`
 * which are initiated by user action. Returns a function
 * which can be called to unsubscribe.
 *
 * @example
 *      const unsubscribe = observeUseraction(fader, 'value', (value) => {
 *        console.log('Fader value changed to %o', value);
 *      });
 *
 *      setTimeout(unsubscribe, 1000);
 */
export function observeUseraction<
  TWidget extends Widget<any, any> = Widget,
  K extends OptionName<WidgetOptionsOf<TWidget>> = OptionName<
    WidgetOptionsOf<TWidget>
  >
>(
  widget: TWidget,
  name: K,
  callback: (value: OptionValue<WidgetOptionsOf<TWidget>, K>) => void
): () => void;

/**
 * This function subscribes to changes to option `name`.
 * Returns a function which can be called to unsubscribe.
 * Unless `replay` is false, the callback is called immediately with the
 * current value, then on each change.
 *
 * @example
 *      const unsubscribe = observeOption(fader, 'value', (value) => {
 *        console.log('Fader value is %o now.', value);
 *      });
 *
 *      setTimeout(unsubscribe, 1000);
 */
export function observeOption<
  TWidget extends Widget<any, any> = Widget,
  K extends OptionName<WidgetOptionsOf<TWidget>> = OptionName<
    WidgetOptionsOf<TWidget>
  >
>(
  widget: TWidget,
  name: K,
  callback: (value: OptionValue<WidgetOptionsOf<TWidget>, K>) => void,
  replay?: boolean
): () => void;

/**
 * This function intercepts changes to option `name` via the userset event.
 * The callback can return false to cancel the modification.
 * Returns a function which can be called to unsubscribe.
 *
 * @example
 *      const unsubscribe = interceptOption(fader, 'value', (value) => {
 *        if (value < 0) return false; // Cancel negative values
 *      });
 *
 *      setTimeout(unsubscribe, 1000);
 */
export function interceptOption<
  TWidget extends Widget<any, any> = Widget,
  K extends OptionName<WidgetOptionsOf<TWidget>> = OptionName<
    WidgetOptionsOf<TWidget>
  >
>(
  widget: TWidget,
  name: K,
  callback: (value: OptionValue<WidgetOptionsOf<TWidget>, K>) => void | false
): () => void;

/**
 * Holds values while the user is interacting with a widget, then calls
 * `apply` with the last pending value after a grace timeout.
 */
export class InteractionSuppress<T = unknown> {
  /**
   * @param widget - The Widget (for the `interacting` option).
   * @param apply - Called with the value when it should be applied.
   * @param time - Grace time in ms after `interacting` becomes false (default 500).
   */
  constructor(widget: Widget, apply: (value: T) => void, time?: number);

  /** The widget instance. */
  widget: Widget;
  /** Grace time in milliseconds. */
  time: number;

  /**
   * Returns true if values are currently being suppressed.
   */
  isLocked(): boolean;

  /**
   * Receive a value. Unless suppressed, calls `apply` immediately.
   */
  set(value: T): void;

  /**
   * Remove all event subscriptions. Delayed values are discarded.
   */
  destroy(): void;
}

/**
 * Install a binding between a widget option and a value stream.
 * Returns an unsubscribe function.
 */
export function bindOption<
  TWidget extends Widget<any, any> = Widget,
  K extends OptionName<WidgetOptionsOf<TWidget>> = OptionName<
    WidgetOptionsOf<TWidget>
  >
>(
  widget: TWidget,
  name: K,
  source: ReadwriteValue<OptionValue<WidgetOptionsOf<TWidget>, K>>,
  options?: BindingOptions
): () => void;
export function bindOption<
  TWidget extends Widget<any, any> = Widget,
  K extends OptionName<WidgetOptionsOf<TWidget>> = OptionName<
    WidgetOptionsOf<TWidget>
  >
>(
  widget: TWidget,
  name: K,
  source: ReadableValue<OptionValue<WidgetOptionsOf<TWidget>, K>>,
  options?: ReceiveOnlyBindingOptions
): () => void;
export function bindOption<
  TWidget extends Widget<any, any> = Widget,
  K extends OptionName<WidgetOptionsOf<TWidget>> = OptionName<
    WidgetOptionsOf<TWidget>
  >
>(
  widget: TWidget,
  name: K,
  source: WritableValue<OptionValue<WidgetOptionsOf<TWidget>, K>>,
  options?: SendOnlyBindingOptions
): () => void;
