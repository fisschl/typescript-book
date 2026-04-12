---
title: 命名空间和模块
---

本文概述了在 TypeScript 中使用模块和命名空间组织代码的各种方式。
我们还将介绍如何使用命名空间和模块的一些高级主题，并解决在 TypeScript 中使用它们时的一些常见陷阱。

有关 ES 模块的更多信息，请参阅 [模块](/handbook-v2/modules) 文档。
有关 TypeScript 命名空间的更多信息，请参阅 [命名空间](/reference/namespaces) 文档。

注意：在 _非常_ 早期的 TypeScript 版本中，命名空间被称为"内部模块"，它们早于 JavaScript 模块系统。

## 使用模块

模块可以包含代码和声明。

模块还依赖于模块加载器（如 CommonJs/Require.js）或支持 ES 模块的运行时。
模块提供更好的代码重用、更强的隔离性和更好的工具支持用于打包。

还值得注意的是，对于 Node.js 应用程序，模块是默认的，**我们在现代代码中推荐使用模块而不是命名空间**。

从 ECMAScript 2015 开始，模块是语言的原生部分，应该被所有兼容的引擎实现支持。
因此，对于新项目，模块将是推荐的代码组织机制。

## 使用命名空间

命名空间是 TypeScript 特有的组织代码的方式。
命名空间只是全局命名空间中的命名 JavaScript 对象。
这使得命名空间成为一种非常简单的构造。
与模块不同，它们可以跨越多个文件，并且可以使用 [`outFile`](https://www.typescriptlang.org/tsconfig#outFile) 进行连接。
命名空间可以是在 Web 应用程序中构建代码的好方法，所有依赖项都作为 HTML 页面中的 `<script>` 标签包含在内。

就像所有全局命名空间污染一样，很难识别组件依赖项，尤其是在大型应用程序中。

## 命名空间和模块的陷阱

在本节中，我们将描述使用命名空间和模块时的各种常见陷阱，以及如何避免它们。

### `/// <reference>` 引用模块

一个常见的错误是尝试使用 `/// <reference ... />` 语法来引用模块文件，而不是使用 `import` 语句。
要理解这种区别，我们首先需要了解编译器如何根据 `import` 的路径定位模块的类型信息（例如 `import x from "...";`、`import x = require("...");` 等中的 `...` 路径）。

编译器将尝试查找具有适当路径的 `.ts`、`.tsx` 和 `.d.ts` 文件。
如果找不到特定文件，则编译器将查找 _环境模块声明_。
回想一下，这些需要在 `.d.ts` 文件中声明。

- `myModules.d.ts`

  ```ts
  // In a .d.ts file or .ts file that is not a module:
  declare module "SomeModule" {
    export function fn(): string;
  }
  ```

- `myOtherModule.ts`

  ```ts
  /// <reference path="myModules.d.ts" />
  import * as m from "SomeModule";
  ```

这里的引用标签允许我们定位包含环境模块声明的声明文件。
这是 TypeScript 示例中使用的 `node.d.ts` 文件的消耗方式。

### 不必要的命名空间

如果你正在将程序从命名空间转换为模块，很容易得到一个看起来像这样的文件：

- `shapes.ts`

  ```ts
  export namespace Shapes {
    export class Triangle {
      /* ... */
    }
    export class Square {
      /* ... */
    }
  }
  ```

这里的顶级命名空间 `Shapes` 毫无理由地包装了 `Triangle` 和 `Square`。
这对于模块的使用者来说既令人困惑又令人烦恼：

- `shapeConsumer.ts`

  ```ts
  import * as shapes from "./shapes";
  let t = new shapes.Shapes.Triangle(); // shapes.Shapes?
  ```

TypeScript 中模块的一个关键特性是两个不同的模块永远不会将名称贡献给同一作用域。
因为模块的使用者决定为其分配什么名称，所以不需要主动将导出的符号包装在命名空间中。

重申一下为什么不应该尝试命名空间你的模块内容，命名空间的一般想法是提供构造的逻辑分组并防止名称冲突。
因为模块文件本身已经是逻辑分组，并且其顶级名称由导入它的代码定义，所以对导出的对象使用额外的模块层是不必要的。

这是一个修订后的示例：

- `shapes.ts`

  ```ts
  export class Triangle {
    /* ... */
  }
  export class Square {
    /* ... */
  }
  ```

- `shapeConsumer.ts`

  ```ts
  import * as shapes from "./shapes";
  let t = new shapes.Triangle();
  ```

### 模块的权衡

就像 JS 文件和模块之间存在一一对应关系一样，TypeScript 的模块源文件与其生成的 JS 文件之间也存在一一对应关系。
这样做的效果之一是，根据你定位的模块系统，不可能连接多个模块源文件。
例如，你不能在定位 `commonjs` 或 `umd` 时使用 [`outFile`](https://www.typescriptlang.org/tsconfig#outFile) 选项，但在 TypeScript 1.8 及更高版本中，[可以](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-8.html#concatenate-amd-and-system-modules-with---outfile)在定位 `amd` 或 `system` 时使用 [`outFile`](https://www.typescriptlang.org/tsconfig#outFile)。
