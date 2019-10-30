# Themeing of AUX

The AUX widget library comes with a slim default theme, based on the color scheme of the AUX brand. It is split into different layers of CSS to offer a starting point for different approaches. From editing a handful of color variables down to low-level theme design various development paths are possible.

## aux.css

`aux.css` is a variable-based high-level color theme representing the AUX color scheme. If you want to start development out-of-the-box to concentrate on the design later, include this style sheet into your project and start development, it already includes all its dependencies.

To play around with color schemes add a `<style></style>` section to your main HTML file or add a new CSS file to the project with a copy of the variables section of `aux.css` from the `:root` block at the top of the file. Change the colors to get an impression of different combinations.

If you need further, minor changes, start overwriting existing definitions in a new file or a `<style></style>` tag.

If you feel the need for heavier intervention, copy `aux.css` to a new location and start editing the new file directly. Include this one instead of `aux.css` into your project and make sure the import of the dependency `basics.css` points to the correct location relative to your new file.

If you find yourself overwriting and correcting a vast amount of rules maybe starting creating your own theme might be the better idea.

## basics.css

`basics.css` is a second layer of CSS taking care of lengths like paddings, margins and the like. It is not as high-level as `aux.css`, not as low-level as `essentials.css` but more like a launch pad for custom themes. Lots of variables at the top give some control over the general appearance apart from the design, but the main use case is to give widgets some dimensions, positioning and other defaults to make them at least appear on the screen - unstyled but in the right place.

Use it as a dependency for your own custom theme, overwrite the default variables to make it fit your design ideas or start overwriting/adding rules for heavier changes.

Maybe your imagination goes way beyond the direction `aux.css` and `basics.css` are taking and you want to create your own highly customized theme, the only thing which is really needed is `essentials.css`.

## essentials.css

`essentials.css` is a technical dependency for all AUX widgets and is required for the functionality of the library. Experts might feel the need to overwrite even rules from this layer of CSS but be warned - changes can lead to unpredicted results. It is not recommended to skip this file while developing a theme from scratch, neither is making any changes to it.

# Icons

AUX widget library comes with a set of icons. To see a list of available icons open the file `styles/fonts/AUX.html` in a browser. This set will grow in the future while keepig backwards compatibility. It occupies private space unicode chars from &#x100000; onwards. A depending CSS file defines rules to offer classes like `.aux-icon.gear` or `.aux-icon.lowpass`. Additionally these icons can be used directly in the `Icon` widget, e.g. `<awml-icon icon=play></awml-icon>` or `<awml-button icon=question></awml-button>`.
