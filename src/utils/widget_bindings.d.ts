import type { Widget, WidgetOptionsOf } from '../widgets/widget.js';
import type {
  ReadableValue,
  WritableValue,
  ReadwriteValue,
} from '../values.interface.js';
import type {
  BindingOptions,
  ReceiveOnlyBindingOptions,
  SendOnlyBindingOptions,
} from '../implements/base.js';

/** Option names for bindings: a declared option key, or a `_`-prefixed name. */
type OptionName<Options> = (keyof Options & string) | `_${string}`;

/** Value type for an option name; `unknown` for `_`-prefixed names. */
type OptionValue<
  Options,
  K extends OptionName<Options>
> = K extends keyof Options ? Options[K] : unknown;

/**
 * One binding descriptor for option `K` on `Options`: BindingOptions plus
 * `name` and a source whose value type matches that option.
 */
export type BindingDescriptorForOption<
  Options,
  K extends OptionName<Options>
> =
  | ({
      name: K;
      source: ReadwriteValue<OptionValue<Options, K>>;
    } & BindingOptions)
  | ({
      name: K;
      source: ReadableValue<OptionValue<Options, K>>;
    } & ReceiveOnlyBindingOptions)
  | ({
      name: K;
      source: WritableValue<OptionValue<Options, K>>;
    } & SendOnlyBindingOptions);

/**
 * Union of valid binding descriptors for a widget options bag (distributed
 * over option names).
 */
export type BindingDescriptor<Options = Record<string, unknown>> = {
  [K in OptionName<Options>]: BindingDescriptorForOption<Options, K>;
}[OptionName<Options>];

/** Binding descriptors allowed for a concrete widget type. */
export type BindingDescriptorForWidget<
  TWidget extends Widget<any, any> = Widget
> = BindingDescriptor<WidgetOptionsOf<TWidget>>;

export function compareBinding(a: object, b: object): boolean;

/**
 * Manages `widget.bind()` subscriptions with an index-aligned list diff.
 * Typed against the widget’s option map, same as {@link Widget.bind}.
 * Multiple bindings may share the same option name.
 */
export class WidgetBindings<TWidget extends Widget<any, any> = Widget> {
  constructor(widget: TWidget & { isDestructed?(): boolean });

  update(
    bindings:
      | BindingDescriptorForWidget<TWidget>
      | BindingDescriptorForWidget<TWidget>[]
      | null
      | undefined
  ): void;

  dispose(): void;
}
