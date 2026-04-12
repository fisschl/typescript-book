---
title: 模块 - 选择编译器选项
---

## 我在编写应用程序

单个 tsconfig.json 只能表示单一环境，包括可用的全局变量和模块行为。如果你的应用程序包含服务器代码、DOM 代码、Web Worker 代码、测试代码以及需要被所有这些代码共享的代码，那么每个环境都应该有自己的 tsconfig.json，并通过 [项目引用](https://www.typescriptlang.org/docs/handbook/project-references.html#handbook-content) 进行连接。然后，针对每个 tsconfig.json 使用本指南。对于应用程序内部的类库项目，特别是需要在多个运行时环境中运行的项目，请使用 "[我在编写类库](#im-writing-a-library)" 部分。

### 我在使用打包工具 {#im-using-a-bundler}

除了采用以下设置外，目前还建议 _不要_ 在打包工具项目中设置 `{ "type": "module" }` 或使用 `.mts` 文件。[某些打包工具](https://andrewbranch.github.io/interop-test/#synthesizing-default-exports-for-cjs-modules) 在这些情况下会采用不同的 ESM/CJS 互操作行为，而 TypeScript 目前无法通过 `"moduleResolution": "bundler"` 来分析这些行为。更多信息请参见 [issue #54102](https://github.com/microsoft/TypeScript/issues/54102)。

```json5
{
  "compilerOptions": {
    // This is not a complete template; it only
    // shows relevant module-related settings.
    // Be sure to set other important options
    // like `target`, `lib`, and `strict`.

    // Required
    "module": "esnext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,

    // Consult your bundler's documentation
    "customConditions": ["module"],

    // Recommended
    "noEmit": true, // or `emitDeclarationOnly`
    "allowImportingTsExtensions": true,
    "allowArbitraryExtensions": true,
    "verbatimModuleSyntax": true, // or `isolatedModules`
  }
}
```

### 我在编译并在 Node.js 中运行输出 {#im-compiling-and-running-the-outputs-in-node}

请记住，如果你打算生成 ES 模块，请设置 `"type": "module"` 或使用 `.mts` 文件。

```json5
{
  "compilerOptions": {
    // This is not a complete template; it only
    // shows relevant module-related settings.
    // Be sure to set other important options
    // like `target`, `lib`, and `strict`.

    // Required
    "module": "nodenext",

    // Implied by `"module": "nodenext"`:
    // "moduleResolution": "nodenext",
    // "esModuleInterop": true,
    // "target": "esnext",

    // Recommended
    "verbatimModuleSyntax": true,
  }
}
```

### 我在使用 ts-node

ts-node 试图与可用于 [编译并在 Node.js 中运行 JS 输出](#im-compiling-and-running-the-outputs-in-node) 的相同代码和相同的 tsconfig.json 设置兼容。更多详情请参考 [ts-node 文档](https://typestrong.org/ts-node/)。

### 我在使用 tsx

虽然 ts-node 默认对 Node.js 的模块系统做最小修改，但 [tsx](https://github.com/esbuild-kit/tsx) 的行为更像一个打包工具，允许无扩展名/索引模块标识符以及任意混合使用 ESM 和 CJS。对于 tsx，请使用与 [打包工具](#im-using-a-bundler) 相同的设置。

### 我在为浏览器编写 ES 模块，不使用打包工具或模块编译器

TypeScript 目前没有专门针对此场景的选项，但你可以通过组合使用 `nodenext` ESM 模块解析算法和 `paths` 作为 URL 和导入映射支持的替代方案来近似实现。

```json5
// tsconfig.json
{
  "compilerOptions": {
    // This is not a complete template; it only
    // shows relevant module-related settings.
    // Be sure to set other important options
    // like `target`, `lib`, and `strict`.

    // Combined with `"type": "module"` in a local package.json,
    // this enforces including file extensions on relative path imports.
    "module": "nodenext",
    "paths": {
      // Point TS to local types for remote URLs:
      "https://esm.sh/lodash@4.17.21": ["./node_modules/@types/lodash/index.d.ts"],
      // Optional: point bare specifier imports to an empty file
      // to prohibit importing from node_modules specifiers not listed here:
      "*": ["./empty-file.ts"]
    }
  }
}
```

此设置允许显式列出的 HTTPS 导入使用本地安装的类型声明文件，同时对通常会在 node_modules 中解析的导入报错：

```ts
import {} from "lodash";
//             ^^^^^^^^
// File '/project/empty-file.ts' is not a module. ts(2306)
```

或者，你可以使用 [导入映射](https://github.com/WICG/import-maps) 将裸标识符列表显式映射到浏览器中的 URL，同时依靠 `nodenext` 的默认 node_modules 查找或依靠 `paths` 来将 TypeScript 指向这些裸标识符导入的类型声明文件：

```html
<script type="importmap">
{
  "imports": {
    "lodash": "https://esm.sh/lodash@4.17.21"
  }
}
</script>
```

```ts
import {} from "lodash";
// Browser: https://esm.sh/lodash@4.17.21
// TypeScript: ./node_modules/@types/lodash/index.d.ts
```

## 我在编写类库 {#im-writing-a-library}

<!-- TODO: I might move all this to a guide/appendix on library publishing and link -->

作为类库作者选择编译设置与作为应用程序作者选择设置是根本不同的过程。编写应用程序时，选择的设置反映运行时环境或打包工具——通常是具有已知行为的单一实体。编写类库时，你理想情况下应该在 _所有可能的_ 类库消费者编译设置下检查你的代码。由于这不切实际，你可以改用尽可能严格的设置，因为满足这些设置往往能满足所有其他设置。

```json5
{
  "compilerOptions": {
    "module": "node18",
    "target": "es2020", // set to the *lowest* target you support
    "strict": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "sourceMap": true,
    "declarationMap": true,
    "rootDir": "src",
    "outDir": "dist"
  }
}
```

让我们逐一审视选择这些设置的原因：

- **`module: "node18"`**。当代码库与 Node.js 的模块系统兼容时，它几乎总是也能在打包工具中工作。如果你使用第三方生成器来生成 ESM 输出，请确保在 package.json 中设置 `"type": "module"`，这样 TypeScript 会将你的代码作为 ESM 进行检查，ESM 在 Node.js 中使用的模块解析算法比 CommonJS 更严格。举个例子，让我们看看如果类库使用 `"moduleResolution": "bundler"` 编译会发生什么：

  ```ts
  export * from "./utils";
  ```

  假设 `./utils.ts`（或 `./utils/index.ts`）存在，打包工具会接受这段代码，因此 `"moduleResolution": "bundler"` 不会报错。使用 `"module": "esnext"` 编译时，此导出语句的输出 JavaScript 将与输入完全相同。如果该 JavaScript 发布到 npm，使用打包工具的项目可以使用它，但在 Node.js 中运行时会出错：

  ```
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../node_modules/dependency/utils' imported from .../node_modules/dependency/index.js
  Did you mean to import ./utils.js?
  ```

  另一方面，如果我们写成：

  ```ts
  export * from "./utils.js";
  ```

  这将生成在 Node.js _和_ 打包工具中都能工作的输出。

  简而言之，`"moduleResolution": "bundler"` 具有传染性，允许生成仅在打包工具中工作的代码。同样，`"moduleResolution": "nodenext"` 仅检查输出在 Node.js 中是否工作，但在大多数情况下，在 Node.js 中工作的模块代码也会在其他运行时和打包工具中工作。

- **`target: "es2020"`**。将此值设置为你打算支持的 _最低_ ECMAScript 版本，可确保生成的代码不会使用后续版本引入的语言特性。由于 `target` 还暗示了相应的 `lib` 值，这也确保你不会访问旧环境中可能不可用的全局变量。

- **`strict: true`**。没有此设置，你可能会编写最终出现在输出 `.d.ts` 文件中的类型级代码，并在消费者启用 `strict` 编译时报错。例如，这个 `extends` 子句：

  ```ts
  export interface Super {
    foo: string;
  }
  export interface Sub extends Super {
    foo: string | undefined;
  }
  ```

  仅在 `strictNullChecks` 下才是错误。另一方面，编写仅在 `strict` _禁用_ 时报错的代码非常困难，因此强烈建议类库使用 `strict` 编译。

- **`verbatimModuleSyntax: true`**。此设置可防止一些可能导致类库消费者问题的模块相关陷阱。首先，它防止编写任何可能根据用户的 `esModuleInterop` 或 `allowSyntheticDefaultImports` 值被模糊解释的导入语句。以前，通常建议类库在不使用 `esModuleInterop` 的情况下编译，因为它在类库中的使用可能迫使用户也采用它。然而，也可以编写仅在 _没有_ `esModuleInterop` 时工作的导入，因此该设置的任何值都不能保证类库的可移植性。`verbatimModuleSyntax` 确实提供了这样的保证。[^1] 其次，它防止在将被生成为 CommonJS 的模块中使用 `export default`，这可能要求打包工具用户和 Node.js ESM 用户以不同方式消费模块。更多详情请参见关于 [ESM/CJS 互操作](https://www.typescriptlang.org/docs/handbook/modules/appendices/esm-cjs-interop.html#library-code-needs-special-considerations) 的附录。

- **`declaration: true`** 会随输出 JavaScript 一起生成类型声明文件。类库的消费者需要这些文件来获取任何类型信息。

- **`sourceMap: true`** 和 **`declarationMap: true`** 分别为输出 JavaScript 和类型声明文件生成源映射。这些只有在类库同时提供源代码（`.ts` 文件）时才有用。通过提供源映射和源文件，类库的消费者将能够更轻松地调试类库代码。通过提供声明映射和源文件，消费者在运行 "转到定义" 时将能够看到原始的 TypeScript 源代码。这两者代表了开发者体验和类库大小之间的权衡，因此是否包含它们由你决定。

- **`rootDir: "src"`** 和 **`outDir: "dist"`**。使用单独的输出目录总是一个好主意，但对于发布其输入文件的类库来说，这是 _必需的_。否则，[扩展名替换](https://www.typescriptlang.org/docs/handbook/modules/reference.html#file-extension-substitution) 将导致类库的消费者加载类库的 `.ts` 文件而不是 `.d.ts` 文件，从而导致类型错误和性能问题。

### 打包类库的注意事项

如果你使用打包工具来生成你的类库，那么你所有的（非外部化的）导入都将由具有已知行为的打包工具处理，而不是由你的用户的不可知环境处理。在这种情况下，你可以使用 `"module": "esnext"` 和 `"moduleResolution": "bundler"`，但有两个注意事项：

1. TypeScript 无法模拟当某些文件被打包而某些文件被外部化时的模块解析。使用打包工具打包类库时，通常将第一方类库源代码打包到单个文件中，但将外部依赖的导入保留为打包输出中的真实导入。这实质上意味着模块解析在打包工具和最终用户的环境之间分割。要在 TypeScript 中模拟这一点，你需要使用 `"moduleResolution": "bundler"` 处理打包的导入，使用 `"moduleResolution": "nodenext"` 处理外部化的导入（或使用多个选项来检查所有内容是否能在各种最终用户环境中工作）。但 TypeScript 无法配置为在同一编译中使用两种不同的模块解析设置。因此，使用 `"moduleResolution": "bundler"` 可能允许导入在打包工具中工作但在 Node.js 中不安全的外部化依赖。另一方面，使用 `"moduleResolution": "nodenext"` 可能对打包的导入施加过于严格的要求。

2. 你必须确保你的声明文件也被打包。回想一下[声明文件的第一条规则](https://www.typescriptlang.org/docs/handbook/modules/theory.html#the-role-of-declaration-files)：每个声明文件恰好代表一个 JavaScript 文件。如果你使用 `"moduleResolution": "bundler"` 并使用打包工具生成 ESM 包，同时使用 `tsc` 生成许多单独的声明文件，你的声明文件可能会在 `"module": "nodenext"` 下消费时导致错误。例如，如下输入文件：

   ```ts
   import { Component } from "./extensionless-relative-import";
   ```

   其导入会被 JS 打包工具擦除，但生成具有相同导入语句的声明文件。然而，该导入语句在 Node.js 中将包含无效的模块标识符，因为它缺少文件扩展名。对于 Node.js 用户，TypeScript 会在声明文件上报错，并假设依赖将在运行时崩溃，从而将引用 `Component` 的类型感染为 `any`。

   如果你的 TypeScript 打包工具不产生打包的声明文件，请使用 `"moduleResolution": "nodenext"` 以确保保留在声明文件中的导入与最终用户的 TypeScript 设置兼容。更好的是，考虑不要打包你的类库。

### 关于双生成方案的说明

单次 TypeScript 编译（无论是生成还是仅类型检查）假设每个输入文件只会产生一个输出文件。即使 `tsc` 没有生成任何内容，它对导入名称执行的类型检查也依赖于关于输出文件在运行时将如何行为的知识，这基于 tsconfig.json 中设置的模块和生成相关选项。虽然第三方生成器通常可以安全地与 `tsc` 类型检查结合使用，只要 `tsc` 可以配置为理解其他生成器将生成什么，但任何在仅类型检查一次的情况下生成两组不同模块格式输出的方案都会使（至少）其中一个输出未经检查。由于外部依赖可能向 CommonJS 和 ESM 消费者暴露不同的 API，你无法使用任何配置在单次编译中保证两个输出都是类型安全的。实际上，大多数依赖遵循最佳实践，双生成输出可以工作。在发布前对所有输出包运行测试和 [静态分析](https://npmjs.com/package/@arethetypeswrong/cli) 可以显著降低严重问题被忽视的可能性。

[^1]: `verbatimModuleSyntax` 只有在 JS 生成器生成与给定 tsconfig.json、源文件扩展名和 package.json `"type"` 时 `tsc` 会生成的相同模块类型的模块时才能工作。该选项通过强制要求编写的 `import`/`require` 与生成的 `import`/`require` 相同来工作。任何从同一源文件生成 ESM 和 CJS 输出的配置都与 `verbatimModuleSyntax` 根本不兼容，因为它的全部目的就是防止你在会生成 `require` 的地方编写 `import`。如果配置第三方生成器生成与 `tsc` 不同的模块类型，`verbatimModuleSyntax` 也可能失效——例如，在 tsconfig.json 中设置 `"module": "esnext"` 同时配置 Babel 生成 CommonJS。
