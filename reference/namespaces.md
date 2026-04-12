---
title: 命名空间
---

> **关于术语的说明：**
> 需要注意的是，在 TypeScript 1.5 中，术语发生了变化。
> "内部模块" 现在是 "命名空间"（namespaces）。
> "外部模块" 现在简称为 "模块"（modules），以与 [ECMAScript 2015](https://www.ecma-international.org/ecma-262/6.0/) 的术语保持一致，（即 `module X {` 等同于现在更推荐的 `namespace X {`）。

本文概述了在 TypeScript 中使用命名空间（之前的"内部模块"）组织代码的各种方式。
正如我们在术语说明中提到的，"内部模块"现在被称为"命名空间"。
此外，在声明内部模块时使用 `module` 关键字的任何地方，都可以且应该使用 `namespace` 关键字代替。
这样可以避免用相似的术语让新用户感到困惑。

## 第一步

让我们从将在本页中用作示例的程序开始。
我们编写了一组简单的字符串验证器，你可能会用它来检查网页中表单的用户输入，或检查外部提供的数据文件的格式。

## 单文件中的验证器

```ts
interface StringValidator {
  isAcceptable(s: string): boolean;
}

let lettersRegexp = /^[A-Za-z]+$/;
let numberRegexp = /^[0-9]+$/;

class LettersOnlyValidator implements StringValidator {
  isAcceptable(s: string) {
    return lettersRegexp.test(s);
  }
}

class ZipCodeValidator implements StringValidator {
  isAcceptable(s: string) {
    return s.length === 5 && numberRegexp.test(s);
  }
}

// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validators: { [s: string]: StringValidator } = {};
validators["ZIP code"] = new ZipCodeValidator();
validators["Letters only"] = new LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
  for (let name in validators) {
    let isMatch = validators[name].isAcceptable(s);
    console.log(`'${s}' ${isMatch ? "matches" : "does not match"} '${name}'.`);
  }
}
```

## 命名空间

随着我们添加更多的验证器，我们需要某种组织方案来跟踪我们的类型，而不必担心与其他对象的命名冲突。
与其将许多不同的名称放入全局命名空间，不如将我们的对象包装到一个命名空间中。

在这个例子中，我们将把所有与验证器相关的实体移到一个名为 `Validation` 的命名空间中。
因为我们希望这里的接口和类在命名空间外可见，所以我们用 `export` 修饰它们。
相反，变量 `lettersRegexp` 和 `numberRegexp` 是实现细节，所以它们保持未导出状态，对命名空间外的代码不可见。
在文件底部的测试代码中，我们现在需要在命名空间外使用时限定类型名称，例如 `Validation.LettersOnlyValidator`。

## 命名空间中的验证器

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }

  const lettersRegexp = /^[A-Za-z]+$/;
  const numberRegexp = /^[0-9]+$/;

  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }

  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}

// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validators: { [s: string]: Validation.StringValidator } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
  for (let name in validators) {
    console.log(
      `"${s}" - ${
        validators[name].isAcceptable(s) ? "matches" : "does not match"
      } ${name}`
    );
  }
}
```

## 跨文件拆分

随着应用程序的增长，我们希望将代码拆分到多个文件中，以便于维护。

## 多文件命名空间

在这里，我们将 `Validation` 命名空间拆分到多个文件中。
尽管文件是分开的，但它们都可以为同一个命名空间做出贡献，并且可以像它们都在一个地方定义一样被消费。
因为文件之间存在依赖关系，我们将添加引用标签来告诉编译器文件之间的关系。
我们的测试代码在其他方面保持不变。

##### Validation.ts

```ts
namespace Validation {
  export interface StringValidator {
    isAcceptable(s: string): boolean;
  }
}
```

##### LettersOnlyValidator.ts

```ts
/// <reference path="Validation.ts" />
namespace Validation {
  const lettersRegexp = /^[A-Za-z]+$/;
  export class LettersOnlyValidator implements StringValidator {
    isAcceptable(s: string) {
      return lettersRegexp.test(s);
    }
  }
}
```

##### ZipCodeValidator.ts

```ts
/// <reference path="Validation.ts" />
namespace Validation {
  const numberRegexp = /^[0-9]+$/;
  export class ZipCodeValidator implements StringValidator {
    isAcceptable(s: string) {
      return s.length === 5 && numberRegexp.test(s);
    }
  }
}
```

##### Test.ts

```ts
/// <reference path="Validation.ts" />
/// <reference path="LettersOnlyValidator.ts" />
/// <reference path="ZipCodeValidator.ts" />

