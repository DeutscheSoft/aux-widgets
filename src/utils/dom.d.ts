/**
 * Helper functions for manipulating the DOM
 */

// ============================================================================
// Class Manipulation
// ============================================================================

/**
 * Returns true if the node has the given class.
 */
export function hasClass(node: HTMLElement | SVGElement, name: string): boolean;

/**
 * Adds CSS classes to a DOM node.
 * @param node - The DOM node
 * @param names - One or more class names (strings, arrays, or space-separated strings)
 */
export function addClass(
  node: HTMLElement | SVGElement,
  ...names: Array<string | string[]>
): void;

/**
 * Removes CSS classes from a DOM node.
 * @param node - The DOM node
 * @param names - One or more class names (strings, arrays, or space-separated strings)
 */
export function removeClass(
  node: HTMLElement | SVGElement,
  ...names: Array<string | string[]>
): void;

/**
 * Toggles a CSS class on a DOM node.
 * @param node - The DOM node
 * @param name - The class name
 * @param cond - Optional condition. If provided, adds the class if true, removes if false
 */
export function toggleClass(
  node: HTMLElement | SVGElement,
  name: string,
  cond?: boolean
): void;

// ============================================================================
// Style Functions
// ============================================================================

/**
 * Returns the computed style of a node.
 */
export function getStyle(
  node: HTMLElement | SVGElement,
  property: string
): string;

/**
 * Set multiple CSS styles onto an HTMLElement.
 */
export function setStyles(
  element: HTMLElement,
  styles: Record<string, string | number | null | undefined>
): void;

/**
 * Sets a single CSS style onto an HTMLElement.
 * @deprecated Use setStyles or direct style manipulation instead. Implicit px conversion is deprecated.
 */
export function setStyle(
  element: HTMLElement,
  style: string,
  value: string | number
): void;

// ============================================================================
// CSS Utilities
// ============================================================================

/**
 * Returns true if a string could be a class name.
 */
export function isClassName(str: string): boolean;

/**
 * Returns true if the given string could be a CSS custom property name
 * (i.e. if it starts with `--` and does not contain any illegal characters).
 */
export function isCSSVariableName(str: string): boolean;

/**
 * Returns the maximum value (in milliseconds) of a comma separated string.
 * It is used to find the longest CSS animation in a set of multiple animations.
 */
export function getMaxTime(string: string | null | undefined): number;

/**
 * Returns the longest animation duration of CSS animations and transitions.
 */
export function getDuration(element: HTMLElement): number;

/**
 * Returns the box-sizing method of an HTMLElement.
 */
export function boxSizing(element: HTMLElement): string | undefined;

/**
 * Returns the overall spacing around an HTMLElement of all given attributes.
 * @param element - The element to evaluate
 * @param attributes - CSS attributes to take into account (e.g., "padding", "border")
 * @returns An object with the members "top", "right", "bottom", "left"
 */
export function CSSSpace(
  element: HTMLElement,
  ...attributes: string[]
): { top: number; right: number; bottom: number; left: number };

// ============================================================================
// Element Creation and Querying
// ============================================================================

/**
 * Returns a newly created HTMLElement.
 * @param tag - The type of the element
 * @param args - Optional attributes object or class name strings
 */
export function element(
  tag: string,
  ...args: Array<Record<string, string> | string>
): HTMLElement;

/**
 * Returns the DOM node with the given ID. Shorthand for document.getElementById.
 */
export function getId(id: string): HTMLElement | null;

/**
 * Returns all elements as NodeList of a given class name.
 * Optionally limit the list to all children of a specific DOM node.
 */
export function getClass(
  cls: string,
  element?: Element | Document
): HTMLCollectionOf<Element>;

/**
 * Returns all elements as NodeList of a given tag name.
 * Optionally limit the list to all children of a specific DOM node.
 */
export function getTag(
  tag: string,
  element?: Element | Document
): HTMLCollectionOf<Element>;

// ============================================================================
// Content Manipulation
// ============================================================================

/**
 * Removes all child nodes from an HTMLElement.
 */
export function empty(element: HTMLElement): void;

/**
 * Sets a string as new exclusive text node of an HTMLElement.
 */
export function setText(element: HTMLElement, text: string): void;

/**
 * Returns a documentFragment containing the result of a string parsed as HTML.
 */
export function HTML(html: string): DocumentFragment;

/**
 * Sets the (exclusive) content of an HTMLElement.
 * Strings are set as textContent. HTMLElements and DocumentFragments are added as children.
 * Note that DocumentFragments are cloned.
 */
export function setContent(
  element: HTMLElement,
  content: string | HTMLElement | DocumentFragment
): void;

// ============================================================================
// DOM Manipulation
// ============================================================================

/**
 * Inserts one HTMLElement after another in the DOM tree.
 */
export function insertAfter(newnode: HTMLElement, refnode: HTMLElement): void;

/**
 * Inserts one HTMLElement before another in the DOM tree.
 */
export function insertBefore(newnode: HTMLElement, refnode: HTMLElement): void;

// ============================================================================
// Viewport and Dimensions
// ============================================================================

