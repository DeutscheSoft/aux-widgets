# Using AUX with Angular

AUX can be integrated into an Angular project simply by installing it as a
dependency. AUX Widgets are exposed as WebComponents using the v1 WebComponents API, which
is supported in modern browser. To import all AUX Components into an Angular
project add a global import to the top level module.

    import '@deutschesoft/aux-widgets';

Importing the standard AUX CSS theme can be done by adding
`node_modules/@deutschesoft/aux-widgets/styles/main.css` to the `styles` list in the
`angular.json` configuration file.

In order to use WebComponents inside of Angular templates, the corresponding Angular
module needs to have the `CUSTOM_ELEMENTS_SCHEMA`. Once that is set up, AUX
Components should work within Angular templates.

## Setting options

All options of AUX Widgets are available via usual tag attributes and can be set
from within the template.

    <aux-fader min=-96 max=6></aux-fader>

In order to set attributes on WebComponents dynamically, a special Angular
syntax needs to be used.

    <aux-fader min=-96 max=6 [attr.value]="myValue"></aux-fader>

A cleaner pattern is to avoid using attributes for dynamic options and
instead set the property on the DOM object directy. They are mapped onto AUX
Widget options automatically.

    <aux-fader min=-96 max=6 [value]="myValue"></aux-fader>

## Subscribing to events

All AUX Widget events are available via standard DOM custom events. Unlike DOM
events, AUX Widget events have a list of arguments. They are available in the
CustomEvent object as `ev.detail.args`.

For instance, for option changes triggered by user interaction, AUX widgets define
one standard event called `useraction`. It has two events, the option name and
the new value. The following event handler would call the method
`onValueChanged` with a two element array.

    <aux-fader min=-96 max=6 (useraction)="onValueChanged($event.detail.args)">
    </aux-fader>

# AUX Angular Directives

The AUX repository contains implementations of several Angular directives which
aim to make bindings between AUX Widget options and Angular components simpler
and more performant than relying on custom DOM events. The implementation of
those Angular Directives can be found in the `angular` subdirectory. They can be
added to an Angular application by importing them

    import { AuxDirectivesModule } from '@deuso/aux/angular/aux-directives.module';

and adding them to the `imports` list of the `@NgModule` declaration.

In addition is is necessary to add all typescript files for the AUX Angular
directives into the `"include"` entry in `tsconfig.app.json` to allow the
typescript compiler to find them:

    "include": [
      "src/**/*.ts",
      "node_modules/@deuso/aux/angular/*.ts"
    ],

## Observing value changes

This group of directives can be used to observe changes of AUX Widget options.
These directives can be used to subscribe to changes to any number of options.
They expect an Object as argument with options names as keys. The values can
either be a function or an object implementing a `next()` method, such as
`Subject` or the more general `Observer` interface of RxJS.
The directives will automatically manage subscriptions and notify the
subscriber when values change.

Note that when supplying a method to one of these directives as a handler, it
needs to be bound to the component. This can be achieved by using
`myMethod.bind(this)`. Otherwise the callback will not be executed in the scope
of the component.

### The `auxObserve` directive

The `auxObserve` directive reacts to value changes triggered by user
interaction. It will not trigger when the corresponding options is set
programmatically. It is a good way to transfer value changes to a back end.

    <aux-fader min=-96 max=6 [auxObserve]="{ value: value_subject }">
    </aux-fader>

### The `auxObserveAll` directive

The `auxObserveAll` directive reacts to all changes to an option. This means
that it will also trigger when the option has been changed programmatically,
e.g. by setting the corresponding property. It will also emit the current value
of the option initially, similarly to how `BehaviorSubject` or `ReplaySubject`
work in RxJS.

It can be useful when synchronizing options between several widgets regardless
of whether the change was made by the user.

    <aux-fader min=-96 max=6 [auxObserveAll]="{ value: value_subject }">
    </aux-fader>

### The `auxIntercept` directive

The `auxIntercept` directive reacts to changes to an option triggered by a user
and prevents it being applied to the widget. This makes it possible to e.g.
externally check if a parameter is valid before feeding it back into the widget.

    <aux-fader min=-96 max=6 [auxIntercept]="{ value: clip_value }">
    </aux-fader>

## Observing AUX Widget events

### The `auxSubscribe` directive

The `auxSubscribe` directive can be used to subscribe to a number of AUX Widget
events. As with the value observe directives it expects an object which contain
either functions or observers. Functions are called with the AUX event
arguments. Observers receive the array of arguments as the value.

Using `auxSubscribe` can be more convenient when working with `Subject`s than
using the DOM custom events as described above. It is also more efficient
because it avoids the translation to and from DOM events.

## Binding options using `auxBind`

Binding backend values to AUX widget options can be done simply by setting the
property. However, when doing this while a user is interacting with the widget
leads to very poor user experience. For instance, a fader value would jump while
being dragged if the back end connection has network delay.

The `auxBind` can be used to prevent such issues when binding options to backend
data. It internally uses the `DebounceBinding` class which is part of AUX. It
delays received values

- while the `interacting` option is `true` on a widget or
- for a certain number of milliseconds after the option was changed by user
  action.

The delay used in the `auxBind` option is 250 milliseconds.

Similar to all other directives, the arguments of the `auxBind` is an object
containing several options. If the value is a object which implements the
`Observable` interface it uses the emitted values, otherwise it passes the value
itself.

    <aux-fader min=-96 max=6 [auxBind]="{ value: value_observable }">
    </aux-fader>

## Notifying widgets of resize events

Some widgets need to be redrawn when their size changes. This applies for
instance to those widgets which contain scales. Other examples are charts with
grids and similar. Widgets automatically react to the size of the browser window
changing, however they do not detect if the widget has changed its size for
some other reason. Some modern browsers support an API called `ResizeObserver`,
however, it is not broadly enough supported, yet, to be relied upon. In order to
notify a widget that a resize happened, the `trigger_resize()` method needs to
be called. This can be done using the directive `auxResize`. Its argument is an
observable.

In future versions when `ResizeObserver` is supported more broadly, this directive
will become a no-op.

# Caveats

## Order of options

In principle the order of options should not matter. However, there are
_currently_ some exceptions to this rule. For instance, the `value` option is
usually clipped to the range `min .. max` when being set. For these situations
it is important to make sure that options such as `min` and `max` are set before
setting the value. When using standard WebComponents with attributes, the set of
initial options is set at once on creation of the Widget. However, when using
WebComponents in Angular, the attributes are not applied on creation but
afterwards separately. They are currently added in the order in which they appear in
the template. It is therefore advisable to apply `min`, `max` and similar
options at the beginning. Example:

    <aux-fader min=-96 max=6 value=3></aux-fader>
