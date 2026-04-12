---
title: 模块 - 参考
---

## 模块语法

TypeScript 编译器在 TypeScript 和 JavaScript 文件中识别标准的 [ECMAScript 模块语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)，并在 JavaScript 文件中识别多种形式的 [CommonJS 语法](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html#commonjs-modules-are-supported)。

还有一些 TypeScript 特定的语法扩展，可以在 TypeScript 文件和/或 JSDoc 注释中使用。

### 导入和导出 TypeScript 特定的声明

类型别名、接口、枚举和命名空间可以像任何标准 JavaScript 声明一样，使用 `export` 修饰符从模块中导出：

```ts
// Standard JavaScript syntax...
export function f() {}
// ...extended to type declarations
export type SomeType = /* ... */;
export interface SomeInterface { /* ... */ }
```

它们也可以在命名导出中引用，甚至与标准 JavaScript 声明的引用一起：

```ts
export { f, SomeType, SomeInterface };
```

导出的类型（和其他 TypeScript 特定的声明）可以使用标准 ECMAScript 导入来导入：

```ts
import { f, SomeType, SomeInterface } from "./module.js";
```

当使用命名空间导入或导出时，导出的类型在类型位置引用时可以在命名空间上使用：

```ts
import * as mod from "./module.js";
mod.f();
mod.SomeType; // Property 'SomeType' does not exist on type 'typeof import("./module.js")'
let x: mod.SomeType; // Ok
```

### 仅类型导入和导出

在将导入和导出生成到 JavaScript 时，默认情况下，TypeScript 会自动省略（不生成）仅在类型位置使用的导入和仅引用类型的导出。仅类型导入和导出可用于强制此行为并使省略显式化。使用 `import type` 编写的导入声明、使用 `export type { ... }` 编写的导出声明，以及带有 `type` 关键字前缀的导入或导出说明符都保证会从输出的 JavaScript 中省略。

```ts
// @Filename: main.ts
import { f, type SomeInterface } from "./module.js";
import type { SomeType } from "./module.js";

class C implements SomeInterface {
  constructor(p: SomeType) {
    f();
  }
}

export type { C };

// @Filename: main.js
import { f } from "./module.js";

class C {
  constructor(p) {
    f();
  }
}
```

即使是值也可以使用 `import type` 导入，但由于它们不会存在于输出的 JavaScript 中，因此只能在非生成位置使用：

```ts
import type { f } from "./module.js";
f(); // 'f' cannot be used as a value because it was imported using 'import type'
let otherFunction: typeof f = () => {}; // Ok
```

仅类型导入声明不能同时声明默认导入和命名绑定，因为 `type` 是应用于默认导入还是整个导入声明存在歧义。相反，将导入声明拆分为两个，或将 `default` 用作命名绑定：

```ts
import type fs, { BigIntOptions } from "fs";
//          ^^^^^^^^^^^^^^^^^^^^^
// Error: A type-only import can specify a default import or named bindings, but not both.

import type { default as fs, BigIntOptions } from "fs"; // Ok
```

### `import()` 类型

TypeScript 提供了一种类似于 JavaScript 动态 `import` 的类型语法，用于引用模块的类型而无需编写导入声明：

```ts
// Access an exported type:
type WriteFileOptions = import("fs").WriteFileOptions;
// Access the type of an exported value:
type WriteFileFunction = typeof import("fs").writeFile;
```

这在 JavaScript 文件的 JSDoc 注释中特别有用，因为在那里无法导入类型：

```ts
/** @type {import("webpack").Configuration} */
module.exports = {
  // ...
}
```

### `export =` 和 `import = require()`

在生成 CommonJS 模块时，TypeScript 文件可以使用 `module.exports = ...` 和 `const mod = require("...")` JavaScript 语法的直接类似物：

```ts
// @Filename: main.ts
import fs = require("fs");
export = fs.readFileSync("...");

// @Filename: main.js
"use strict";
const fs = require("fs");
module.exports = fs.readFileSync("...");
```

之所以使用这种语法而不是其 JavaScript 对应语法，是因为变量声明和属性赋值无法引用 TypeScript 类型，而特殊的 TypeScript 语法可以：

```ts
// @Filename: a.ts
interface Options { /* ... */ }
module.exports = Options; // Error: 'Options' only refers to a type, but is being used as a value here.
export = Options; // Ok

// @Filename: b.ts
const Options = require("./a");
const options: Options = { /* ... */ }; // Error: 'Options' refers to a value, but is being used as a type here.

// @Filename: c.ts
import Options = require("./a");
const options: Options = { /* ... */ }; // Ok
```

### 环境模块

TypeScript 支持在脚本（非模块）文件中使用一种语法来声明在运行时存在但没有相应文件的模块。这些 _环境模块_ 通常表示运行时提供的模块，如 Node.js 中的 `"fs"` 或 `"path"`：

```ts
declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}
```

一旦环境模块加载到 TypeScript 程序中，TypeScript 将识别其他文件中声明模块的导入：

```ts
// Ensure the ambient module is loaded -
//    may be unnecessary if path.d.ts is included
//    by the project tsconfig.json somehow.
/// <reference path="path.d.ts" />

import { normalize, join } from "path";
```

环境模块声明很容易与 [模块扩展](/reference/declaration-merging#模块扩展) 混淆，因为它们使用相同的语法。当文件是模块时，这种模块声明语法就变成了模块扩展，意味着它具有顶级 `import` 或 `export` 语句（或受 [`--moduleDetection force` 或 `auto`](https://www.typescriptlang.org/tsconfig#moduleDetection) 影响）：

```ts
// Not an ambient module declaration anymore!
export {};
declare module "path" {
  export function normalize(p: string): string;
  export function join(...paths: any[]): string;
  export var sep: string;
}
```

环境模块可以在模块声明体内使用导入来引用其他模块，而不会将包含文件变成模块（这会使环境模块声明变成模块扩展）：

```ts
declare module "m" {
  // Moving this outside "m" would totally change the meaning of the file!
  import { SomeType } from "other";
  export function f(): SomeType;
}
```

_模式_ 环境模块在其名称中包含单个 `*` 通配符字符，匹配导入路径中的零个或多个字符。这对于声明由自定义加载器提供的模块很有用：

```ts
declare module "*.html" {
  const content: string;
  export default content;
}
```

## `module` 编译器选项

本节讨论每个 `module` 编译器选项值的详细信息。有关该选项是什么以及它如何适应整体编译过程的更多背景信息，请参阅 [_模块输出格式_](/modules-reference/theory.html#the-module-output-format) 理论部分。简而言之，`module` 编译器选项历史上仅用于控制生成的 JavaScript 文件的输出模块格式。然而，较新的 `node16`、`node18` 和 `nodenext` 值描述了 Node.js 模块系统的广泛特性，包括支持哪些模块格式、如何确定每个文件的模块格式，以及不同模块格式如何互操作。

### `node16`、`node18`、`node20`、`nodenext`

Node.js 支持 CommonJS 和 ECMAScript 模块，对每个文件可以使用哪种格式以及允许两种格式如何互操作有特定的规则。`node16`、`node18` 和 `nodenext` 描述了 Node.js 双格式模块系统的完整行为范围，并 **生成 CommonJS 或 ESM 格式的文件**。这与其他每个 `module` 选项都不同，后者是与运行时无关的，并强制所有输出文件采用单一格式，由用户确保输出对其运行时有效。

> 一个常见的误解是 `node16`—`nodenext` 只生成 ES 模块。实际上，这些模式描述的是 _支持_ ES 模块的 Node.js 版本，而不仅仅是 _使用_ ES 模块的项目。基于每个文件的 [检测到的模块格式](#module-format-detection)，支持 ESM 和 CommonJS 生成。因为它们是唯一反映 Node.js 双模块系统复杂性的 `module` 选项，所以它们是所有旨在在 Node.js v12 或更高版本中运行的应用程序和库的 **唯一正确的 `module` 选项**，无论它们是否使用 ES 模块。

固定版本 `node16` 和 `node18` 模式表示各自 Node.js 版本中稳定的模块系统行为，而 `nodenext` 模式会随着 Node.js 的最新稳定版本而变化。下表总结了三种模式之间的当前差异：

|          | `target` | `moduleResolution` | import assertions | import attributes | JSON imports        | require(esm) |
|----------|----------|--------------------|-------------------|-------------------|---------------------|--------------|
| node16   | `es2022` | `node16`           | ❌                | ❌                 | no restrictions     | ❌           |
| node18   | `es2022` | `node16`           | ✅                | ✅                 | needs `type "json"` | ❌           |
| nodenext | `esnext` | `nodenext`         | ❌                | ✅                 | needs `type "json"` | ✅           |

#### 模块格式检测 {#module-format-detection}

- `.mts`/`.mjs`/`.d.mts` 文件始终是 ES 模块。
- `.cts`/`.cjs`/`.d.cts` 文件始终是 CommonJS 模块。
- `.ts`/`.tsx`/`.js`/`.jsx`/`.d.ts` 文件如果最近的祖先 package.json 文件包含 `"type": "module"`，则为 ES 模块，否则为 CommonJS 模块。

输入 `.ts`/`.tsx`/`.mts`/`.cts` 文件的检测到的模块格式决定了生成的 JavaScript 文件的模块格式。因此，例如，一个完全由 `.ts` 文件组成的项目在 `--module nodenext` 下默认会生成所有 CommonJS 模块，并且可以通过向项目 package.json 添加 `"type": "module"` 来使其生成所有 ES 模块。

#### 互操作性规则

- **当 ES 模块引用 CommonJS 模块时：**
  - CommonJS 模块的 `module.exports` 可作为默认导入供 ES 模块使用。
  - CommonJS 模块的 `module.exports` 的属性（除 `default` 外）可能作为命名导入供 ES 模块使用，也可能不可用。Node.js 尝试通过 [静态分析](https://github.com/nodejs/cjs-module-lexer) 使它们可用。TypeScript 无法从声明文件中知道该静态分析是否会成功，并乐观地假设它会成功。这限制了 TypeScript 捕获可能在运行时崩溃的命名导入的能力。有关更多详细信息，请参阅 [#54018](https://github.com/microsoft/TypeScript/issues/54018)。
- **当 CommonJS 模块引用 ES 模块时：**
  - 在 `node16` 和 `node18` 中，`require` 不能引用 ES 模块。对于 TypeScript，这包括在被 [检测](#module-format-detection) 为 CommonJS 模块的文件中的 `import` 语句，因为这些 `import` 语句将在生成的 JavaScript 中被转换为 `require` 调用。
  - 在 `nodenext` 中，为了反映 Node.js v22.12.0 及更高版本的行为，`require` 可以引用 ES 模块。在 Node.js 中，如果 ES 模块或其导入的模块使用顶级 `await`，则会抛出错误。TypeScript 不尝试检测这种情况，也不会生成编译时错误。`require` 调用的结果是模块的模块命名空间对象，即与同一模块的 `await import()` 结果相同（但无需 `await` 任何内容）。
  - 动态 `import()` 调用始终可用于导入 ES 模块。它返回模块的模块命名空间对象的 Promise（即从另一个 ES 模块执行 `import * as ns from "./module.js"` 会得到的结果）。

#### 生成

每个文件的生成格式由每个文件的 [检测到的模块格式](#module-format-detection) 决定。ESM 生成类似于 [`--module esnext`](#es2015-es2020-es2022-esnext)，但对 `import x = require("...")` 有特殊转换，这在 `--module esnext` 中是不允许的：

```ts
// @Filename: main.ts
import x = require("mod");
```

```js
// @Filename: main.js
import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
const x = __require("mod");
```

CommonJS 生成类似于 [`--module commonjs`](#commonjs)，但动态 `import()` 调用不会被转换。此处显示的生成启用了 `esModuleInterop`：

```ts
// @Filename: main.ts
import fs from "fs"; // transformed
const dynamic = import("mod"); // not transformed
```

```js
// @Filename: main.js
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs")); // transformed
const dynamic = import("mod"); // not transformed
```

#### 隐式和强制选项

- `--module nodenext` 隐式强制 `--moduleResolution nodenext`。
- `--module node18` 或 `node16` 隐式强制 `--moduleResolution node16`。
- `--module nodenext` 隐式 `--target esnext`。
- `--module node18` 或 `node16` 隐式 `--target es2022`。
- `--module nodenext` 或 `node18` 或 `node16` 隐式 `--esModuleInterop`。

#### 总结

- `node16`、`node18` 和 `nodenext` 是所有旨在在 Node.js v12 或更高版本中运行的应用程序和库的唯一正确的 `module` 选项，无论它们是否使用 ES 模块。
- `node16`、`node18` 和 `nodenext` 基于每个文件的 [检测到的模块格式](#module-format-detection) 生成 CommonJS 或 ESM 格式的文件。
- Node.js 的 ESM 和 CJS 之间的互操作性规则在类型检查中得到反映。
- ESM 生成将 `import x = require("...")` 转换为从 `createRequire` 导入构建的 `require` 调用。
- CommonJS 生成保留动态 `import()` 调用不变，因此 CommonJS 模块可以异步导入 ES 模块。

### `preserve`

在 `--module preserve`（在 TypeScript 5.4 中[添加](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)）中，输入文件中编写的 ECMAScript 导入和导出在输出中保留，而 CommonJS 风格的 `import x = require("...")` 和 `export = ...` 语句作为 CommonJS `require` 和 `module.exports` 生成。换句话说，每个单独的导入或导出语句的格式被保留，而不是被强制转换为整个编译（甚至整个文件）的单一格式。

虽然在同一个文件中混合导入和 require 调用很少见，但这种 `module` 模式最能反映大多数现代打包器以及 Bun 运行时的功能。

> 为什么要关心 TypeScript 的 `module` 生成与打包器或 Bun 一起使用，在那里你可能还设置了 `noEmit`？TypeScript 的类型检查和模块解析行为受其 _将要_ 生成的模块格式的影响。设置 `module` 为 TypeScript 提供有关打包器或运行时将如何处理导入和导出的信息，这确保你在导入值上看到的类型准确地反映运行时或打包后会发生的情况。有关更多讨论，请参阅 [`--moduleResolution bundler`](#bundler)。

#### 示例

```ts
// @Filename: main.ts
import x, { y, z } from "mod";
import mod = require("mod");
const dynamic = import("mod");

export const e1 = 0;
export default "default export";
```

```js
// @Filename: main.js
import x, { y, z } from "mod";
const mod = require("mod");
const dynamic = import("mod");

export const e1 = 0;
export default "default export";
```

#### 隐式和强制选项

- `--module preserve` 隐式 `--moduleResolution bundler`。
- `--module preserve` 隐式 `--esModuleInterop`。

> 选项 `--esModuleInterop` 仅在 `--module preserve` 中默认启用其 [类型检查](/modules-reference/appendices/esm-cjs-interop#allowsyntheticdefaultimports-and-esmoduleinterop) 行为。由于在 `--module preserve` 中导入永远不会转换为 require 调用，`--esModuleInterop` 不会影响生成的 JavaScript。

### `es2015`、`es2020`、`es2022`、`esnext` {#es2015-es2020-es2022-esnext}

#### 总结

- 将 `esnext` 与 `--moduleResolution bundler` 一起用于打包器、Bun 和 tsx。
- 不要用于 Node.js。使用 `node16`、`node18` 或 `nodenext` 并在 package.json 中设置 `"type": "module"` 来为 Node.js 生成 ES 模块。
- 在非声明文件中不允许 `import mod = require("mod")`。
- `es2020` 添加了对 `import.meta` 属性的支持。
- `es2022` 添加了对顶级 `await` 的支持。
- `esnext` 是一个动态目标，可能包括对 ECMAScript 模块的 Stage 3 提案的支持。
- 生成的文件是 ES 模块，但依赖项可以是任何格式。

#### 示例

```ts
// @Filename: main.ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
// @Filename: main.js
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

### `commonjs` {#commonjs}

#### 总结

- 你可能不应该使用这个。使用 `node16`、`node18` 或 `nodenext` 为 Node.js 生成 CommonJS 模块。
- 生成的文件是 CommonJS 模块，但依赖项可以是任何格式。
- 动态 `import()` 被转换为 `require()` 调用的 Promise。
- `esModuleInterop` 影响默认导入和命名空间导入的输出代码。

#### 示例

> 输出显示为 `esModuleInterop: false`。

```ts
// @Filename: main.ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
// @Filename: main.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.e1 = void 0;
const mod_1 = require("mod");
const mod = require("mod");
const dynamic = Promise.resolve().then(() => require("mod"));

console.log(mod_1.default, mod_1.y, mod_1.z, mod);
exports.e1 = 0;
exports.default = "default export";
```

```ts
// @Filename: main.ts
import mod = require("mod");
console.log(mod);

export = {
    p1: true,
    p2: false
};
```

```js
// @Filename: main.js
"use strict";
const mod = require("mod");
console.log(mod);

module.exports = {
    p1: true,
    p2: false
};
```

### `system`

#### 总结

- 设计用于与 [SystemJS 模块加载器](https://github.com/systemjs/systemjs) 一起使用。

#### 示例

```ts
// @Filename: main.ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
// @Filename: main.js
System.register(["mod"], function (exports_1, context_1) {
    "use strict";
    var mod_1, mod, dynamic, e1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (mod_1_1) {
                mod_1 = mod_1_1;
                mod = mod_1_1;
            }
        ],
        execute: function () {
            dynamic = context_1.import("mod");
            console.log(mod_1.default, mod_1.y, mod_1.z, mod, dynamic);
            exports_1("e1", e1 = 0);
            exports_1("default", "default export");
        }
    };
});
```

### `amd`

#### 总结

- 设计用于 AMD 加载器，如 RequireJS。
- 你可能不应该使用这个。使用打包器代替。
- 生成的文件是 AMD 模块，但依赖项可以是任何格式。
- 支持 `outFile`。

#### 示例

```ts
// @Filename: main.ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
// @Filename: main.js
define(["require", "exports", "mod", "mod"], function (require, exports, mod_1, mod) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.e1 = void 0;
    const dynamic = new Promise((resolve_1, reject_1) => { require(["mod"], resolve_1, reject_1); });

    console.log(mod_1.default, mod_1.y, mod_1.z, mod, dynamic);
    exports.e1 = 0;
    exports.default = "default export";
});
```

### `umd`

#### 总结

- 设计用于 AMD 或 CommonJS 加载器。
- 不像大多数其他 UMD 包装器那样暴露全局变量。
- 你可能不应该使用这个。使用打包器代替。
- 生成的文件是 UMD 模块，但依赖项可以是任何格式。

#### 示例

```ts
// @Filename: main.ts
import x, { y, z } from "mod";
import * as mod from "mod";
const dynamic = import("mod");
console.log(x, y, z, mod, dynamic);

export const e1 = 0;
export default "default export";
```

```js
// @Filename: main.js
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "mod", "mod"], factory);
    }
})(function (require, exports) {
    "use strict";
    var __syncRequire = typeof module === "object" && typeof module.exports === "object";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.e1 = void 0;
    const mod_1 = require("mod");
    const mod = require("mod");
    const dynamic = __syncRequire ? Promise.resolve().then(() => require("mod")) : new Promise((resolve_1, reject_1) => { require(["mod"], resolve_1, reject_1); });

    console.log(mod_1.default, mod_1.y, mod_1.z, mod, dynamic);
    exports.e1 = 0;
    exports.default = "default export";
});
```

## `moduleResolution` 编译器选项

本节描述多个 `moduleResolution` 模式共享的模块解析特性和过程，然后指定每个模式的详细信息。有关该选项是什么以及它如何适应整体编译过程的更多背景信息，请参阅 [_模块解析_](/modules-reference/theory.html#module-resolution) 理论部分。简而言之，`moduleResolution` 控制 TypeScript 如何将 _模块说明符_（`import`/`export`/`require` 语句中的字符串字面量）解析为磁盘上的文件，应设置为与目标运行时或打包器使用的模块解析器匹配。

### 通用特性和过程

#### 文件扩展名替换 {#file-extension-substitution}

TypeScript 始终希望内部解析到可以提供类型信息的文件，同时确保运行时或打包器可以使用相同的路径解析到提供 JavaScript 实现的文件。对于任何根据指定的 `moduleResolution` 算法会触发在运行时或打包器中查找 JavaScript 文件的模块说明符，TypeScript 将首先尝试查找具有相同名称和类似文件扩展名的 TypeScript 实现文件或类型声明文件。

| 运行时查找 | TypeScript 查找 #1 | TypeScript 查找 #2 | TypeScript 查找 #3 | TypeScript 查找 #4 | TypeScript 查找 #5 |
| -------------- | -------------------- | -------------------- | -------------------- | -------------------- | -------------------- |
| `/mod.js`      | `/mod.ts`            | `/mod.tsx`           | `/mod.d.ts`          | `/mod.js`            | `./mod.jsx`          |
| `/mod.mjs`     | `/mod.mts`           | `/mod.d.mts`         | `/mod.mjs`           |                      |                      |
| `/mod.cjs`     | `/mod.cts`           | `/mod.d.cts`         | `/mod.cjs`           |                      |                      |

请注意，此行为独立于导入中写入的实际模块说明符。这意味着即使模块说明符明确使用 `.js` 文件扩展名，TypeScript 也可以解析到 `.ts` 或 `.d.ts` 文件：

```ts
import x from "./mod.js";
// Runtime lookup: "./mod.js"
// TypeScript lookup #1: "./mod.ts"
// TypeScript lookup #2: "./mod.d.ts"
// TypeScript lookup #3: "./mod.js"
```

有关 TypeScript 的模块解析为何以这种方式工作的解释，请参阅 [_TypeScript 模仿主机的模块解析，但带有类型_](/modules-reference/theory.html#typescript-imitates-the-hosts-module-resolution-but-with-types)。

#### 相对文件路径解析 {#relative-file-path-resolution}

所有 TypeScript 的 `moduleResolution` 算法都支持通过包含文件扩展名的相对路径引用模块（将根据[上述规则](#file-extension-substitution)进行替换）：

```ts
// @Filename: a.ts
export {};

// @Filename: b.ts
import {} from "./a.js"; // ✅ Works in every `moduleResolution`
```

#### 无扩展名相对路径

在某些情况下，运行时或打包器允许从相对路径中省略 `.js` 文件扩展名。TypeScript 在 `moduleResolution` 设置和上下文表明运行时或打包器支持此行为时支持此行为：

```ts
// @Filename: a.ts
export {};

// @Filename: b.ts
import {} from "./a";
```

如果 TypeScript 确定运行时将对模块说明符 `"./a"` 执行 `./a.js` 的查找，则 `./a.js` 将经历[扩展名替换](#file-extension-substitution)，并在此示例中解析到文件 `a.ts`。

Node.js 的 `import` 路径中不支持无扩展名相对路径，并且在 package.json 文件中指定的文件路径中也不总是受支持。TypeScript 目前从不支持省略 `.mjs`/`.mts` 或 `.cjs`/`.cts` 文件扩展名，即使某些运行时和打包器支持。

#### 目录模块（索引文件解析）

在某些情况下，目录（而非文件）可以作为模块引用。在最简单和最常见的情况下，这涉及运行时或打包器在目录中查找 `index.js` 文件。TypeScript 在 `moduleResolution` 设置和上下文表明运行时或打包器支持此行为时支持此行为：

```ts
// @Filename: dir/index.ts
export {};

// @Filename: b.ts
import {} from "./dir";
```

如果 TypeScript 确定运行时将对模块说明符 `"./dir"` 执行 `./dir/index.js` 的查找，则 `./dir/index.js` 将经历[扩展名替换](#file-extension-substitution)，并在此示例中解析到文件 `dir/index.ts`。

目录模块还可能包含 package.json 文件，其中支持 [`"main"` 和 `"types"`](#packagejson-main-and-types) 字段的解析，并优先于 `index.js` 查找。[`"typesVersions"`](#packagejson-typesversions) 字段也在目录模块中受支持。

请注意，目录模块与 [`node_modules` 包](#node_modules-package-lookups) 不同，仅支持包可用功能的子集，并且在某些上下文中根本不受支持。Node.js 认为它们是[遗留功能](https://nodejs.org/dist/latest-v20.x/docs/api/modules.html#folders-as-modules)。

#### `paths`

##### 概述

TypeScript 提供了一种使用 `paths` 编译器选项覆盖编译器对裸说明符的模块解析的方法。虽然该功能最初设计为与 AMD 模块加载器一起使用（在 ESM 存在或打包器广泛使用之前在浏览器中运行模块的一种方式），但当运行时或打包器支持 TypeScript 未建模的模块解析功能时，它今天仍然有用。例如，当使用 `--experimental-network-imports` 运行 Node.js 时，你可以手动为特定的 `https://` 导入指定本地类型定义文件：

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "paths": {
      "https://esm.sh/lodash@4.17.21": ["./node_modules/@types/lodash/index.d.ts"]
    }
  }
}
```

```ts
// Typed by ./node_modules/@types/lodash/index.d.ts due to `paths` entry
import { add } from "https://esm.sh/lodash@4.17.21";
```

使用打包器构建的应用程序通常在其打包器配置中定义便捷的路径别名，然后使用 `paths` 通知 TypeScript 这些别名也很常见：

```json
{
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@app/*": ["./src/*"]
    }
  }
}
```

##### `paths` 不影响生成

`paths` 选项 _不会_ 改变 TypeScript 生成的代码中的导入路径。因此，很容易创建在 TypeScript 中看起来可以工作但在运行时会崩溃的路径别名：

```json
{
  "compilerOptions": {
    "module": "nodenext",
    "paths": {
      "node-has-no-idea-what-this-is": ["./oops.ts"]
    }
  }
}
```

```ts
// TypeScript: ✅
// Node.js: 💥
import {} from "node-has-no-idea-what-this-is";
```

虽然为打包应用程序设置 `paths` 是可以的，但发布的库 _不应该_ 这样做，因为生成的 JavaScript 不会为库的使用者工作，除非这些用户为 TypeScript 和他们的打包器设置相同的别名。库和应用程序都可以考虑使用 [package.json `"imports"`](#packagejson-imports-and-self-name-imports) 作为便捷 `paths` 别名的标准替代方案。

##### `paths` 不应指向 monorepo 包或 node_modules 包

虽然匹配 `paths` 别名的模块说明符是裸说明符，但一旦别名被解析，模块解析就会作为相对路径在解析的路径上继续进行。因此，当匹配 `paths` 别名时，[`node_modules` 包查找](#node_modules-package-lookups) 中发生的解析功能（包括 package.json `"exports"` 字段支持）不会生效。如果 `paths` 用于指向 `node_modules` 包，这可能导致令人惊讶的行为：

```ts
{
  "compilerOptions": {
    "paths": {
      "pkg": ["./node_modules/pkg/dist/index.d.ts"],
      "pkg/*": ["./node_modules/pkg/*"]
    }
  }
}
```

虽然此配置可能模拟包解析的某些行为，但它会覆盖包的 `package.json` 文件定义的任何 `main`、`types`、`exports` 和 `typesVersions`，并且来自包的导入可能在运行时失败。

同样的警告适用于 monorepo 中相互引用的包。与其使用 `paths` 使 TypeScript 人为地将 `"@my-scope/lib"` 解析为同级包，不如通过 [npm](https://docs.npmjs.com/cli/v7/using-npm/workspaces)、[yarn](https://classic.yarnpkg.com/en/docs/workspaces/) 或 [pnpm](https://pnpm.io/workspaces) 使用工作区将包符号链接到 `node_modules`，这样 TypeScript 和运行时或打包器都会执行真正的 `node_modules` 包查找。如果 monorepo 包将发布到 npm，这一点尤其重要——包将通过 `node_modules` 包查找相互引用，一旦用户安装，使用工作区允许你在本地开发期间测试该行为。

##### 与 `baseUrl` 的关系

当提供 [`baseUrl`](#baseurl) 时，`paths` 数组中的值相对于 `baseUrl` 解析。否则，它们相对于定义它们的 `tsconfig.json` 文件解析。

##### 通配符替换

`paths` 模式可以包含单个 `*` 通配符，匹配任何字符串。然后可以在文件路径值中使用 `*` 标记来替换匹配的字符串：

```json
{
  "compilerOptions": {
    "paths": {
      "@app/*": ["./src/*"]
    }
  }
}
```

在解析 `"@app/components/Button"` 的导入时，TypeScript 将匹配 `@app/*`，将 `*` 绑定到 `components/Button`，然后尝试相对于 `tsconfig.json` 路径解析路径 `./src/components/Button`。此查找的其余部分将遵循与根据 `moduleResolution` 设置的任何其他[相对路径查找](#relative-file-path-resolution)相同的规则。

当多个模式匹配模块说明符时，使用在任何 `*` 标记之前具有最长匹配前缀的模式：

```json
{
  "compilerOptions": {
    "paths": {
      "*": ["./src/foo/one.ts"],
      "foo/*": ["./src/foo/two.ts"],
      "foo/bar": ["./src/foo/three.ts"]
    }
  }
}
```

在解析 `"foo/bar"` 的导入时，所有三个 `paths` 模式都匹配，但最后一个被使用，因为 `"foo/bar"` 比 `"foo/"` 和 `""` 更长。

##### 回退

可以为路径映射提供多个文件路径。如果对一个路径的解析失败，将尝试数组中的下一个路径，直到解析成功或到达数组末尾。

```json
{
  "compilerOptions": {
    "paths": {
      "*": ["./vendor/*", "./types/*"]
    }
  }
}
```

#### `baseUrl` {#baseurl}

> `baseUrl` 设计用于与 AMD 模块加载器一起使用。如果你没有使用 AMD 模块加载器，你可能不应该使用 `baseUrl`。自 TypeScript 4.1 起，`baseUrl` 不再是使用 [`paths`](#paths) 所必需的，不应仅用于设置 `paths` 值解析的目录。

`baseUrl` 编译器选项可以与任何 `moduleResolution` 模式结合使用，并指定裸说明符（不以 `./`、`../` 或 `/` 开头的模块说明符）解析的目录。`baseUrl` 的优先级高于支持它们的 `moduleResolution` 模式中的 [`node_modules` 包查找](#node_modules-package-lookups)。

在执行 `baseUrl` 查找时，解析按照与其他相对路径解析相同的规则进行。例如，在支持[无扩展名相对路径](#extensionless-relative-paths)的 `moduleResolution` 模式中，如果 `baseUrl` 设置为 `/src`，模块说明符 `"some-file"` 可能会解析到 `/src/some-file.ts`。

相对模块说明符的解析从不受 `baseUrl` 选项的影响。

#### `node_modules` 包查找 {#node_modules-package-lookups}

Node.js 将不是相对路径、绝对路径或 URL 的模块说明符视为对其在 `node_modules` 子目录中查找的包的引用。打包器方便地采用了这种行为，允许其用户使用与在 Node.js 中相同的依赖管理系统，甚至通常使用相同的依赖。除 `classic` 外，所有 TypeScript 的 `moduleResolution` 选项都支持 `node_modules` 查找。（`classic` 在其他解析方式失败时支持在 `node_modules/@types` 中查找，但从不直接在 `node_modules` 中查找包。）每个 `node_modules` 包查找具有以下结构（在更高优先级的裸说明符规则（如 `paths`、`baseUrl`、自名导入和 package.json `"imports"` 查找）耗尽后开始）：

1. 对于导入文件的每个祖先目录，如果其中存在 `node_modules` 目录：
   1. 如果 `node_modules` 中存在与包同名的目录：
      1. 尝试从包目录解析类型。
      2. 如果找到结果，返回它并停止搜索。
   2. 如果 `node_modules/@types` 中存在与包同名的目录：
      1. 尝试从 `@types` 包目录解析类型。
      2. 如果找到结果，返回它并停止搜索。
2. 通过所有 `node_modules` 目录重复上述搜索，但这次允许 JavaScript 文件作为结果，并且不在 `@types` 目录中搜索。

所有 `moduleResolution` 模式（除 `classic` 外）都遵循此模式，而它们从包目录解析的方式的细节有所不同，并在以下部分中解释。

#### package.json `"exports"`

当 `moduleResolution` 设置为 `node16`、`nodenext` 或 `bundler`，且 `resolvePackageJsonExports` 未禁用时，TypeScript 遵循 Node.js 的 [package.json `"exports"` 规范](https://nodejs.org/api/packages.html#packages_package_entry_points)，在由[裸说明符 `node_modules` 包查找](#node_modules-package-lookups) 触发的包目录解析时。

TypeScript 通过 `"exports"` 将模块说明符解析为文件路径的实现与 Node.js 完全相同。然而，一旦文件路径被解析，TypeScript 仍将[尝试多个文件扩展名](#file-extension-substitution)以优先查找类型。

在解析[条件 `"exports"`](https://nodejs.org/api/packages.html#conditional-exports) 时，TypeScript 始终匹配 `"types"` 和 `"default"` 条件（如果存在）。此外，TypeScript 将根据 [`"typesVersions"`](#packagejson-typesversions) 中实现的相同版本匹配规则，匹配形式为 `"types@{selector}"`（其中 `{selector}` 是 `"typesVersions"` 兼容的版本选择器）的版本化类型条件。其他不可配置的条件取决于 `moduleResolution` 模式，并在以下部分中指定。可以使用 `customConditions` 编译器选项配置要匹配的附加条件。

请注意，`"exports"` 的存在阻止了任何未在 `"exports"` 中明确列出或由模式匹配的子路径被解析。

##### 示例：子路径、条件和扩展名替换

场景：在具有以下 package.json 的包目录中，使用条件 `["types", "node", "require"]`（由 `moduleResolution` 设置和触发模块解析请求的上下文确定）请求 `"pkg/subpath"`：

```json
{
  "name": "pkg",
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.cjs"
    },
    "./subpath": {
      "import": "./subpath/index.mjs",
      "require": "./subpath/index.cjs"
    }
  }
}
```

包目录内的解析过程：

1. `"exports"` 是否存在？**是。**
2. `"exports"` 是否有 `"./subpath"` 条目？**是。**
3. `exports["./subpath"]` 处的值是一个对象——它必须指定条件。
4. 第一个条件 `"import"` 是否匹配此请求？**否。**
5. 第二个条件 `"require"` 是否匹配此请求？**是。**
6. 路径 `"./subpath/index.cjs"` 是否有可识别的 TypeScript 文件扩展名？**否，所以使用扩展名替换。**
7. 通过[扩展名替换](#file-extension-substitution)，尝试以下路径，返回第一个存在的路径，否则返回 `undefined`：
   1. `./subpath/index.cts`
   2. `./subpath/index.d.cts`
   3. `./subpath/index.cjs`

如果 `./subpath/index.cts` 或 `./subpath.d.cts` 存在，解析完成。否则，解析按照 [`node_modules` 包查找](#node_modules-package-lookups) 规则搜索 `node_modules/@types/pkg` 和其他 `node_modules` 目录以尝试解析类型。如果未找到类型，则第二次通过所有 `node_modules` 解析到 `./subpath/index.cjs`（假设它存在），这算作成功的解析，但不提供类型，导致 `any` 类型的导入和 `noImplicitAny` 错误（如果启用）。

##### 示例：显式 `"types"` 条件

场景：在具有以下 package.json 的包目录中，使用条件 `["types", "node", "import"]`（由 `moduleResolution` 设置和触发模块解析请求的上下文确定）请求 `"pkg/subpath"`：

```json
{
  "name": "pkg",
  "exports": {
    "./subpath": {
      "import": {
        "types": "./types/subpath/index.d.mts",
        "default": "./es/subpath/index.mjs"
      },
      "require": {
        "types": "./types/subpath/index.d.cts",
        "default": "./cjs/subpath/index.cjs"
      }
    }
  }
}
```

包目录内的解析过程：

1. `"exports"` 是否存在？**是。**
2. `"exports"` 是否有 `"./subpath"` 条目？**是。**
3. `exports["./subpath"]` 处的值是一个对象——它必须指定条件。
4. 第一个条件 `"import"` 是否匹配此请求？**是。**
5. `exports["./subpath"].import` 处的值是一个对象——它必须指定条件。
6. 第一个条件 `"types"` 是否匹配此请求？**是。**
7. 路径 `"./types/subpath/index.d.mts"` 是否有可识别的 TypeScript 文件扩展名？**是，所以不使用扩展名替换。**
8. 如果文件存在，返回路径 `"./types/subpath/index.d.mts"`，否则返回 `undefined`。

##### 示例：版本化 `"types"` 条件

场景：使用 TypeScript 4.7.5，在具有以下 package.json 的包目录中，使用条件 `["types", "node", "import"]`（由 `moduleResolution` 设置和触发模块解析请求的上下文确定）请求 `"pkg/subpath"`：

```json
{
  "name": "pkg",
  "exports": {
    "./subpath": {
      "types@>=5.2": "./ts5.2/subpath/index.d.ts",
      "types@>=4.6": "./ts4.6/subpath/index.d.ts",
      "types": "./tsold/subpath/index.d.ts",
      "default": "./dist/subpath/index.js"
    }
  }
}
```

包目录内的解析过程：

1. `"exports"` 是否存在？**是。**
2. `"exports"` 是否有 `"./subpath"` 条目？**是。**
3. `exports["./subpath"]` 处的值是一个对象——它必须指定条件。
4. 第一个条件 `"types@>=5.2"` 是否匹配此请求？**否，4.7.5 不大于或等于 5.2。**
5. 第二个条件 `"types@>=4.6"` 是否匹配此请求？**是，4.7.5 大于或等于 4.6。**
6. 路径 `"./ts4.6/subpath/index.d.ts"` 是否有可识别的 TypeScript 文件扩展名？**是，所以不使用扩展名替换。**
7. 如果文件存在，返回路径 `"./ts4.6/subpath/index.d.ts"`，否则返回 `undefined`。

##### 示例：子路径模式

场景：在具有以下 package.json 的包目录中，使用条件 `["types", "node", "import"]`（由 `moduleResolution` 设置和触发模块解析请求的上下文确定）请求 `"pkg/wildcard.js"`：

```json
{
  "name": "pkg",
  "type": "module",
  "exports": {
    "./*.js": {
      "types": "./types/*.d.ts",
      "default": "./dist/*.js"
    }
  }
}
```

包目录内的解析过程：

1. `"exports"` 是否存在？**是。**
2. `"exports"` 是否有 `"./wildcard.js"` 条目？**否。**
3. 是否有带 `*` 的键匹配 `"./wildcard.js"`？**是，`"./*.js"` 匹配并将 `wildcard` 设置为替换。**
4. `exports["./*.js"]` 处的值是一个对象——它必须指定条件。
5. 第一个条件 `"types"` 是否匹配此请求？**是。**
6. 在 `./types/*.d.ts` 中，将 `*` 替换为替换 `wildcard`。**`./types/wildcard.d.ts`**
7. 路径 `"./types/wildcard.d.ts"` 是否有可识别的 TypeScript 文件扩展名？**是，所以不使用扩展名替换。**
8. 如果文件存在，返回路径 `"./types/wildcard.d.ts"`，否则返回 `undefined`。

##### 示例：`"exports"` 阻止其他子路径

场景：在具有以下 package.json 的包目录中请求 `"pkg/dist/index.js"`：

```json
{
  "name": "pkg",
  "main": "./dist/index.js",
  "exports": "./dist/index.js"
}
```

包目录内的解析过程：

1. `"exports"` 是否存在？**是。**
2. `exports` 处的值是一个字符串——它必须是包根 (`"."`) 的文件路径。
3. 请求 `"pkg/dist/index.js"` 是否针对包根？**否，它有一个子路径 `dist/index.js`。**
4. 解析失败；返回 `undefined`。

如果没有 `"exports"`，请求可能已成功，但 `"exports"` 的存在阻止了通过 `"exports"` 无法匹配的任何子路径的解析。

#### package.json `"typesVersions"` {#packagejson-typesversions}

[`node_modules` 包](#node_modules-package-lookups)或[目录模块](#directory-modules-index-file-resolution)可以在其 package.json 中指定 `"typesVersions"` 字段，以根据 TypeScript 编译器版本重定向 TypeScript 的解析过程，对于 `node_modules` 包，还根据正在解析的子路径。这允许包作者在一组类型定义中包含新的 TypeScript 语法，同时为与旧 TypeScript 版本的向后兼容性提供另一组（通过 [downlevel-dts](https://github.com/sandersn/downlevel-dts) 等工具）。`"typesVersions"` 在所有 `moduleResolution` 模式中都受支持；但是，当读取 [package.json `"exports"`](#packagejson-exports) 时，不会读取该字段。

##### 示例：将所有请求重定向到子目录

场景：模块使用 TypeScript 5.2 导入 `"pkg"`，其中 `node_modules/pkg/package.json` 是：

```json
{
  "name": "pkg",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.1": {
      "*": ["ts3.1/*"]
    }
  }
}
```

解析过程：

1. （取决于编译器选项）`"exports"` 是否存在？**否。**
2. `"typesVersions"` 是否存在？**是。**
3. TypeScript 版本是否 `>=3.1`？**是。记住映射 `"*": ["ts3.1/*"]`。**
4. 我们是否正在解析包名后的子路径？**否，只是根 `"pkg"`。**
5. `"types"` 是否存在？**是。**
6. `"typesVersions"` 中是否有任何键匹配 `./index.d.ts`？**是，`"*"` 匹配并将 `index.d.ts` 设置为替换。**
7. 在 `ts3.1/*` 中，将 `*` 替换为替换 `./index.d.ts`：**`ts3.1/index.d.ts`**。
8. 路径 `./ts3.1/index.d.ts` 是否有可识别的 TypeScript 文件扩展名？**是，所以不使用扩展名替换。**
9. 如果文件存在，返回路径 `./ts3.1/index.d.ts`，否则返回 `undefined`。

##### 示例：将特定文件的请求重定向

场景：模块使用 TypeScript 3.9 导入 `"pkg"`，其中 `node_modules/pkg/package.json` 是：

```json
{
  "name": "pkg",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    "<4.0": { "index.d.ts": ["index.v3.d.ts"] }
  }
}
```

解析过程：

1. （取决于编译器选项）`"exports"` 是否存在？**否。**
2. `"typesVersions"` 是否存在？**是。**
3. TypeScript 版本是否 `<4.0`？**是。记住映射 `"index.d.ts": ["index.v3.d.ts"]`。**
4. 我们是否正在解析包名后的子路径？**否，只是根 `"pkg"`。**
5. `"types"` 是否存在？**是。**
6. `"typesVersions"` 中是否有任何键匹配 `./index.d.ts`？**是，`"index.d.ts"` 匹配。**
7. 路径 `./index.v3.d.ts` 是否有可识别的 TypeScript 文件扩展名？**是，所以不使用扩展名替换。**
8. 如果文件存在，返回路径 `./index.v3.d.ts`，否则返回 `undefined`。

#### package.json `"main"` 和 `"types"` {#packagejson-main-and-types}

如果目录的 [package.json `"exports"`](#packagejson-exports) 字段未被读取（由于编译器选项，或因为它不存在，或因为目录被作为[目录模块](#directory-modules-index-file-resolution)而不是 [`node_modules` 包](#node_modules-package-lookups)解析）且模块说明符在包名或包含 package.json 的目录后没有子路径，TypeScript 将按顺序尝试从这些 package.json 字段解析，以尝试找到包或目录的主模块：

- `"types"`
- `"typings"`（遗留）
- `"main"`

`"types"` 处找到的声明文件被假定为 `"main"` 处找到的实现文件的准确表示。如果 `"types"` 和 `"typings"` 不存在或无法解析，TypeScript 将读取 `"main"` 字段并执行[扩展名替换](#file-extension-substitution)以查找声明文件。

当向 npm 发布类型化包时，建议即使[扩展名替换](#file-extension-substitution)或 [package.json `"exports"`](#packagejson-exports) 使其不必要，也要包含 `"types"` 字段，因为 npm 仅在 package.json 包含 `"types"` 字段时才会在包注册表列表上显示 TS 图标。

#### 包相对文件路径

如果 [package.json `"exports"`](#packagejson-exports) 和 [package.json `"typesVersions"`](#packagejson-typesversions) 都不适用，裸包说明符的子路径相对于包目录解析，根据适用的[相对路径](#relative-file-path-resolution)解析规则。在尊重 [package.json `"exports"`] 的模式中，此行为被包的 package.json 中 `"exports"` 字段的存在阻止，即使导入无法通过 `"exports"` 解析，如[上面的示例](#example-exports-block-other-subpaths)所示。另一方面，如果导入无法通过 `"typesVersions"` 解析，则尝试包相对文件路径解析作为回退。

当支持包相对路径时，它们在与考虑 `moduleResolution` 模式和上下文的任何其他相对路径相同的规则下解析。例如，在 [`--moduleResolution nodenext`](#node16-nodenext-1) 中，[目录模块](#directory-modules-index-file-resolution)和[无扩展名路径](#extensionless-relative-paths)仅在 `require` 调用中受支持，而不在 `import` 中：

```ts
// @Filename: module.mts
import "pkg/dist/foo";                // ❌ import, needs `.js` extension
import "pkg/dist/foo.js";             // ✅
import foo = require("pkg/dist/foo"); // ✅ require, no extension needed
```

#### package.json `"imports"` 和自名导入 {#packagejson-imports-and-self-name-imports}

当 `moduleResolution` 设置为 `node16`、`nodenext` 或 `bundler`，且 `resolvePackageJsonImports` 未禁用时，TypeScript 将尝试通过导入文件的最近祖先 package.json 的 `"imports"` 字段解析以 `#` 开头的导入路径。类似地，当启用 [package.json `"exports"` 查找](#packagejson-exports) 时，TypeScript 将尝试通过该 package.json 的 `"exports"` 字段解析以当前包名开头的导入路径——即导入文件的最近祖先 package.json 的 `"name"` 字段中的值。这两个功能都允许包中的文件导入同一包中的其他文件，替代相对导入路径。

TypeScript 遵循 Node.js 的 [`"imports"`](https://nodejs.org/api/packages.html#subpath-imports) 和 [自引用](https://nodejs.org/api/packages.html#self-referencing-a-package-using-its-name) 解析算法，直到文件路径被解析。此时，TypeScript 的解析算法根据包含正在解析的 `"imports"` 或 `"exports"` 的 package.json 是属于 `node_modules` 依赖项还是正在编译的本地项目（即其目录包含包含导入文件的项目的 tsconfig.json 文件）而分叉：

- 如果 package.json 在 `node_modules` 中，TypeScript 将对文件路径应用[扩展名替换](#file-extension-substitution)（如果它还没有可识别的 TypeScript 文件扩展名），并检查生成的文件路径是否存在。
- 如果 package.json 是本地项目的一部分，则执行额外的重新映射步骤以查找将最终生成从 `"imports"` 解析的输出 JavaScript 或声明文件路径的 _输入_ TypeScript 实现文件。如果没有此步骤，任何解析 `"imports"` 路径的编译都将引用 _先前编译_ 的输出文件，而不是打算包含在当前编译中的其他输入文件。此重新映射使用 tsconfig.json 中的 `outDir`/`declarationDir` 和 `rootDir`，因此使用 `"imports"` 通常需要显式设置 `rootDir`。

这种变化允许包作者编写 `"imports"` 和 `"exports"` 字段，仅引用将发布到 npm 的编译输出，同时仍允许本地开发使用原始 TypeScript 源文件。

##### 示例：带条件的本地项目

场景：`"/src/main.mts"` 在具有 tsconfig.json 和 package.json 的项目目录中导入 `"#utils"`，条件为 `["types", "node", "import"]`（由 `moduleResolution` 设置和触发模块解析请求的上下文确定）：

```json5
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node16",
    "resolvePackageJsonImports": true,
    "rootDir": "./src",
    "outDir": "./dist"
  }
}
```

```json5
// package.json
{
  "name": "pkg",
  "imports": {
    "#utils": {
      "import": "./dist/utils.d.mts",
      "require": "./dist/utils.d.cts"
    }
  }
}
```

解析过程：

1. 导入路径以 `#` 开头，尝试通过 `"imports"` 解析。
2. 最近的祖先 package.json 中是否存在 `"imports"`？**是。**
3. `"imports"` 对象中是否存在 `"#utils"`？**是。**
4. `imports["#utils"]` 处的值是一个对象——它必须指定条件。
5. 第一个条件 `"import"` 是否匹配此请求？**是。**
6. 是否应该尝试将输出路径映射到输入路径？**是，因为：**
   - package.json 是否在 `node_modules` 中？**否，它在本地项目中。**
   - tsconfig.json 是否在 package.json 目录内？**是。**
7. 在 `./dist/utils.d.mts` 中，将 `outDir` 前缀替换为 `rootDir`。**`./src/utils.d.mts`**
8. 将输出扩展名 `.d.mts` 替换为相应的输入扩展名 `.mts`。**`./src/utils.mts`**
9. 如果文件存在，返回路径 `"./src/utils.mts"`。
10. 否则，如果文件存在，返回路径 `"./dist/utils.d.mts"`。

##### 示例：带子路径模式的 `node_modules` 依赖项

场景：`"/node_modules/pkg/main.mts"` 在具有以下 package.json 的情况下导入 `"#internal/utils"`，条件为 `["types", "node", "import"]`（由 `moduleResolution` 设置和触发模块解析请求的上下文确定）：

```json5
// /node_modules/pkg/package.json
{
  "name": "pkg",
  "imports": {
    "#internal/*": {
      "import": "./dist/internal/*.mjs",
      "require": "./dist/internal/*.cjs"
    }
  }
}
```

解析过程：

1. 导入路径以 `#` 开头，尝试通过 `"imports"` 解析。
2. 最近的祖先 package.json 中是否存在 `"imports"`？**是。**
3. `"imports"` 对象中是否存在 `"#internal/utils"`？**否，检查模式匹配。**
4. 是否有带 `*` 的键匹配 `"#internal/utils"`？**是，`"#internal/*"` 匹配并将 `utils` 设置为替换。**
5. `imports["#internal/*"]` 处的值是一个对象——它必须指定条件。
6. 第一个条件 `"import"` 是否匹配此请求？**是。**
7. 是否应该尝试将输出路径映射到输入路径？**否，因为 package.json 在 `node_modules` 中。**
8. 在 `./dist/internal/*.mjs` 中，将 `*` 替换为替换 `utils`。**`./dist/internal/utils.mjs`**
9. 路径 `"./dist/internal/utils.mjs"` 是否有可识别的 TypeScript 文件扩展名？**否，尝试扩展名替换。**
10. 通过[扩展名替换](#file-extension-substitution)，尝试以下路径，返回第一个存在的路径，否则返回 `undefined`：
    1. `./dist/internal/utils.mts`
    2. `./dist/internal/utils.d.mts`
    3. `./dist/internal/utils.mjs`

### `node16`、`nodenext`

这些模式反映了 Node.js v12 及更高版本的模块解析行为。（`node16` 和 `nodenext` 目前相同，但如果 Node.js 将来对其模块系统进行重大更改，`node16` 将被冻结，而 `nodenext` 将更新以反映新行为。）在 Node.js 中，ECMAScript 导入的解析算法与 CommonJS `require` 调用的算法显著不同。对于每个正在解析的模块说明符，首先使用语法和导入文件的[模块格式](#module-format-detection)来确定模块说明符将在生成的 JavaScript 中是 `import` 还是 `require`。然后将该信息传递给模块解析器，以确定使用哪种解析算法（以及是否在 package.json [`"exports"`](#packagejson-exports) 或 [`"imports"`](#packagejson-imports-and-self-name-imports) 中使用 `"import"` 或 `"require"` 条件）。

> 被[确定为 CommonJS 格式](#module-format-detection)的 TypeScript 文件默认仍可以使用 `import` 和 `export` 语法，但生成的 JavaScript 将使用 `require` 和 `module.exports`。这意味着常见的情况是看到使用 `require` 算法解析的 `import` 语句。如果这导致混淆，可以启用 `verbatimModuleSyntax` 编译器选项，它禁止将 `import` 语句生成为 `require` 调用。

请注意，动态 `import()` 调用始终使用 `import` 算法解析，根据 Node.js 的行为。然而，`import()` 类型根据导入文件的格式解析（为了与现有的 CommonJS 格式类型声明向后兼容）：

```ts
// @Filename: module.mts
import x from "./mod.js";             // `import` algorithm due to file format (emitted as-written)
import("./mod.js");                   // `import` algorithm due to syntax (emitted as-written)
type Mod = typeof import("./mod.js"); // `import` algorithm due to file format
import mod = require("./mod");        // `require` algorithm due to syntax (emitted as `require`)

// @Filename: commonjs.cts
import x from "./mod";                // `require` algorithm due to file format (emitted as `require`)
import("./mod.js");                   // `import` algorithm due to syntax (emitted as-written)
type Mod = typeof import("./mod");    // `require` algorithm due to file format
import mod = require("./mod");        // `require` algorithm due to syntax (emitted as `require`)
```

#### 隐式和强制选项

- `--moduleResolution node16` 和 `nodenext` 必须与 [`--module node16`、`node18`、`node20` 或 `nodenext`](#node16-node18-node20-nodenext) 配对。

#### 支持的特性

特性按优先级顺序列出。

| | `import` | `require` |
|-| -------- | --------- |
| [`paths`](#paths) | ✅ | ✅ |
| [`baseUrl`](#baseurl) | ✅ | ✅ |
| [`node_modules` 包查找](#node_modules-package-lookups) | ✅ | ✅ |
| [package.json `"exports"`](#packagejson-exports) | ✅ matches `types`, `node`, `import` | ✅ matches `types`, `node`, `require` |
| [package.json `"imports"` 和自名导入](#packagejson-imports-and-self-name-imports) | ✅ matches `types`, `node`, `import` | ✅ matches `types`, `node`, `require` |
| [package.json `"typesVersions"`](#packagejson-typesversions) | ✅ | ✅ |
| [包相对路径](#package-relative-file-paths) | ✅ when `exports` not present | ✅ when `exports` not present |
| [完整相对路径](#relative-file-path-resolution) | ✅ | ✅ |
| [无扩展名相对路径](#extensionless-relative-paths) | ❌ | ✅ |
| [目录模块](#directory-modules-index-file-resolution) | ❌ | ✅ |

### `bundler` {#bundler}

`--moduleResolution bundler` 尝试模拟大多数 JavaScript 打包器共有的模块解析行为。简而言之，这意味着支持所有传统上与 Node.js 的 CommonJS `require` 解析算法相关的行为，如 [`node_modules` 查找](#node_modules-package-lookups)、[目录模块](#directory-modules-index-file-resolution)和[无扩展名路径](#extensionless-relative-paths)，同时也支持较新的 Node.js 解析功能，如 [package.json `"exports"`](#packagejson-exports) 和 [package.json `"imports"`](#packagejson-imports-and-self-name-imports)。

思考 `--moduleResolution bundler` 和 `--moduleResolution nodenext` 之间的相似性和差异是很有启发性的，特别是它们如何决定在解析 package.json `"exports"` 或 `"imports"` 时使用什么条件。考虑 `.ts` 文件中的导入语句：

```ts
// index.ts
import { foo } from "pkg";
```

回想一下，在 `--module nodenext --moduleResolution nodenext` 中，`--module` 设置首先[确定](#module-format-detection)导入将作为 `import` 还是 `require` 调用生成到 `.js` 文件中，然后将该信息传递给 TypeScript 的模块解析器，以决定在 `"pkg"` 的 package.json `"exports"` 中是匹配 `"import"` 还是 `"require"` 条件。假设此文件的作用域中没有 package.json。文件扩展名是 `.ts`，所以输出文件扩展名将是 `.js`，Node.js 会将其解释为 CommonJS，因此 TypeScript 会将此 `import` 生成为 `require` 调用。因此，模块解析器将使用 `require` 条件解析 `"pkg"` 的 `"exports"`。

相同的过程发生在 `--moduleResolution bundler` 中，但决定为此导入语句生成 `import` 还是 `require` 调用的规则将不同，因为 `--moduleResolution bundler` 需要使用 [`--module esnext`](#es2015-es2020-es2022-esnext) 或 [`--module preserve`](#preserve)。在这两种模式中，ESM `import` 声明始终生成为 ESM `import` 声明，因此 TypeScript 的模块解析器将接收该信息并使用 `"import"` 条件解析 `"pkg"` 的 `"exports"`。

这个解释可能有些违反直觉，因为 `--moduleResolution bundler` 通常与 `--noEmit` 一起使用——打包器通常处理原始 `.ts` 文件并对未转换的 `import` 或 `require` 执行模块解析。然而，为了保持一致性，TypeScript 仍然使用 `module` 决定的假设生成来通知模块解析和类型检查。这使得 [`--module preserve`](#preserve) 成为运行时或打包器在原始 `.ts` 文件上操作时的最佳选择，因为它暗示不转换。在 `--module preserve --moduleResolution bundler` 下，你可以在同一文件中编写导入和 require，它们将分别使用 `import` 和 `require` 条件解析：

```ts
// index.ts
import pkg1 from "pkg";       // Resolved with "import" condition
import pkg2 = require("pkg"); // Resolved with "require" condition
```


#### 隐式和强制选项

- `--moduleResolution bundler` 必须与 `--module esnext` 或 `--module preserve` 配对。
- `--moduleResolution bundler` 隐式 `--allowSyntheticDefaultImports`。

#### 支持的特性

- [`paths`](#paths) ✅
- [`baseUrl`](#baseurl) ✅
- [`node_modules` 包查找](#node_modules-package-lookups) ✅
- [package.json `"exports"`](#packagejson-exports) ✅ matches `types`, `import`/`require` depending on syntax
- [package.json `"imports"` 和自名导入](#packagejson-imports-and-self-name-imports) ✅ matches `types`, `import`/`require` depending on syntax
- [package.json `"typesVersions"`](#packagejson-typesversions) ✅
- [包相对路径](#package-relative-file-paths) ✅ when `exports` not present
- [完整相对路径](#relative-file-path-resolution) ✅
- [无扩展名相对路径](#extensionless-relative-paths) ✅
- [目录模块](#directory-modules-index-file-resolution) ✅

### `node10`（以前称为 `node`）

`--moduleResolution node` 在 TypeScript 5.0 中重命名为 `node10`（为向后兼容保留 `node` 作为别名）。它反映了 Node.js v12 之前版本中存在的 CommonJS 模块解析算法。不应再使用它。

#### 支持的特性

- [`paths`](#paths) ✅
- [`baseUrl`](#baseurl) ✅
- [`node_modules` 包查找](#node_modules-package-lookups) ✅
- [package.json `"exports"`](#packagejson-exports) ❌
- [package.json `"imports"` 和自名导入](#packagejson-imports-and-self-name-imports) ❌
- [package.json `"typesVersions"`](#packagejson-typesversions) ✅
- [包相对路径](#package-relative-file-paths) ✅
- [完整相对路径](#relative-file-path-resolution) ✅
- [无扩展名相对路径](#extensionless-relative-paths) ✅
- [目录模块](#directory-modules-index-file-resolution) ✅

### `classic`

不要使用 `classic`。


