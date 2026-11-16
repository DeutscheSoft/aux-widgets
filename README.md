# ![AUX](aux_logo_4c.svg)

AUX is a JavaScript widget library for low-latency audio UIs — faders, knobs,
levelmeters, equalizers, and more. It has no external dependencies and relies
on ES modules and CSS variables.

## Repository structure

Widgets live in `src/widgets/`. Default themes are under `styles/`; see
[`doc/docs/Theming.md`](doc/docs/Theming.md) for building your own.

## Installation

```
npm i @deutschesoft/aux-widgets
```

```js
import { Fader, Knob } from '@deutschesoft/aux-widgets';
```

All widgets are re-exported from that package entry. Include a default theme
stylesheet in your app as well.

## Examples

Serve the project root and open `/examples.html` for a playground of all
widgets.

## Demos

Online demos: [http://demo.deuso.de](http://demo.deuso.de).

## License

AUX is released under the terms of the GPLv3. See `COPYING` for details.
Commercial licensing and support are available from
[DeusO GmbH](https://deuso.de/).

Copyright (c) 2013-2026 Markus Schmidt <markus@deuso.de>

Copyright (c) 2014-2026 Arne G&ouml;deke <arne@deuso.de>

Copyright (c) 2014-2026 DeusO GmbH
