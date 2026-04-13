---
title: JSDoc 参考
---

以下列表概述了在使用 JSDoc 注解为 JavaScript 文件提供类型信息时，当前支持的构造。

注意：
- 任何未在下面明确列出的标签（如 `@async`）目前均不受支持。
- 仅在 TypeScript 文件中支持文档标签。其余标签仅在 JavaScript 文件中受支持。

#### 类型

- [`@type`](#type)
- [`@import`](#import)
- [`@param`](#param-and-returns)（或 [`@arg`](#param-and-returns) 或 [`@argument`](#param-and-returns)）
- [`@returns`](#param-and-returns)（或 [`@return`](#param-and-returns)）
- [`@typedef`](#typedef-callback-and-param)
- [`@callback`](#typedef-callback-and-param)
- [`@template`](#template)
- [`@satisfies`](#satisfies)

#### 类

- [属性修饰符](#property-modifiers) `@public`、`@private`、`@protected`、`@readonly`
- [`@override`](#override)
- [`@extends`](#extends)（或 [`@augments`](#extends)）
- [`@implements`](#implements)
- [`@class`](#constructor)（或 [`@constructor`](#constructor)）
- [`@this`](#this)

#### 文档

文档标签在 TypeScript 和 JavaScript 中均可使用。

- [`@deprecated`](#deprecated)
- [`@see`](#see)
- [`@link`](#link)

#### 其他

- [`@enum`](#enum)
- [`@author`](#author)
- [其他支持的模式](#other-supported-patterns)
- [不支持的模式](#unsupported-patterns)
- [不支持的标签](#unsupported-tags)

其含义通常与 [jsdoc.app](https://jsdoc.app) 上给出的标签含义相同，或是其超集。
下面的代码描述了差异并给出了每个标签的示例用法。

**注意：** 你可以使用 [Playground 来探索 JSDoc 支持](https://www.typescriptlang.org/play?useJavaScript=truee=4#example/jsdoc-support)。

## 类型

### `@type`

你可以使用 "@type" 标签引用类型。该类型可以是：

1. 原始类型，如 `string` 或 `number`。
2. 在 TypeScript 声明中声明的，可以是全局的或导入的。
3. 在 JSDoc [`@typedef`](#typedef-callback-and-param) 标签中声明的。

你可以使用大多数 JSDoc 类型语法和任何 TypeScript 语法，从 [最基本的如 `string`](https://www.typescriptlang.org/docs/handbook/2/basic-types.html) 到 [最高级的如条件类型](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)。

```js twoslash
/**
 * @type {string}
 */
var s;

/** @type {Window} */
var win;

/** @type {PromiseLike<string>} */
var promisedString;

// You can specify an HTML Element with DOM properties
/** @type {HTMLElement} */
var myElement = document.querySelector(selector);
element.dataset.myData = "";
```

`@type` 可以指定联合类型 —— 例如，某个值可以是字符串或布尔值。

```js twoslash
/**
 * @type {string | boolean}
 */
var sb;
```

你可以使用多种语法指定数组类型：

```js twoslash
/** @type {number[]} */
var ns;
/** @type {Array.<number>} */
var jsdoc;
/** @type {Array<number>} */
var nas;
```

你还可以指定对象字面量类型。
例如，一个具有属性 'a'（字符串）和 'b'（数字）的对象使用以下语法：

```js twoslash
/** @type {{ a: string, b: number }} */
var var9;
```

你可以使用字符串和数字索引签名来指定类 Map 和类数组对象，可以使用标准 JSDoc 语法或 TypeScript 语法。

```js twoslash
/**
 * A map-like object that maps arbitrary `string` properties to `number`s.
 *
 * @type {Object.<string, number>}
 */
var stringToNumber;

/** @type {Object.<number, object>} */
var arrayLike;
```

前面两种类型分别等同于 TypeScript 类型 `{ [x: string]: number }` 和 `{ [x: number]: any }`。编译器理解这两种语法。

你可以使用 TypeScript 或 Google Closure 语法指定函数类型：

```js twoslash
/** @type {function(string, boolean): number} Closure syntax */
var sbn;
/** @type {(s: string, b: boolean) => number} TypeScript syntax */
var sbn2;
```

或者你可以直接使用未指定的 `Function` 类型：

```js twoslash
/** @type {Function} */
var fn7;
/** @type {function} */
var fn6;
```

来自 Closure 的其他类型也可以工作：

```js twoslash
/**
 * @type {*} - can be 'any' type
 */
var star;
/**
 * @type {?} - unknown type (same as 'any')
 */
var question;
```

#### 类型转换

TypeScript 借鉴了 Google Closure 的类型转换语法。
这使你可以通过在括号表达式前添加 `@type` 标签来将类型转换为其他类型。

```js twoslash
/**
 * @type {number | string}
 */
var numberOrString = Math.random() < 0.5 ? "hello" : 100;
var typeAssertedNumber = /** @type {number} */ (numberOrString);
```

你甚至可以像 TypeScript 一样转换为 `const`：

```js twoslash
let one = /** @type {const} */(1);
```

#### 导入类型

你可以使用导入类型从其他文件导入声明。
此语法是 TypeScript 特有的，与 JSDoc 标准不同：

```js twoslash
// @filename: types.d.ts
export type Pet = {
  name: string,
};

// @filename: main.js
/**
 * @param {import("./types").Pet} p
 */
function walk(p) {
  console.log(`Walking ${p.name}...`);
}
```

导入类型可用于在不知道类型或类型较大不便手动输入时从模块获取值的类型：

```js twoslash
// @types: node
// @filename: accounts.d.ts
export const userAccount = {
  name: "Name",
  address: "An address",
  postalCode: "",
  country: "",
  planet: "",
  system: "",
  galaxy: "",
  universe: "",
};
// @filename: main.js
// ---cut---
/**
 * @type {typeof import("./accounts").userAccount}
 */
var x = require("./accounts").userAccount;
```

### `@import`

`@import` 标签可以让我们引用其他文件的导出。

```js twoslash
// @filename: types.d.ts
export type Pet = {
  name: string,
};
// @filename: main.js
// ---cut---
/**
 * @import {Pet} from "./types"
 */

/**
 * @type {Pet}
 */
var myPet;
myPet.name;
```

这些标签实际上不会在运行时导入文件，它们引入作用域的符号只能在 JSDoc 注释中用于类型检查。

```js twoslash
// @filename: dog.js
export class Dog {
  woof() {
    console.log("Woof!");
  }
}

// @filename: main.js
/** @import { Dog } from "./dog.js" */

const d = new Dog(); // error!
```

### `@param` 和 `@returns`

`@param` 使用与 `@type` 相同的类型语法，但添加了参数名。
参数也可以通过用方括号括起来声明为可选：

```js twoslash
// Parameters may be declared in a variety of syntactic forms
/**
 * @param {string}  p1 - A string param.
 * @param {string=} p2 - An optional param (Google Closure syntax)
 * @param {string} [p3] - Another optional param (JSDoc syntax).
 * @param {string} [p4="test"] - An optional param with a default value
 * @returns {string} This is the result
 */
function stringsStringStrings(p1, p2, p3, p4) {
  // TODO
}
```

同样，对于函数的返回类型：

```js twoslash
/**
 * @return {PromiseLike<string>}
 */
function ps() {}

/**
 * @returns {{ a: string, b: number }} - May use '@returns' as well as '@return'
 */
function ab() {}
```

### `@typedef`、`@callback` 和 `@param`

你可以使用 `@typedef` 定义复杂类型。
类似的语法也适用于 `@param`。

```js twoslash
/**
 * @typedef {Object} SpecialType - creates a new type named 'SpecialType'
 * @property {string} prop1 - a string property of SpecialType
 * @property {number} prop2 - a number property of SpecialType
 * @property {number=} prop3 - an optional number property of SpecialType
 * @prop {number} [prop4] - an optional number property of SpecialType
 * @prop {number} [prop5=42] - an optional number property of SpecialType with default
 */

/** @type {SpecialType} */
var specialTypeObject;
specialTypeObject.prop3;
```

你可以在首行使用 `object` 或 `Object`。

```js twoslash
/**
 * @typedef {object} SpecialType1 - creates a new type named 'SpecialType1'
 * @property {string} prop1 - a string property of SpecialType1
 * @property {number} prop2 - a number property of SpecialType1
 * @property {number=} prop3 - an optional number property of SpecialType1
 */

/** @type {SpecialType1} */
var specialTypeObject1;
```

`@param` 允许类似的语法用于一次性类型规范。
注意嵌套属性名必须以参数名为前缀：

```js twoslash
/**
 * @param {Object} options - The shape is the same as SpecialType above
 * @param {string} options.prop1
 * @param {number} options.prop2
 * @param {number=} options.prop3
 * @param {number} [options.prop4]
 * @param {number} [options.prop5=42]
 */
function special(options) {
  return (options.prop4 || 1001) + options.prop5;
}
```

`@callback` 类似于 `@typedef`，但它指定的是函数类型而不是对象类型：

```js twoslash
/**
 * @callback Predicate
 * @param {string} data
 * @param {number} [index]
 * @returns {boolean}
 */

/** @type {Predicate} */
const ok = (s) => !(s.length % 2);
```

当然，这些类型中的任何一个都可以使用 TypeScript 语法在单行 `@typedef` 中声明：

```js
/** @typedef {{ prop1: string, prop2: string, prop3?: number }} SpecialType */
/** @typedef {(data: string, index?: number) => boolean} Predicate */
```

### `@template`

你可以使用 `@template` 标签声明类型参数。
这使你可以创建泛型的函数、类或类型：

```js twoslash
/**
 * @template T
 * @param {T} x - A generic parameter that flows through to the return type
 * @returns {T}
 */
function id(x) {
  return x;
}

const a = id("string");
const b = id(123);
const c = id({});
```

使用逗号或多个标签声明多个类型参数：

```js
/**
 * @template T,U,V
 * @template W,X
 */
```

你还可以在类型参数名前指定类型约束。
只有列表中的第一个类型参数会被约束：

```js twoslash
/**
 * @template {string} K - K must be a string or string literal
 * @template {{ serious(): string }} Seriousalizable - must have a serious method
 * @param {K} key
 * @param {Seriousalizable} object
 */
function seriousalize(key, object) {
  // ????
}
```

最后，你可以为类型参数指定默认值：

```js twoslash
/** @template [T=object] */
class Cache {
    /** @param {T} initial */
    constructor(initial) {
    }
}
let c = new Cache()
```

### `@satisfies`

`@satisfies` 提供了对 TypeScript 中后缀 [运算符 `satisfies`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html) 的访问。Satisfies 用于声明一个值实现了某个类型，但不影响该值的类型。

```js twoslash
// @errors: 1360
// @ts-check
/**
 * @typedef {"hello world" | "Hello, world"} WelcomeMessage
 */

/** @satisfies {WelcomeMessage} */
const message = "hello world"

/** @satisfies {WelcomeMessage} */
const failingMessage = "Hello world!"

/** @type {WelcomeMessage} */
const messageUsingType = "hello world"
```

## 类

类可以声明为 ES6 类。

```js twoslash
class C {
  /**
   * @param {number} data
   */
  constructor(data) {
    // property types can be inferred
    this.name = "foo";

    // or set explicitly
    /** @type {string | null} */
    this.title = null;

    // or simply annotated, if they're set elsewhere
    /** @type {number} */
    this.size;

    this.initialize(data); // Should error, initializer expects a string
  }
  /**
   * @param {string} s
   */
  initialize = function (s) {
    this.size = s.length;
  };
}

var c = new C(0);

// C should only be called with new, but
// because it is JavaScript, this is allowed and
// considered an 'any'.
var result = C(1);
```

它们也可以声明为构造函数；为此请使用 [`@constructor`](#constructor) 和 [`@this`](#this)。

### 属性修饰符

`@public`、`@private` 和 `@protected` 的工作方式与 TypeScript 中的 `public`、`private` 和 `protected` 完全相同：

```js twoslash
// @errors: 2341
// @ts-check

class Car {
  constructor() {
    /** @private */
    this.identifier = 100;
  }

  printIdentifier() {
    console.log(this.identifier);
  }
}

const c = new Car();
console.log(c.identifier);
```

- `@public` 始终是隐含的，可以省略，但表示属性可以从任何地方访问。
- `@private` 表示属性只能在包含类中使用。
- `@protected` 表示属性只能在包含类及其所有派生子类中使用，但不能在不相似的包含类实例上使用。

`@public`、`@private` 和 `@protected` 在构造函数中不起作用。

### `@readonly`

`@readonly` 修饰符确保属性仅在初始化期间写入。

```js twoslash
// @errors: 2540
// @ts-check

class Car {
  constructor() {
    /** @readonly */
    this.identifier = 100;
  }

  printIdentifier() {
    console.log(this.identifier);
  }
}

const c = new Car();
console.log(c.identifier);
```

### `@override`

`@override` 的工作方式与 TypeScript 中相同；在覆盖基类方法的方法上使用它：

```js twoslash
export class C {
  m() { }
}
class D extends C {
  /** @override */
  m() { }
}
```

在 tsconfig 中设置 `noImplicitOverride: true` 以检查覆盖。

### `@extends`

当 JavaScript 类扩展泛型基类时，没有 JavaScript 语法来传递类型参数。`@extends` 标签允许这样做：

```js twoslash
/**
 * @template T
 * @extends {Set<T>}
 */
class SortableSet extends Set {
  // ...
}
```

注意，`@extends` 仅适用于类。目前，构造函数无法扩展类。

### `@implements`

同样，没有 JavaScript 语法来实现 TypeScript 接口。`@implements` 标签的工作方式与 TypeScript 中完全相同：

```js twoslash
/** @implements {Print} */
class TextBook {
  print() {
    // TODO
  }
}
```

### `@constructor`

编译器根据 this 属性赋值推断构造函数，但如果你添加 `@constructor` 标签，可以使检查更严格并获得更好的建议：

```js twoslash
// @checkJs
// @errors: 2345 2348
/**
 * @constructor
 * @param {number} data
 */
function C(data) {
  // property types can be inferred
  this.name = "foo";

  // or set explicitly
  /** @type {string | null} */
  this.title = null;

  // or simply annotated, if they're set elsewhere
  /** @type {number} */
  this.size;

  this.initialize(data);
}
/**
 * @param {string} s
 */
C.prototype.initialize = function (s) {
  this.size = s.length;
};

var c = new C(0);
c.size;

var result = C(1);
```

> 注意：错误消息仅在具有 [JSConfig](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) 和启用了 [`checkJs`](https://www.typescriptlang.org/tsconfig#checkJs) 的 JS 代码库中显示。

使用 `@constructor` 时，构造函数 `C` 内部的 `this` 会被检查，因此你会获得 `initialize` 方法的建议，如果传递数字则会报错。如果你调用 `C` 而不是构造它，你的编辑器也可能显示警告。

不幸的是，这意味着同时也是可调用的构造函数不能使用 `@constructor`。

### `@this`

当编译器有一些上下文可供处理时，通常可以推断出 `this` 的类型。当没有上下文时，你可以使用 `@this` 显式指定 `this` 的类型：

```js twoslash
/**
 * @this {HTMLElement}
 * @param {*} e
 */
function callbackForLater(e) {
  this.clientHeight = parseInt(e); // should be fine!
}
```

## 文档

### `@deprecated`

当函数、方法或属性被弃用时，你可以通过用 `/** @deprecated */` JSDoc 注释标记它来通知用户。该信息会在完成列表中显示，并作为建议诊断，编辑器可以特殊处理。在 VS Code 等编辑器中，弃用的值通常以删除线样式显示 ~~像这样~~。

```js twoslash
// @noErrors
/** @deprecated */
const apiV1 = {};
const apiV2 = {};

apiV;
// ^|


```

### `@see`

`@see` 允许你链接到程序中的其他名称：

```ts twoslash
type Box<T> = { t: T }
/** @see Box for implementation details */
type Boxify<T> = { [K in keyof T]: Box<T> };
```

一些编辑器会将 `Box` 转换为链接，以便轻松跳转。

### `@link`

`@link` 类似于 `@see`，但它可以在其他标签内部使用：

```ts twoslash
type Box<T> = { t: T }
/** @returns A {@link Box} containing the parameter. */
function box<U>(u: U): Box<U> {
  return { t: u };
}
```

你也可以链接一个属性：

```ts twoslash 
type Pet = {
  name: string
  hello: () => string
}

/**
 * Note: you should implement the {@link Pet.hello} method of Pet.
 */
function hello(p: Pet) {
  p.hello()
}
```

或者使用可选名称：

```ts twoslash
type Pet = {
  name: string
  hello: () => string
}

/**
 * Note: you should implement the {@link Pet.hello | hello} method of Pet.
 */
function hello(p: Pet) {
  p.hello()
}
```

## 其他

### `@enum`

`@enum` 标签允许你创建一个对象字面量，其成员都是指定类型。与 JavaScript 中的大多数对象字面量不同，它不允许其他成员。
`@enum` 旨在与 Google Closure 的 `@enum` 标签兼容。

```js twoslash
/** @enum {number} */
const JSDocState = {
  BeginningOfLine: 0,
  SawAsterisk: 1,
  SavingComments: 2,
};

JSDocState.SawAsterisk;
```

注意，`@enum` 与 TypeScript 的 `enum` 非常不同，也简单得多。然而，与 TypeScript 的枚举不同，`@enum` 可以是任何类型：

```js twoslash
/** @enum {function(number): number} */
const MathFuncs = {
  add1: (n) => n + 1,
  id: (n) => -n,
  sub1: (n) => n - 1,
};

MathFuncs.add1;
```

### `@author`

你可以使用 `@author` 指定项目的作者：

```ts twoslash
/**
 * Welcome to awesome.ts
 * @author Ian Awesome <i.am.awesome@example.com>
 */
```

记住用尖括号包围电子邮件地址。
否则，`@example` 将被解析为新标签。

### 其他支持的模式

```js twoslash
// @types: react
class Foo {}
// ---cut---
var someObj = {
  /**
   * @param {string} param1 - JSDocs on property assignments work
   */
  x: function (param1) {},
};

/**
 * As do jsdocs on variable assignments
 * @return {Window}
 */
let someFunc = function () {};

/**
 * And class methods
 * @param {string} greeting The greeting to use
 */
Foo.prototype.sayHi = (greeting) => console.log("Hi!");

/**
 * And arrow function expressions
 * @param {number} x - A multiplier
 */
let myArrow = (x) => x * x;

/**
 * Which means it works for function components in JSX too
 * @param {{a: string, b: number}} props - Some param
 */
var fc = (props) => <div>{props.a.charAt(0)}</div>;

/**
 * A parameter can be a class constructor, using Google Closure syntax.
 *
 * @param {{new(...args: any[]): object}} C - The class to register
 */
function registerClass(C) {}

/**
 * @param {...string} p1 - A 'rest' arg (array) of strings. (treated as 'any')
 */
function fn10(p1) {}

/**
 * @param {...string} p1 - A 'rest' arg (array) of strings. (treated as 'any')
 */
function fn9(p1) {
  return p1.join();
}
```

### 不支持的模式

对象字面量类型中的属性类型后缀等号并不指定可选属性：

```js twoslash
/**
 * @type {{ a: string, b: number= }}
 */
var wrong;
/**
 * Use postfix question on the property name instead:
 * @type {{ a: string, b?: number }}
 */
var right;
```

可空类型只有在启用了 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 时才有意义：

```js twoslash
/**
 * @type {?number}
 * With strictNullChecks: true  -- number | null
 * With strictNullChecks: false -- number
 */
var nullable;
```

TypeScript 原生语法是联合类型：

```js twoslash
/**
 * @type {number | null}
 * With strictNullChecks: true  -- number | null
 * With strictNullChecks: false -- number
 */
var unionNullable;
```

非可空类型没有意义，仅被视为其原始类型：

```js twoslash
/**
 * @type {!number}
 * Just has type number
 */
var normal;
```

与 JSDoc 的类型系统不同，TypeScript 只允许你将类型标记为包含 null 或不包含 null。
没有显式的非可空性 —— 如果 strictNullChecks 开启，则 `number` 不可为空。
如果关闭，则 `number` 可为空。

### 不支持的标签

TypeScript 会忽略任何不受支持的 JSDoc 标签。

以下标签有开放的问题要支持它们：

- `@memberof` ([issue #7237](https://github.com/Microsoft/TypeScript/issues/7237))
- `@yields` ([issue #23857](https://github.com/Microsoft/TypeScript/issues/23857))
- `@member` ([issue #56674](https://github.com/microsoft/TypeScript/issues/56674))

### 遗留类型同义词

许多常见类型被赋予别名以兼容旧 JavaScript 代码。
其中一些别名与现有类型相同，尽管大多数很少使用。
例如，`String` 被视为 `string` 的别名。
即使 `String` 是 TypeScript 中的类型，旧 JSDoc 通常用它来表示 `string`。
此外，在 TypeScript 中，原始类型的大写版本是包装类型 —— 几乎总是错误的使用。
因此，编译器根据旧 JSDoc 中的用法将这些类型视为同义词：

- `String -> string`
- `Number -> number`
- `Boolean -> boolean`
- `Void -> void`
- `Undefined -> undefined`
- `Null -> null`
- `function -> Function`
- `array -> Array<any>`
- `promise -> Promise<any>`
- `Object -> any`
- `object -> any`

当 `noImplicitAny: true` 时，最后四个别名会被关闭：

- `object` 和 `Object` 是内置类型，尽管 `Object` 很少使用。
- `array` 和 `promise` 不是内置的，但可能在你的程序中的某处声明。
