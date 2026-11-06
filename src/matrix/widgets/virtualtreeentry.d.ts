import type { Label } from '../../widgets/label.js';
import type { Icon } from '../../widgets/icon.js';
import type { Button } from '../../widgets/button.js';
import type { Container } from '../../widgets/container.js';
import type {
  VirtualTreeEntryBase,
  IVirtualTreeEntryBaseOptions,
  IVirtualTreeEntryBaseEvents,
  VirtualTreeEntryBaseInteractiveOptions,
} from './virtualtreeentrybase.js';

/** Indentation glyph kinds drawn beside an entry. */
export type VirtualTreeIndent = 'trunk' | 'branch' | 'end' | 'none';

/**
 * Options for {@link VirtualTreeEntry}.
 */
export interface IVirtualTreeEntryOptions extends IVirtualTreeEntryBaseOptions {
  /** Label text, or `false` to remove the label from the DOM. */
  label: string | false;
  /** Icon URL/class, or `false` to remove the icon from the DOM. */
  icon: string | false;
  /**
   * Indentation glyphs, or `false` to remove the indent element.
   */
  depth: VirtualTreeIndent[] | false;
  /** Whether this entry is a collapsible group header. */
  collapsable: boolean;
  /** Collapsed state for group headers. */
  collapsed: boolean;
  /** Collapse-button icon while collapsed. */
  icon_collapsed: string;
  /** Collapse-button icon while expanded. */
  icon_uncollapsed: string;
  /** Alternating row styling (`aux-odd` / `aux-even`). */
  odd: boolean;
  /** Whether this entry is a group header. */
  group: boolean;
  /** Toggles class `aux-connected`. */
  connected: boolean;
  /** Toggles class `aux-hovered`. */
  hovered: boolean;
}

/**
 * Events for {@link VirtualTreeEntry}.
 */
export interface IVirtualTreeEntryEvents extends IVirtualTreeEntryBaseEvents {
  /** Fired when the collapse button is clicked. */
  collapse: () => void;
}

/**
 * VirtualTreeEntry options that may be changed through user interaction.
 */
export interface VirtualTreeEntryInteractiveOptions
  extends VirtualTreeEntryBaseInteractiveOptions {}

/**
 * Default entry widget used by {@link VirtualTree}: label, icon, indent, and
 * collapse control.
 */
export declare class VirtualTreeEntry<
  Options extends IVirtualTreeEntryOptions = IVirtualTreeEntryOptions,
  Events extends IVirtualTreeEntryEvents = IVirtualTreeEntryEvents,
  InteractiveOptions extends VirtualTreeEntryInteractiveOptions = VirtualTreeEntryInteractiveOptions
> extends VirtualTreeEntryBase<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);

  label: Label;
  icon: Icon;
  indent: Container;
  collapse: Button;

  /**
   * Subscribe to `data` property changes. Override to track extra fields.
   */
  subscribeData(): void;
}
