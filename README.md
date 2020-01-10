# ![AUX](logo.png)

AUX is a JavaScript widget library with special focus on building low
latency user interfaces for audio applications. It contains a wide range
of widgets such as faders, knobs, levelmeters and equalizers.

## Repository structure

The JavaScript code in this repository uses ES6 modules. When
integrating AUX into an application it should be sufficient to import
the required widgets or components from the main file `src/index.js`.

AUX widgets are implemented as JavaScript widgets. Some of those widgets
have corresponding WebComponents. All widgets can be found under
`src/widgets/` and the corresponding components are located at
`src/components/`. The document `doc/docs/Components.md` describes how
the components work.

Default themes can be found in the `styles` directory. The document
`doc/docs/Themeing.md` describes how to create themes based no the
default theme(s) contained in this repository.

## Installation

AUX can be installed using `npm`. In order to gain access to all components,
simply import them all using

    import 'aux';

and include the default theme into your web application.

## Design Goals

AUX is written in pure JavaScript and has no external dependencies. It
is supposed to run in browsers which support ECMAScript 6. When transpiled to
ECMAScript 5 it should work in modern versions of Chrome, Edge, Firefox and
Safari.

AUX was designed to be lightweight and fast while keeping the full
flexibility which comes with CSS. AUX widgets offer consistent and intuitive
APIs.

## Documentation

The complete API documentation can be found at [http://docs.deuso.de/].

Alternatively, the documentation can be directly built from the source
code.  The documentation in the source files uses the common jsdoc
syntax and [JSDoc 3](https://usejsdoc.org).  can be used to generate the
documentation. If you have jsdoc installed, simply run

    npm run build

inside the `doc` directory.

Apart from the documentation inside the source tree, there are several
longer introductory articles and usage examples in the directories
`doc/docs/`.

## Examples

Several component examples can be found in seperate HTML files in the
`examples/` directory. When serving the repository from a HTTP server
all examples can be viewed when opening the file `examples.html`.

## Demos

Several online demos of interfaces using AUX can be found at
[http://demo.deuso.de].

## Reporting Bugs

If you find a bug in this software, please report it to our issue
tracker at [https://gitlab.deuso.de/WebUI/AUX].

## License

AUX is released unter the the terms of the GPLv3. See the file `COPYING`
file for details.

Copyright (c) 2013-2020 Markus Schmidt <markus@deuso.de>

Copright (c) 2014-2020 Arne G&ouml;deke <arne@deuso.de>
