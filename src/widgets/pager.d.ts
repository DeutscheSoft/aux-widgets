import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { Pages, Page, IPagesPageInput, IPageOptions } from './pages.js';
import { Navigation } from './navigation.js';
import { Button, IButtonOptions } from './button.js';

/**
 * Position of the Navigation widget in the Pager.
 */
export type IPagerPosition = 'top' | 'right' | 'left' | 'bottom';

/**
 * Page configuration for Pager initialization.
 */
export type IPagerPageConfig = Partial<IButtonOptions> & {
  /** Content of the page. */
  content: IPagesPageInput;
};

/**
 * Options specific to the Pager widget.
 * Extends Container options.
 */
export interface IPagerOptions extends IContainerOptions {
  /** The position of the Navigation widget. */
  position: IPagerPosition;
  /** The page index to show. Set to -1 to hide all pages. */
  show: number | null;
  /** Initial pages to add. */
  pages: IPagerPageConfig[];
}

/**
 * Events specific to the Pager widget.
 * Extends Container events.
 */
export interface IPagerEvents extends IContainerEvents {
  /** Fired when a page was added. */
  added: (page: Page) => void;
  /** Fired when a page was removed. */
  removed: (page: Page) => void;
}

/**
 * Pager provides multiple containers for displaying contents via Pages
 * which are switchable via a Navigation.
 */
export declare class Pager<
  TOptions extends IPagerOptions = IPagerOptions,
  TEvents extends IPagerEvents = IPagerEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV element. Has class .aux-pager */
  element: HTMLDivElement;
  /** The Navigation instance acting as the menu. */
  navigation: Navigation;
  /** The Pages instance. */
  pages: Pages;

  /**
   * Add multiple pages.
   */
  addPages(pages: IPagerPageConfig[]): void;

  /**
   * Add a page and corresponding navigation button.
   */
  addPage(
    buttonOptions: string | IButtonOptions,
    content: IPagesPageInput,
    options?: Partial<IPageOptions>,
    position?: number
  ): Page;

  /**
   * Remove a page.
   */
  removePage(page: number | Page): void;

  /**
   * Return the currently displayed page or null.
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
   * Get all pages.
   */
  getPages(): Page[];

  /**
   * Get the navigation button for a page.
   */
  getButtonForPage(page: Page): Button | undefined;
}
