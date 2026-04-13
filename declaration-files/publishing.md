---
title: 发布
---

现在你已经按照本指南的步骤编写了声明文件，是时候将它发布到 npm 了。
你可以通过两种主要方式将声明文件发布到 npm：

1. 与你的 npm 包捆绑在一起
2. 发布到 npm 上的 [@types 组织](https://www.npmjs.com/~types)。

如果你的类型是由源代码生成的，请将类型与源代码一起发布。TypeScript 和 JavaScript 项目都可以通过 [`declaration`](https://www.typescriptlang.org/tsconfig#declaration) 生成类型。

否则，我们建议将类型提交到 DefinitelyTyped，它们将被发布到 npm 上的 `@types` 组织。

## 在你的 npm 包中包含声明

如果你的包有一个主 `.js` 文件，你也需要在 `package.json` 文件中指示主声明文件。
将 `types` 属性设置为指向你捆绑的声明文件。
例如：

```json
{
  "name": "awesome",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "main": "./lib/main.js",
  "types": "./lib/main.d.ts"
}
```

请注意，`"typings"` 字段与 `types` 同义，也可以使用。

## 依赖项

所有依赖项都由 npm 管理。
确保你依赖的所有声明包都在 `package.json` 的 `"dependencies"` 部分中正确标记。
例如，假设我们编写了一个使用 Browserify 和 TypeScript 的包。

```json
{
  "name": "browserify-typescript-extension",
  "author": "Vandelay Industries",
  "version": "1.0.0",
  "main": "./lib/main.js",
  "types": "./lib/main.d.ts",
  "dependencies": {
    "browserify": "latest",
    "@types/browserify": "latest",
    "typescript": "next"
  }
}
```

在这里，我们的包依赖于 `browserify` 和 `typescript` 包。
`browserify` 没有将其声明文件与 npm 包捆绑在一起，所以我们需要依赖 `@types/browserify` 来获取其声明。
另一方面，`typescript` 打包了其声明文件，因此不需要任何额外的依赖项。

我们的包暴露了来自这些包的声明，所以任何使用我们 `browserify-typescript-extension` 包的用户也需要有这些依赖项。
因此，我们使用了 `"dependencies"` 而不是 `"devDependencies"`，否则我们的消费者将需要手动安装这些包。
如果我们只是编写了一个命令行应用程序，并不期望我们的包被用作库，我们可能会使用 `devDependencies`。

## 危险信号

### `/// <reference path="..." />`

_不要_ 在你的声明文件中使用 `/// <reference path="..." />`。

```ts
/// <reference path="../typescript/lib/typescriptServices.d.ts" />
....
```

_应该_ 使用 `/// <reference types="..." />` 代替。

```ts
/// <reference types="typescript" />
....
```

请务必重新访问 [消费依赖项](/declaration-files/library-structures#消费依赖) 部分以获取更多信息。

### 打包依赖声明

如果你的类型定义依赖于另一个包：

- _不要_ 将它与你的合并，各自保留在自己的文件中。
- _不要_ 将声明复制到你的包中。
- _应该_ 依赖 npm 类型声明包，如果它没有打包其声明文件的话。

## 使用 `typesVersions` 进行版本选择

当 TypeScript 打开 `package.json` 文件以确定需要读取哪些文件时，它首先查看一个名为 `typesVersions` 的字段。

#### 文件夹重定向（使用 `*`）

带有 `typesVersions` 字段的 `package.json` 可能如下所示：

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

这个 `package.json` 告诉 TypeScript 首先检查当前版本的 TypeScript。
如果是 3.1 或更高版本，TypeScript 会计算出你相对于包导入的路径，并从包的 `ts3.1` 文件夹中读取。

这就是 `{ "*": ["ts3.1/*"] }` 的意思——如果你熟悉 [路径映射](https://www.typescriptlang.org/tsconfig#paths)，它的工作原理完全一样。

在上面的例子中，如果我们在 TypeScript 3.1 中运行时从 `"package-name"` 导入，TypeScript 将尝试从 `[...]/node_modules/package-name/ts3.1/index.d.ts`（和其他相关路径）解析。
如果我们从 `package-name/foo` 导入，我们将尝试查找 `[...]/node_modules/package-name/ts3.1/foo.d.ts` 和 `[...]/node_modules/package-name/ts3.1/foo/index.d.ts`。

如果我们在这个例子中没有在 TypeScript 3.1 中运行怎么办？
好吧，如果 `typesVersions` 中的字段都没有匹配，TypeScript 会回退到 `types` 字段，所以这里 TypeScript 3.0 及更早版本将被重定向到 `[...]/node_modules/package-name/index.d.ts`。

#### 文件重定向

当你只想一次更改单个文件的解析时，你可以通过传入确切的文件名告诉 TypeScript 以不同的方式解析文件：

```json
{
  "name": "package-name",
  "version": "1.0.0",
  "types": "./index.d.ts",
  "typesVersions": {
    "<4.0": { "index.d.ts": ["index.v3.d.ts"] }
  }
}
```

在 TypeScript 4.0 及以上版本中，对 `"package-name"` 的导入将解析为 `./index.d.ts`，而对于 3.9 及以下版本则解析为 `"./index.v3.d.ts"`。

请注意，重定向只影响包的 _外部_ API；项目内的导入解析不受 `typesVersions` 影响。例如，前一个例子中包含 `import * as foo from "./index"` 的 `d.ts` 文件仍将映射到 `index.d.ts`，而不是 `index.v3.d.ts`，而另一个包导入 `import * as foo from "package-name"` _将_ 得到 `index.v3.d.ts`。

## 匹配行为

TypeScript 决定编译器和语言版本是否匹配的方式是使用 Node 的 [semver 范围](https://github.com/npm/node-semver#ranges)。

## 多个字段

`typesVersions` 可以支持多个字段，其中每个字段名称由要匹配的范围指定。

```json tsconfig
{
  "name": "package-name",
  "version": "1.0",
  "types": "./index.d.ts",
  "typesVersions": {
    ">=3.2": { "*": ["ts3.2/*"] },
    ">=3.1": { "*": ["ts3.1/*"] }
  }
}
```

由于范围有可能重叠，确定哪个重定向适用是特定于顺序的。
这意味着在上面的例子中，即使 `>=3.2` 和 `>=3.1` 匹配器都支持 TypeScript 3.2 及以上版本，反转顺序可能会有不同的行为，所以上面的示例不等同于以下内容。

```jsonc tsconfig
{
  "name": "package-name",
  "version": "1.0",
  "types": "./index.d.ts",
  "typesVersions": {
    // 注意：这不起作用！
    ">=3.1": { "*": ["ts3.1/*"] },
    ">=3.2": { "*": ["ts3.2/*"] }
  }
}
```

## 发布到 [@types](https://www.npmjs.com/~types)

[@types](https://www.npmjs.com/~types) 组织下的包是使用 [types-publisher 工具](https://github.com/microsoft/DefinitelyTyped-tools/tree/master/packages/publisher) 自动从 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 发布的。
要将你的声明发布为 @types 包，请向 [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped) 提交拉取请求。
你可以在 [贡献指南页面](https://definitelytyped.github.io/guides/contributing.html) 找到更多详细信息。
