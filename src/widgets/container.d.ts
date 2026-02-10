import { Widget, IWidgetOptions, IWidgetEvents } from './widget.js';
import { EffectiveEvents } from '../implements/base.js';

/**
 * Visible state for Container.
 * Can be a boolean or one of the transition states.
 */
export type IContainerVisible = boolean | 'hiding' | 'showing' | 'show' | 'hide';

/**
 * Options specific to the Container widget.
 * Extends Widget options.
 */
export interface IContainerOptions extends Omit<IWidgetOptions, 'visible'> {
  /** The content of the container. It can either be a string which is interpreted as HTML or a DOM node. Note that this option will remove all child nodes from the container element including those added via appendChild. */
  content?: string | HTMLElement;
  /** The visible state of the container. Can be a boolean or one of the transition states ('hiding', 'showing', 'show', 'hide'). */
  visible: IContainerVisible;
  /** The duration in ms of the hiding CSS transition/animation of this container. If this option is set to -1, the transition duration will be determined by the computed style. */
  hiding_duration: number;
  /** The duration in ms of the showing CSS transition/animation of this container. If this option is set to -1, the transition duration will be determined by the computed style. */
  showing_duration: number;
  /** Add child widgets on init. Will not be maintained on runtime! Just for convenience purposes on init. */
  children: unknown[]; // Array of Widget instances
  /** If false, child widgets stops rendering while the hiding animation of this container is running. */
  render_while_hiding: boolean;
}

/**
 * Events specific to the Container widget.
 * Extends Widget events.
 */
export interface IContainerEvents extends IWidgetEvents {
  // Container doesn't add any specific events beyond Widget events
}

/**
 * Container represents a DIV element containing various
 * other widgets or DOMNodes.
 *
 * Containers have four different display states: show, hide,
 * showing and hiding. Each of these states has a corresponding
 * CSS class called .aux-show, .aux-hide, .aux-showing
 * and .aux-hiding, respectively. The display state can be controlled using
 * the methods show, hide and toggleHidden.
 *
 * A container can keep track of the display states of its child widgets.
 * The display state of a child can be changed using hideChild,
 * showChild and toggleChild.
 */
export declare class Container<
  TOptions extends IContainerOptions = IContainerOptions,
  TEvents extends IContainerEvents = IContainerEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Widget<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV element. Has class .aux-container */
  element: HTMLDivElement;
  /** Array tracking which children are hidden. */
  hidden_children: boolean[];
  /** Array of child widgets. Inherited from Widget. */
  children: unknown[] | null;

  /**
   * Starts the transition of the visible to false.
   */
  hide(): void;

  /**
   * Immediately hides the container without transition.
   */
  forceHide(): void;

  /**
   * Starts the transition of the visible to true.
   */
  show(): void;

  /**
   * Immediately shows the container without transition.
   */
  forceShow(): void;

  /**
   * Switches the hidden state of a child to hidden.
   * The argument is either the child index or the child itself.
   * @param child - Child or its index.
   */
  hideChild(child: number | unknown): void;

  /**
   * Switches the hidden state of a child to shown.
   * The argument is either the child index or the child itself.
   * @param child - Child or its index.
   */
  showChild(child: number | unknown): void;

  /**
   * Returns true if the given child is currently marked as hidden in this container.
   * @param child - Child or its index.
   * @returns True if the child is hidden.
   */
  isChildHidden(child: number | unknown): boolean;

  /**
   * Toggles the hidden state of a child.
   * The argument is either the child index or the child itself.
   * @param child - Child or its index.
   */
  toggleChild(child: number | unknown): void;

  /**
   * Returns an array of all visible children (recursively).
   * @param a - Optional array to append results to.
   * @returns Array of visible child widgets.
   */
  visibleChildren(a?: unknown[]): unknown[];

  /**
   * Returns true if the container is hidden.
   * @returns True if hidden.
   */
  hidden(): boolean;

  /**
   * Enables drawing for all visible children.
   */
  enableDrawChildren(): void;

  /**
   * Disables drawing for all visible children.
   */
  disableDrawChildren(): void;
}
