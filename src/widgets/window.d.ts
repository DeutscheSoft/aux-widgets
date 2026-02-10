import { Container, IContainerOptions, IContainerEvents } from './container.js';
import { EffectiveEvents } from '../implements/base.js';
import { Drag } from '../modules/drag.js';
import { Resize } from '../modules/resize.js';
import { Icon } from './icon.js';
import { Label } from './label.js';
import { Button } from './button.js';

/**
 * Anchor position for window placement.
 */
export type IWindowAnchor =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right';

/**
 * Header/footer element type.
 */
export type IWindowHeaderFooterElement =
  | 'title'
  | 'icon'
  | 'close'
  | 'minimize'
  | 'shrink'
  | 'maximize'
  | 'maximizevertical'
  | 'maximizehorizontal'
  | 'status'
  | 'resize'
  | 'spacer';

/**
 * Header action type.
 */
export type IWindowHeaderAction =
  | 'close'
  | 'minimize'
  | 'shrink'
  | 'maximize'
  | 'maximizevertical'
  | 'maximizehorizontal';

/**
 * Resizing policy.
 */
export type IWindowResizing = 'continuous' | 'stop';

/**
 * Maximize state.
 */
export interface IWindowMaximize {
  x: boolean;
  y: boolean;
}

/**
 * Window dimensions object.
 */
export interface IWindowDimensions {
  anchor: IWindowAnchor;
  x: number;
  x1: number;
  x2: number;
  y: number;
  y1: number;
  y2: number;
  width: number;
  height: number;
}

/**
 * Options specific to the Window widget.
 * Extends Container options.
 */
export interface IWindowOptions extends IContainerOptions {
  /** Initial width, can be a CSS length or an integer (pixels). */
  width: number | string;
  /** Initial height, can be a CSS length or an integer (pixels). */
  height: number | string;
  /** X position of the window. */
  x: number;
  /** Y position of the window. */
  y: number;
  /** Minimum width of the window. */
  min_width: number;
  /** Maximum width of the window, -1 ~ infinite. */
  max_width: number;
  /** Minimum height of the window. */
  min_height: number;
  /** Maximum height of the window, -1 ~ infinite. */
  max_height: number;
  /** Anchor of the window. */
  anchor: IWindowAnchor;
  /** If modal window blocks all other elements. */
  modal: boolean;
  /** Docking of the window. */
  dock: IWindowAnchor | false;
  /** Boolean or object with members x and y as boolean to determine the maximized state. */
  maximize: boolean | IWindowMaximize;
  /** Minimize window (does only make sense with a window manager application to keep track of it). */
  minimize: boolean;
  /** Shrink rolls the window up into the title bar. */
  shrink: boolean;
  /** The content of the window. Can be either a string, a HTMLElement or a Container to append to the content area. */
  content: string | HTMLElement;
  /** Initial position of the window. */
  open: IWindowAnchor;
  /** Z index for piling windows. */
  z_index: number;
  /** Single element or array of header elements. */
  header: IWindowHeaderFooterElement | IWindowHeaderFooterElement[];
  /** Single element or array of footer elements. */
  footer: IWindowHeaderFooterElement | IWindowHeaderFooterElement[] | false;
  /** Window status. */
  status: string | false;
  /** URL to window icon. */
  icon: string | false;
  /** Whether the window sticks to the viewport rather than the document. */
  fixed: boolean;
  /** Auto-toggle the active-class when mouseovered. */
  auto_active: boolean;
  /** Set whether close destroys the window or not. */
  auto_close: boolean;
  /** Set whether maximize toggles the window or not. */
  auto_maximize: boolean;
  /** Set whether minimize toggles the window or not. */
  auto_minimize: boolean;
  /** Set whether shrink toggles the window or not. */
  auto_shrink: boolean;
  /** Set whether the window is draggable. */
  draggable: boolean;
  /** Set whether the window is resizable. */
  resizable: boolean;
  /** Resizing policy, continuous or stop. The first one resizes all children continuously while resizing. */
  resizing: IWindowResizing;
  /** Action for double clicking the window header. */
  header_action: IWindowHeaderAction;
  /** Active state of the window. */
  active: boolean;
  /** If set to !0 status message hides after [n] milliseconds. */
  hide_status: number;
}

