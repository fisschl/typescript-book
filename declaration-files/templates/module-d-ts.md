---
title: 模块 .d.ts
---

## 将 JavaScript 与 DTS 示例进行比较

## 常见的 CommonJS 模式

使用 CommonJS 模式的模块通过 `module.exports` 来描述导出的值。例如，以下是一个导出函数和数值常量的模块：

```js
const maxInterval = 12;

function getArrayLength(arr) {
  return arr.length;
}

module.exports = {
  getArrayLength,
  maxInterval,
};
```

可以通过以下 `.d.ts` 来描述：

```ts
export function getArrayLength(arr: any[]): number;
export const maxInterval: 12;
```

TypeScript Playground 可以为你展示 JavaScript 代码对应的 `.d.ts`。你可以在[这里亲自尝试](https://www.typescriptlang.org/play?useJavaScript=true#code/GYVwdgxgLglg9mABAcwKZQIICcsEMCeAMqmMlABYAUuOAlIgN6IBQiiW6IWSNWAdABsSZcswC-zCAgDOURAFtcADwAq5GKUQBeRAEYATM2by4AExBC-qJQAc4WKNO2NWKdNjxFhFADSvFquqk4sxAA)。

`.d.ts` 语法故意设计得类似于 [ES 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) 语法。
ES 模块于 2015 年作为 ES2015（ES6）的一部分由 TC39 批准，尽管它通过转译器已经可用很长时间了，但如果你有一个使用 ES 模块的 JavaScript 代码库：

```js
export function getArrayLength(arr) {
  return arr.length;
}
```

这将对应以下 `.d.ts`：

```ts
export function getArrayLength(arr: any[]): number;
```

### 默认导出

在 CommonJS 中，你可以将任何值作为默认导出，例如以下是一个正则表达式模块：

```js
module.exports = /hello( world)?/;
```

可以通过以下 .d.ts 来描述：

```ts
declare const helloWorld: RegExp;
export = helloWorld;
```

或者一个数字：

```js
module.exports = 3.142;
```

```ts
declare const pi: number;
export = pi;
```

CommonJS 中的一种导出风格是导出一个函数。
因为函数也是对象，所以可以添加额外的字段并包含在导出中。

```js
function getArrayLength(arr) {
  return arr.length;
}
getArrayLength.maxInterval = 12;

module.exports = getArrayLength;
```

可以通过以下方式描述：

```ts
declare function getArrayLength(arr: any[]): number;
declare namespace getArrayLength {
  declare const maxInterval: 12;
}

export = getArrayLength;
```

有关其工作原理的详细信息，请参阅[模块：函数](./module-function.d.ts)和[模块参考](/handbook-v2/modules)页面。

## 处理多种消费导入方式

在现代消费代码中有多种导入模块的方式：

```ts
const fastify = require("fastify");
const { fastify } = require("fastify");
import fastify = require("fastify");
import * as Fastify from "fastify";
import { fastify, FastifyInstance } from "fastify";
import fastify from "fastify";
import fastify, { FastifyInstance } from "fastify";
```

覆盖所有这些情况需要 JavaScript 代码实际支持所有这些模式。
要支持其中的许多模式，CommonJS 模块需要看起来像这样：

```js
class FastifyInstance {}

function fastify() {
  return new FastifyInstance();
}

fastify.FastifyInstance = FastifyInstance;

// Allows for { fastify }
fastify.fastify = fastify;
// Allows for strict ES Module support
fastify.default = fastify;
// Sets the default export
module.exports = fastify;
```

## 模块中的类型

你可能想为不存在的 JavaScript 代码提供类型

```js
function getArrayMetadata(arr) {
  return {
    length: getArrayLength(arr),
    firstObject: arr[0],
  };
}

module.exports = {
  getArrayMetadata,
};
```

可以通过以下方式描述：

```ts
export type ArrayMetadata = {
  length: number;
  firstObject: any | undefined;
};
export function getArrayMetadata(arr: any[]): ArrayMetadata;
```

这个示例是使用[泛型](/handbook-v2/type-manipulation/generics)来提供更丰富类型信息的一个好案例：

```ts
export type ArrayMetadata<ArrType> = {
  length: number;
  firstObject: ArrType | undefined;
};

export function getArrayMetadata<ArrType>(
  arr: ArrType[]
): ArrayMetadata<ArrType>;
```

现在数组的类型会传播到 `ArrayMetadata` 类型中。

导出的类型可以被模块的消费者使用 TypeScript 代码中的 `import` 或 `import type`，或者 [JSDoc 导入](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types)来重用。

### 模块代码中的命名空间

尝试描述 JavaScript 代码的运行时关系可能会很棘手。
当类似 ES 模块的语法没有提供足够的工具来描述导出时，你可以使用 `namespaces`。

例如，你可能有足够复杂的类型需要描述，因此选择在 `.d.ts` 中将它们命名空间化：

```ts
// This represents the JavaScript class which would be available at runtime
export class API {
  constructor(baseURL: string);
  getInfo(opts: API.InfoRequest): API.InfoResponse;
}

// This namespace is merged with the API class and allows for consumers, and this file
// to have types which are nested away in their own sections.
declare namespace API {
  export interface InfoRequest {
    id: string;
  }

  export interface InfoResponse {
    width: number;
    height: number;
  }
}
```

要了解命名空间在 `.d.ts` 文件中的工作原理，请阅读 [`.d.ts` 深入探讨](../deep-dive)。

### 可选的全局使用

你可以使用 `export as namespace` 来声明你的模块将在 UMD 环境中的全局作用域中可用：

```ts
export as namespace moduleName;
```

## 参考示例

为了让你了解所有这些部分如何组合在一起，这里有一个参考 `.d.ts`，在制作新模块时可以作为起点

```ts
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the module template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ If this module is a UMD module that exposes a global variable 'myLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */
export as namespace myLib;

/*~ If this module exports functions, declare them like so.
 */
export function myFunction(a: string): string;
export function myOtherFunction(a: number): number;

/*~ You can declare types that are available via importing the module */
export interface SomeType {
  name: string;
  length: number;
  extras?: string[];
}

/*~ You can declare properties of the module using const, let, or var */
export const myField: number;
```

### 库文件布局

你的声明文件布局应该与库的布局一致。

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

### 测试你的类型

如果你计划将这些更改提交给 DefinitelyTyped 供所有人使用，那么我们建议你：

> 1. 在 `node_modules/@types/[libname]` 中创建一个新文件夹
> 2. 在该文件夹中创建一个 `index.d.ts`，并复制示例进去
> 3. 查看你对模块的使用在哪里会中断，然后开始填写 index.d.ts
> 4. 当你满意时，克隆 [DefinitelyTyped/DefinitelyTyped](https://github.com/DefinitelyTyped) 并按照 README 中的说明操作。

否则

> 1. 在你的源代码树根目录创建一个新文件：`[libname].d.ts`
> 2. 添加 `declare module "[libname]" {  }`
> 3. 在大括号内添加模板，并查看你对模块的使用在哪里会中断
