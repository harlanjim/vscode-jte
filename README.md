# JTE Extension for VS Code

This extension provides support for Java Template Engine (JTE) files in Visual Studio Code.

## Features

This extension provides code completion for JTE templates.
So far it has support for the following:

- @import 
- @param
- ${...}

## Requirements

There are no requirements or dependencies for this extension.

## Extension Settings
Not extracting the java classes in the jdk. so the user can add their own classes to the list.
- common.jdk.classes

The list of jte directives is configurable in the settings.
- @.completions

The list of java types is configurable in the settings.
- java.types

## Known Issues

- No code completion for object methods.
- No help for @if, @for or @template

## Release Notes

### 0.0.1

Initial release of JTE code completion.