/**
 * Events specific to the Window widget.
 * Extends Container events.
 */
export interface IWindowEvents extends IContainerEvents {
  /** The user double-clicked on the header. */
  headeraction: (action: IWindowHeaderAction) => void;
  /** The user clicked the close button. */
  closeclicked: () => void;
  /** The user clicked the maximize button. */
  maximizeclicked: (maximize: IWindowMaximize) => void;
  /** The user clicked the maximize-vertical button. */
  maximizeverticalclicked: (maximize: boolean) => void;
  /** The user clicked the maximize-horizontal button. */
  maximizehorizontalclicked: (maximize: boolean) => void;
  /** The user clicked the minimize button. */
  minimizeclicked: (minimize: boolean) => void;
  /** The user clicked the shrink button. */
  shrinkclicked: (shrink: boolean) => void;
  /** The user starts resizing the window. */
  startresize: (event: MouseEvent | TouchEvent) => void;
  /** The user stops resizing the window. */
  stopresize: (event: MouseEvent | TouchEvent) => void;
  /** The user resizes the window. */
  resizing: (event: MouseEvent | TouchEvent) => void;
  /** The user starts dragging the window. */
  startdrag: (event: MouseEvent | TouchEvent) => void;
  /** The user stops dragging the window. */
  stopdrag: (event: MouseEvent | TouchEvent) => void;
  /** The user is dragging the window. */
  dragging: (event: MouseEvent | TouchEvent) => void;
  /** The header changed. */
  headerchanged: () => void;
  /** The footer changed. */
  footerchanged: () => void;
  /** The dimensions of the window changed. */
  dimensionschanged: (dimensions: IWindowDimensions) => void;
  /** The position of the window changed. */
  positionchanged: (dimensions: IWindowDimensions) => void;
}

/**
 * This widget is a flexible overlay window.
 */
export declare class Window<
  TOptions extends IWindowOptions = IWindowOptions,
  TEvents extends IWindowEvents = IWindowEvents,
  TEffectiveEvents extends EffectiveEvents<TOptions, TEvents> = EffectiveEvents<TOptions, TEvents>
> extends Container<TOptions, TEvents, TEffectiveEvents> {
  constructor(options?: Partial<NoInfer<TOptions>>);

  /** The main DIV element. Has class .aux-window */
  element: HTMLDivElement;
  /** The Drag module. */
  drag: Drag;
  /** The Resize module. */
  resize: Resize;
  /** Window dimensions object. */
  dimensions: IWindowDimensions;
  /** Whether the window is currently being dragged. */
  dragging: boolean;
  /** Whether the window is currently being resized. */
  resizing: boolean;

  /** A Icon widget to display the window icon. */
  icon: Icon;
  /** A Label to display the window title. */
  title: Label;
  /** A Label to display the window status. */
  status: Label;
  /** The close button. */
  close: Button;
  /** The minimize button. */
  minimize: Button;
  /** The maximize button. */
  maximize: Button;
  /** The maximizevertical button. */
  maximizevertical: Button;
  /** The maximizehorizontal button. */
  maximizehorizontal: Button;
  /** The shrink button. */
  shrink: Button;
  /** A Icon acting as handle for window resize. */
  size: Icon;
  /** A Container for the window content. */
  content: Container;
  /** The top header bar. */
  header: Container;
  /** The bottom footer bar. */
  footer: Container;

  /**
   * Appends a new child to the window content area.
   * @param child - The child widget to add to the windows content area.
   */
  appendChild(child: unknown): void;

  /**
   * Toggles the overall maximize state of the window.
   */
  toggleMaximize(): void;

  /**
   * Toggles the vertical maximize state of the window.
   */
  toggleMaximizeVertical(): void;

  /**
   * Toggles the horizontal maximize state of the window.
   */
  toggleMaximizeHorizontal(): void;

  /**
   * Toggles the minimize state of the window.
   */
  toggleMinimize(): void;

  /**
   * Toggles the shrink state of the window.
   */
  toggleShrink(): void;
}
