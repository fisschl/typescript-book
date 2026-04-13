---
title: 在 TypeScript 中使用 Babel
---

## Babel 与 `tsc` 在 TypeScript 中的对比

在构建现代 JavaScript 项目时，你可能会问自己：将 TypeScript 文件转换为 JavaScript 的正确方式是什么？

很多时候，答案是 _"视情况而定"_，或者 _"别人已经为你做了决定"_，这取决于具体项目。如果你使用 [tsdx](https://tsdx.io)、[Angular](https://angular.io/)、[NestJS](https://nestjs.com/) 或 [入门指南](/get-started/ts-for-the-new-programmer) 中提到的任何框架来构建项目，那么这个决定已经由框架帮你处理了。

不过，一个有用的经验法则是：

- 如果你的构建输出与源输入文件基本相同？使用 `tsc`
- 如果你需要一个具有多种潜在输出的构建管道？使用 `babel` 进行转译，`tsc` 进行类型检查

## 使用 Babel 转译，`tsc` 检查类型

这是一种常见的模式，适用于具有现有构建基础设施的项目，这些项目可能已经从 JavaScript 代码库迁移到了 TypeScript。

这种技术是一种混合方法，使用 Babel 的 [preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript) 来生成你的 JS 文件，然后使用 TypeScript 进行类型检查和 `.d.ts` 文件生成。

通过使用 Babel 对 TypeScript 的支持，你可以与现有的构建管道协同工作，并且由于 Babel 不会检查你的代码类型，因此 JS 生成时间可能会更快。

#### 类型检查和 d.ts 文件生成

使用 Babel 的缺点是在从 TS 转换到 JS 的过程中你无法获得类型检查。这意味着你在编辑器中遗漏的类型错误可能会偷偷溜进生产代码。

此外，Babel 无法为你的 TypeScript 创建 `.d.ts` 文件，如果你的项目是一个库，这会使使用你的项目变得更加困难。

为了解决这些问题，你可能需要设置一个使用 TSC 来检查项目类型的命令。这可能意味着将一些 Babel 配置复制到相应的 [`tsconfig.json`](https://www.typescriptlang.org/tsconfig) 中，并确保启用以下标志：

```json tsconfig
"compilerOptions": {
  // Ensure that .d.ts files are created by tsc, but not .js files
  "declaration": true,
  "emitDeclarationOnly": true,
  // Ensure that Babel can safely transpile files in the TypeScript project
  "isolatedModules": true
}
```

有关这些标志的更多信息：

- [`isolatedModules`](https://www.typescriptlang.org/tsconfig#isolatedModules)
- [`declaration`](https://www.typescriptlang.org/tsconfig#declaration), [`emitDeclarationOnly`](https://www.typescriptlang.org/tsconfig#emitDeclarationOnly)
