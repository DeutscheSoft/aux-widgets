import {
  Container,
  IContainerOptions,
  IContainerEvents,
  ContainerInteractiveOptions,
} from './container.js';

export interface IExpandOptions extends IContainerOptions {
  /** The state of the widget. */
  expanded: boolean;
  /** Overwrites the expanded option. Use to keep the widget always expanded. */
  always_expanded: boolean;
  /** Group name for mutually exclusive expands. */
  group?: string;
  /** If set, this expand is expanded by default when its group is shown. */
  group_default: boolean;
  /** Icon of the Button which toggles expanded state. */
  icon: string | false;
  /** Icon of the active Button which toggles expanded state. */
  icon_active: string | false;
  /** Label of the Button which toggles expanded state. */
  label: string | false;
  /** Set to false to hide the Button toggling expanded state. */
  show_button?: boolean;
}
export interface IExpandEvents extends IContainerEvents {}

/**
 * Expand options that may be changed through user interaction.
 */
export interface ExpandInteractiveOptions extends ContainerInteractiveOptions {
  /** The state of the widget. */
  expanded: IExpandOptions['expanded'];
}

export declare class Expand<
  Options extends IExpandOptions = IExpandOptions,
  Events extends IExpandEvents = IExpandEvents,
  InteractiveOptions extends ExpandInteractiveOptions = ExpandInteractiveOptions
> extends Container<Options, Events, InteractiveOptions> {
  constructor(options?: Partial<NoInfer<Options>>);
}
