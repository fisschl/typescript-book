---
title: 类型兼容性
---

TypeScript 中的类型兼容性基于 _结构化子类型_。结构化类型是一种仅根据成员来关联类型的方式。这与 _标称类型_ 形成对比。考虑以下代码：

```ts twoslash
// @noErrors
interface Pet {
  name: string;
}

class Dog {
  name: string;
}

let pet: Pet;
// OK, because of structural typing
pet = new Dog();
```

在 C# 或 Java 等标称类型语言中，等效的代码会产生错误，因为 `Dog` 类没有显式声明自己是 `Pet` 接口的实现者。

TypeScript 的结构化类型系统是基于 JavaScript 代码的典型编写方式设计的。由于 JavaScript 广泛使用函数表达式和对象字面量等匿名对象，因此使用结构化类型系统而不是标称类型系统来表示 JavaScript 库中存在的各种关系更为自然。

## 关于完备性的说明

TypeScript 的类型系统允许某些在编译时无法确定为安全的操作。当类型系统具有此属性时，它被称为不是"完备的"。TypeScript 允许不完备行为的地方都经过仔细考虑，在本文档中，我们将解释这些行为发生的位置以及其背后的动机场景。

## 开始

TypeScript 结构化类型系统的基本规则是，如果 `y` 至少具有与 `x` 相同的成员，则 `x` 与 `y` 兼容。例如，考虑以下涉及一个名为 `Pet` 的接口的代码，该接口具有 `name` 属性：

```ts twoslash
interface Pet {
  name: string;
}

let pet: Pet;
// dog's inferred type is { name: string; owner: string; }
let dog = { name: "Lassie", owner: "Rudd Weatherwax" };
pet = dog;
```

要检查 `dog` 是否可以赋值给 `pet`，编译器会检查 `pet` 的每个属性以在 `dog` 中找到相应的兼容属性。在这种情况下，`dog` 必须有一个名为 `name` 的成员，且类型为字符串。它确实有，因此赋值被允许。

检查函数调用参数时使用相同的赋值规则：

```ts twoslash
interface Pet {
  name: string;
}

let dog = { name: "Lassie", owner: "Rudd Weatherwax" };

function greet(pet: Pet) {
  console.log("Hello, " + pet.name);
}
greet(dog); // OK
```

请注意，`dog` 有一个额外的 `owner` 属性，但这不会产生错误。在检查兼容性时，只考虑目标类型（本例中为 `Pet`）的成员。这种比较过程递归地进行，探索每个成员和子成员的类型。

