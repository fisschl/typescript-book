---
title: 类型检查 JavaScript 文件
---

以下是 `.js` 文件与 `.ts` 文件在类型检查方面的一些显著差异。

## 属性从类体内的赋值推断

ES2015 没有声明类属性的方式。属性是动态赋值的，就像对象字面量一样。

在 `.js` 文件中，编译器从类体内的属性赋值推断属性。
属性的类型是构造函数中给出的类型，除非它在构造函数中未定义，或者构造函数中的类型是 undefined 或 null。
在这种情况下，类型是所有这些赋值中右侧值的类型的联合。
在构造函数中定义的属性总是假定存在，而仅在方法、getter 或 setter 中定义的属性被视为可选。

```js twoslash
// @checkJs
// @errors: 2322
class C {
  constructor() {
    this.constructorOnly = 0;
    this.constructorUnknown = undefined;
  }
  method() {
    this.constructorOnly = false;
    this.constructorUnknown = "plunkbat"; // ok, constructorUnknown is string | undefined
    this.methodOnly = "ok"; // ok, but methodOnly could also be undefined
  }
  method2() {
    this.methodOnly = true; // also, ok, methodOnly's type is string | boolean | undefined
  }
}
```

如果属性从未在类体内设置，则它们被视为未知。
如果你的类有仅读取的属性，请在构造函数中添加并使用 JSDoc 注释声明来指定类型。
如果稍后会初始化，你甚至不需要给值：

```js twoslash
// @checkJs
// @errors: 2322
class C {
  constructor() {
    /** @type {number | undefined} */
    this.prop = undefined;
    /** @type {number | undefined} */
    this.count;
  }
}

let c = new C();
c.prop = 0; // OK
c.count = "string";
```

## 构造函数等价于类

在 ES2015 之前，JavaScript 使用构造函数而不是类。
编译器支持这种模式，并将构造函数理解为等价于 ES2015 类。
上述属性推断规则的工作方式完全相同。

```js twoslash
// @checkJs
// @errors: 2683 2322
function C() {
  this.constructorOnly = 0;
  this.constructorUnknown = undefined;
}
C.prototype.method = function () {
  this.constructorOnly = false;
  this.constructorUnknown = "plunkbat"; // OK, the type is string | undefined
};
```

## 支持 CommonJS 模块

在 `.js` 文件中，TypeScript 理解 CommonJS 模块格式。
对 `exports` 和 `module.exports` 的赋值被识别为导出声明。
同样，`require` 函数调用被识别为模块导入。例如：

```js
// same as `import module "fs"`
const fs = require("fs");

// same as `export function readFile`
module.exports.readFile = function (f) {
  return fs.readFileSync(f);
};
```

JavaScript 中的模块支持比 TypeScript 的模块支持在语法上更加宽容。
支持大多数赋值和声明的组合。

## 类、函数和对象字面量是命名空间

在 `.js` 文件中，类是命名空间。
这可用于嵌套类，例如：

```js twoslash
class C {}
C.D = class {};
```

对于 ES2015 之前的代码，它可以用来模拟静态方法：

```js twoslash
function Outer() {
  this.y = 2;
}

Outer.Inner = function () {
  this.yy = 2;
};

Outer.Inner();
```

它还可以用来创建简单的命名空间：

```js twoslash
var ns = {};
ns.C = class {};
ns.func = function () {};

ns;
```

其他变体也是允许的：

```js twoslash
// IIFE
var ns = (function (n) {
  return n || {};
})();
ns.CONST = 1;

// defaulting to global
var assign =
  assign ||
  function () {
    // code goes here
  };
assign.extra = 1;
```

## 对象字面量是开放式的

在 `.ts` 文件中，初始化变量声明的对象字面量将其类型赋予该声明。
不能添加原始字面量中未指定的新成员。
在 `.js` 文件中，这一规则被放宽；对象字面量具有开放式类型（索引签名），允许添加和查找最初未定义的属性。
例如：

