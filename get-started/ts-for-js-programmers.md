---
title: 面向 JavaScript 程序员的 TypeScript
---

TypeScript 与 JavaScript 之间有着独特的关系。TypeScript 提供了 JavaScript 的所有功能，并在此基础上增加了一层：TypeScript 的类型系统。

例如，JavaScript 提供了 `string` 和 `number` 等语言原语，但它不会检查你是否一致地使用了这些类型。TypeScript 会进行检查。

这意味着你现有的正常工作的 JavaScript 代码也是 TypeScript 代码。TypeScript 的主要好处是它可以高亮显示代码中的意外行为，降低出现 bug 的几率。

本教程简要概述了 TypeScript，重点介绍其类型系统。

## 类型推断

TypeScript 了解 JavaScript 语言，会在许多情况下为你生成类型。
例如，在创建一个变量并将其赋值为特定值时，TypeScript 会将该值作为其类型。

```ts twoslash
let helloWorld = "Hello World";
//  ^?
```

通过理解 JavaScript 的工作原理，TypeScript 可以构建一个接受 JavaScript 代码但具有类型的类型系统。这提供了一个类型系统，而无需在代码中添加额外字符来显式声明类型。这就是 TypeScript 知道上面示例中 `helloWorld` 是 `string` 的原因。

你可能在 Visual Studio Code 中编写过 JavaScript，并使用过编辑器自动补全功能。Visual Studio Code 在底层使用 TypeScript 来让你更轻松地使用 JavaScript。

## 定义类型

你可以在 JavaScript 中使用各种各样的设计模式。然而，某些设计模式会使类型难以自动推断（例如，使用动态编程的模式）。为了涵盖这些情况，TypeScript 支持 JavaScript 语言的扩展，为你提供告诉 TypeScript 类型应该是什么的地方。

例如，要创建一个包含 `name: string` 和 `id: number` 的推断类型对象，你可以这样写：

```ts twoslash
const user = {
  name: "Hayes",
  id: 0,
};
```

你可以使用 `interface` 声明来显式描述这个对象的形状：

```ts twoslash
interface User {
  name: string;
  id: number;
}
```

然后，你可以通过在变量声明后使用 `: TypeName` 这样的语法来声明 JavaScript 对象符合你的新 `interface` 的形状：

```ts twoslash
interface User {
  name: string;
  id: number;
}
// ---cut---
const user: User = {
  name: "Hayes",
  id: 0,
};
```

如果你提供的对象与你提供的接口不匹配，TypeScript 会警告你：

```ts twoslash
// @errors: 2322 2353
interface User {
  name: string;
  id: number;
}

const user: User = {
  username: "Hayes",
  id: 0,
};
```

由于 JavaScript 支持类和面向对象编程，TypeScript 也支持。你可以将接口声明与类一起使用：

```ts twoslash
interface User {
  name: string;
  id: number;
}

class UserAccount {
  name: string;
  id: number;

  constructor(name: string, id: number) {
    this.name = name;
    this.id = id;
  }
}

const user: User = new UserAccount("Murphy", 1);
```

你可以使用接口来注解函数的参数和返回值：

```ts twoslash
// @noErrors
interface User {
  name: string;
  id: number;
}
// ---cut---
function deleteUser(user: User) {
  // ...
}

function getAdminUser(): User {
  //...
}
```

