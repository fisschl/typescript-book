---
title: 深入探索
---

## 声明文件理论：深入探索

构建模块以提供你想要的精确 API 形状可能会很棘手。
例如，我们可能需要一个模块，可以通过 `new` 调用或不使用 `new` 调用来产生不同的类型，
在层级结构中暴露各种命名类型，
并且在模块对象上也有一些属性。

通过阅读本指南，你将掌握编写复杂声明文件的工具，以暴露友好的 API 表面。
本指南重点介绍模块（或 UMD）库，因为这里的选项更加多样化。

## 关键概念

通过理解 TypeScript 工作原理的一些关键概念，你可以完全理解如何制作任何形状的声明。

### 类型

如果你正在阅读本指南，你可能已经大致知道 TypeScript 中的类型是什么。
不过，为了更明确，_类型_ 是通过以下方式引入的：

- 类型别名声明（`type sn = number | string;`）
- 接口声明（`interface I { x: number[]; }`）
- 类声明（`class C { }`）
- 枚举声明（`enum E { A, B, C }`）
- 引用类型的 `import` 声明

这些声明形式中的每一种都会创建一个新的类型名称。

### 值

与类型一样，你可能已经理解什么是值。
值是运行时名称，我们可以在表达式中引用它们。
例如 `let x = 5;` 创建了一个名为 `x` 的值。

再次明确，以下事物会创建值：

- `let`、`const` 和 `var` 声明
- 包含值的 `namespace` 或 `module` 声明
- `enum` 声明
- `class` 声明
- 引用值的 `import` 声明
- `function` 声明

### 命名空间

类型可以存在于 _命名空间_ 中。
例如，如果我们有声明 `let x: A.B.C`，
我们说类型 `C` 来自 `A.B` 命名空间。

这个区别很微妙但很重要——在这里，`A.B` 不一定是类型或值。

## 简单组合：一个名称，多种含义

给定一个名称 `A`，我们可能会发现 `A` 有多达三种不同的含义：类型、值或命名空间。
如何解释该名称取决于使用它的上下文。
例如，在声明 `let m: A.A = A;` 中，
`A` 首先用作命名空间，然后用作类型名称，再然后用作值。
这些含义最终可能指向完全不同的声明！

这可能看起来很混乱，但实际上非常方便，只要我们不要过度重载事物。
让我们看看这种组合行为的一些有用方面。

### 内置组合

细心的读者会注意到，例如，`class` 同时出现在 _类型_ 和 _值_ 列表中。
声明 `class C { }` 创建了两个东西：
一个 _类型_ `C`，它引用类的实例形状，
和一个 _值_ `C`，它引用类的构造函数。
枚举声明的行为类似。

### 用户组合

假设我们编写了一个模块文件 `foo.d.ts`：

```ts
export var SomeVar: { a: SomeType };
export interface SomeType {
  count: number;
}
```

然后消费它：

```ts
import * as foo from "./foo";
let x: foo.SomeType = foo.SomeVar.a;
console.log(x.count);
```

这工作得足够好，但我们可能想象 `SomeType` 和 `SomeVar` 密切相关，
以至于你希望它们有相同的名称。
我们可以使用组合来在同一个名称 `Bar` 下呈现这两个不同的对象（值和类型）：

```ts
export var Bar: { a: Bar };
export interface Bar {
  count: number;
}
```

这为消费代码中的解构提供了一个很好的机会：

```ts
import { Bar } from "./foo";
let x: Bar = Bar.a;
console.log(x.count);
```

同样，我们在这里将 `Bar` 同时用作类型和值。
请注意，我们不必将 `Bar` 值声明为 `Bar` 类型——它们是独立的。

## 高级组合

某些类型的声明可以跨多个声明进行组合。
例如，`class C { }` 和 `interface C { }` 可以共存，并且都为 `C` 类型贡献属性。

只要不产生冲突，这是合法的。
一个经验法则是，值总是与同名的其他值冲突，除非它们被声明为 `namespace`，
如果使用类型别名声明（`type s = string`）声明类型，则类型会产生冲突，
而命名空间永远不会冲突。

让我们看看如何使用它。

### 使用 `interface` 添加

我们可以用另一个 `interface` 声明向 `interface` 添加额外的成员：

```ts
interface Foo {
  x: number;
}
// ... elsewhere ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // OK
```

这也适用于类：

```ts
class Foo {
  x: number;
}
// ... elsewhere ...
interface Foo {
  y: number;
}
let a: Foo = ...;
console.log(a.x + a.y); // OK
```

请注意，我们无法使用接口向类型别名（`type s = string;`）添加内容。

### 使用 `namespace` 添加

`namespace` 声明可用于以任何不会产生冲突的方式添加新类型、值和命名空间。

例如，我们可以向类添加静态成员：

```ts
class C {}
// ... elsewhere ...
namespace C {
  export let x: number;
}
let y = C.x; // OK
```

请注意，在这个例子中，我们向 `C` 的 _静态_ 侧（其构造函数）添加了一个值。
这是因为我们添加了一个 _值_，而所有值的容器是另一个值
（类型由命名空间包含，命名空间由其他命名空间包含）。

我们也可以向类添加命名空间类型：

```ts
class C {}
// ... elsewhere ...
namespace C {
  export interface D {}
}
let y: C.D; // OK
```

在这个例子中，直到我们为 `C` 编写了 `namespace` 声明，才存在命名空间 `C`。
`C` 作为命名空间的含义与类创建的 `C` 的值或类型含义不冲突。

最后，我们可以使用 `namespace` 声明执行许多不同的合并。
这不是一个特别现实的例子，但展示了各种有趣的行为：

```ts
namespace X {
  export interface Y {}
  export class Z {}
}

// ... elsewhere ...
namespace X {
  export var Y: number;
  export namespace Z {
    export class C {}
  }
}
type X = string;
```

在这个例子中，第一个块创建了以下名称含义：

- 一个值 `X`（因为 `namespace` 声明包含一个值 `Z`）
- 一个命名空间 `X`（因为 `namespace` 声明包含一个类型 `Y`）
- `X` 命名空间中的一个类型 `Y`
- `X` 命名空间中的一个类型 `Z`（类的实例形状）
- 作为 `X` 值属性的一个值 `Z`（类的构造函数）

第二个块创建了以下名称含义：

- 作为 `X` 值属性的一个值 `Y`（类型为 `number`）
- 一个命名空间 `Z`
- 作为 `X` 值属性的一个值 `Z`
- `X.Z` 命名空间中的一个类型 `C`
- 作为 `X.Z` 值属性的一个值 `C`
- 一个类型 `X`

<!-- TODO: Write more on that. -->
