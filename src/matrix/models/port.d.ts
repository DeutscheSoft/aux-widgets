import type { TreeNodeData, TreeNodeProperties } from './treenode.js';

/** Known properties on ports. Extra application keys are always allowed. */
export interface PortProperties extends TreeNodeProperties {
  type?: string;
}

/**
 * The data model of a port.
 *
 * Extend `P` for custom port subclasses with extra *typed* properties.
 * Untyped application data can be stored with {@link Datum.set} without
 * extending `P`.
 */
export declare class PortData<
  P extends PortProperties = PortProperties
> extends TreeNodeData<P> {
  get type(): string | undefined;
  set type(value: string);
}
