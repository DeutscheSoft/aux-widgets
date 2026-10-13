# Widgets inside the DOM

This document describes briefly how AUX widgets can be used inside of a HTML layout.

Widgets are organized in a tree. This tree will usually be similar to the DOM
tree, where each widget consists of at least one DOM element. There may be
several disconnected widget trees at the same time. The root of a widget tree
should always be a widget which is a subclass of Root. The Root widget takes
care of document visibility changes (so drawing can be paused when the page is
hidden).

By default all Widgets are represented by DOM Elements with `display: inline-block`.
When laying out an interface they can therefore be absolutely positioned inside
a container.
Alternatively, they can also simply be floating, which makes it easier to build grid-like layouts
which reorganize themselves depending on window size.

However, utilizing CSS features like grid and flexbox is recommended.

All widgets can be given a size using CSS alone.
This makes it possible to build fully responsive layouts by using CSS only.

## Resize handling

Widgets that need to remeasure when their box changes declare a renderer
dependency on `SymResize`. Those widgets automatically install a
`ResizeObserver` on `getResizeTargets()` (or `this.element` by default), and
also remeasure after font/window `load` when text metrics may change without
the border box changing.

Viewport-dependent work (for example dialog repositioning) uses
`SymWindowResize` instead; those widgets subscribe to the global window resize
signal without walking the widget tree.

There is no recursive resize cascade: resizing the window does not invalidate
every descendant. Only widgets that declare a resize dependency do work.

If you change a widget's size from JavaScript (for example by setting styles),
widgets that observe their own element will pick that up via `ResizeObserver`.
You can also call `triggerResize()` on a widget that depends on `SymResize` to
invalidate its measure tasks explicitly; this does not recurse into children.
