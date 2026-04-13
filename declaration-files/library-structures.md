---
title: 库结构
---

一般来说，你 _组织_ 声明文件的方式取决于库的使用方式。
JavaScript 中提供库供使用的方式有很多种，你需要编写与之匹配的声明文件。
本指南介绍如何识别常见的库模式，以及如何编写与该模式对应的声明文件。

每种主要的库结构模式在 [模板](/declaration-files/templates) 部分都有对应的文件。
你可以从这些模板开始，帮助你更快上手。

## 识别库的种类

首先，我们回顾一下 TypeScript 声明文件可以表示的库类型。
我们将简要展示每种库是如何 _使用_ 的，如何 _编写_ 的，并列出一些来自现实世界的示例库。

识别库的结构是编写其声明文件的第一步。
我们将根据库的 _使用方式_ 和 _代码_ 提供识别结构的提示。
根据库的文档和组织方式，其中一种可能更容易。
我们建议使用你觉得更顺手的方式。

### 你应该寻找什么？

在查看你尝试添加类型的库时，问自己以下问题。

1. 你如何获取该库？

   例如，你是 _只能_ 通过 npm 获取，还是只能从 CDN 获取？

2. 你会如何导入它？

   它是添加一个全局对象吗？它使用 `require` 还是 `import`/`export` 语句？

### 不同类型库的示例

### 模块化库

几乎每个现代 Node.js 库都属于模块家族。
这类库只能在带有模块加载器的 JS 环境中工作。
例如，`express` 只能在 Node.js 中工作，必须使用 CommonJS 的 `require` 函数加载。

ECMAScript 2015（也称为 ES2015、ECMAScript 6 和 ES6）、CommonJS 和 RequireJS 都有相似的 _导入_ _模块_ 的概念。
例如，在 JavaScript CommonJS（Node.js）中，你会这样写

```js
var fs = require("fs");
```

在 TypeScript 或 ES6 中，`import` 关键字具有相同的作用：

```ts
import * as fs from "fs";
```

你通常会在模块化库的文档中看到以下某一行：

```js
var someLib = require("someLib");
```

或者

```js
define(..., ['someLib'], function(someLib) {

});
```

