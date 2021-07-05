/**
 * Evaluate size of scroll bars. The size is set as CSS variable
 * `--aux-scrollbar-size` on the `body` element.
 * @returns {integer} Size in pixel.
 * @function scrollbarSize
 */
var _scrollbar_size;

export function scrollbarSize() {
  if (typeof _scrollbar_size === 'undefined') {
    var div = document.createElement('div');
    div.style.overflow = 'scroll';
    div.style.position = 'fixed';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    _scrollbar_size = div.offsetWidth - div.clientWidth;
    document.body.removeChild(div);
    document.body.style.setProperty(
      '--aux-scrollbar-size',
      _scrollbar_size + 'px'
    );
  }
  return _scrollbar_size;
}
