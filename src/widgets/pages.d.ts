import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { ChildWidgets } from '../utils/child_widgets.js';

/**
 * Page transition direction.
 */
export type IPagesDirection = 'forward' | 'backward';

/**
 * Page animation direction.
 */
export type IPagesAnimation = 'horizontal' | 'vertical';

/**
 * Page content input type.
 */
export type IPagesPageInput = Page | Node | string;

/**
 * Options specific to the Pages widget.
 * Extends Container options.
 */
export interface IPagesOptions extends IContainerOptions {
  /** List of pages to add on init. */
  pages?: IPagesPageInput[];
  /** The page index to show. Set to -1 to hide all pages. */
  show?: number;
  /** Animation direction for page flips. */
  animation?: IPagesAnimation;
  /** Internal direction for animation. */
  direction?: IPagesDirection;
}

/**
 * Events specific to the Pages widget.
 * Extends Container events.
 */
export interface IPagesEvents extends IContainerEvents {
  /** Fired when a page was added. */
  added: (page: Page, position: number) => void;
  /** Fired when a page was removed. */
  removed: (page: Page, index: number) => void;
  /** Fired when the current page changed. */
  changed: (page: Page, id: number) => void;
}

/**
 * Options specific to the Page widget.
 * Extends Container options.
 */
export interface IPageOptions extends IContainerOptions {
  /** Label for the corresponding navigation button. */
  label?: string;
  /** Icon for the corresponding navigation button. */
  icon?: string;
  /** Duration in ms for hiding transition. */
  hiding_duration?: number;
  /** Duration in ms for showing transition. */
  showing_duration?: number;
  /** Role for the page element. */
  role?: string;
  /** Whether this page is active. */
  active?: boolean;
}

/**
 * Events specific to the Page widget.
 * Extends Container events.
 */
export interface IPageEvents extends IContainerEvents {
  // No additional events beyond those inherited from Container
}

/**
 * Pages contains different Page widgets which can be switched via option.
 */
export declare class Pages<
  TOptions extends IPagesOptions = IPagesOptions,
  TEvents extends IPagesEvents = IPagesEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);

  /** The main DIV element. Has class .aux-pages */
  element: HTMLDivElement;
  /** ChildWidgets list of pages. */
  pages: ChildWidgets;

  /**
   * Add multiple pages.
   */
  addPages(pages: IPagesPageInput[]): void;

  /**
   * Create a Page instance from content and options.
   */
  createPage(content: IPagesPageInput, options?: Partial<IPageOptions>): Page;

  /**
   * Add a page.
   */
  addPage(
    content: IPagesPageInput,
    position?: number,
    options?: Partial<IPageOptions>
  ): Page;

  /**
   * Remove a page.
   */
  removePage(page: number | Page, destroy?: boolean): void;

  /**
   * Remove all pages.
   */
  empty(): void;

  /**
   * Return the current page or null.
   */
  current(): Page | null;

  /**
   * Open the first page.
   */
  first(): boolean;

  /**
   * Open the last page.
   */
  last(): boolean;

  /**
   * Open the next page.
   */
  next(): boolean;

  /**
   * Open the previous page.
   */
  prev(): boolean;

  /**
   * Get the list of pages.
   */
  getPages(): Page[];
}

/**
 * Page is the child widget to be used in Pages.
 */
export declare class Page<
  TOptions extends IPageOptions = IPageOptions,
  TEvents extends IPageEvents = IPageEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<TOptions>);
}
