---
title: 声明合并
---

## 简介

TypeScript 中的一些独特概念描述了 JavaScript 对象在类型层面的形状。
其中一个 TypeScript 特有的概念就是 _声明合并_。
理解这个概念将使你在使用现有 JavaScript 代码时具有优势。
它也开启了更高级抽象概念的大门。

就本文而言，"声明合并"意味着编译器将两个使用相同名称声明的独立声明合并为单个定义。
这个合并后的定义具有两个原始声明的所有特性。
任意数量的声明都可以合并；它不限于仅两个声明。

## 基本概念

在 TypeScript 中，一个声明至少在以下三个组之一中创建实体：命名空间、类型或值。
创建命名空间的声明创建一个命名空间，其中包含使用点号表示法访问的名称。
创建类型的声明正是这样做的：它们创建一个具有声明形状的类型，并绑定到给定的名称。
最后，创建值的声明创建在输出的 JavaScript 中可见的值。

| 声明类型 | 命名空间 | 类型 | 值 |
| -------- | :------: | :--: | :-: |
| 命名空间 |    X     |      |  X  |
| 类       |          |  X   |  X  |
| 枚举     |          |  X   |  X  |
| 接口     |          |  X   |     |
| 类型别名 |          |  X   |     |
| 函数     |          |      |  X  |
| 变量     |          |      |  X  |

理解每个声明创建的内容将帮助你理解执行声明合并时合并了什么。

## 合并接口

最简单，也可能是最常见的声明合并类型是 _接口合并_。
在最基本的层面上，合并将两个声明的成员机械地连接成一个具有相同名称的单一接口。

```ts
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

let box: Box = { height: 5, width: 6, scale: 10 };
```

接口的非函数成员应该是唯一的。
如果它们不唯一，则必须是相同的类型。
如果两个接口都声明了相同名称但不同类型的非函数成员，编译器将报错。

对于函数成员，每个相同名称的函数成员都被视为描述同一函数的重载。
值得注意的是，在接口 `A` 与后面的接口 `A` 合并的情况下，第二个接口将比第一个具有更高的优先级。

也就是说，在以下示例中：

```ts
interface Cloner {
  clone(animal: Animal): Animal;
}

interface Cloner {
  clone(animal: Sheep): Sheep;
}

interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
}
```

这三个接口将合并创建如下单一声明：

```ts
interface Cloner {
  clone(animal: Dog): Dog;
  clone(animal: Cat): Cat;
  clone(animal: Sheep): Sheep;
  clone(animal: Animal): Animal;
}
```

请注意，每个组的元素保持相同的顺序，但组本身在合并时，后面的重载集排在前面。

此规则的一个例外是特化签名。
如果一个签名具有 _单一_ 字符串字面量类型的参数（例如，不是字符串字面量的联合），那么它将被冒泡到其合并重载列表的顶部。

例如，以下接口将合并在一起：

```ts
interface Document {
  createElement(tagName: any): Element;
}
interface Document {
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
}
interface Document {
  createElement(tagName: string): HTMLElement;
  createElement(tagName: "canvas"): HTMLCanvasElement;
}
```

`Document` 的合并结果声明如下：

```ts
interface Document {
  createElement(tagName: "canvas"): HTMLCanvasElement;
  createElement(tagName: "div"): HTMLDivElement;
  createElement(tagName: "span"): HTMLSpanElement;
  createElement(tagName: string): HTMLElement;
  createElement(tagName: any): Element;
}
```

## 合并命名空间

与接口类似，相同名称的命名空间也会合并其成员。
由于命名空间同时创建命名空间和值，我们需要了解两者如何合并。

要合并命名空间，每个命名空间中声明的导出接口的类型定义本身会合并，形成一个具有合并接口定义的单一命名空间。

要合并命名空间值，在每个声明位置，如果已存在具有给定名称的命名空间，则通过获取现有命名空间并将第二个命名空间的导出成员添加到第一个命名空间来进一步扩展它。

此示例中 `Animals` 的声明合并：

```ts
namespace Animals {
  export class Zebra {}
}

namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }
  export class Dog {}
}
```

等价于：

```ts
namespace Animals {
  export interface Legged {
    numberOfLegs: number;
  }

  export class Zebra {}
  export class Dog {}
}
```

这种命名空间合并模型是一个有用的起点，但我们还需要了解非导出成员会发生什么。
非导出成员仅在原始（未合并的）命名空间中可见。这意味着合并后，来自其他声明的合并成员无法看到非导出成员。

我们可以在这个示例中更清楚地看到这一点：

