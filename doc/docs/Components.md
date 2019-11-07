# Components

Most AUX widgets have corresponding WebComponents implementations.
The component implementation maps options of AUX widgets onto both
attributes and properties. This means that components have getters and
setters for each widget option. Exceptions to this are those options
which would collide with properties of the component base class.
Examples for this are the `value` or `placeholder` options of the
`ValueComponent` which extends `HTMLInputElement`.

When setting a property to `undefined`, the widget option will be reset
to the default value.

Widget options can also be set on components as attributes. In that case
the component will interpret the attribute value based on the type of
the option. To control how the attribute is interpreted, it the
attribute may be prefixed by the format type.

Example:
    
      <aux-fader min='number:-20' max='number:6'></aux-fader>

The format types which exist are

* `js`, `javascript` - interprets the attribute as JavaScript code
* `json` - parses the attribute as JSON
* `html` - turns the attribute into a `DocumentFragment`
* `string` - the attribute is used as-is
* `number` - parses the attribute using `parseFloat`
* `int` - parses the attribute using `parseInt`
* `sprintf` - turns the attribute into a sprintf-like formatting
  function
* `boolean` - `"true"` or `"false"`.