// Some samples to try
let strings = ["Hello", "98052", "101"];

// Validators to use
let validators: { [s: string]: Validation.StringValidator } = {};
validators["ZIP code"] = new Validation.ZipCodeValidator();
validators["Letters only"] = new Validation.LettersOnlyValidator();

// Show whether each string passed each validator
for (let s of strings) {
  for (let name in validators) {
    console.log(
      `"${s}" - ${
        validators[name].isAcceptable(s) ? "matches" : "does not match"
      } ${name}`
    );
  }
}
```

一旦涉及多个文件，我们需要确保所有编译后的代码都被加载。
有两种方法可以做到这一点。

首先，我们可以使用连接输出，使用 [`outFile`](https://www.typescriptlang.org/tsconfig#outFile) 选项将所有输入文件编译成单个 JavaScript 输出文件：

```Shell
tsc --outFile sample.js Test.ts
```

编译器将根据文件中存在的引用标签自动排序输出文件。你也可以单独指定每个文件：

```Shell
tsc --outFile sample.js Validation.ts LettersOnlyValidator.ts ZipCodeValidator.ts Test.ts
```

或者，我们可以使用按文件编译（默认）为每个输入文件生成一个 JavaScript 文件。
如果生成了多个 JS 文件，我们需要在网页上使用 `<script>` 标签按适当的顺序加载每个生成的文件，例如：

##### MyTestPage.html（摘录）

```html
<script src="Validation.js" type="text/javascript" />
<script src="LettersOnlyValidator.js" type="text/javascript" />
<script src="ZipCodeValidator.js" type="text/javascript" />
<script src="Test.js" type="text/javascript" />
```

## 别名

简化命名空间使用的另一种方式是使用 `import q = x.y.z` 为常用对象创建更短的名称。
不要与用于加载模块的 `import x = require("name")` 语法混淆，这种语法只是为指定符号创建一个别名。
你可以将这种导入（通常称为别名）用于任何类型的标识符，包括从模块导入创建的对象。

```ts
namespace Shapes {
  export namespace Polygons {
    export class Triangle {}
    export class Square {}
  }
}

import polygons = Shapes.Polygons;
let sq = new polygons.Square(); // Same as 'new Shapes.Polygons.Square()'
```

注意我们没有使用 `require` 关键字；相反，我们直接从要导入的符号的限定名称进行赋值。
这类似于使用 `var`，但它也适用于导入符号的类型和命名空间含义。
重要的是，对于值来说，`import` 是与原始符号不同的引用，所以对别名 `var` 的更改不会反映到原始变量中。

## 与其他 JavaScript 库一起工作

为了描述非 TypeScript 编写的库的形状，我们需要声明该库公开的 API。
因为大多数 JavaScript 库只公开少数顶级对象，所以命名空间是表示它们的好方法。

我们将不定义实现的声明称为"环境"声明。
通常这些定义在 `.d.ts` 文件中。
如果你熟悉 C/C++，你可以将它们视为 `.h` 文件。
让我们看几个例子。

## 环境命名空间

流行的库 D3 在一个名为 `d3` 的全局对象中定义其功能。
因为这个库是通过 `<script>` 标签加载的（而不是模块加载器），所以它的声明使用命名空间来定义其形状。
为了让 TypeScript 编译器看到这个形状，我们使用环境命名空间声明。
例如，我们可以这样开始编写它：

##### D3.d.ts（简化摘录）

```ts
declare namespace D3 {
  export interface Selectors {
    select: {
      (selector: string): Selection;
      (element: EventTarget): Selection;
    };
  }

  export interface Event {
    x: number;
    y: number;
  }

  export interface Base extends Selectors {
    event: Event;
  }
}

declare var d3: D3.Base;
```
