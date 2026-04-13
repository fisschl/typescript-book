---
title: 使用
---

## 下载

获取类型声明除了 npm 之外不需要任何工具。

例如，获取 lodash 这样的库的声明只需要以下命令

```cmd
npm install --save-dev @types/lodash
```

值得注意的是，如果 npm 包已经按照 [发布](/declaration-files/publishing) 中的描述包含了其声明文件，则不需要下载相应的 `@types` 包。

## 使用

从那里，你就可以在 TypeScript 代码中无障碍地使用 lodash 了。
这适用于模块和全局代码。

例如，一旦你通过 `npm install` 安装了类型声明，你就可以使用导入并编写

```ts
import * as _ from "lodash";
_.padStart("Hello TypeScript!", 20, " ");
```

或者如果你不使用模块，你可以直接使用全局变量 `_`。

```ts
_.padStart("Hello TypeScript!", 20, " ");
```

## 搜索

在大多数情况下，类型声明包的名称应该始终与 `npm` 上的包名称相同，但前缀为 `@types/`，
但如果你需要，可以使用 [Yarn 包搜索](https://yarnpkg.com/) 来找到你喜爱的库的包。

> 注意：如果你正在搜索的声明文件不存在，你可以随时贡献一个回来，帮助下一个寻找它的开发者。
> 详情请参见 DefinitelyTyped [贡献指南页面](https://definitelytyped.org/guides/contributing.html)。
