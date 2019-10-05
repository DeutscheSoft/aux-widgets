# ![AUX](logo.png)

AUX is a JavaScript widget library with special focus on building
low latency user interfaces for audio applications. It contains a wide range
of widgets such as faders, knobs, levelmeters and equalizers.

## Design Goals

AUX is written in pure JavaScript and has no external dependencies.
It is supposed to run in browsers which support ECMAScript 5 including
IE9. AUX was designed to be lightweight and fast while keeping the
full flexibility which comes with CSS. AUX widgets offer consistent
and intuitive APIs.

## Documentation

The complete API documentation can be found at [http://docs.deuso.de/].
The documentation contains interactive examples for many Widgets.

Alternatively, the documentation can be directly built from the source code.
The documentation in the source files uses the common jsdoc syntax and [JSDoc 3](https://usejsdoc.org).
can be used to generate the documentation. If you have jsdoc installed, simply run

    make jsdoc

Apart from the documentation inside the source tree, there are several longer
introductory articles and usage examples in the directories `doc/docs/` and `doc/tutorials/`.
These articles automatically get added to the generated documentation by our jsdoc configuration.

## Demos

Several online demos of interfaces using AUX can be found at [http://demo.deuso.de].
All of those demos are written in [AWML](https://github.com/DeutscheSoft/AWML), which is
a HTML5 based markup language, which can be used to create AUX-based interfaces.

For most use-cases using AWML is much more convenient than building an interface in
JavaScript using AUX directly.

## Reporting Bugs

When you find a bug in this software, please report it to our issue tracker at [https://github.com/DeutscheSoft/toolkit].

## License

AUX is released unter the the terms of the GPLv3. See the file `COPYING`
file for details.

Copyright (c) 2013-2019 Markus Schmidt <markus@deuso.de>

Copyright (c) 2014-2019 Arne G&ouml;deke <arne@deuso.de>