```js twoslash
var obj = { a: 1 };
obj.b = 2; // Allowed
```

对象字面量的行为就好像它们具有索引签名 `[x:string]: any`，允许它们被视为开放式映射而不是封闭式对象。

与其他特殊的 JS 检查行为一样，可以通过为变量指定 JSDoc 类型来更改此行为。例如：

```js twoslash
// @checkJs
// @errors: 2339
/** @type {{a: number}} */
var obj = { a: 1 };
obj.b = 2;
```

## null、undefined 和空数组初始化器的类型为 any 或 any[]

任何用 null 或 undefined 初始化的变量、参数或属性都将具有 any 类型，即使启用了严格的空检查。
任何用 [] 初始化的变量、参数或属性都将具有 any[] 类型，即使启用了严格的空检查。
唯一的例外是上面描述的具有多个初始化器的属性。

```js twoslash
function Foo(i = null) {
  if (!i) i = 1;
  var j = undefined;
  j = 2;
  this.l = [];
}

var foo = new Foo();
foo.l.push(foo.i);
foo.l.push("end");
```

## 函数参数默认是可选的

由于在 ES2015 之前的 JavaScript 中无法指定参数的可选性，`.js` 文件中的所有函数参数都被视为可选。
允许使用少于声明参数数量的参数调用函数。

需要注意的是，使用过多参数调用函数是错误的。

例如：

```js twoslash
// @checkJs
// @strict: false
// @errors: 7006 7006 2554
function bar(a, b) {
  console.log(a + " " + b);
}

bar(1); // OK, second argument considered optional
bar(1, 2);
bar(1, 2, 3); // Error, too many arguments
```

带有 JSDoc 注释的函数不受此规则约束。
使用 JSDoc 可选参数语法（`[` `]`）来表达可选性。例如：

```js twoslash
/**
 * @param {string} [somebody] - Somebody's name.
 */
function sayHello(somebody) {
  if (!somebody) {
    somebody = "John Doe";
  }
  console.log("Hello " + somebody);
}

sayHello();
```

## 从 `arguments` 的使用推断可变参数声明

函数体中引用 `arguments` 的函数被隐式视为具有可变参数（即 `(...arg: any[]) => any`）。使用 JSDoc 可变参数语法来指定参数的类型。

```js twoslash
/** @param {...number} args */
function sum(/* numbers */) {
  var total = 0;
  for (var i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}
```

## 未指定的类型参数默认为 `any`

由于 JavaScript 中没有指定泛型类型参数的自然语法，未指定的类型参数默认为 `any`。

### 在 extends 子句中

例如，`React.Component` 被定义为具有两个类型参数 `Props` 和 `State`。
在 `.js` 文件中，没有合法的方式在 extends 子句中指定这些。默认情况下，类型参数将是 `any`：

```js
import { Component } from "react";

class MyComponent extends Component {
  render() {
    this.props.b; // Allowed, since this.props is of type any
  }
}
```

使用 JSDoc `@augments` 显式指定类型。例如：

```js
import { Component } from "react";

/**
 * @augments {Component<{a: number}, State>}
 */
class MyComponent extends Component {
  render() {
    this.props.b; // Error: b does not exist on {a:number}
  }
}
```

### 在 JSDoc 引用中

JSDoc 中未指定的类型参数默认为 any：

```js twoslash
/** @type{Array} */
var x = [];

x.push(1); // OK
x.push("string"); // OK, x is of type Array<any>

/** @type{Array.<number>} */
var y = [];

y.push(1); // OK
y.push("string"); // Error, string is not assignable to number
```

### 在函数调用中

对泛型函数的调用使用参数来推断类型参数。有时这个过程无法推断任何类型，主要是因为缺乏推断源；在这些情况下，类型参数将默认为 `any`。例如：

```js
var p = new Promise((resolve, reject) => {
  reject();
});

p; // Promise<any>;
```

要了解 JSDoc 的所有可用功能，请参阅 [参考文档](/javascript/jsdoc-reference)。
