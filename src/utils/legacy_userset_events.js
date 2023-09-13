export function applyLegacyUsersetEventsRanged(
  widget,
  transformation,
  snap_module,
  key,
  value
) {
  const snappedValue = snap_module.snap(transformation.clampValue(value));

  if (false === widget.emit('userset', key, value, snappedValue)) return false;
  widget.set(key, value);
  widget.emit('useraction', key, snappedValue, value);
  return true;
}
