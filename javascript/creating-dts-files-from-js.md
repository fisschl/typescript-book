---
title: 从 .js 文件创建 .d.ts 文件
---

[从 TypeScript 3.7 开始](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#--declaration-and---allowjs)，TypeScript 增加了对使用 JSDoc 语法从 JavaScript 生成 .d.ts 文件的支持。

这种设置意味着你可以拥有 TypeScript 驱动编辑器的编辑器体验，而无需将项目移植到 TypeScript，也无需在代码库中维护 .d.ts 文件。TypeScript 支持大多数 JSDoc 标签，你可以在 [这里](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html#supported-jsdoc) 找到参考。

## 设置项目以生成 .d.ts 文件

要在项目中添加 .d.ts 文件的创建，你需要完成最多四个步骤：

- 将 TypeScript 添加到你的开发依赖
- 添加 `tsconfig.json` 来配置 TypeScript
- 运行 TypeScript 编译器为 JS 文件生成相应的 d.ts 文件
- （可选）编辑你的 package.json 以引用类型

### 添加 TypeScript

你可以在我们的 [安装页面](https://www.typescriptlang.org/download) 了解如何操作。

### TSConfig

TSConfig 是一个 jsonc 文件，用于配置编译器标志并声明在哪里查找文件。在这种情况下，你需要一个如下所示的文件：

```jsonc tsconfig
{
  // Change this to match your project
  "include": ["src/**/*"],

  "compilerOptions": {
    // Tells TypeScript to read JS files, as
    // normally they are ignored as source files
    "allowJs": true,
    // Generate d.ts files
    "declaration": true,
    // This compiler run should
    // only output d.ts files
    "emitDeclarationOnly": true,
    // Types should go into this directory.
    // Removing this would place the .d.ts files
    // next to the .js files
    "outDir": "dist",
    // go to js file when using IDE functions like
    // "Go to Definition" in VSCode
    "declarationMap": true
  }
}
```

你可以在 [tsconfig 参考](https://www.typescriptlang.org/tsconfig) 中了解更多选项。使用 TSConfig 文件的替代方案是 CLI，这与以下 CLI 命令的行为相同：

```sh
npx -p typescript tsc src/**/*.js --declaration --allowJs --emitDeclarationOnly --outDir types
```

## 运行编译器

你可以在我们的 [安装页面](https://www.typescriptlang.org/download) 了解如何操作。
如果这些文件位于项目的 `.gitignore` 中，你要确保这些文件包含在你的包中。

## 编辑 package.json

TypeScript 在 `package.json` 中复制了 Node 的模块解析机制，并增加了一个查找 .d.ts 文件的步骤。大致上，解析过程会先检查可选的 `types` 字段，然后是 `"main"` 字段，最后会尝试根目录下的 `index.d.ts`。

| Package.json              | 默认 .d.ts 的位置              |
| :------------------------ | :----------------------------- |
| No "types" field          | 检查 "main"，然后 index.d.ts |
| "types": "main.d.ts"      | main.d.ts                      |
| "types": "./dist/main.js" | ./dist/main.d.ts               |

如果不存在，则使用 "main"

| Package.json             | 默认 .d.ts 的位置         |
| :----------------------- | :------------------------ |
| No "main" field          | index.d.ts                |
| "main":"index.js"        | index.d.ts                |
| "main":"./dist/index.js" | ./dist/index.d.ts         |

## 技巧

如果你想为 .d.ts 文件编写测试，可以尝试 [tsd](https://github.com/SamVerschueren/tsd) 或 [TSTyche](https://github.com/tstyche/tstyche)。
