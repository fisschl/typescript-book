---
title: "全局：插件"
---

## _UMD_

_UMD_ 模块是一种既可以作为模块使用（通过导入），也可以作为全局变量使用（在没有模块加载器的环境中运行时）的模块。
许多流行的库，如 [Moment.js](http://momentjs.com/)，都是以这种方式编写的。
例如，在 Node.js 或使用 RequireJS 时，你可以这样写：

```ts
import moment = require("moment");
console.log(moment.format());
```

而在普通的浏览器环境中，你会这样写：

```js
console.log(moment.format());
```

### 识别 UMD 库

[UMD 模块](https://github.com/umdjs/umd) 会检查模块加载器环境是否存在。
这是一个容易识别的模式，看起来像这样：

```js
(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define(["libName"], factory);
    } else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("libName"));
    } else {
        root.returnExports = factory(root.libName);
    }
}(this, function (b) {
```

如果你在库的代码中看到对 `typeof define`、`typeof window` 或 `typeof module` 的测试，特别是在文件顶部，那它几乎肯定是一个 UMD 库。

UMD 库的文档通常也会展示一个 "在 Node.js 中使用" 的示例，显示 `require`，
以及一个 "在浏览器中使用" 的示例，显示使用 `<script>` 标签加载脚本。

### UMD 库示例

大多数流行的库现在都以 UMD 包的形式提供。
示例包括 [jQuery](https://jquery.com/)、[Moment.js](http://momentjs.com/)、[lodash](https://lodash.com/) 等等。

### 模板

模块有三种模板可用，
[`module.d.ts`](/declaration-files/templates/module-d-ts)、[`module-class.d.ts`](/declaration-files/templates/module-class-d-ts) 和 [`module-function.d.ts`](/declaration-files/templates/module-function-d-ts)。

如果你的模块可以像函数一样被 _调用_，请使用 [`module-function.d.ts`](/declaration-files/templates/module-function-d-ts)：

```js
var x = require("foo");
// Note: calling 'x' as a function
var y = x(42);
```

请务必阅读 [脚注 "ES6 对模块调用签名的影响"](#es6-对模块插件的影响)

如果你的模块可以使用 `new` 来 _构造_，请使用 [`module-class.d.ts`](/declaration-files/templates/module-class-d-ts)：

```js
var x = require("bar");
// Note: using 'new' operator on the imported variable
var y = new x("hello");
```

同样的 [脚注](#es6-对模块插件的影响) 也适用于这些模块。

如果你的模块不可调用也不可构造，请使用 [`module.d.ts`](/declaration-files/templates/module-d-ts) 文件。

## _模块插件_ 或 _UMD 插件_

_模块插件_ 会改变另一个模块（UMD 或模块）的形状。
例如，在 Moment.js 中，`moment-range` 向 `moment` 对象添加了一个新的 `range` 方法。

为了编写声明文件的目的，无论被修改的模块是普通模块还是 UMD 模块，你都将编写相同的代码。

### 模板

请使用 [`module-plugin.d.ts`](/declaration-files/templates/module-plugin-d-ts) 模板。

## _全局插件_

_全局插件_ 是改变某些全局变量形状的全局代码。
与 _全局修改模块_ 一样，这些插件也会引发运行时冲突的可能性。

例如，一些库会向 `Array.prototype` 或 `String.prototype` 添加新函数。

### 识别全局插件

全局插件通常很容易从其文档中识别出来。

你会看到如下示例：

```js
var x = "hello, world";
// Creates new methods on built-in types
console.log(x.startsWithHello());

var y = [1, 2, 3];
// Creates new methods on built-in types
console.log(y.reverseAndSort());
```

### 模板

请使用 [`global-plugin.d.ts`](/declaration-files/templates/global-plugin-d-ts) 模板。

## _全局修改模块_

_全局修改模块_ 在导入时会改变全局作用域中的现有值。
例如，可能存在一个库，在导入时会向 `String.prototype` 添加新成员。
由于可能发生运行时冲突，这种模式有些危险，
但我们仍然可以为它编写声明文件。

### 识别全局修改模块

全局修改模块通常很容易从其文档中识别出来。
一般来说，它们类似于全局插件，但需要一个 `require` 调用来激活其效果。

你可能会看到如下文档：

```js
// 'require' call that doesn't use its return value
var unused = require("magic-string-time");
/* or */
require("magic-string-time");

var x = "hello, world";
// Creates new methods on built-in types
console.log(x.startsWithHello());

var y = [1, 2, 3];
// Creates new methods on built-in types
console.log(y.reverseAndSort());
```

### 模板

请使用 [`global-modifying-module.d.ts`](/declaration-files/templates/global-modifying-module-d-ts) 模板。

## 消费依赖

你的库可能有几种不同类型的依赖。
本节展示如何将它们导入到声明文件中。

### 依赖全局库

如果你的库依赖于全局库，请使用 `/// <reference types="..." />` 指令：

```ts
/// <reference types="someLib" />

function getThing(): someLib.thing;
```

### 依赖模块

如果你的库依赖于模块，请使用 `import` 语句：

```ts
import * as moment from "moment";

function getThing(): moment;
```

### 依赖 UMD 库

#### 从全局库

如果你的全局库依赖于 UMD 模块，请使用 `/// <reference types` 指令：

```ts
/// <reference types="moment" />

function getThing(): moment;
```

#### 从模块或 UMD 库

如果你的模块或 UMD 库依赖于 UMD 库，请使用 `import` 语句：

```ts
import * as someLib from "someLib";
```

_不要_ 使用 `/// <reference` 指令来声明对 UMD 库的依赖！

## 脚注

### 防止命名冲突

请注意，在编写全局声明文件时，可能会在全局作用域中定义许多类型。
我们强烈不建议这样做，因为当项目中存在许多声明文件时，这可能导致无法解决的命名冲突。

一个简单的规则是只声明由库定义的任何全局变量 _命名空间化_ 的类型。
例如，如果库定义了全局值 'cats'，你应该这样写

```ts
declare namespace cats {
  interface KittySettings {}
}
```

但 _不要_ 这样写

```ts
// at top-level
interface CatsKittySettings {}
```

这个指导也确保了库可以在不破坏声明文件用户的情况下过渡到 UMD。

### ES6 对模块插件的影响

一些插件会在现有模块上添加或修改顶级导出。
虽然在 CommonJS 和其他加载器中这是合法的，但 ES6 模块被认为是不可变的，这种模式将不可能实现。
由于 TypeScript 是与加载器无关的，因此没有对此策略的编译时强制执行，但打算过渡到 ES6 模块加载器的开发人员应该注意这一点。

### ES6 对模块调用签名的影响

许多流行的库，如 Express，在导入时会将自己暴露为可调用的函数。
例如，典型的 Express 用法看起来像这样：

```ts
import exp = require("express");
var app = exp();
```

在 ES6 模块加载器中，顶级对象（这里导入为 `exp`）只能有属性；
顶级模块对象 _永远_ 不可调用。
这里最常见的解决方案是为可调用/可构造对象定义一个 `default` 导出；
一些模块加载器垫片会自动检测这种情况，并用 `default` 导出替换顶级对象。

### 库文件布局

你的声明文件的布局应该与库的布局一致。

一个库可以由多个模块组成，例如

```
myLib
  +---- index.js
  +---- foo.js
  +---- bar
         +---- index.js
         +---- baz.js
```

这些可以这样导入

```js
var a = require("myLib");
var b = require("myLib/foo");
var c = require("myLib/bar");
var d = require("myLib/bar/baz");
```

因此，你的声明文件应该是

```
@types/myLib
  +---- index.d.ts
  +---- foo.d.ts
  +---- bar
         +---- index.d.ts
         +---- baz.d.ts
```

```ts
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This template shows how to write a global plugin. */

/*~ Write a declaration for the original type and add new members.
 *~ For example, this adds a 'toBinaryString' method with overloads to
 *~ the built-in number type.
 */
interface Number {
  toBinaryString(opts?: MyLibrary.BinaryFormatOptions): string;

  toBinaryString(
    callback: MyLibrary.BinaryFormatCallback,
    opts?: MyLibrary.BinaryFormatOptions
  ): string;
}

/*~ If you need to declare several types, place them inside a namespace
 *~ to avoid adding too many things to the global namespace.
 */
declare namespace MyLibrary {
  type BinaryFormatCallback = (n: number) => string;
  interface BinaryFormatOptions {
    prefix?: string;
    padding: number;
  }
}
```
