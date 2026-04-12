---
title: 三斜杠指令
---

三斜杠指令是包含单个 XML 标签的单行注释。注释内容被用作编译器指令。

三斜杠指令 **仅** 在其包含文件的顶部有效。
三斜杠指令只能由单行或多行注释（包括其他三斜杠指令）前置。
如果它们在语句或声明之后被遇到，则被视为普通单行注释，不具有特殊含义。

从 TypeScript 5.5 开始，编译器不会生成引用指令，并且 _不会_ 将手写的三斜杠指令生成到输出文件中，除非这些指令被标记为 [`preserve="true"`](#preservetrue)。

## `/// <reference path="..." />`

`/// <reference path="..." />` 指令是这组指令中最常见的。
它用于声明文件之间的 _依赖_ 关系。

三斜杠引用指示编译器在编译过程中包含额外的文件。

它们还用作在使用 [`out`](https://www.typescriptlang.org/tsconfig#out) 或 [`outFile`](https://www.typescriptlang.org/tsconfig#outFile) 时排序输出的方法。
文件在预处理通过后，按照与输入相同的顺序生成到输出文件位置。

### 预处理输入文件

编译器对输入文件执行预处理，以解析所有三斜杠引用指令。
在此过程中，额外的文件被添加到编译中。

该过程从一组 _根文件_ 开始；
这些是在命令行中指定的文件名或在 `tsconfig.json` 文件的 [`files`](https://www.typescriptlang.org/tsconfig#files) 列表中的文件。
这些根文件按照它们被指定的顺序进行预处理。
在将文件添加到列表之前，会处理其中的所有三斜杠引用，并将其目标包含进来。
三斜杠引用以深度优先的方式解析，按照它们在文件中出现的顺序。

如果使用相对路径，三斜杠引用路径将相对于包含文件进行解析。

### 错误

引用不存在的文件是错误的。
文件对自身进行三斜杠引用是错误的。

### 使用 `--noResolve`

如果指定了编译器标志 [`noResolve`](https://www.typescriptlang.org/tsconfig#noResolve)，三斜杠引用将被忽略；它们既不会导致添加新文件，也不会改变所提供文件的顺序。

## `/// <reference types="..." />`

与作为 _依赖_ 声明的 `/// <reference path="..." />` 指令类似，`/// <reference types="..." />` 指令声明了对包的依赖。

解析这些包名称的过程类似于解析 `import` 语句中的模块名称。
可以将三斜杠引用类型指令简单地理解为声明包的 `import`。

例如，在声明文件中包含 `/// <reference types="node" />` 表示该文件使用 `@types/node/index.d.ts` 中声明的名称；
因此，该包需要与声明文件一起包含在编译中。

对于在 `.ts` 文件中声明对 `@types` 包的依赖，请改用命令行或 `tsconfig.json` 中的 [`types`](https://www.typescriptlang.org/tsconfig#types)。
有关更多详细信息，请参阅 [在 `tsconfig.json` 文件中使用 `@types`、`typeRoots` 和 `types`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html#types-typeroots-and-types)。

## `/// <reference lib="..." />`

此指令允许文件显式包含现有的内置 _lib_ 文件。

内置 _lib_ 文件的引用方式与 _tsconfig.json_ 中的 [`lib`](https://www.typescriptlang.org/tsconfig#lib) 编译器选项相同（例如使用 `lib="es2015"` 而不是 `lib="lib.es2015.d.ts"` 等）。

对于依赖内置类型的声明文件作者，例如 DOM API 或内置 JS 运行时构造函数如 `Symbol` 或 `Iterable`，建议使用三斜杠引用 lib 指令。以前这些 .d.ts 文件必须添加此类类型的前向/重复声明。

例如，将 `/// <reference lib="es2017.string" />` 添加到编译中的某个文件，等同于使用 `--lib es2017.string` 进行编译。

```ts
/// <reference lib="es2017.string" />

"foo".padStart(4);
```

## `/// <reference no-default-lib="true"/>`

此指令将文件标记为 _默认库_。
你会在 `lib.d.ts` 及其不同变体的顶部看到此注释。

此指令指示编译器 _不_ 在编译中包含默认库（即 `lib.d.ts`）。
这里的影响类似于在命令行上传递 [`noLib`](https://www.typescriptlang.org/tsconfig#noLib)。

另请注意，当传递 [`skipDefaultLibCheck`](https://www.typescriptlang.org/tsconfig#skipDefaultLibCheck) 时，编译器将仅跳过检查带有 `/// <reference no-default-lib="true"/>` 的文件。

## `/// <amd-module />`

默认情况下，AMD 模块是匿名生成的。
当使用其他工具处理生成的模块时（例如 bundlers，如 `r.js`），这可能会导致问题。

`amd-module` 指令允许向编译器传递可选的模块名称：

##### amdModule.ts

```ts
/// <amd-module name="NamedModule"/>
export class C {}
```

这将导致在调用 AMD `define` 时将名称 `NamedModule` 分配给模块：

##### amdModule.js

```js
define("NamedModule", ["require", "exports"], function (require, exports) {
  var C = (function () {
    function C() {}
    return C;
  })();
  exports.C = C;
});
```

## `/// <amd-dependency />`

> **注意**：此指令已被弃用。请改用 `import "moduleName";` 语句。

`/// <amd-dependency path="x" />` 通知编译器关于需要在结果模块的 require 调用中注入的非 TS 模块依赖。

`amd-dependency` 指令还可以有一个可选的 `name` 属性；这允许为 amd-dependency 传递可选名称：

```ts
/// <amd-dependency path="legacy/moduleA" name="moduleA"/>
declare var moduleA: MyType;
moduleA.callStuff();
```

生成的 JS 代码：

```js
define(["require", "exports", "legacy/moduleA"], function (
  require,
  exports,
  moduleA
) {
  moduleA.callStuff();
});
```

## `preserve="true"`

三斜杠指令可以标记为 `preserve="true"` 以防止编译器将它们从输出中移除。

例如，这些将在输出中被擦除：

```ts
/// <reference path="..." />
/// <reference types="..." />
/// <reference lib="..." />
```

但这些将被保留：

```ts
/// <reference path="..." preserve="true" />
/// <reference types="..." preserve="true" />
/// <reference lib="..." preserve="true" />
```