但是请注意，对象字面量 [只能指定已知属性](/handbook-v2/object-types#多余属性检查)。例如，因为我们明确指定了 `dog` 的类型为 `Pet`，所以以下代码是无效的：

```ts twoslash
// @errors: 2353
interface Pet {
  name: string;
}

let dog: Pet = { name: "Lassie", owner: "Rudd Weatherwax" };
```

## 比较两个函数

虽然比较原始类型和对象类型相对简单，但关于应该将哪些类型的函数视为兼容的问题则更为复杂。让我们从两个仅在参数列表上有所不同的函数的基本示例开始：

```ts twoslash
// @errors: 2322
let x = (a: number) => 0;
let y = (b: number, s: string) => 0;

y = x; // OK
x = y; // Error
```

要检查 `x` 是否可以赋值给 `y`，我们首先查看参数列表。`x` 中的每个参数必须在 `y` 中具有相应类型的兼容参数。请注意，参数的名称不被考虑，只考虑它们的类型。在这种情况下，`x` 的每个参数在 `y` 中都有相应的兼容参数，因此赋值被允许。

第二次赋值是一个错误，因为 `y` 有一个 `x` 没有的必需第二个参数，因此赋值被禁止。

你可能想知道为什么我们允许像示例 `y = x` 中那样"丢弃"参数。允许这种赋值的原因是，忽略额外的函数参数在 JavaScript 中实际上非常常见。例如，`Array#forEach` 为回调函数提供三个参数：数组元素、其索引和包含数组。然而，提供一个只使用第一个参数的回调非常有用：

```ts twoslash
let items = [1, 2, 3];

// Don't force these extra parameters
items.forEach((item, index, array) => console.log(item));

// Should be OK!
items.forEach((item) => console.log(item));
```

现在让我们看看如何处理返回类型，使用两个仅在返回类型上有所不同的函数：

```ts twoslash
// @errors: 2322
let x = () => ({ name: "Alice" });
let y = () => ({ name: "Alice", location: "Seattle" });

x = y; // OK
y = x; // Error, because x() lacks a location property
```

类型系统强制要求源函数的返回类型必须是目标类型返回类型的子类型。

### 函数参数的双变性

在比较函数参数的类型时，如果源参数可赋值给目标参数，或者反之亦然，则赋值成功。这是不完备的，因为调用者可能最终得到一个接受更专业类型的函数，但却用较不专业的类型调用该函数。在实践中，这种错误很少见，允许这样做可以实现许多常见的 JavaScript 模式。一个简短的例子：

```ts twoslash
// @noErrors
enum EventType {
  Mouse,
  Keyboard,
}

interface Event {
  timestamp: number;
}
interface MyMouseEvent extends Event {
  x: number;
  y: number;
}
interface MyKeyEvent extends Event {
  keyCode: number;
}

function listenEvent(eventType: EventType, handler: (n: Event) => void) {
  /* ... */
}

// Unsound, but useful and common
listenEvent(EventType.Mouse, (e: MyMouseEvent) => console.log(e.x + "," + e.y));

// Undesirable alternatives in presence of soundness
listenEvent(EventType.Mouse, (e: Event) =>
  console.log((e as MyMouseEvent).x + "," + (e as MyMouseEvent).y)
);
listenEvent(EventType.Mouse, ((e: MyMouseEvent) =>
  console.log(e.x + "," + e.y)) as (e: Event) => void);

// Still disallowed (clear error). Type safety enforced for wholly incompatible types
listenEvent(EventType.Mouse, (e: number) => console.log(e));
```

你可以通过编译器标志 [`strictFunctionTypes`](https://www.typescriptlang.org/tsconfig#strictFunctionTypes) 让 TypeScript 在这种情况下引发错误。

### 可选参数和剩余参数

在比较函数的兼容性时，可选参数和必需参数可以互换。源类型的额外可选参数不是错误，目标类型中没有相应参数的源类型可选参数也不是错误。

当函数具有剩余参数时，它被视为具有无限系列的可选参数。

从类型系统的角度来看，这是不完备的，但从运行时的角度来看，可选参数的概念通常执行得不好，因为在该位置传递 `undefined` 对大多数函数来说是等效的。

激励示例是一个接受回调并使用一些可预测的（对程序员而言）但未知的（对类型系统而言）数量的参数调用它的常见模式：

```ts twoslash
function invokeLater(args: any[], callback: (...args: any[]) => void) {
  /* ... Invoke callback with 'args' ... */
}

// Unsound - invokeLater "might" provide any number of arguments
invokeLater([1, 2], (x, y) => console.log(x + ", " + y));

// Confusing (x and y are actually required) and undiscoverable
invokeLater([1, 2], (x?, y?) => console.log(x + ", " + y));
```

### 具有重载的函数

当函数具有重载时，目标类型中的每个重载必须由源类型上的兼容签名匹配。这确保源函数可以在与目标函数相同的所有情况下被调用。

## 枚举

枚举与数字兼容，数字也与枚举兼容。来自不同枚举类型的枚举值被视为不兼容。例如，

```ts twoslash
// @errors: 2322
enum Status {
  Ready,
  Waiting,
}
enum Color {
  Red,
  Blue,
  Green,
}

let status = Status.Ready;
status = Color.Green;
```

## 类

类的工作方式类似于对象字面量类型和接口，只有一个例外：它们同时具有静态类型和实例类型。在比较两个类类型的对象时，只比较实例的成员。静态成员和构造函数不影响兼容性。

```ts twoslash
// @noErrors
class Animal {
  feet: number;
  constructor(name: string, numFeet: number) {}
}

class Size {
  feet: number;
  constructor(numFeet: number) {}
}

let a: Animal;
let s: Size;

a = s; // OK
s = a; // OK
```

### 类中的私有和受保护成员

类中的私有和受保护成员会影响其兼容性。当检查类的实例的兼容性时，如果目标类型包含私有成员，则源类型也必须包含源自同一类的私有成员。同样，这也适用于具有受保护成员的实例。这允许类与其超类赋值兼容，但 _不_ 与来自不同继承层次结构但具有相同形状的类赋值兼容。

## 泛型

因为 TypeScript 是结构化类型系统，类型参数仅在作为成员类型的一部分被消费时才会影响结果类型。例如，

```ts twoslash
// @noErrors
interface Empty<T> {}
let x: Empty<number>;
let y: Empty<string>;

x = y; // OK, because y matches structure of x
```

在上面的例子中，`x` 和 `y` 是兼容的，因为它们的结构没有以区分方式使用类型参数。通过向 `Empty<T>` 添加成员来更改此示例可以展示其工作原理：

```ts twoslash
// @errors: 2322 2454
interface NotEmpty<T> {
  data: T;
}
let x: NotEmpty<number>;
let y: NotEmpty<string>;

x = y; // Error, because x and y are not compatible
```

通过这种方式，具有指定类型参数的泛型类型就像非泛型类型一样。

对于没有指定类型参数的泛型类型，兼容性通过在所有未指定的类型参数位置指定 `any` 来检查。然后检查结果类型的兼容性，就像在非泛型情况下一样。

例如，

```ts twoslash
// @noErrors
let identity = function <T>(x: T): T {
  // ...
};

let reverse = function <U>(y: U): U {
  // ...
};

identity = reverse; // OK, because (x: any) => any matches (y: any) => any
```

## 高级主题

### 子类型与赋值

到目前为止，我们使用了"兼容"这个词，这不是语言规范中定义的术语。在 TypeScript 中，有两种兼容性：子类型和赋值。它们的区别仅在于赋值扩展了子类型兼容性，添加了允许与 `any` 之间以及具有相应数值的 `enum` 之间赋值的规则。

语言中的不同位置根据情况使用两种兼容性机制之一。出于实际目的，类型兼容性由赋值兼容性决定，即使在 `implements` 和 `extends` 子句的情况下也是如此。

## `any`、`unknown`、`object`、`void`、`undefined`、`null` 和 `never` 的可赋值性

下表总结了一些抽象类型之间的可赋值性。行表示每个类型可赋值给什么，列表示什么可赋值给它们。"<span class='black-tick'>✓</span>" 表示仅在 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 关闭时才兼容的组合。

<!-- This is the rendered form of https://github.com/microsoft/TypeScript-Website/pull/1490 -->
<table class="data">
<thead>
<tr>
<th></th>
<th align="center">any</th>
<th align="center">unknown</th>
<th align="center">object</th>
<th align="center">void</th>
<th align="center">undefined</th>
<th align="center">null</th>
<th align="center">never</th>
</tr>
</thead>
<tbody>
<tr>
<td>any →</td>
<td align="center"></td>
<td align="center"><span class="blue-tick" style="
    color: #007aff;
">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>unknown →</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>object →</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>void →</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>undefined →</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>null →</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"><span class="black-tick">✓</span></td>
<td align="center"></td>
<td align="center"><span class="red-cross">✕</span></td>
</tr>
<tr>
<td>never →</td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"><span class="blue-tick">✓</span></td>
<td align="center"></td>
</tr>
</tbody>
</table>

重申 [基础](/handbook-v2/basics) 中的内容：

- 所有东西都可以赋值给自己。
- `any` 和 `unknown` 在可赋值给它们的内容方面是相同的，不同之处在于 `unknown` 不能赋值给除 `any` 之外的任何东西。
- `unknown` 和 `never` 就像彼此的逆。
  所有东西都可以赋值给 `unknown`，`never` 可以赋值给所有东西。
  没有什么可以赋值给 `never`，`unknown` 不能赋值给任何东西（除了 `any`）。
- `void` 不能赋值给或从任何东西赋值，但有以下例外：`any`、`unknown`、`never`、`undefined` 和 `null`（如果 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 关闭，详见表格）。
- 当 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 关闭时，`null` 和 `undefined` 类似于 `never`：可赋值给大多数类型，大多数类型不可赋值给它们。
  它们可以相互赋值。
- 当 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 开启时，`null` 和 `undefined` 的行为更像 `void`：不可赋值给或从任何东西赋值，除了 `any`、`unknown` 和 `void`（`undefined` 总是可赋值给 `void`）。
