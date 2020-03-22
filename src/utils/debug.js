export function check_visibility(widget) {
  let drawn = widget.is_drawn();
  
  if (drawn) while (widget)
  {
    let element = widget.element;

    if (element.classList.contains('aux-hide'))
    {
      throw new Error('found aux-hide on element while drawn.');
    }
    widget = widget.parent;
  }
  else
  {
    let element = widget.element;

    if (element.classList.contains('aux-show'))
    {
      throw new Error('found aux-show on element while !drawn.');
    }
  }
}
