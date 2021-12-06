/**
 * Evaluate size of scroll bars. The size is set as CSS variable
 * `--aux-scrollbar-size` on the `body` element.
 * @returns {void}
 * @function scrollbarSize
 */
let scrollbarMeasured = false;

function measureScrollbarSize() {
  const div = document.createElement('div');
  div.style.overflow = 'scroll';
  div.style.position = 'fixed';
  div.style.visibility = 'hidden';
  document.body.appendChild(div);
  const size = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);
  document.body.style.setProperty(
    '--aux-scrollbar-size',
    size + 'px'
  );
}

export function scrollbarSize() {
  if (scrollbarMeasured) return;
  scrollbarMeasured = true;

  if (document.body)
    measureScrollbarSize();
  else
    document.addEventListener('DOMContentLoaded', measureScrollbarSize);
}

window.addEventListener('resize', measureScrollbarSize);
