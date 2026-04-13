---
title: 在 JavaScript 项目中使用 TypeScript
---

TypeScript 的类型系统在处理代码库时有不同的严格级别：

- 仅基于 JavaScript 代码推断的类型系统
- 通过 [JSDoc](/javascript/jsdoc-reference) 在 JavaScript 中渐进式添加类型
- 在 JavaScript 文件中使用 `// @ts-check`
- TypeScript 代码
- 启用了 [`strict`](https://www.typescriptlang.org/tsconfig#strict) 的 TypeScript

每一步都代表着向更安全的类型系统迈进，但并非每个项目都需要那种级别的验证。

## 在 JavaScript 中使用 TypeScript

这是指使用带有 TypeScript 支持的编辑器来提供自动补全、跳转到符号和重命名等重构工具。[首页](/) 列出了带有 TypeScript 插件的编辑器。

## 通过 JSDoc 在 JS 中提供类型提示

在 `.js` 文件中，类型通常可以被推断出来。当类型无法被推断时，可以使用 JSDoc 语法来指定。

声明前的 JSDoc 注解将被用于设置该声明的类型。例如：

```js twoslash
/** @type {number} */
var x;

x = 0; // OK
x = false; // OK?!
```

你可以在 [JSDoc 支持的类型](/javascript/jsdoc-reference) 中找到完整的 JSDoc 模式列表。

## `@ts-check`

上一段代码示例的最后一行在 TypeScript 中会报错，但在 JS 项目中默认不会报错。要在你的 JavaScript 文件中启用错误检查，请在 `.js` 文件的第一行添加 `// @ts-check`，让 TypeScript 将其作为错误抛出。

```js twoslash
// @ts-check
// @errors: 2322
/** @type {number} */
var x;

x = 0; // OK
x = false; // Not OK
```

如果你有很多 JavaScript 文件想要添加错误检查，可以改用 [`jsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)。
你可以通过在文件中添加 `// @ts-nocheck` 注释来跳过某些文件的检查。

如果你不同意 TypeScript 提供的某些错误，可以通过在前一行添加 `// @ts-ignore` 或 `// @ts-expect-error` 来忽略特定行的错误。

```js twoslash
// @ts-check
/** @type {number} */
var x;

x = 0; // OK
// @ts-expect-error
x = false; // Not OK
```

要了解更多关于 TypeScript 如何解释 JavaScript 的信息，请阅读 [TypeScript 如何检查 JavaScript](/javascript/type-checking-javascript-files)
