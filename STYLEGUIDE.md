# Code Style Guide

The code is prettified with `prettier` node module.

General styling is 2 spaces for tabbing, single quotes, braces on the
same line and around 80 chars per line.

## Naming conventions

* Classes: PascalCase (abbrevations uppercase, e.g. RGB, HTML or DOM)
* Functions: camelCase (abbrevations uppercase, e.g. RGB, HTML or DOM)
* variables, members, options ad attributes: lower_case_with_underscore
* Private members: \_my_private_member
* More private members: \__my_very_private_member
* CSS classes: aux-myclassname
* Event names: myeventname

## Spaces

* No spaces between `function` and arguments
* Spaces around operators
* Spaces after comma
* No spaces between first and last member of array and object brackets

## Examples

```
function myFunction(foo, bar) {
  return foo + bar;
}

const my_array = [1, 2, 3, 4];
const myString = 'foobar';
```
