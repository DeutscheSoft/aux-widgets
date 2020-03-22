import { S } from '../src/index.js';

export function compare(a, b)
{
  if (a === b) return true;

  if (typeof(a) !== typeof(b)) return false;
  if (typeof(a) === 'object')
  {
    const json1 = JSON.stringify(a, Object.keys(a).sort());
    const json2 = JSON.stringify(b, Object.keys(b).sort());

    //console.log(json1, json2);

    return json1 === json2;
  }

  return false;
}

export function object_minus(o, list)
{
  const ret = Object.assign({}, o);

  for (let i = 0; i < list.length; i++)
  {
    delete ret[list[i]];
  }

  return ret;
}

export function assert(v, msg)
{
  if (!v)
  {
    debugger;
    throw new Error(msg || 'assertion failed.');
  }
}

export function assert_error(cb, msg)
{
  let ok = true;
  try
  {
    w2.remove_child(c1);
    ok = false;
  }
  catch (err) { }

  assert(ok, msg || "expected error.");
}

export function sleep(n)
{
  return new Promise((resolve) => setTimeout(resolve, n));
}

export function wait_for_event(widget, name)
{
  return new Promise((resolve, reject) => {
    const unsubscribe = widget.subscribe(name, () => {
      resolve();
      unsubscribe();
    });
  });
}

let _canvas;

export function canvas()
{
  if (!_canvas)
  {
    _canvas = document.createElement("div");
    _canvas.style.visibility = 'hidden';
    document.body.appendChild(_canvas);
  }

  return _canvas;
}

export function wait_for_drawn(widget)
{
  if (!widget.element.parentNode)
  {
    canvas().appendChild(widget.element);
    widget.enable_draw();
  }

  return new Promise((resolve, reject) => {
    S.after_frame(resolve);
  });
}
