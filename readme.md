# Polytype · [![npm version][npm badge]][npm url]

**If you are upgrading from a previous version, note that usage has changed.**
**Change your imports to `"polytype/global"` to keep using the script build.**
**Check the [Setup Instructions](#setup-instructions) for details.**

---

**Dynamic multiple inheritance for JavaScript and TypeScript. Without mixins.**

**Polytype** is a library that adds support for dynamic
[multiple inheritance](https://en.wikipedia.org/wiki/Multiple_inheritance) to JavaScript and
TypeScript with a simple syntax.
“Dynamic” means that changes to base classes at runtime are reflected immediately in all derived
classes just like programmers would expect when working with single prototype inheritance.

Polytype uses
[proxies](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
along with other relatively new language features to provide multiple inheritance.
Some of these features are not yet well supported in all browsers.
As of today, Polytype runs in **current versions of Chrome, Firefox, Safari, Opera and in Node.js**.
As JavaScript support in other browsers improves, Polytype will start to run in those browsers, too.

## Contents

- [Contents](#contents)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
  * [In Node.js](#in-nodejs)
  * [In the browser](#in-the-browser)
- [Usage](#usage)
  * [Inheriting from multiple base classes](#inheriting-from-multiple-base-classes)
  * [Using methods and properties from multiple base classes](#using-methods-and-properties-from-multiple-base-classes)
  * [Static methods and properties](#static-methods-and-properties)
  * [Invoking multiple base constructors](#invoking-multiple-base-constructors)
  * [`instanceof`](#instanceof)
  * [`in`](#in)
  * [`isPrototypeOf`](#isprototypeof)
  * [Finding the base classes](#finding-the-base-classes)
  * [Dynamic base class changes](#dynamic-base-class-changes)
- [TypeScript support](#typescript-support)
- [Caveats](#caveats)
  * [`for...in` iterations](#forin-iterations)
  * [Member resolution order](#member-resolution-order)
  * [Ambiguous protected instance members](#ambiguous-protected-instance-members)
- [Compatibility](#compatibility)

## Features

* Python style multiple inheritance
* Works in Node.js and in most browsers
* Full TypeScript support
* Zero dependencies
* Qualified or unqualified access to all base class features
  * constructors
  * methods, getters and setters – both static and nonstatic
  * value properties on base classes and base instance prototypes
  * public [class fields](https://github.com/tc39/proposal-class-fields) (in engines that support
    them)
* `in`, `instanceof` and `isPrototypeOf` integration

## Setup Instructions

Polytytpe is available in two flavors: a module build (comprising CommonJS and ECMAScript modules)
with exported definitions, and a script build where all definitions are accessible through global
objects.
Apart from this, both builds provide the same features and are available in the standard package.

You are free to choose whichever build of Polytype best fits your requirements, but make sure to
remain consistent throughout your application: mixing the module and the script builds together is
not recommended and may produce unexpected results.

### In Node.js

If you are using Node.js, you can install Polytype with [npm](https://www.npmjs.org).

```console
npm install polytype
```

Then you can import it in your code like any module.

```js
const { classes } = require("polytype"); // CommonJS syntax
```
or
```js
import { classes } from "polytype"; // ECMAScript module syntax
```

In TypeScript you can also import certain types where necessary.

```ts
import { SuperConstructorInvokeInfo } from "polytype";
```

Alternatively, you can import the script build at the start of your application and access Polytype
definitions through global objects.

```js
require("polytype/global"); // CommonJS syntax
```
or
```js
import "polytype/global"; // ECMAScript module syntax
```

### In the browser

In an HTML‐based application, the script build of Polytype can be simply embedded.
Just download [polytype.min.js][polytype.min.js] from GitHub and include it in your HTML file.

```html
<script src="polytype.min.js"></script>
```

Alternatively, you can hotlink the current stable version using a CDN of your choice.

```html
<script src="https://cdn.statically.io/gh/fasttime/Polytype/0.6.0-beta.1/lib/polytype.min.js"></script>
```

If your browser application already uses ECMAScript modules, you can also import the module build
(“.mjs”) in contexts where Polytype specific definitions like `classes` are required.
This has the advantage to avoid possible naming conflicts on global objects.

```js
import { classes } from "https://cdn.statically.io/gh/fasttime/Polytype/0.6.0-beta.1/lib/polytype.min.mjs";
```

## Usage

### Inheriting from multiple base classes

For example, declare a derived class `ColoredCircle` that inherits from both base classes `Circle`
and `ColoredObject`.

```js
class Circle
{
    constructor(centerX, centerY, radius)
    {
        this.moveTo(centerX, centerY);
        this.radius = radius;
    }
    get diameter() { return this.radius * 2; }
    set diameter(diameter) { this.radius = diameter / 2; }
    moveTo(centerX, centerY)
    {
        this.centerX = centerX;
        this.centerY = centerY;
    }
    toString()
    {
        return `circle with center (${this.centerX}, ${this.centerY}) and radius ${this.radius}`;
    }
}

class ColoredObject
{
    constructor(color) { this.color = color; }
    static areSameColor(obj1, obj2) { return obj1.color === obj2.color; }
    paint() { console.log(`painting in ${this.color}`); }
    toString() { return `${this.color} object`; }
}

class ColoredCircle
extends classes(Circle, ColoredObject) // Base classes as comma‐separated params
{
    // Add methods here.
}
```

### Using methods and properties from multiple base classes

```js
const c = new ColoredCircle();

c.moveTo(42, 31);
c.radius = 1;
c.color = "red";
console.log(c.centerX, c.centerY);  // 42, 31
console.log(c.diameter);            // 2
c.paint();                          // "painting in red"
```

As usual, the keyword `super` invokes a base class method or property accessor when used inside a
derived class.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    paint()
    {
        super.paint(); // Using method paint from some base class
    }
}
```

If different base classes include a member with the same name, the syntax
```js
super.class(DirectBaseClass).member
```
can be used to make the member access unambiguous.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    toString()
    {
        // Using method toString from base class Circle
        const circleString = super.class(Circle).toString();
        return `${circleString} in ${this.color}`;
    }
}
```

More generally, `super.class(DirectBaseClass)[propertyKey]` can be used to reference a property of a
particular base class in the body of a derived class.

**Note:**
In TypeScript, the syntax described here cannot be used to access protected instance members, so it
is currently not possible to disambiguate between protected instance members having the same name,
the same index or the same symbol in different base classes.

### Static methods and properties

Static methods and property accessors are inherited, too.

```js
ColoredCircle.areSameColor(c1, c2)
```
same as
```js
ColoredObject.areSameColor(c1, c2)
```

### Invoking multiple base constructors

Use arrays to group together parameters for each base constructor in the derived class constructor.

```js
class ColoredCircle
extends classes(Circle, ColoredObject)
{
    constructor(centerX, centerY, radius, color)
    {
        super
        (
            [centerX, centerY, radius], // Circle constructor params
            [color]                     // ColoredObject constructor params
        );
    }
}
```

If you prefer to keep parameter lists associated to their base classes explicitly without relying on
order, there is an alternative syntax.

```js
class GreenCircle
extends classes(Circle, ColoredObject)
{
    constructor(centerX, centerY, radius)
    {
        super
        (
            { super: ColoredObject, arguments: ["green"] },
            { super: Circle, arguments: [centerX, centerY, radius] }
        );
    }
}
```

There is no need to specify an array of parameters for each base constructor.
If the parameter arrays are omitted, the base constructors will still be invoked without parameters.

```js
class WhiteUnitCircle
extends classes(Circle, ColoredObject)
{
    constructor()
    {
        super(); // Base constructors invoked without parameters
        this.centerX    = 0;
        this.centerY    = 0;
        this.radius     = 1;
        this.color      = "white";
    }
}
```

### `instanceof`

The `instanceof` operator works just like it should.

```js
const c = new ColoredCircle();

console.log(c instanceof Circle);           // true
console.log(c instanceof ColoredObject);    // true
console.log(c instanceof ColoredCircle);    // true
console.log(c instanceof Object);           // true
console.log(c instanceof Array);            // false
```

In pure JavaScript, the expression
```js
B.prototype instanceof A
```
determines if `A` is a base class of class `B`.

Polytype takes care that this test still works well with multiple inheritance.

```js
console.log(ColoredCircle.prototype instanceof Circle);         // true
console.log(ColoredCircle.prototype instanceof ColoredObject);  // true
console.log(ColoredCircle.prototype instanceof ColoredCircle);  // false
console.log(ColoredCircle.prototype instanceof Object);         // true
console.log(Circle.prototype instanceof ColoredObject);         // false
```

### `in`

The `in` operator determines whether a property is in an object or in its prototype chain.
In the case of multiple inheritance, the prototype “chain” looks more like a directed graph, yet the
function of the `in` operator is the same.

```js
const c = new ColoredCircle();

console.log("moveTo" in c); // true
console.log("paint" in c);  // true
```

```js
console.log("areSameColor" in ColoredCircle);   // true
console.log("areSameColor" in Circle);          // false
console.log("areSameColor" in ColoredObject);   // true
```

### `isPrototypeOf`

`isPrototypeOf` works fine, too.

```js
const c = new ColoredCircle();

console.log(Circle.prototype.isPrototypeOf(c));         // true
console.log(ColoredObject.prototype.isPrototypeOf(c));  // true
console.log(ColoredCircle.prototype.isPrototypeOf(c));  // true
console.log(Object.prototype.isPrototypeOf(c));         // true
console.log(Array.prototype.isPrototypeOf(c));          // false
```

```js
console.log(Circle.isPrototypeOf(ColoredCircle));               // true
console.log(ColoredObject.isPrototypeOf(ColoredCircle));        // true
console.log(ColoredCircle.isPrototypeOf(ColoredCircle));        // false
console.log(Object.isPrototypeOf(ColoredCircle));               // false
console.log(Function.prototype.isPrototypeOf(ColoredCircle));   // true
```

### Finding the base classes

In single inheritance JavaScript, the direct base class of a derived class is obtained with
`Object.getPrototypeOf`.

```js
const DirectBaseClass = Object.getPrototypeOf(DerivedClass);
```

If a class has no explicit `extends` clause, `Object.getPrototypeOf` returns `Function.prototype`,
the base of all classes.

Of course this method cannot work with multiple inheritance, since there is no way to return
multiple classes without packing them in some kind of structure.
For this and other use cases, Polytype exports the function `getPrototypeListOf`, which can be used
to get an array of direct base classes given a derived class.

```js
const { getPrototypeListOf } = require("polytype"); // Or some other kind of import.

function getBaseNames(derivedClass)
{
    return getPrototypeListOf(derivedClass).map(({ name }) => name);
}

console.log(getBaseNames(ColoredCircle));   // ["Circle", "ColoredObject"]
console.log(getBaseNames(Int8Array));       // ["TypedArray"]
console.log(getBaseNames(Circle));          // [""] i.e. [Function.prototype.name]
```

If you use the script build of Polytype, no functions will be exported.
Instead, `getPrototypeListOf` will be defined globally as `Object.getPrototypeListOf`.

### Dynamic base class changes

If a property in a base class is added, removed or modified at runtime, the changes are immediately
reflected in all derived classes.
This is the magic of proxies.

```js
const c = new ColoredCircle();

Circle.prototype.sayHello = () => console.log("Hello!");
c.sayHello(); // "Hello!"
```

## TypeScript support

Polytype has built‐in TypeScript support: you can take advantage of type checking while working with
multiple inheritance without installing any additional packages.
If you are using an IDE that supports TypeScript code completion like Visual Studio Code, you will
get multiple inheritance sensitive suggestions as you type.
A TypeScript version of the `ColoredCircle` sample code above can be found in
[ColoredCircle.ts](https://github.com/fasttime/Polytype/blob/0.6.0-beta.1/example/ColoredCircle.ts)
in the example folder.

## Caveats

Neither JavaScript nor TypeScript offer native support for multiple inheritance of any kind.
Polytype strives to make up for this deficiency, but some important limitations remain.

### `for...in` iterations

In plain TypeScript, without Polytype, a `for...in` iteration over a class constructor will
enumerate not only names of static fields defined on that class, but also names of static fields
defined on all base classes in its prototype chain.

```ts
class FooClass
{
    static foo = "foo";
}

class BarClass extends FooClass
{
    static bar = "bar";
}

for (const name in BarClass)
    console.log(name); // Prints "bar" and "foo".
```

Additionally, some newer JavaScript engines have implemented support for
[static public fields](https://github.com/tc39/proposal-static-class-features#static-public-fields),
which work much like in TypeScript, but without transpiling.
Even in JavaScript, a `for...in` iteration over a class constructor will include names of static
fields defined on base classes.

Anyway, this behavior breaks with Polytype inheritance on static fields: names of static fields
defined on base classes are not enumerated by `for...in` statements if the inheritance line crosses
the constructor of a class in some `extends classes(...)` clause.

```ts
class BazClass extends classes(FooClass)
{
    static baz = "baz";
}

for (const name in BazClass)
    console.log(name); // Prints just "baz".
```

For this reason, and because generally [better alternatives exist][Why Use for...in?], iterating
over Polytype classes and their derived classes with `for...in` is not recommended.

### Member resolution order

Multiple base classes may expose members with the same name, the same index or the same symbol.
When this happens, any unqualified access to one of those members will have to determine the
implementation to be used.
The approach taken by Polytype is to pick the implementation found in the first direct base class
that contains the (possibly inherited) member.

```js
class A
{ }

class B
{
    whoAmI() { console.log("B"); }
}

class C
{
    whoAmI() { console.log("C"); }
}

class ABC extends classes(A, B, C)
{ }

const abc = new ABC();
abc.whoAmI(); // Prints "B".
```

This is similar to the depth‐first search algorithm of old‐style classes in Python 2, but it is
different from the behavior of several other programming languages that support multiple
inheritance, and it may not match your expectations if you come from a C++ background.

### Ambiguous protected instance members

TypeScript class members can have
[protected](https://www.typescriptlang.org/docs/handbook/classes.html#understanding-protected)
access: protected members are inherited just like public members but can only be accessed in the
body of the defining class itself or of a derived class.
If a derived class inherits from multiple base classes, it is possible for inherited members in
different base classes to share the same property key, i.e. the same name, the same index or the
same symbol.
In this case, Polytype provides the syntax `super.class(DirectBaseClass)[propertyKey]` to specify
the base class containing the member to be accessed.
This works fine for all public or static members, but results in a compiler error when applied to
protected instance members.

```ts
class Apple
{
    protected id: number;
}

class Banana
{
    protected id: number;
}

class Bananapple extends classes(Apple, Banana)
{
    get bananaId()
    {
        return super.class(Banana).id; // error TS2446: Property 'id' is protected…
    }
}
```

As a workaround, you could use an intermediate class to expose the inherited member with a different
name without making it public.

```ts
class BananaProxy extends Banana
{
    get bananaId()
    {
        return super.id;
    }
}

class Bananapple extends classes(Apple, Banana)
{ }
```

## Compatibility

Polytype was successfully tested in the following browsers / JavaScript engines.

* Chrome 63+
* Firefox 67+
* Safari 13+
* Opera 50+
* Node.js 10.6+

The minimum supported TypeScript version is 3.5.

In the current version of the Edge browser, the JavaScript engine Chakra still contains
[a serious bug](https://github.com/Microsoft/ChakraCore/issues/5883) that can produce incorrect
results when the `instanceof` operator is used with bound functions after Polytype has been loaded.
For this reason it is recommended not to use Polytype in Edge as long as this issue persists.

[npm badge]: https://badge.fury.io/js/polytype.svg
[npm url]: https://www.npmjs.com/package/polytype
[polytype.min.js]:
https://raw.githubusercontent.com/fasttime/Polytype/0.6.0-beta.1/lib/polytype.min.js
[Why Use for...in?]:
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...in#Why_Use_for...in