```ts
namespace Animal {
  let haveMuscles = true;

  export function animalsHaveMuscles() {
    return haveMuscles;
  }
}

namespace Animal {
  export function doAnimalsHaveMuscles() {
    return haveMuscles; // Error, because haveMuscles is not accessible here
  }
}
```

由于 `haveMuscles` 未被导出，只有共享相同未合并命名空间的 `animalsHaveMuscles` 函数可以看到该符号。
`doAnimalsHaveMuscles` 函数，即使它是合并后的 `Animal` 命名空间的一部分，也无法看到这个未导出的成员。

## 合并命名空间与类、函数和枚举

命名空间足够灵活，也可以与其他类型的声明合并。
为此，命名空间声明必须跟在它将要合并的声明之后。结果声明具有两种声明类型的属性。
TypeScript 使用这种能力来模拟 JavaScript 以及其他编程语言中的一些模式。

### 合并命名空间与类

这为用户提供了一种描述内部类的方式。

```ts
class Album {
  label: Album.AlbumLabel;
}
namespace Album {
  export class AlbumLabel {}
}
```

合并成员的可见性规则与 [合并命名空间](#合并命名空间) 部分中描述的相同，因此我们必须导出 `AlbumLabel` 类，以便合并的类可以看到它。
最终结果是一个在另一个类内部管理的类。
你还可以使用命名空间向现有类添加更多静态成员。

除了内部类的模式外，你可能还熟悉 JavaScript 中创建函数然后通过向函数添加属性来进一步扩展函数的实践。
TypeScript 使用声明合并以类型安全的方式构建这样的定义。

```ts
function buildLabel(name: string): string {
  return buildLabel.prefix + name + buildLabel.suffix;
}

namespace buildLabel {
  export let suffix = "";
  export let prefix = "Hello, ";
}

console.log(buildLabel("Sam Smith"));
```

类似地，命名空间可用于用静态成员扩展枚举：

```ts
enum Color {
  red = 1,
  green = 2,
  blue = 4,
}

namespace Color {
  export function mixColor(colorName: string) {
    if (colorName == "yellow") {
      return Color.red + Color.green;
    } else if (colorName == "white") {
      return Color.red + Color.green + Color.blue;
    } else if (colorName == "magenta") {
      return Color.red + Color.blue;
    } else if (colorName == "cyan") {
      return Color.green + Color.blue;
    }
  }
}
```

## 禁止的合并

并非所有合并在 TypeScript 中都是允许的。
目前，类不能与其他类或变量合并。
有关模拟类合并的信息，请参阅 [Mixins in TypeScript](https://www.typescriptlang.org/docs/handbook/mixins.html) 部分。

## 模块增强

尽管 JavaScript 模块不支持合并，但你可以通过导入然后更新现有对象来修补它们。
让我们看一个简单的 Observable 示例：

```ts
// observable.ts
export class Observable<T> {
  // ... implementation left as an exercise for the reader ...
}

// map.ts
import { Observable } from "./observable";
Observable.prototype.map = function (f) {
  // ... another exercise for the reader
};
```

这在 TypeScript 中也能正常工作，但编译器不知道 `Observable.prototype.map`。
你可以使用 _模块增强_ 来告诉编译器：

```ts
// observable.ts
export class Observable<T> {
  // ... implementation left as an exercise for the reader ...
}

// map.ts
import { Observable } from "./observable";
declare module "./observable" {
  interface Observable<T> {
    map<U>(f: (x: T) => U): Observable<U>;
  }
}
Observable.prototype.map = function (f) {
  // ... another exercise for the reader
};

// consumer.ts
import { Observable } from "./observable";
import "./map";
let o: Observable<number>;
o.map((x) => x.toFixed());
```

模块名称的解析方式与 `import`/`export` 中的模块说明符相同。
有关更多信息，请参阅 [模块](https://www.typescriptlang.org/docs/handbook/modules.html)。
然后，增强中的声明就像它们在原始文件中被声明一样合并。

但是，有两个限制需要记住：

1. 你不能在增强中声明新的顶级声明——只能修补现有声明。
2. 默认导出也不能被增强，只有命名导出可以（因为你需要通过其导出的名称来增强导出，而 `default` 是保留字——详见 [#14080](https://github.com/Microsoft/TypeScript/issues/14080)）

### 全局增强

你还可以从模块内部向全局作用域添加声明：

```ts
// observable.ts
export class Observable<T> {
  // ... still no implementation ...
}

declare global {
  interface Array<T> {
    toObservable(): Observable<T>;
  }
}

Array.prototype.toObservable = function () {
  // ...
};
```

_全局增强_ 具有与模块增强相同的行为和限制。
