---
title: 从 JavaScript 迁移
---

TypeScript 并非孤立存在。
它是在考虑 JavaScript 生态系统的情况下构建的，而且如今已有大量 JavaScript 代码存在。
将 JavaScript 代码库转换为 TypeScript 虽然有些繁琐，但通常并不困难。
在本教程中，我们将探讨如何开始迁移。
我们假设你已经阅读了手册的足够内容，能够编写新的 TypeScript 代码。

如果你希望转换 React 项目，我们建议先查看 [React 转换指南](https://github.com/Microsoft/TypeScript-React-Conversion-Guide#typescript-react-conversion-guide)。

## 设置目录结构

如果你正在编写纯 JavaScript，很可能你是直接运行 JavaScript 的，
你的 `.js` 文件位于 `src`、`lib` 或 `dist` 目录中，然后根据需要运行。

如果是这种情况，你编写的文件将用作 TypeScript 的输入，你将运行它生成的输出。
在我们的 JS 到 TS 迁移过程中，我们需要分离输入文件，以防止 TypeScript 覆盖它们。
如果你的输出文件需要存放在特定目录中，那么该目录就是你的输出目录。

你可能还在 JavaScript 上运行一些中间步骤，比如打包或使用另一个转译器如 Babel。
在这种情况下，你可能已经设置了如下所示的文件夹结构。

从现在开始，我们假设你的目录设置类似于这样：

```
projectRoot
├── src
│   ├── file1.js
│   └── file2.js
├── built
└── tsconfig.json
```

如果你在 `src` 目录外有一个 `tests` 文件夹，你可能在 `src` 中有一个 `tsconfig.json`，在 `tests` 中也有一个。

## 编写配置文件

TypeScript 使用一个名为 `tsconfig.json` 的文件来管理项目的选项，比如你想包含哪些文件，以及你想执行哪些类型的检查。
让我们为我们的项目创建一个基本的配置文件：

```json
{
  "compilerOptions": {
    "outDir": "./built",
    "allowJs": true,
    "target": "es5"
  },
  "include": ["./src/**/*"]
}
```

在这里，我们向 TypeScript 指定了几件事情：

1. 读取 `src` 目录中它能理解的任何文件（使用 [`include`](https://www.typescriptlang.org/tsconfig#include)）。
2. 接受 JavaScript 文件作为输入（使用 [`allowJs`](https://www.typescriptlang.org/tsconfig#allowJs)）。
3. 将所有输出文件放在 `built` 中（使用 [`outDir`](https://www.typescriptlang.org/tsconfig#outDir)）。
4. 将较新的 JavaScript 结构转换为旧版本，如 ECMAScript 5（使用 [`target`](https://www.typescriptlang.org/tsconfig#target)）。

此时，如果你尝试在项目根目录运行 `tsc`，你应该会在 `built` 目录中看到输出文件。
`built` 中的文件布局应该与 `src` 的布局完全相同。
你现在应该已经让 TypeScript 与项目配合工作了。

## 早期收益

即使在这个阶段，你也能从 TypeScript 理解你的项目中获得一些巨大的好处。
如果你打开 [VS Code](https://code.visualstudio.com) 或 [Visual Studio](https://visualstudio.com) 等编辑器，你会发现通常可以获得一些工具支持，比如自动补全。
你还可以通过以下选项捕获某些错误：

- [`noImplicitReturns`](https://www.typescriptlang.org/tsconfig#noImplicitReturns) 可以防止你在函数末尾忘记返回值。
- [`noFallthroughCasesInSwitch`](https://www.typescriptlang.org/tsconfig#noFallthroughCasesInSwitch) 如果你永远不想在 `switch` 块的 `case` 之间忘记 `break` 语句，这会很有帮助。

TypeScript 还会警告不可达代码和标签，你可以分别使用 [`allowUnreachableCode`](https://www.typescriptlang.org/tsconfig#allowUnreachableCode) 和 [`allowUnusedLabels`](https://www.typescriptlang.org/tsconfig#allowUnusedLabels) 来禁用这些警告。

## 与构建工具集成

你的构建流程中可能还有一些其他构建步骤。
也许你要在每个文件中拼接某些内容。
每个构建工具都不同，但我们会尽力涵盖要点。

### Gulp

如果你以某种方式使用 Gulp，我们有一个关于 [使用 Gulp](/tutorials/gulp) 配合 TypeScript 的教程，以及与 Browserify、Babelify 和 Uglify 等常见构建工具的集成。
你可以在那里阅读更多内容。

### Webpack

Webpack 集成非常简单。
你可以使用 `ts-loader`（一个 TypeScript 加载器），结合 `source-map-loader` 以便更轻松地进行调试。
只需运行

```shell
npm install ts-loader source-map-loader
```

然后将以下选项合并到你的 `webpack.config.js` 文件中：

```js
module.exports = {
  entry: "./src/index.ts",
  output: {
    filename: "./dist/bundle.js",
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
      { test: /\.tsx?$/, loader: "ts-loader" },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { test: /\.js$/, loader: "source-map-loader" },
    ],
  },

  // Other options...
};
```

需要注意的是，ts-loader 需要在任何处理 `.js` 文件的其他加载器之前运行。

你可以在我们的 [React 和 Webpack 教程](https://www.typescriptlang.org/docs/handbook/react-&-webpack.html) 中看到使用 Webpack 的示例。

## 迁移到 TypeScript 文件

此时，你可能已经准备好开始使用 TypeScript 文件了。
第一步是将你的一个 `.js` 文件重命名为 `.ts`。
如果你的文件使用 JSX，你需要将其重命名为 `.tsx`。

完成这一步了吗？
太棒了！
你已经成功将一个文件从 JavaScript 迁移到 TypeScript！

当然，这可能感觉不太对劲。
如果你在支持 TypeScript 的编辑器中打开该文件（或者如果你运行 `tsc --pretty`），你可能会在某些行上看到红色波浪线。
你应该像看待 Microsoft Word 等编辑器中的红色波浪线一样看待这些标记。
TypeScript 仍然会翻译你的代码，就像 Word 仍然会允许你打印文档一样。

如果这对你来说太宽松了，你可以收紧这种行为。
例如，如果你 _不想_ 让 TypeScript 在出现错误时编译为 JavaScript，你可以使用 [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError) 选项。
从这个意义上说，TypeScript 有一个严格程度的调节器，你可以随心所欲地调高它。

如果你计划使用可用的更严格设置，最好现在就打开它们（参见下面的 [获取更严格的检查](#获取更严格的检查)）。
例如，如果你永远不想让 TypeScript 在没有你明确说明的情况下静默推断 `any` 类型，你可以在开始修改文件之前使用 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny)。
虽然这可能感觉有些压倒性，但长期收益会更快地显现出来。

### 清除错误

就像我们提到的，转换后出现错误消息并不意外。
重要的是逐一检查这些错误并决定如何处理它们。
通常这些会是合理的 bug，但有时你需要向 TypeScript 更好地解释你想要做什么。

#### 从模块导入

你可能会开始遇到一堆错误，比如 `Cannot find name 'require'.` 和 `Cannot find name 'define'.`。
在这些情况下，很可能你正在使用模块。
虽然你可以通过写出以下内容来说服 TypeScript 这些东西存在

```ts
// For Node/CommonJS
declare function require(path: string): any;
```

或者

```ts
// For RequireJS/AMD
declare function define(...args: any[]): any;
```

但最好摆脱这些调用，使用 TypeScript 的导入语法。

首先，你需要通过设置 TypeScript 的 [`module`](https://www.typescriptlang.org/tsconfig#module) 选项来启用某种模块系统。
有效选项是 `commonjs`、`amd`、`system` 和 `umd`。

如果你有以下 Node/CommonJS 代码：

```js
var foo = require("foo");

foo.doStuff();
```

或者以下 RequireJS/AMD 代码：

```js
define(["foo"], function (foo) {
  foo.doStuff();
});
```

那么你会编写以下 TypeScript 代码：

```ts
import foo = require("foo");

foo.doStuff();
```

#### 获取声明文件

如果你开始转换为 TypeScript 导入，你可能会遇到像 `Cannot find module 'foo'.` 这样的错误。
这里的问题是你可能没有 _声明文件_ 来描述你的库。
幸运的是这很容易解决。
如果 TypeScript 抱怨像 `lodash` 这样的包，你可以直接写

```shell
npm install -S @types/lodash
```

如果你使用的模块选项不是 `commonjs`，你需要将 [`moduleResolution`](https://www.typescriptlang.org/tsconfig#moduleResolution) 选项设置为 `node`。

之后，你就可以毫无问题地导入 lodash，并获得准确的自动补全。

#### 从模块导出

通常，从模块导出涉及向 `exports` 或 `module.exports` 这样的值添加属性。
TypeScript 允许你使用顶级导出语句。
例如，如果你像这样导出一个函数：

```js
module.exports.feedPets = function (pets) {
  // ...
};
```

你可以将其写成如下形式：

```ts
export function feedPets(pets) {
  // ...
}
```

有时你会完全覆盖导出对象。
这是人们用来使他们的模块可立即调用的一种常见模式，如下面的代码片段所示：

```js
var express = require("express");
var app = express();
```

你可能之前是这样写的：

```js
function foo() {
  // ...
}
module.exports = foo;
```

在 TypeScript 中，你可以用 `export =` 结构来模拟这种行为。

```ts
function foo() {
  // ...
}
export = foo;
```

#### 参数过多/过少

有时你会发现自己用过多或过少的参数调用函数。
通常，这是一个 bug，但在某些情况下，你可能声明了一个使用 `arguments` 对象而不是写出任何参数的函数：

```js
function myCoolFunction() {
  if (arguments.length == 2 && !Array.isArray(arguments[1])) {
    var f = arguments[0];
    var arr = arguments[1];
    // ...
  }
  // ...
}

myCoolFunction(
  function (x) {
    console.log(x);
  },
  [1, 2, 3, 4]
);
myCoolFunction(
  function (x) {
    console.log(x);
  },
  1,
  2,
  3,
  4
);
```

在这种情况下，我们需要使用 TypeScript 通过函数重载来告诉调用者 `myCoolFunction` 可以被调用的方式。

```ts
function myCoolFunction(f: (x: number) => void, nums: number[]): void;
function myCoolFunction(f: (x: number) => void, ...nums: number[]): void;
function myCoolFunction() {
  if (arguments.length == 2 && !Array.isArray(arguments[1])) {
    var f = arguments[0];
    var arr = arguments[1];
    // ...
  }
  // ...
}
```

我们为 `myCoolFunction` 添加了两个重载签名。
第一个签名声明 `myCoolFunction` 接受一个函数（该函数接受一个 `number`），然后是一个 `number` 列表。
第二个签名说它也接受一个函数，然后使用剩余参数（`...nums`）来声明之后的任何参数都需要是 `number` 类型。

#### 顺序添加的属性

有些人觉得创建一个对象然后立即添加属性更具美感，如下所示：

```js
var options = {};
options.color = "red";
options.volume = 11;
```

TypeScript 会说你不能给 `color` 和 `volume` 赋值，因为它首先将 `options` 的类型推断为 `{}`，而 `{}` 没有任何属性。
如果你改为将声明移到对象字面量本身中，你就不会得到错误：

```ts
let options = {
  color: "red",
  volume: 11,
};
```

你也可以定义 `options` 的类型，并在对象字面量上添加类型断言。

```ts
interface Options {
  color: string;
  volume: number;
}

let options = {} as Options;
options.color = "red";
options.volume = 11;
```

或者，你可以直接说 `options` 的类型是 `any`，这是最简单的做法，但对你的好处最少。

#### `any`、`Object` 和 `{}`

你可能会想使用 `Object` 或 `{}` 来表示一个值可以具有任何属性，因为 `Object` 在大多数情况下是最通用的类型。
然而，**`any` 实际上才是你在这些情况下想要使用的类型**，因为它是最 _灵活_ 的类型。

例如，如果你有类型为 `Object` 的东西，你将无法在其上调用像 `toLowerCase()` 这样的方法。
更通用的类型通常意味着你能用它做的事情更少，但 `any` 是特殊的，它是最通用的类型，同时仍然允许你对它做任何事情。
这意味着你可以调用它、构造它、访问它的属性等。
但请记住，每当你使用 `any` 时，你就会失去 TypeScript 提供给你的大部分错误检查和编辑器支持。

如果必须在 `Object` 和 `{}` 之间做出选择，你应该优先选择 `{}`。
虽然它们大多相同，但从技术上讲，在某些特殊情况下 `{}` 比 `Object` 更通用。

### 获取更严格的检查

TypeScript 带有一些检查，可以为你的程序提供更多的安全性和分析。
一旦你将代码库转换为 TypeScript，你就可以开始启用这些检查以获得更高的安全性。

#### 禁止隐式 `any`

在某些情况下，TypeScript 无法确定某些类型应该是什么。
为了尽可能宽松，它会决定使用 `any` 类型代替。
虽然这对迁移很有好处，但使用 `any` 意味着你没有获得任何类型安全，也不会获得与其他地方相同的工具支持。
你可以使用 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 选项告诉 TypeScript 标记这些位置并给出错误。

#### 严格的 `null` 和 `undefined` 检查

默认情况下，TypeScript 假设 `null` 和 `undefined` 在每个类型的域中。
这意味着用 `number` 类型声明的任何东西都可能是 `null` 或 `undefined`。
由于 `null` 和 `undefined` 是 JavaScript 和 TypeScript 中如此频繁的 bug 来源，TypeScript 提供了 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 选项，让你免于担心这些问题。

当启用 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 时，`null` 和 `undefined` 获得它们自己的类型，分别称为 `null` 和 `undefined`。
每当任何东西 _可能_ 是 `null` 时，你可以使用与原始类型的联合类型。
例如，如果某个东西可能是 `number` 或 `null`，你会将类型写成 `number | null`。

如果你有一个 TypeScript 认为可能是 `null`/`undefined` 的值，但你知道不是这样，你可以使用后缀 `!` 运算符来告诉它：

```ts
declare var foo: string[] | null;

foo.length; // error - 'foo' is possibly 'null'

foo!.length; // okay - 'foo!' just has type 'string[]'
```

提醒一下，当使用 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 时，你的依赖项可能也需要更新以使用 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)。

#### 禁止 `this` 的隐式 `any`

当你在类之外使用 `this` 关键字时，它默认具有 `any` 类型。
例如，想象一个 `Point` 类，以及一个我们希望添加为方法的函数：

```ts
class Point {
  constructor(public x, public y) {}
  getDistance(p: Point) {
    let dx = p.x - this.x;
    let dy = p.y - this.y;
    return Math.sqrt(dx ** 2 + dy ** 2);
  }
}
// ...

// Reopen the interface.
interface Point {
  distanceFromOrigin(): number;
}
Point.prototype.distanceFromOrigin = function () {
  return this.getDistance({ x: 0, y: 0 });
};
```

这存在我们上面提到的相同问题——我们很容易拼错 `getDistance` 而不会得到错误。
因此，TypeScript 提供了 [`noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis) 选项。
当设置该选项时，TypeScript 会在没有显式（或推断）类型的情况下使用 `this` 时发出错误。
解决方法是使用 `this` 参数在接口或函数本身中给出显式类型：

```ts
Point.prototype.distanceFromOrigin = function (this: Point) {
  return this.getDistance({ x: 0, y: 0 });
};
```
