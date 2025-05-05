function fromGradientObject(gradient) {
  const entries = [];

  for (const entry in gradient) {
    const value = parseFloat(entry);
    const color = gradient[entry];

    entries.push({ value, color });
  }

  return entries;
}

/**
 *
 * @param {*} definition
 * @param {HTMLCanvasElement} element
 * @param {*} options
 * @returns
 */
export function computeMeterFillStyle(definition, element, options) {
  if (!definition) return 'transparent';

  const {
    _width,
    _height,
    transformation,
    snap_module,
    layout,
    base,
    segment,
  } = options;

  if (typeof definition === 'string') {
    return definition;
  } else if (typeof definition === 'function') {
    return definition;
  } else if (typeof definition === 'object') {
    const basePx = transformation.valueToPixel(base);
    const vert = layout === 'left' || layout === 'right';

    let entries = (Array.isArray(definition)
      ? definition
      : fromGradientObject(definition)
    ).map(({ color, value }) => {
      if (isNaN(value) || !isFinite(value))
        throw new TypeError(`Malformed definition entry '${entry}'.`);

      let coef;

      if (segment > 1) {
        const valuePx = transformation.valueToPixel(snap_module.snap(value));
        const segmentPx = Math.round(
          basePx + segment * Math.round((valuePx - basePx) / segment)
        );
        coef = transformation.valueToCoef(
          transformation.pixelToValue(segmentPx)
        );
      } else {
        coef = transformation.valueToCoef(snap_module.snap(value));
      }

      if (!(coef >= 0)) coef = 0;
      else if (!(coef <= 1)) coef = 1;

      return {
        value,
        color,
        coef: vert ? 1 - coef : coef,
      };
    });

    entries.sort(function (a, b) {
      return a.value - b.value;
    });

    const length = entries.length;

    if (length > 1 && entries[0].coef > entries[length - 1].coef)
      entries = entries.reverse();

    const ctx = element.getContext('2d');
    const grd = ctx.createLinearGradient(
      0,
      0,
      vert ? 0 : _width || 0,
      vert ? _height || 0 : 0
    );

    // Add all colors starting from the lowest coefficient
    entries.forEach(({ coef, color }) => {
      grd.addColorStop(coef, color);
    });

    return grd;
  } else {
    throw new TypeError('Unexpected definition type.');
  }
}

/**
 *
 * @param {Widget} widget
 * @param {HTMLCanvasElement} element
 * @param {*} definition
 * @returns
 *  Returns false if the fillstyle was modified. This usually means that
 *  the full canvas content has to be re-drawn.
 */
export function applyMeterFillStyle(widget, element, definition) {
  if (typeof definition === 'function') {
    const options = widget.options;
    const { _width, _height } = options;

    return definition.call(
      widget,
      element.getContext('2d'),
      options,
      element,
      _width,
      _height
    );
  } else {
    const ctx = element.getContext('2d');
    if (ctx.fillStyle !== definition) {
      ctx.fillStyle = definition;
      return true;
    }
  }

  return false;
}
