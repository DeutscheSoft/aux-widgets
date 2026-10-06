export function seatSVG(e: SVGElement): void;
export function seatAllSVG(parent: ParentNode): void;
export function makeSVG(
  tag: string,
  args?: Record<string, unknown>
): SVGElement;
export function getBBox(element: SVGGraphicsElement): DOMRect | SVGRect;
export function getComputedTextLength(element: SVGTextContentElement): number;