/**
 * Returns the width of the viewport.
 */
export function width(): number;

/**
 * Returns the height of the viewport.
 */
export function height(): number;

/**
 * Returns the amount of CSS pixels the document or an optional element is scrolled from top.
 */
export function scrollTop(element?: HTMLElement): number;

/**
 * Returns the amount of CSS pixels the document or an optional element is scrolled from left.
 */
export function scrollLeft(element?: HTMLElement): number;

/**
 * Returns the sum of CSS pixels an element and all of its parents are scrolled from top.
 */
export function scrollAllTop(element: HTMLElement): number;

/**
 * Returns the sum of CSS pixels an element and all of its parents are scrolled from left.
 */
export function scrollAllLeft(element: HTMLElement): number;

/**
 * Returns the position from top of an element in relation to the document
 * or an optional HTMLElement. Scrolling of the parent is taken into account.
 */
export function positionTop(
  element: HTMLElement,
  relation?: HTMLElement
): number;

/**
 * Returns the position from the left of an element in relation to the document
 * or an optional HTMLElement. Scrolling of the parent is taken into account.
 */
export function positionLeft(
  element: HTMLElement,
  relation?: HTMLElement
): number;

/**
 * Returns if an element is positioned fixed to the viewport.
 */
export function fixed(element: HTMLElement): boolean;

/**
 * Gets or sets the outer width of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param element - The element to evaluate / manipulate
 * @param margin - Determine if margin is included
 * @param width - If defined, the element's outer width is set to this value
 * @param notransform - Don't take transformations into account
 * @returns The outer width (when getting) or the set width (when setting)
 */
export function outerWidth(
  element: HTMLElement,
  margin?: boolean,
  width?: number,
  notransform?: boolean
): number;

/**
 * Gets or sets the outer height of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param element - The element to evaluate / manipulate
 * @param margin - Determine if margin is included
 * @param height - If defined, the element's outer height is set to this value
 * @param notransform - Don't take transformations into account
 * @returns The outer height (when getting) or the set height (when setting)
 */
export function outerHeight(
  element: HTMLElement,
  margin?: boolean,
  height?: number,
  notransform?: boolean
): number;

/**
 * Gets or sets the inner width of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param element - The element to evaluate / manipulate
 * @param width - If defined, the element's inner width is set to this value
 * @param notransform - Don't take transformations into account
 * @returns The inner width (when getting) or the set width (when setting)
 */
export function innerWidth(
  element: HTMLElement,
  width?: number,
  notransform?: boolean
): number;

/**
 * Gets or sets the inner height of an element as CSS pixels. The box sizing
 * method is taken into account.
 * @param element - The element to evaluate / manipulate
 * @param height - If defined, the element's inner height is set to this value
 * @param notransform - Don't take transformations into account
 * @returns The inner height (when getting) or the set height (when setting)
 */
export function innerHeight(
  element: HTMLElement,
  height?: number,
  notransform?: boolean
): number;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID string.
 */
export function uniqueId(): string;

/**
 * Create a unique ID string with a prefix.
 */
export function createID(prefix: string): string;

/**
 * Check if an object is a DOMNode.
 * Note: This is broken for SVG elements.
 */
export function isDomNode(o: unknown): o is Node;

/**
 * Check if an object is a DocumentFragment.
 */
export function isDocumentFragment(o: unknown): o is DocumentFragment;

/**
 * Check if a device is touch-enabled.
 */
export function isTouch(): boolean;

/**
 * Get all child elements which can be focused.
 * @param element - The parent element. If omitted, document.body is used.
 */
export function getFocusableElements(
  element?: HTMLElement
): NodeListOf<HTMLElement>;

/**
 * Observe part of the DOM for changes. The callback is called if nodes
 * are added or removed from the DOM structure (including subtrees).
 * @param element - The parent element. If omitted, document.body is used.
 * @param callback - The callback function.
 * @param options - An object containing options. Default is `{childList: true, subtree: true}`.
 * @returns The MutationObserver, or undefined if element.nodeType !== 1
 */
export function observeDOM(
  element?: Element,
  callback?: MutationCallback,
  options?: MutationObserverInit
): MutationObserver | undefined;

/**
 * Set focus to an element after a short timeout. This can be used to
 * prevent browsers grabbing focus because of bubbling or collecting.
 * @param element - The element to set focus on
 * @param timeout - The timeout to use in milliseconds. Default is 50.
 */
export function setDelayedFocus(element: HTMLElement, timeout?: number): void;

/**
 * If the given attributeValue is either null nor undefined, the given
 * attributeName is removed using removeAttribute. Otherwise, it is
 * set using setAttribute.
 */
export function applyAttribute(
  element: Element,
  attributeName: string,
  attributeValue: string | null | undefined
): void;

/**
 * Takes false-ish, strings or arrays as input and generates
 * an array of class names. Strings will be split on spaces.
 */
export function splitClassNames(
  input: string | string[] | false | null | undefined
): string[];

// ============================================================================
// Constants
// ============================================================================

/**
 * True if the current browser supports CSS transforms.
 */
export const supports_transform: boolean;
