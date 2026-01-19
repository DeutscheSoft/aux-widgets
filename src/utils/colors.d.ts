/**
 * RGB color object.
 */
export interface IRGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color object.
 */
export interface IHSLColor {
  h: number;
  s: number;
  l: number;
}

/**
 * RGB color input - can be individual numbers, array, object, or hex string.
 */
export type IRGBInput = number | number[] | IRGBColor | string;

/**
 * HSL color input - can be individual numbers, array, or object.
 */
export type IHSLInput = number | number[] | IHSLColor;

/**
 * Universal color input - can be RGB, HSL, hex string, or color name.
 */
export type IColorInput = IRGBInput | IHSLInput | string;

/* RGB Functions */

/**
 * Returns a hex color string from a RGB color.
 * @overload
 */
export function RGBToHex(r: number, g: number, b: number): string;
export function RGBToHex(rgb: IRGBColor): string;
export function RGBToHex(rgb: [number, number, number]): string;

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l') from a RGB color.
 * @overload
 */
export function RGBToHSL(r: number, g: number, b: number): IHSLColor;
export function RGBToHSL(rgb: IRGBColor): IHSLColor;
export function RGBToHSL(rgb: [number, number, number]): IHSLColor;

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument from a RGB color.
 * @overload
 */
export function RGBToBW(r: number, g: number, b: number): string;
export function RGBToBW(rgb: IRGBColor): string;
export function RGBToBW(rgb: [number, number, number]): string;

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument from a RGB color.
 * @overload
 */
export function RGBToWB(r: number, g: number, b: number): string;
export function RGBToWB(rgb: IRGBColor): string;
export function RGBToWB(rgb: [number, number, number]): string;

/**
 * Returns a grayscale value (0..1) from a RGB color.
 * @overload
 */
export function RGBToGray(r: number, g: number, b: number): number;
export function RGBToGray(rgb: IRGBColor): number;
export function RGBToGray(rgb: [number, number, number]): number;

/* HSL Functions */

/**
 * Helper function for HSL to RGB conversion.
 * @internal
 */
export function hueToRGB(p: number, q: number, t: number): number;

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b') from a HSL color.
 * @overload
 */
export function HSLToRGB(h: number, s: number, l: number): IRGBColor;
export function HSLToRGB(hsl: IHSLColor): IRGBColor;
export function HSLToRGB(hsl: [number, number, number]): IRGBColor;

/**
 * Returns a hex color string from a HSL color.
 * @overload
 */
export function HSLToHex(h: number, s: number, l: number): string;
export function HSLToHex(hsl: IHSLColor): string;
export function HSLToHex(hsl: [number, number, number]): string;

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument from a HSL color.
 * @overload
 */
export function HSLToBW(h: number, s: number, l: number): string;
export function HSLToBW(hsl: IHSLColor): string;
export function HSLToBW(hsl: [number, number, number]): string;

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument from a HSL color.
 * @overload
 */
export function HSLToWB(h: number, s: number, l: number): string;
export function HSLToWB(hsl: IHSLColor): string;
export function HSLToWB(hsl: [number, number, number]): string;

/**
 * Returns a grayscale value (0..1) from a HSL color.
 * @overload
 */
export function HSLToGray(h: number, s: number, l: number): number;
export function HSLToGray(hsl: IHSLColor): number;
export function HSLToGray(hsl: [number, number, number]): number;

/* HEX Functions */

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b') from a hex color string.
 * @param hex - Hex color string (with or without leading #).
 * @returns Object with members r, g and b as numbers (0..255).
 */
export function hexToRGB(hex: string): IRGBColor;

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l') from a hex color string.
 * @param hex - Hex color string (with or without leading #).
 * @returns Object with members h, s and l as numbers (0..1).
 */
export function hexToHSL(hex: string): IHSLColor;

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument from a hex color string.
 * @param hex - Hex color string (with or without leading #).
 * @returns Hex color string (#000000 or #ffffff).
 */
export function hexToBW(hex: string): string;

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument from a hex color string.
 * @param hex - Hex color string (with or without leading #).
 * @returns Hex color string (#000000 or #ffffff).
 */
export function hexToWB(hex: string): string;

/**
 * Returns a grayscale value (0..1) from a hex color string.
 * @param hex - Hex color string (with or without leading #).
 * @returns Grayscale value (0..1).
 */
export function hexToGray(hex: string): number;

/* Name Functions */

/**
 * Returns a hex color string from a color name.
 * @param name - Color name (e.g., "red", "lightcoral").
 * @returns Hex color string (without leading #).
 */
export function nameToHex(name: string): string | undefined;

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b') from a color name.
 * @param name - Color name (e.g., "red", "lightcoral").
 * @returns Object with members r, g and b as numbers (0..255).
 */
export function nameToRGB(name: string): IRGBColor;

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l') from a color name.
 * @param name - Color name (e.g., "red", "lightcoral").
 * @returns Object with members h, s and l as numbers (0..1).
 */
export function nameToHSL(name: string): IHSLColor;

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument from a color name.
 * @param name - Color name (e.g., "red", "lightcoral").
 * @returns Hex color string (#000000 or #ffffff).
 */
export function nameToBW(name: string): string;

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument from a color name.
 * @param name - Color name (e.g., "red", "lightcoral").
 * @returns Hex color string (#000000 or #ffffff).
 */
export function nameToWB(name: string): string;

/**
 * Returns a grayscale value (0..1) from a color name.
 * @param name - Color name (e.g., "red", "lightcoral").
 * @returns Grayscale value (0..1).
 */
export function nameToGray(name: string): number;

/* Universal COLOR Functions */

/**
 * Returns an object containing red ('r'), green ('g') and blue ('b') from any type of valid color.
 * @overload
 */
export function colorToRGB(rgb: IRGBColor): IRGBColor;
export function colorToRGB(hsl: IHSLColor): IRGBColor;
export function colorToRGB(hex: string): IRGBColor;
export function colorToRGB(name: string): IRGBColor;

/**
 * Returns an object containing hue ('h'), saturation ('s') and lightness ('l') from any type of valid color.
 * @overload
 */
export function colorToHSL(rgb: IRGBColor): IHSLColor;
export function colorToHSL(hsl: IHSLColor): IHSLColor;
export function colorToHSL(hex: string): IHSLColor;
export function colorToHSL(name: string): IHSLColor;

/**
 * Returns a hex color string from any type of valid color.
 * @overload
 */
export function colorToHex(rgb: IRGBColor): string;
export function colorToHex(hsl: IHSLColor): string;
export function colorToHex(hex: string): string;
export function colorToHex(name: string): string;

/**
 * Returns a hex color string either black or white at highest contrast compared to the argument from any type of valid color.
 * @overload
 */
export function colorToBW(rgb: IRGBColor): string;
export function colorToBW(hsl: IHSLColor): string;
export function colorToBW(hex: string): string;
export function colorToBW(name: string): string;

/**
 * Returns a hex color string either black or white at lowest contrast compared to the argument from any type of valid color.
 * @overload
 */
export function colorToWB(rgb: IRGBColor): string;
export function colorToWB(hsl: IHSLColor): string;
export function colorToWB(hex: string): string;
export function colorToWB(name: string): string;

/**
 * Returns a hex color string of the grayscaled argument from any type of valid color.
 * @overload
 */
export function colorToGray(rgb: IRGBColor): string;
export function colorToGray(hsl: IHSLColor): string;
export function colorToGray(hex: string): string;
export function colorToGray(name: string): string;