JavaScript 中已经有一组可用的基本类型：`boolean`、`bigint`、`null`、`number`、`string`、`symbol` 和 `undefined`，你可以在接口中使用这些类型。TypeScript 在此基础上扩展了更多类型，例如 `any`（允许任何值）、[`unknown`](https://www.typescriptlang.org/play#example/unknown-and-never)（确保使用此类型的人声明类型是什么）、[`never`](https://www.typescriptlang.org/play#example/unknown-and-never)（这种类型不可能发生）和 `void`（返回 `undefined` 或没有返回值的函数）。

你会看到有两种构建类型的语法：[接口和类型](https://www.typescriptlang.org/play/?e=83#example/types-vs-interfaces)。你应该优先使用 `interface`。在需要特定功能时使用 `type`。

## 组合类型

使用 TypeScript，你可以通过组合简单类型来创建复杂类型。有两种流行的方法：联合类型（unions）和泛型（generics）。

### 联合类型

使用联合类型，你可以声明一个类型可以是多种类型之一。例如，你可以将 `boolean` 类型描述为 `true` 或 `false`：

```ts twoslash
type MyBool = true | false;
```

_注意：_ 如果你将鼠标悬停在 `MyBool` 上，你会看到它被归类为 `boolean`。这是结构类型系统的一个特性。更多内容见下文。

联合类型的一个常见用例是描述值允许的一组 `string` 或 `number` [字面量](../handbook-v2/everyday-types.html#字面量类型)：

```ts twoslash
type WindowStates = "open" | "closed" | "minimized";
type LockStates = "locked" | "unlocked";
type PositiveOddNumbersUnderTen = 1 | 3 | 5 | 7 | 9;
```

联合类型还提供了一种处理不同类型的方法。例如，你可能有一个接受 `array` 或 `string` 的函数：

```ts twoslash
function getLength(obj: string | string[]) {
  return obj.length;
}
```

要了解变量的类型，请使用 `typeof`：

| 类型      | 谓词                               |
| --------- | ---------------------------------- |
| string    | `typeof s === "string"`            |
| number    | `typeof n === "number"`            |
| boolean   | `typeof b === "boolean"`           |
| undefined | `typeof undefined === "undefined"` |
| function  | `typeof f === "function"`          |
| array     | `Array.isArray(a)`                 |

例如，你可以根据传递给函数的参数是字符串还是数组来让函数返回不同的值：

<!-- prettier-ignore -->
```ts twoslash
function wrapInArray(obj: string | string[]) {
  if (typeof obj === "string") {
    return [obj];
//          ^?
  }
  return obj;
}
```

### 泛型

泛型为类型提供变量。一个常见的例子是数组。没有泛型的数组可以包含任何内容。带有泛型的数组可以描述数组包含的值。

```ts
type StringArray = Array<string>;
type NumberArray = Array<number>;
type ObjectWithNameArray = Array<{ name: string }>;
```

你可以声明使用泛型的自己的类型：

```ts twoslash
// @errors: 2345
interface Backpack<Type> {
  add: (obj: Type) => void;
  get: () => Type;
}

// 这一行是一个快捷方式，告诉 TypeScript 有一个名为 `backpack` 的常量，
// 不用担心它来自哪里。
declare const backpack: Backpack<string>;

// object 是一个字符串，因为我们在上面将其声明为 Backpack 的变量部分。
const object = backpack.get();

// 由于 backpack 变量是字符串，你不能将数字传递给 add 函数。
backpack.add(23);
```

## 结构类型系统

TypeScript 的核心原则之一是类型检查关注值的 _形状_ 。这有时被称为"鸭子类型"或"结构类型"。

在结构类型系统中，如果两个对象具有相同的形状，它们被认为是相同的类型。

```ts twoslash
interface Point {
  x: number;
  y: number;
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}

// 输出 "12, 26"
const point = { x: 12, y: 26 };
logPoint(point);
```

`point` 变量从未被声明为 `Point` 类型。然而，TypeScript 在类型检查中比较了 `point` 的形状与 `Point` 的形状。它们具有相同的形状，因此代码通过检查。

形状匹配只需要对象字段的子集匹配。

```ts twoslash
// @errors: 2345
interface Point {
  x: number;
  y: number;
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}
// ---cut---
const point3 = { x: 12, y: 26, z: 89 };
logPoint(point3); // 输出 "12, 26"

const rect = { x: 33, y: 3, width: 30, height: 80 };
logPoint(rect); // 输出 "33, 3"

const color = { hex: "#187ABF" };
logPoint(color);
```

类和对象符合形状的方式没有区别：

```ts twoslash
// @errors: 2345
interface Point {
  x: number;
  y: number;
}

function logPoint(p: Point) {
  console.log(`${p.x}, ${p.y}`);
}
// ---cut---
class VirtualPoint {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const newVPoint = new VirtualPoint(13, 56);
logPoint(newVPoint); // 输出 "13, 56"
```

如果对象或类具有所有必需的属性，TypeScript 会说它们匹配，无论实现细节如何。

## 下一步

这是对日常 TypeScript 中使用的语法和工具的简要概述。从这里开始，你可以：

- 从头到尾阅读完整的[手册](../handbook-v2/the-handbook.html)
- 探索 [Playground 示例](https://www.typescriptlang.org/play#show-examples)
