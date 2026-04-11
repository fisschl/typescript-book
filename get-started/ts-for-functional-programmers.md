---
title: 面向函数式程序员的 TypeScript
---

TypeScript 最初是为了将传统的面向对象类型引入 JavaScript 而诞生的，这样微软的程序员就可以将传统的面向对象程序带到 Web 上。随着它的发展，TypeScript 的类型系统逐渐演变为能够建模原生 JavaScript 开发者编写的代码。由此产生的系统强大、有趣且有些复杂。

本介绍专为有 Haskell 或 ML 工作经验的程序员设计，帮助他们学习 TypeScript。它描述了 TypeScript 的类型系统与 Haskell 类型系统的不同之处，还介绍了 TypeScript 类型系统中因其对 JavaScript 代码的建模而产生的独特功能。

本介绍不涵盖面向对象编程。实际上，TypeScript 中的面向对象程序与其他流行的具有面向对象特性的语言中的程序相似。


## 前置知识

在本介绍中，我假设你知道以下内容：


- 如何编写 JavaScript 的精华部分。
- C 系语言的类型语法。

如果你需要学习 JavaScript 的精华部分，请阅读[《JavaScript: The Good Parts》](https://shop.oreilly.com/product/9780596517748.do)。
如果你知道如何编写一个按值调用、词法作用域、具有大量可变性和其他特性不多的程序，你可能可以跳过这本书。
[R<sup>4</sup>RS Scheme](https://people.csail.mit.edu/jaffer/r4rs.pdf) 就是一个很好的例子。

[《C++ 程序设计语言》](http://www.stroustrup.com/4th.html)是学习 C 风格类型语法的好地方。与 C++ 不同，
TypeScript 使用后缀类型，像这样：`x: string` 而不是 `string x`。


## Haskell 中没有的概念


### 内置类型

JavaScript 定义了 8 种内置类型：


| 类型 | 说明 |
| --- | --- |
| `Number` | 双精度 IEEE 754 浮点数。 |
| `String` | 不可变的 UTF-16 字符串。 |
| `BigInt` | 任意精度格式的整数。 |
| `Boolean` | `true` 和 `false`。 |
| `Symbol` | 通常用作键的唯一值。 |
| `Null` | 等价于单位类型。 |
| `Undefined` | 也等价于单位类型。 |
| `Object` | 类似于记录。 |

详情请参见 [MDN 页面](https://developer.mozilla.org/docs/Web/JavaScript/Data_structures)。

TypeScript 有与内置类型对应的原始类型：


- `number`
- `string`
- `bigint`
- `boolean`
- `symbol`
- `null`
- `undefined`
- `object`


#### TypeScript 的其他重要类型


| 类型 | 说明 |
| --- | --- |
| `unknown` | 顶层类型。 |
| `never` | 底层类型。 |
| 对象字面量 | 例如 `{ property: Type }` |
| `void` | 用于没有文档化返回值的函数 |
| `T[]` | 可变数组，也可写作 `Array<T>` |
| `[T, T]` | 元组，长度固定但可变 |
| `(t: T) => U` | 函数 |

注意：


1. 函数语法包含参数名。这很难习惯！
```ts
let fst: (a: any, b: any) => any = (a, b) => a;

// 或者更精确地：

let fst: <T, U>(a: T, b: U) => T = (a, b) => a;
```
2. 对象字面量类型语法与对象字面量值语法非常相似：
```ts
let o: { n: number; xs: object[] } = { n: 1, xs: [] };
```
3. `[T, T]` 是 `T[]` 的子类型。这与 Haskell 不同，在 Haskell 中元组和列表没有关系。


#### 装箱类型

JavaScript 有原始类型的装箱等价物，包含程序员与这些类型相关联的方法。TypeScript 通过原始类型 `number` 和装箱类型 `Number` 之间的区别来反映这一点。装箱类型很少需要，因为它们的方法返回原始类型。


```ts
(1).toExponential();
// 等价于
Number.prototype.toExponential.call(1);
```

注意，在数字字面量上调用方法需要将其放在括号中，以帮助解析器识别。


### 渐进式类型

每当 TypeScript 无法确定表达式的类型时，它会使用类型 `any`。与 `Dynamic` 相比，将 `any` 称为类型是一种夸大。它只是关闭类型检查器，无论它出现在哪里。例如，你可以将任何值推入 `any[]` 而无需以任何方式标记该值：


```ts twoslash
// 在 tsconfig.json 中设置 "noImplicitAny": false，anys: any[]
const anys = [];
anys.push(1);
anys.push("oh no");
anys.push({ anything: "goes" });
```

你可以在任何地方使用 `any` 类型的表达式：


```ts
anys.map(anys[1]); // oh no，"oh no" 不是一个函数
```

`any` 也是具有传染性的——如果你用 `any` 类型的表达式初始化变量，该变量也具有 `any` 类型。


```ts
let sepsis = anys[0] + anys[1]; // 这可能意味着任何东西
```

要在 TypeScript 产生 `any` 时得到错误，请在 tsconfig.json 中使用 `"noImplicitAny": true` 或 `"strict": true`。


### 结构类型

结构类型对大多数函数式程序员来说是一个熟悉的概念，尽管 Haskell 和大多数 ML 不是结构类型的。它的基本形式相当简单：


```ts twoslash
// @strict: false
let o = { x: "hi", extra: 1 }; // ok
let o2: { x: string } = o; // ok
```

这里，对象字面量 `{ x: "hi", extra: 1 }` 具有匹配的字面量类型 `{ x: string, extra: number }`。该类型可以赋值给 `{ x: string }`，因为它具有所有必需的属性，且这些属性具有可赋值的类型。额外的属性不会阻止赋值，它只是使其成为 `{ x: string }` 的子类型。

命名类型只是给类型一个名称；对于赋值目的，类型别名 One 和接口类型 Two 之间没有区别。它们都具有属性 `p: string`。（然而，类型别名在递归定义和类型参数方面与接口的行为不同。）


```ts twoslash
// @errors: 2322
type One = { p: string };
interface Two {
  p: string;
}
class Three {
  p = "Hello";
}

let x: One = { p: "hi" };
let two: Two = x;
two = new Three();
```


### 联合类型

在 TypeScript 中，联合类型是无标签的。换句话说，它们不像 Haskell 中的 `data` 那样是判别联合。然而，你通常可以使用内置标签或其他属性来区分联合中的类型。


```ts twoslash
function start(
  arg: string | string[] | (() => string) | { s: string }
): string {
  // 这在 JavaScript 中非常常见
  if (typeof arg === "string") {
    return commonCase(arg);
  } else if (Array.isArray(arg)) {
    return arg.map(commonCase).join(",");
  } else if (typeof arg === "function") {
    return commonCase(arg());
  } else {
    return commonCase(arg.s);
  }

  function commonCase(s: string): string {
    // 最后，只是将一个字符串转换为另一个字符串
    return s;
  }
}
```

`string`、`Array` 和 `Function` 有内置的类型谓词，方便地将对象类型留给 else 分支。然而，有可能生成在运行时难以区分的联合。对于新代码，最好只构建判别联合。

以下类型有内置谓词：


| 类型 | 谓词 |
| --- | --- |
| `string` | `typeof s === "string"` |
| `number` | `typeof n === "number"` |
| `bigint` | `typeof m === "bigint"` |
| `boolean` | `typeof b === "boolean"` |
| `symbol` | `typeof g === "symbol"` |
| `undefined` | `typeof undefined === "undefined"` |
| `function` | `typeof f === "function"` |
| `array` | `Array.isArray(a)` |
| `object` | `typeof o === "object"` |

注意，函数和数组在运行时是对象，但它们有自己的谓词。


#### 交叉类型

除了联合类型，TypeScript 还有交叉类型：


```ts twoslash
type Combined = { a: number } & { b: string };
type Conflicting = { a: number } & { a: string };
```

`Combined` 有两个属性，`a` 和 `b`，就像它们被写成一个对象字面量类型一样。在冲突的情况下，交叉和联合是递归的，所以 `Conflicting.a: number & string`。


### 单元类型

单元类型是原始类型的子类型，包含恰好一个原始值。例如，字符串 `"foo"` 具有类型 `"foo"`。由于 JavaScript 没有内置的枚举，通常使用一组众所周知的字符串代替。字符串字面量类型的联合允许 TypeScript 对此模式进行类型检查：


```ts twoslash
declare function pad(s: string, n: number, direction: "left" | "right"): string;
pad("hi", 10, "left");
```

当需要时，编译器会*拓宽*——转换为超类型——单元类型到原始类型，例如 `"foo"` 到 `string`。这在使用可变性时发生，可能会妨碍可变变量的一些用途：


```ts twoslash
// @errors: 2345
declare function pad(s: string, n: number, direction: "left" | "right"): string;
// ---cut---
let s = "right";
pad("hi", 10, s); // 错误：'string' 不能赋值给 '"left" | "right"'
```

错误是这样产生的：


- `"right": "right"`
- `s: string`，因为 `"right"` 在赋值给可变变量时*拓宽*为 `string`。
- `string` 不能赋值给 `"left" | "right"`

你可以用 `s` 的类型注解来解决这个问题，但这反过来会阻止将不是 `"left" | "right"` 类型的变量赋值给 `s`。


```ts twoslash
declare function pad(s: string, n: number, direction: "left" | "right"): string;
// ---cut---
let s: "left" | "right" = "right";
pad("hi", 10, s);
```


## 与 Haskell 相似的概念


### 上下文类型推断

TypeScript 在一些明显的地方可以推断类型，比如变量声明：


```ts twoslash
let s = "I'm a string!";
```

但它还在一些你可能没想到的地方推断类型，如果你曾使用过其他 C 语法语言：


```ts twoslash
declare function map<T, U>(f: (t: T) => U, ts: T[]): U[];
let sns = map((n) => n.toString(), [1, 2, 3]);
```

这里，`n: number` 在这个例子中也是如此，尽管 `T` 和 `U` 在调用之前还没有被推断出来。实际上，在 `[1,2,3]` 被用来推断 `T=number` 之后，`n => n.toString()` 的返回类型被用来推断 `U=string`，导致 `sns` 具有类型 `string[]`。

注意，推断会以任何顺序工作，但智能提示只会从左到右工作，所以 TypeScript 更倾向于先声明数组的 map：


```ts twoslash
declare function map<T, U>(ts: T[], f: (t: T) => U): U[];
```

上下文类型推断也递归地通过对象字面量工作：


```ts twoslash
window.onerror = (event, source, line, col, error) => {
  // window.onerror 的声明有多个重载，其中一个具有
  // 这个类型：
  //   (event: string, source: string, line: number, col: number,
  //    error: Error): boolean | void
  // 这意味着 'event'、'source'、'line'、'col' 和 'error'
  // 都是上下文类型化的，并具有推断出的类型。
  // 尝试将鼠标悬停在它们上面！
};
```


### 类型别名和接口

Haskell 有 `type` 来创建类型别名，以及 `newtype` 来创建与现有类型不同的新类型。TypeScript 有 `type` 和 `interface`，但不像 `newtype` 那样有区别。


```ts twoslash
type Tree<T> = {
  value: T;
  left: Tree<T>;
  right: Tree<T>;
};

// 与上面相同，但使用 interface
interface Itree<T> {
  value: T;
  left: Itree<T>;
  right: Itree<T>;
}
```

类型别名和接口在大多数情况下可以互换使用。几乎所有 `interface` 的功能在 `type` 中都可用，反之亦然。选择 `interface` 还是 `type` 主要是风格问题。


### 声明合并

TypeScript 支持声明合并，这意味着你可以多次声明同一个名称，并将它们合并在一起。Haskell 不支持这一点。


```ts twoslash
interface Box {
  height: number;
  width: number;
}

interface Box {
  scale: number;
}

let box: Box = { height: 5, width: 6, scale: 10 };
```


### 泛型

TypeScript 的泛型与 Haskell 的泛型非常相似：


```ts twoslash
function identity<T>(arg: T): T {
  return arg;
}
```

然而，TypeScript 要求你显式地写出类型参数，而 Haskell 通常可以从上下文中推断出来。


### 类型类

TypeScript 没有类型类。最接近的等价物是接口，但你需要显式地传递字典，而不是让编译器自动处理。


```ts twoslash
interface Show<T> {
  show: (x: T) => string;
}

function print<T>(dict: Show<T>, x: T): void {
  console.log(dict.show(x));
}
```


### 模块

TypeScript 的模块系统与 Haskell 的模块系统有些相似，但更接近于 ES6 模块。每个文件可以是一个模块，使用 `import` 和 `export` 来控制可见性。


```ts
// math.ts
export function add(x: number, y: number): number {
  return x + y;
}

// main.ts
import { add } from "./math";
console.log(add(1, 2));
```


## 下一步

现在你已经了解了 TypeScript 的类型系统与 Haskell 的不同之处，你可以：

- 阅读完整的[手册](/docs/handbook/intro.html)
- 探索 [Playground 示例](/play#show-examples)
