---
title: 模块
---

JavaScript 在模块化代码方面有着悠久的历史。
TypeScript 自 2012 年诞生以来，已经实现了对多种模块格式的支持，但随着时间推移，社区和 JavaScript 规范逐渐趋同于一种称为 ES 模块（或 ES6 模块）的格式。你可能知道它是 `import`/`export` 语法。

ES 模块于 2015 年被添加到 JavaScript 规范中，到 2020 年已在大多数 Web 浏览器和 JavaScript 运行时中得到广泛支持。

为了保持重点，本手册将介绍 ES 模块及其流行的前身 CommonJS 的 `module.exports =` 语法，你可以在参考部分的 [模块](https://www.typescriptlang.org/docs/handbook/modules.html) 中找到关于其他模块模式的更多信息。

## JavaScript 模块是如何定义的

在 TypeScript 中，就像在 ECMAScript 2015 中一样，任何包含顶级 `import` 或 `export` 的文件都被视为模块。

相反，没有任何顶级 import 或 export 声明的文件被视为脚本，其内容在全局作用域中可用（因此对模块也可用）。

模块在自己的作用域内执行，而不是在全局作用域中。
这意味着在模块中声明的变量、函数、类等在模块外部不可见，除非它们使用某种 export 形式显式导出。
相反，要使用从不同模块导出的变量、函数、类、接口等，必须使用某种 import 形式导入。

## 非模块

在开始之前，了解 TypeScript 认为什么是模块很重要。
JavaScript 规范声明，任何没有 `import` 声明、`export` 或顶级 `await` 的 JavaScript 文件都应被视为脚本而不是模块。

在脚本文件中，变量和类型被声明为在共享的全局作用域中，并且假设你要么使用 [`outFile`](https://www.typescriptlang.org/tsconfig#outFile) 编译器选项将多个输入文件合并为一个输出文件，要么在 HTML 中使用多个 `<script>` 标签来加载这些文件（按正确的顺序！）。

如果你有一个目前没有 `import` 或 `export` 的文件，但你想将其视为模块，请添加以下行：

```ts twoslash
export {};
```

这将把文件更改为不导出任何内容的模块。无论你的模块目标是什么，此语法都有效。

## TypeScript 中的模块

<blockquote class='bg-reading'>
   <p>延伸阅读：<br />
   <a href='https://exploringjs.com/impatient-js/ch_modules.html#overview-syntax-of-ecmascript-modules'>Impatient JS (Modules)</a><br/>
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules'>MDN: JavaScript Modules</a><br/>
   </p>
</blockquote>

在 TypeScript 中编写基于模块的代码时，需要考虑三个主要方面：

- **语法**：我想使用什么语法来导入和导出内容？
- **模块解析**：模块名称（或路径）与磁盘上的文件之间的关系是什么？
- **模块输出目标**：我生成的 JavaScript 模块应该是什么样的？

### ES 模块语法

文件可以通过 `export default` 声明一个主要导出：

```ts twoslash
// @filename: hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
```

然后通过以下方式导入：

```ts twoslash
// @filename: hello.ts
export default function helloWorld() {
  console.log("Hello, world!");
}
// @filename: index.ts
// ---cut---
import helloWorld from "./hello.js";
helloWorld();
```

除了默认导出外，你还可以通过省略 `default` 使用 `export` 导出多个变量和函数：

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;

export class RandomNumberGenerator {}

export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
```

这些可以通过 `import` 语法在另一个文件中使用：

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;
export class RandomNumberGenerator {}
export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
// @filename: app.ts
// ---cut---
import { pi, phi, absolute } from "./maths.js";

console.log(pi);
const absPhi = absolute(phi);
```

### 额外的导入语法

可以使用 `import {old as new}` 格式重命名导入：

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
// @filename: app.ts
// ---cut---
import { pi as π } from "./maths.js";

console.log(π);
```

你可以将上述语法混合到一个 `import` 中：

```ts twoslash
// @filename: maths.ts
export const pi = 3.14;
export default class RandomNumberGenerator {}

// @filename: app.ts
import RandomNumberGenerator, { pi as π } from "./maths.js";

RandomNumberGenerator;

console.log(π);
```

你可以使用 `* as name` 将所有导出的对象放入一个命名空间：

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
export let squareTwo = 1.41;
export const phi = 1.61;

export function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}
// ---cut---
// @filename: app.ts
import * as math from "./maths.js";

console.log(math.pi);
const positivePhi = math.absolute(math.phi);
```

你可以通过 `import "./file"` 导入文件而 _不_ 将任何变量包含到当前模块中：

```ts twoslash
// @filename: maths.ts
export var pi = 3.14;
// ---cut---
// @filename: app.ts
import "./maths.js";

console.log("3.14");
```

在这种情况下，`import` 什么也不做。但是，`maths.ts` 中的所有代码都被执行了，这可能会触发影响其他对象的副作用。

#### TypeScript 特定的 ES 模块语法

类型可以使用与 JavaScript 值相同的语法导出和导入：

```ts twoslash
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };

export interface Dog {
  breeds: string[];
  yearOfBirth: number;
}

// @filename: app.ts
import { Cat, Dog } from "./animal.js";
type Animals = Cat | Dog;
```

TypeScript 扩展了 `import` 语法，引入了两个用于声明类型导入的概念：

###### `import type`

这是一个 _只能_ 导入类型的导入语句：

```ts twoslash
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";

// @filename: valid.ts
import type { Cat, Dog } from "./animal.js";
export type Animals = Cat | Dog;

// @filename: app.ts
// @errors: 1361
import type { createCatName } from "./animal.js";
const name = createCatName();
```

###### 内联 `type` 导入

TypeScript 4.5 还允许在单个导入前添加 `type` 前缀，以表明导入的引用是一个类型：

```ts twoslash
// @filename: animal.ts
export type Cat = { breed: string; yearOfBirth: number };
export type Dog = { breeds: string[]; yearOfBirth: number };
export const createCatName = () => "fluffy";
// ---cut---
// @filename: app.ts
import { createCatName, type Cat, type Dog } from "./animal.js";

export type Animals = Cat | Dog;
const name = createCatName();
```

这些功能一起允许像 Babel、swc 或 esbuild 这样的非 TypeScript 转译器知道哪些导入可以安全地删除。

#### 具有 CommonJS 行为的 ES 模块语法

TypeScript 有一种 ES 模块语法，它 _直接_ 对应于 CommonJS 和 AMD 的 `require`。在大多数情况下，使用 ES 模块的导入与这些环境中的 `require` 相同，但这种语法确保你的 TypeScript 文件与 CommonJS 输出有 1 对 1 的匹配：

```ts twoslash
/// <reference types="node" />
// @module: commonjs
// ---cut---
import fs = require("fs");
const code = fs.readFileSync("hello.ts", "utf8");
```

你可以在 [模块参考页面](https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require) 中了解更多关于此语法的信息。

## CommonJS 语法

CommonJS 是 npm 上大多数模块交付的格式。即使你使用上述 ES 模块语法编写，简要了解 CommonJS 语法的工作原理也会帮助你更轻松地调试。

#### 导出

标识符通过在一个名为 `module` 的全局对象上设置 `exports` 属性来导出。

```ts twoslash
/// <reference types="node" />
// ---cut---
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
```

然后可以通过 `require` 语句导入这些文件：

```ts twoslash
// @module: commonjs
// @filename: maths.ts
/// <reference types="node" />
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
// @filename: index.ts
// ---cut---
const maths = require("./maths");
maths.pi;
```

或者你可以使用 JavaScript 中的解构功能稍微简化一下：

```ts twoslash
// @module: commonjs
// @filename: maths.ts
/// <reference types="node" />
function absolute(num: number) {
  if (num < 0) return num * -1;
  return num;
}

module.exports = {
  pi: 3.14,
  squareTwo: 1.41,
  phi: 1.61,
  absolute,
};
// @filename: index.ts
// ---cut---
const { squareTwo } = require("./maths");
squareTwo;
```

### CommonJS 和 ES 模块的互操作

CommonJS 和 ES 模块在区分默认导入和模块命名空间对象导入方面存在功能不匹配。TypeScript 有一个编译器标志 [`esModuleInterop`](https://www.typescriptlang.org/tsconfig#esModuleInterop) 来减少这两组不同约束之间的摩擦。

## TypeScript 的模块解析选项

模块解析是将 `import` 或 `require` 语句中的字符串转换为该字符串所引用的文件的过程。

TypeScript 包含两种解析策略：Classic 和 Node。当编译器选项 [`module`](https://www.typescriptlang.org/tsconfig#module) 不是 `commonjs` 时，Classic 是默认的，它是为了向后兼容而包含的。
Node 策略复制了 Node.js 在 CommonJS 模式下的工作方式，并额外检查 `.ts` 和 `.d.ts`。

有许多 TSConfig 标志会影响 TypeScript 中的模块策略：[`moduleResolution`](https://www.typescriptlang.org/tsconfig#moduleResolution)、[`baseUrl`](https://www.typescriptlang.org/tsconfig#baseUrl)、[`paths`](https://www.typescriptlang.org/tsconfig#paths)、[`rootDirs`](https://www.typescriptlang.org/tsconfig#rootDirs)。

有关这些策略如何工作的完整详细信息，你可以查阅 [模块解析](https://www.typescriptlang.org/docs/handbook/modules/reference.html#the-moduleresolution-compiler-option) 参考页面。

## TypeScript 的模块输出选项

有两个选项会影响生成的 JavaScript 输出：

- [`target`](https://www.typescriptlang.org/tsconfig#target) 决定哪些 JS 特性被降级（转换为在较旧的 JavaScript 运行时中运行），哪些保持原样
- [`module`](https://www.typescriptlang.org/tsconfig#module) 决定模块之间交互使用什么代码

你使用哪个 [`target`](https://www.typescriptlang.org/tsconfig#target) 取决于你期望运行 TypeScript 代码的 JavaScript 运行时中可用的特性。这可能是：你支持的最旧的 Web 浏览器，你期望运行的最低版本的 Node.js，或者可能来自运行时的独特约束——例如 Electron。

模块之间的所有通信都通过模块加载器进行，编译器选项 [`module`](https://www.typescriptlang.org/tsconfig#module) 决定使用哪一个。
在运行时，模块加载器负责在执行模块之前定位和执行模块的所有依赖项。

例如，这里是一个使用 ES 模块语法的 TypeScript 文件，展示了 [`module`](https://www.typescriptlang.org/tsconfig#module) 的几个不同选项：

```ts twoslash
// @filename: constants.ts
export const valueOfPi = 3.142;
// @filename: index.ts
// ---cut---
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

#### `ES2020`

```ts twoslash
// @showEmit
// @module: es2020
// @noErrors
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

#### `CommonJS`

```ts twoslash
// @showEmit
// @module: commonjs
// @noErrors
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

#### `UMD`

```ts twoslash
// @showEmit
// @module: umd
// @moduleResolution: node
// @noErrors
import { valueOfPi } from "./constants.js";

export const twoPi = valueOfPi * 2;
```

> 注意 ES2020 实际上与原始的 `index.ts` 相同。

你可以在 [`module`](https://www.typescriptlang.org/tsconfig#module) 的 TSConfig 参考中查看所有可用选项及其生成的 JavaScript 代码的样子。

## TypeScript 命名空间

TypeScript 有自己的模块格式称为 `namespaces`，它早于 ES 模块标准。这种语法在创建复杂的定义文件时有很多有用的功能，并且在 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 中仍然活跃使用。虽然没有被弃用，但命名空间中的大多数功能在 ES 模块中都存在，我们建议你使用 ES 模块以与 JavaScript 的方向保持一致。你可以在 [命名空间参考页面](https://www.typescriptlang.org/docs/handbook/namespaces.html) 中了解更多关于命名空间的信息。