与全局模块一样，你可能会在 [UMD](#umd) 模块的文档中看到这些示例，因此请务必检查代码或文档。

#### 从代码中识别模块库

模块化库通常至少具有以下特征：

- 无条件调用 `require` 或 `define`
- 声明如 `import * as a from 'b';` 或 `export c;`
- 赋值给 `exports` 或 `module.exports`

它们很少会有：

- 赋值给 `window` 或 `global` 的属性

#### 模块模板

模块有四个模板可用，
[`module.d.ts`](/declaration-files/templates/module-d-ts)、[`module-class.d.ts`](/declaration-files/templates/module-class-d-ts)、[`module-function.d.ts`](/declaration-files/templates/module-function-d-ts) 和 [`module-plugin.d.ts`](/declaration-files/templates/module-plugin-d-ts)。

你应该首先阅读 [`module.d.ts`](/declaration-files/templates/module-d-ts) 以了解它们的工作原理概述。

如果你的模块可以像函数一样 _调用_，请使用模板 [`module-function.d.ts`](/declaration-files/templates/module-function-d-ts)：

```js
const x = require("foo");
// Note: calling 'x' as a function
const y = x(42);
```

如果你的模块可以使用 `new` _构造_，请使用模板 [`module-class.d.ts`](/declaration-files/templates/module-class-d-ts)：

```js
const x = require("bar");
// Note: using 'new' operator on the imported variable
const y = new x("hello");
```

如果你有一个模块，在导入时会对其他模块进行更改，请使用模板 [`module-plugin.d.ts`](/declaration-files/templates/module-plugin-d-ts)：

```js
const jest = require("jest");
require("jest-matchers-files");
```

### 全局库

_全局_ 库是指可以从全局作用域访问的库（即不使用任何形式的 `import`）。
许多库只是暴露一个或多个全局变量供使用。
例如，如果你使用 [jQuery](https://jquery.com/)，只需引用 `$` 变量即可使用：

```ts
$(() => {
  console.log("hello!");
});
```

你通常会在全局库的文档中看到关于如何在 HTML script 标签中使用该库的指导：

```html
<script src="http://a.great.cdn.for/someLib.js"></script>
```

如今，大多数流行的可全局访问的库实际上都是作为 UMD 库编写的（见下文）。
UMD 库的文档很难与全局库的文档区分开来。
在编写全局声明文件之前，请确保该库实际上不是 UMD。

#### 从代码中识别全局库

全局库代码通常非常简单。
一个全局的 "Hello, world" 库可能看起来像这样：

```js
function createGreeting(s) {
  return "Hello, " + s;
}
```

或者像这样：

```js
// Web
window.createGreeting = function (s) {
  return "Hello, " + s;
};

// Node
global.createGreeting = function (s) {
  return "Hello, " + s;
};

// Potentially any runtime
globalThis.createGreeting = function (s) {
  return "Hello, " + s;
};
```

在查看全局库的代码时，你通常会看到：

- 顶级的 `var` 语句或 `function` 声明
- 对一个或多个 `window.someName` 的赋值
- 假设存在 DOM 原语如 `document` 或 `window`

你 _不会_ 看到：

- 检查或使用模块加载器如 `require` 或 `define`
- CommonJS/Node.js 风格的导入形式如 `var fs = require("fs");`
- 调用 `define(...)`
- 描述如何 `require` 或导入库的文档

#### 全局库示例

因为将全局库转换为 UMD 库通常很容易，所以很少有流行的库仍然以全局风格编写。
然而，小型且需要 DOM（或 _没有_ 依赖）的库可能仍然是全局的。

#### 全局库模板

模板文件 [`global.d.ts`](/declaration-files/templates/global-d-ts) 定义了一个示例库 `myLib`。
请务必阅读 ["防止命名冲突"脚注](#防止命名冲突)。

### _UMD_

_UMD_ 模块是一种既可以作为模块使用（通过导入），也可以作为全局变量使用（在没有模块加载器的环境中运行）的模块。
许多流行的库，如 [Moment.js](https://momentjs.com/)，都是以这种方式编写的。
例如，在 Node.js 或使用 RequireJS 中，你会这样写：

```ts
import moment = require("moment");
console.log(moment.format());
```

而在普通的浏览器环境中，你会这样写：

```js
console.log(moment.format());
```

#### 识别 UMD 库

[UMD 模块](https://github.com/umdjs/umd) 会检查模块加载器环境是否存在。
这是一种容易识别的模式，看起来像这样：

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

如果你在库的代码中看到对 `typeof define`、`typeof window` 或 `typeof module` 的测试，特别是在文件顶部，它几乎总是一个 UMD 库。

UMD 库的文档通常也会展示一个 "在 Node.js 中使用" 的示例，显示 `require`，
以及一个 "在浏览器中使用" 的示例，显示使用 `<script>` 标签加载脚本。

#### UMD 库示例

大多数流行的库现在都以 UMD 包的形式提供。
示例包括 [jQuery](https://jquery.com/)、[Moment.js](https://momentjs.com/)、[lodash](https://lodash.com/) 等等。

#### 模板

使用 [`module-plugin.d.ts`](/declaration-files/templates/module-plugin.d.ts) 模板。

## 消费依赖

你的库可能有几种不同类型的依赖。
本节展示如何将它们导入声明文件。

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

请注意，在编写全局声明文件时，可以在全局作用域中定义许多类型。
我们强烈反对这样做，因为当项目中存在许多声明文件时，这会导致可能无法解决的命名冲突。

一个简单的规则是只声明由库定义的全局变量 _命名空间化_ 的类型。
例如，如果库定义了全局值 'cats'，你应该这样写

```ts
declare namespace cats {
  interface KittySettings {}
}
```

但 _不要_

```ts
// at top-level
interface CatsKittySettings {}
```

这个指导也确保了库可以过渡到 UMD 而不会破坏声明文件用户。

### ES6 对模块调用签名的影响

许多流行的库，如 Express，在导入时会暴露为一个可调用函数。
例如，典型的 Express 用法看起来像这样：

```ts
import exp = require("express");
var app = exp();
```

在符合 ES6 的模块加载器中，顶级对象（这里导入为 `exp`）只能有属性；
顶级模块对象 _永远_ 不能是可调用的。

这里最常见的解决方案是为可调用/可构造对象定义一个 `default` 导出；
模块加载器通常会检测这种情况并自动用 `default` 导出替换顶级对象。
如果你在你的 tsconfig.json 中设置了 [`"esModuleInterop": true`](https://www.typescriptlang.org/tsconfig#esModuleInterop)，TypeScript 可以为你处理这个问题。
