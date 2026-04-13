---
title: "全局 .d.ts"
---

## 全局库

<!-- 
TODO:

1. mention that global nearly always means 'browser'
2. if you have a global library that you suspect is UMD, look for instructions on
   a. how to import it
   b. -OR- how to make it work with webpack
3. Make the page follow the structure of documentation,usage,source example.

-->

_全局_ 库是指可以从全局作用域访问的库（即无需使用任何形式的 `import`）。
许多库只是暴露一个或多个全局变量供使用。
例如，如果你使用 [jQuery](https://jquery.com/)，可以通过直接引用 `$` 变量来使用它：

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

## 从代码中识别全局库

全局库代码通常非常简单。
一个全局 "Hello, world" 库可能看起来像这样：

```js
function createGreeting(s) {
  return "Hello, " + s;
}
```

或者像这样：

```js
window.createGreeting = function (s) {
  return "Hello, " + s;
};
```

在查看全局库的代码时，你通常会看到：

- 顶级 `var` 语句或 `function` 声明
- 对一个或多个 `window.someName` 的赋值
- 假设存在 DOM 原语如 `document` 或 `window`

你 _不会_ 看到：

- 对模块加载器如 `require` 或 `define` 的检查或使用
- CommonJS/Node.js 风格的导入，形式为 `var fs = require("fs");`
- 对 `define(...)` 的调用
- 描述如何 `require` 或导入库的文档

## 全局库示例

因为将全局库转换为 UMD 库通常很容易，所以很少有流行的库仍然使用全局风格编写。
然而，小型且需要 DOM（或 _没有_ 依赖）的库可能仍然是全局的。

## 全局库模板

你可以在下面看到一个 DTS 示例：

```ts
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ If this library is callable (e.g. can be invoked as myLib(3)),
 *~ include those call signatures here.
 *~ Otherwise, delete this section.
 */
declare function myLib(a: string): string;
declare function myLib(a: number): number;

/*~ If you want the name of this library to be a valid type name,
 *~ you can do so here.
 *~
 *~ For example, this allows us to write 'var x: myLib';
 *~ Be sure this actually makes sense! If it doesn't, just
 *~ delete this declaration and add types inside the namespace below.
 */
interface myLib {
  name: string;
  length: number;
  extras?: string[];
}

/*~ If your library has properties exposed on a global variable,
 *~ place them here.
 *~ You should also place types (interfaces and type alias) here.
 */
declare namespace myLib {
  //~ We can write 'myLib.timeout = 50;'
  let timeout: number;

  //~ We can access 'myLib.version', but not change it
  const version: string;

  //~ There's some class we can create via 'let c = new myLib.Cat(42)'
  //~ Or reference e.g. 'function f(c: myLib.Cat) { ... }
  class Cat {
    constructor(n: number);

    //~ We can read 'c.age' from a 'Cat' instance
    readonly age: number;

    //~ We can invoke 'c.purr()' from a 'Cat' instance
    purr(): void;
  }

  //~ We can declare a variable as
  //~   'var s: myLib.CatSettings = { weight: 5, name: "Maru" };'
  interface CatSettings {
    weight: number;
    name: string;
    tailLength?: number;
  }

  //~ We can write 'const v: myLib.VetID = 42;'
  //~  or 'const v: myLib.VetID = "bob";'
  type VetID = string | number;

  //~ We can invoke 'myLib.checkCat(c)' or 'myLib.checkCat(c, v);'
  function checkCat(c: Cat, s?: VetID);
}
```
