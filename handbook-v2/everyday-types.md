---
title: 日常类型
---

在本章中，我们将介绍一些在 JavaScript 代码中最常见的值类型，并解释在 TypeScript 中描述这些类型的相应方式。
这不是一个详尽的列表，未来的章节将描述更多命名和使用其他类型的方式。

类型也可以出现在比类型注解更多的 _地方_ 。
当我们了解类型本身时，我们还将了解可以在哪些地方引用这些类型以形成新的构造。

我们将从回顾编写 JavaScript 或 TypeScript 代码时可能遇到的最基本和最常见的类型开始。
这些将稍后形成更复杂类型的核心构建块。

## 基本类型：`string`、`number` 和 `boolean`

JavaScript 有三个非常常用的[基本类型](https://developer.mozilla.org/en-US/docs/Glossary/Primitive)：`string`、`number` 和 `boolean`。
每种类型在 TypeScript 中都有相应的类型。
正如你可能期望的那样，如果你对这些类型的值使用 JavaScript `typeof` 运算符，你会看到相同的名称：

- `string` 表示字符串值，如 `"Hello, world"`
- `number` 用于数字，如 `42`。JavaScript 没有专门的整数值运行时类型，所以没有相当于 `int` 或 `float` 的东西——一切都只是 `number`
- `boolean` 用于两个值 `true` 和 `false`

> 类型名称 `String`、`Number` 和 `Boolean`（以大写字母开头）是合法的，但指的是一些很少出现在代码中的特殊内置类型。 _始终_ 使用 `string`、`number` 或 `boolean` 作为类型。

## 数组

要指定像 `[1, 2, 3]` 这样的数组类型，你可以使用语法 `number[]`；这种语法适用于任何类型（例如 `string[]` 是字符串数组，以此类推）。
你也可能看到它写成 `Array<number>`，意思相同。
当我们介绍 _泛型_ 时，我们将了解更多关于 `T<U>` 语法。

> 注意 `[number]` 是不同的东西；请参阅[元组](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types)部分。

## `any`

TypeScript 还有一个特殊类型 `any`，你可以在你不希望特定值导致类型检查错误时使用它。

当值的类型为 `any` 时，你可以访问它的任何属性（这些属性又将是 `any` 类型），像函数一样调用它，将它赋值给（或从）任何类型的值，或者几乎任何语法上合法的东西：

```ts twoslash
let obj: any = { x: 0 };
// 以下代码行都不会抛出编译器错误。
// 使用 `any` 会禁用所有进一步的类型检查，并假设
// 你比 TypeScript 更了解环境。
obj.foo();
obj();
obj.bar = 100;
obj = "hello";
const n: number = obj;
```

当你不想仅仅为了说服 TypeScript 某行代码没问题而写出一个长类型时，`any` 类型很有用。

### `noImplicitAny`

当你没有指定类型，且 TypeScript 无法从上下文中推断它时，编译器通常会默认为 `any`。

不过，你通常想避免这种情况，因为 `any` 不会被类型检查。
使用编译器标志 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 将任何隐式 `any` 标记为错误。

## 变量上的类型注解

当你使用 `const`、`var` 或 `let` 声明变量时，你可以选择性添加类型注解以显式指定变量的类型：

```ts twoslash
let myName: string = "Alice";
//        ^^^^^^^^ 类型注解
```

> TypeScript 不使用"类型在左边"风格的声明，如 `int x = 0;`
> 类型注解将始终放在被类型化的东西 _之后_ 。

然而，在大多数情况下，这并不需要。
只要可能，TypeScript 会尝试自动 _推断_ 代码中的类型。
例如，变量的类型是根据其初始化器的类型推断的：

```ts twoslash
// 不需要类型注解——'myName' 被推断为 'string' 类型
let myName = "Alice";
```

大多数情况下，你不需要显式学习推断规则。
如果你刚开始，尝试使用比你想象的更少的类型注解——你可能会惊讶地发现 TypeScript 完全理解正在发生的事情所需的注解如此之少。

## 函数

函数是 JavaScript 中传递数据的主要方式。
TypeScript 允许你指定函数的输入和输出值的类型。

### 参数类型注解

当你声明函数时，可以在每个参数后添加类型注解，以声明函数接受什么类型的参数。
参数类型注解放在参数名之后：

```ts twoslash
// 参数类型注解
function greet(name: string) {
  //                 ^^^^^^^^
  console.log("Hello, " + name.toUpperCase() + "!!");
}
```

当参数有类型注解时，该函数的参数将被检查：

```ts twoslash
// @errors: 2345
declare function greet(name: string): void;
// ---cut---
// 如果执行，这将是运行时错误！
greet(42);
```

> 即使你的参数没有类型注解，TypeScript 仍会检查你传递了正确数量的参数。

### 返回类型注解

你也可以添加返回类型注解。
返回类型注解出现在参数列表之后：

```ts twoslash
function getFavoriteNumber(): number {
  //                        ^^^^^^^^
  return 26;
}
```

与变量类型注解非常相似，你通常不需要返回类型注解，因为 TypeScript 会根据其 `return` 语句推断函数的返回类型。
上面示例中的类型注解不会改变任何东西。
有些代码库会显式指定返回类型以用于文档目的，防止意外更改，或仅仅是个人偏好。

#### 返回 Promise 的函数

如果你想注解返回 promise 的函数的返回类型，你应该使用 `Promise` 类型：

```ts twoslash
async function getFavoriteNumber(): Promise<number> {
  return 26;
}
```

### 匿名函数

匿名函数与函数声明略有不同。
当函数出现在 TypeScript 可以确定它将如何被调用的地方时，该函数的参数会自动获得类型。

这里有一个例子：

```ts twoslash
// @errors: 2551
const names = ["Alice", "Bob", "Eve"];

// 函数的上下文类型——参数 s 被推断为 string 类型
names.forEach(function (s) {
  console.log(s.toUpperCase());
});

// 上下文类型也适用于箭头函数
names.forEach((s) => {
  console.log(s.toUpperCase());
});
```

即使参数 `s` 没有类型注解，TypeScript 也使用 `forEach` 函数的类型以及数组的推断类型来确定 `s` 将具有的类型。

这个过程被称为 _上下文类型_ ，因为函数发生的 _上下文_ 决定了它应该具有的类型。

类似于推断规则，你不需要显式学习这是如何发生的，但理解它 _确实_ 发生可以帮助你注意到何时不需要类型注解。
稍后，我们将看到值发生的上下文如何影响其类型的更多示例。

## 对象类型

除了基本类型之外，你最常遇到的类型是 _对象类型_ 。
这指的是任何具有属性的 JavaScript 值，几乎所有值都是！
要定义对象类型，我们只需列出其属性及其类型。

例如，这里有一个接受点状对象的函数：

```ts twoslash
// 参数的类型注解是对象类型
function printCoord(pt: { x: number; y: number }) {
  //                      ^^^^^^^^^^^^^^^^^^^^^^^^
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}
printCoord({ x: 3, y: 7 });
```

在这里，我们用具有两个属性的类型注解了参数——`x` 和 `y`——它们都是 `number` 类型。
你可以使用 `,` 或 `;` 来分隔属性，最后的分隔符两种方式都是可选的。

每个属性的类型部分也是可选的。
如果你不指定类型，它将假定为 `any`。

### 可选属性

对象类型还可以指定其部分或全部属性为 _可选的_ 。
为此，在属性名后添加 `?`：

```ts twoslash
function printName(obj: { first: string; last?: string }) {
  // ...
}
// 都可以
printName({ first: "Bob" });
printName({ first: "Alice", last: "Alisson" });
```

在 JavaScript 中，如果你访问一个不存在的属性，你会得到值 `undefined` 而不是运行时错误。
因此，当你从可选属性 _读取_ 时，你必须在使用它之前检查 `undefined`。

```ts twoslash
// @errors: 18048
function printName(obj: { first: string; last?: string }) {
  // 错误——如果 'obj.last' 没有提供可能会崩溃！
  console.log(obj.last.toUpperCase());
  if (obj.last !== undefined) {
    // OK
    console.log(obj.last.toUpperCase());
  }

  // 使用现代 JavaScript 语法的安全替代方案：
  console.log(obj.last?.toUpperCase());
}
```

## 联合类型

TypeScript 的类型系统允许你使用大量运算符从现有类型构建新类型。
既然我们知道如何编写几种类型，是时候开始以有趣的方式 _组合_ 它们了。

### 定义联合类型

你可能看到的组合类型的第一种方式是 _联合_ 类型。
联合类型是由两个或多个其他类型形成的类型，表示值可能是这些类型中的 _任何一个_ 。
我们将这些类型中的每一个称为联合的 _成员_ 。

让我们编写一个可以对字符串或数字进行操作的函数：

```ts twoslash
// @errors: 2345
function printId(id: number | string) {
  console.log("Your ID is: " + id);
}
// OK
printId(101);
// OK
printId("202");
// Error
printId({ myID: 22342 });
```

> 联合成员的分隔符允许在第一个元素之前，所以你也可以这样写：
> ```ts twoslash
> function printTextOrNumberOrBool(
>   textOrNumberOrBool:
>     | string
>     | number
>     | boolean
> ) {
>   console.log(textOrNumberOrBool);
> }
> ```

### 使用联合类型

_提供_ 匹配联合类型的值很容易——只需提供匹配联合任何成员的类型。
如果你 _拥有_ 联合类型的值，如何使用它？

TypeScript 只允许对联合的 _每个_ 成员都有效的操作。
例如，如果你有联合 `string | number`，你不能使用仅在 `string` 上可用的方法：

```ts twoslash
// @errors: 2339
function printId(id: number | string) {
  console.log(id.toUpperCase());
}
```

解决方案是用代码 _缩小_ 联合，就像你在没有类型注解的 JavaScript 中所做的那样。
当 TypeScript 可以根据代码结构推断出值的更具体类型时，就会发生 _窄化_ 。

例如，TypeScript 知道只有 `string` 值才会有 `typeof` 值 `"string"`：

```ts twoslash
function printId(id: number | string) {
  if (typeof id === "string") {
    // 在这个分支中，id 是 'string' 类型
    console.log(id.toUpperCase());
  } else {
    // 这里，id 是 'number' 类型
    console.log(id);
  }
}
```

另一个例子是使用像 `Array.isArray` 这样的函数：

```ts twoslash
function welcomePeople(x: string[] | string) {
  if (Array.isArray(x)) {
    // 这里：'x' 是 'string[]'
    console.log("Hello, " + x.join(" and "));
  } else {
    // 这里：'x' 是 'string'
    console.log("Welcome lone traveler " + x);
  }
}
```

注意，在 `else` 分支中，我们不需要做任何特殊的事情——如果 `x` 不是 `string[]`，那么它一定是 `string`。

有时你会有一个联合，其中所有成员都有共同的属性。
例如，数组和字符串都有 `slice` 方法。
如果联合的每个成员都有一个共同的属性，你可以使用该属性而无需窄化：

```ts twoslash
// 返回类型被推断为 number[] | string
function getFirstThree(x: number[] | string) {
  return x.slice(0, 3);
}
```

## 类型别名

我们一直在使用对象类型和联合类型，通过直接在类型注解中编写它们。
这很方便，但通常希望多次使用同一个类型，并用一个名称引用它。

类型别名就是这样——任何类型的 _名称_ 。类型别名的语法是：

```ts twoslash
type Point = {
  x: number;
  y: number;
};

// 与上面的示例完全相同
function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}

printCoord({ x: 100, y: 100 });
```

你可以使用类型别名为任何类型命名，不仅仅是对象类型。
例如，类型别名可以命名联合类型：

```ts twoslash
type ID = number | string;
```

注意，别名只是 _别名_ ——你不能使用类型别名创建相同类型的不同"版本"。
当你使用别名时，它就像你写了别名的类型一样。
换句话说，这段代码看起来可能是非法的，但对 TypeScript 来说是可以的，因为这两种类型都是同一类型的别名：

```ts twoslash
declare function getInput(): string;
declare function sanitize(str: string): string;
// ---cut---
type UserInputSanitizedString = string;

function sanitizeInput(str: string): UserInputSanitizedString {
  return sanitize(str);
}

// 创建经过清理的输入
let userInput = sanitizeInput(getInput());

// 仍然可以用字符串重新赋值
userInput = "new input";
```

## 接口

接口声明是另一种命名对象类型的方式：

```ts twoslash
interface Point {
  x: number;
  y: number;
}

function printCoord(pt: Point) {
  console.log("The coordinate's x value is " + pt.x);
  console.log("The coordinate's y value is " + pt.y);
}

printCoord({ x: 100, y: 100 });
```

就像我们在上面使用类型别名时一样，这个示例在使用 `interface` 声明时也能正常工作，就好像我们使用了匿名对象类型一样。

TypeScript 对类型别名和接口之间的区别主要是 _风格偏好_ ；然而，你需要知道接口总是可以通过扩展在声明中向对象类型添加新字段，而类型别名不能。

## 类型别名与接口的区别

类型别名和接口非常相似，在许多情况下你可以自由选择它们。
`interface` 的几乎所有特性都可以在 `type` 中使用，关键区别在于类型别名不能重新打开以添加新属性，而接口总是可扩展的。

| `Interface` | `Type` |
|-------------|--------|
| 扩展接口 | 通过交叉扩展类型 |
| ```interface Animal { name: string; } interface Bear extends Animal { honey: boolean; }``` | ```type Animal = { name: string; } type Bear = Animal & { honey: boolean; }``` |
| 向现有接口添加新字段 | 类型创建后不能更改 |
| ```interface Window { title: string; } interface Window { ts: TypeScriptAPI; }``` | ```type Window = { title: string; } // 错误：重复标识符 'Window'``` |

你将在后面的章节中了解更多关于这些概念的信息，所以如果你现在不理解所有这些，也不用担心。

- 在 TypeScript 4.2 版本之前，类型别名名称 [_可能_ 出现在错误消息中](https://www.typescriptlang.org/play?#code/PTAEGEHsFsAcEsA2BTATqNrLusgzngIYDm+oA7koqIYuYQJ56gCueyoAUCKAC4AWHAHaFcoSADMaQ0PCG80EwgGNkALk6c5C1EtWgAsqOi1QAb06groEbjWg8vVHOKcAvpokshy3vEgyyMr8kEbQJogAFND2YREAlOaW1soBeJAoAHSIkMTRmbbI8e6aPMiZxJmgACqCGKhY6ABGyDnkFFQ0dIzMbBwCwqIccabcYLyQoKjIEmh8kwN8DLAc5PzwwbLMyAAeK77IACYaQSEjUWZWhfYAjABMAMwALA+gbsVjoADqgjKESytQPxCHghAByXigYgBfr8LAsYj8aQMUASbDQcRSExCeCwFiIQh+AKfAYyBiQFgOPyIaikSGLQo0Zj-aazaY+dSaXjLDgAGXgAC9CKhDqAALxJaw2Ib2RzOISuDycLw+ImBYKQflCkWRRD2LXCw6JCxS1JCdJZHJ5RAFIbFJU8ADKC3WzEcnVZaGYE1ABpFnFOmsFhsil2uoHuzwArO9SmAAEIsSFrZB-GgAjjA5gtVN8VCEc1o1C4Q4AGlR2AwO1EsBQoAAbvB-gJ4HhPgB5aDwem-Ph1TCV3AEEirTp4ELtRbTPD4vwKjOfAuioSQHuDXBcnmgACC+eCONFEs73YAPGGZVT5cRyyhiHh7AAON7lsG3vBggB8XGV3l8-nVISOgghxoLq9i7io-AHsayRWGaFrlFauq2rg9qaIGQHwCBqChtKdgRo8TxRjeyB3o+7xAA)，有时代替等效的匿名类型（这可能是可取的，也可能不是）。接口在错误消息中总是会被命名。
- 类型别名不能参与 [声明合并，但接口可以](https://www.typescriptlang.org/play?#code/PTAEEEDtQS0gXApgJwGYEMDGjSfdAIx2UQFoB7AB0UkQBMAoEUfO0Wgd1ADd0AbAK6IAzizp16ALgYM4SNFhwBZdAFtV-UAG8GoPaADmNAcMmhh8ZHAMMAvjLkoM2UCvWad+0ARL0A-GYWVpA29gyY5JAWLJAwGnxmbvGgALzauvpGkCZmAEQAjABMAMwALLkANBl6zABi6DB8okR4Jjg+iPSgABboovDk3jjo5pbW1d6+dGb5djLwAJ7UoABKiJTwjThpnpnGpqPBoTLMAJrkArj4kOTwYmycPOhW6AR8IrDQ8N04wmo4HHQCwYi2Waw2W1S6S8HX8gTGITsQA)。
- 接口只能用于 [声明对象的形状，不能重命名基本类型](https://www.typescriptlang.org/play?#code/PTAEAkFMCdIcgM6gC4HcD2pIA8CGBbABwBtIl0AzUAKBFAFcEBLAOwHMUBPQs0XFgCahWyGBVwBjMrTDJMAshOhMARpD4tQ6FQCtIE5DWoixk9QEEWAeV37kARlABvaqDegAbrmL1IALlAEZGV2agBfampkbgtrWwMAJlAAXmdXdy8ff0Dg1jZwyLoAVWZ2Lh5QVHUJflAlSFxROsY5fFAWAmk6CnRoLGwmILzQQmV8JmQmDzI-SOiKgGV+CaYAL0gBBdyy1KCQ-Pn1AFFplgA5enw1PtSWS+vCsAAVAAtB4QQWOEMKBuYVUiVCYvYQsUTQcRSBDGMGmKSgAAa-VEgiQe2GLgKQA)。
- 接口名称在错误消息中 [_始终_ 以原始形式出现](https://www.typescriptlang.org/play?#code/PTAEGEHsFsAcEsA2BTATqNrLusgzngIYDm+oA7koqIYuYQJ56gCueyoAUCKAC4AWHAHaFcoSADMaQ0PCG80EwgGNkALk6c5C1EtWgAsqOi1QAb06groEbjWg8vVHOKcAvpokshy3vEgyyMr8kEbQJogAFND2YREAlOaW1soBeJAoAHSIkMTRmbbI8e6aPMiZxJmgACqCGKhY6ABGyDnkFFQ0dIzMbBwCwqIccabcYLyQoKjIEmh8kwN8DLAc5PzwwbLMyAAeK77IACYaQSEjUWZWhfYAjABMAMwALA+gbsVjNXW8yxySoAADaAA0CCaZbPh1XYqXgOIY0ZgmcK0AA0nyaLFhhGY8F4AHJmEJILCWsgZId4NNfIgGFdcIcUTVfgBlZTOWC8T7kAJ42G4eT+GS42QyRaYbCgXAEEguTzeXyCjDBSAAQSE8Ai0Xsl0K9kcziExDeiQs1lAqSE6SyOTy0AKQ2KHk4p1V6s1OuuoHuzwArMagA)，但 _仅_ 在按名称使用时。
- 使用带有 `extends` 的接口 [通常对编译器来说比带有交叉的类型别名性能更好](https://github.com/microsoft/TypeScript/wiki/Performance#preferring-interfaces-over-intersections)

在大多数情况下，你可以根据个人偏好选择，TypeScript 会告诉你是否需要另一种声明。如果你想要一个启发式方法，请使用 `interface`，直到你需要使用 `type` 的功能。

## 类型断言

有时你会知道一个值的类型，而 TypeScript 不知道。

例如，如果你使用 `document.getElementById`，TypeScript 只知道这将返回 _某种_ `HTMLElement`，但你可能知道给定的 ID 总会给你一个 `HTMLCanvasElement`。

在这种情况下，你可以使用 _类型断言_ 来指定更具体的类型：

```ts twoslash
const myCanvas = document.getElementById("main_canvas") as HTMLCanvasElement;
```

与类型注解一样，类型断言被编译器移除，不会影响代码的运行时行为。

你也可以使用尖括号语法（除非代码在 `.tsx` 文件中），它是等效的：

```ts twoslash
const myCanvas = <HTMLCanvasElement>document.getElementById("main_canvas");
```

TypeScript 只允许类型断言转换为 _更具体_ 或 _更不具体_ 的类型版本。
这个规则防止像 `as` 这样的"不可能"强制转换：

```ts twoslash
// @errors: 2352
const x = "hello" as number;
```

有时这个规则可能过于保守，会阻止你可能想要进行的更复杂的有效强制转换。
如果发生这种情况，你可以使用两个断言，先转换为 `any`（或 `unknown`），然后再转换为所需类型：

```ts twoslash
const x = "hello" as unknown as number;
```

## 字面量类型

除了通用类型 `string` 和 `number` 之外，我们还可以在类型位置引用 _特定的_ 字符串和数字。

考虑这一点的一种方式是 JavaScript 如何用不同的方法来声明变量。
`var` 和 `let` 都允许更改变量中保存的内容，`const` 不允许。
这反映在 TypeScript 如何为字面量创建类型。

```ts twoslash
let changingString = "Hello World";
changingString = "Olá Mundo";
// 因为 'changingString' 可以表示任何可能的字符串，这就是
// TypeScript 在类型系统中描述它的方式
changingString;

const constantString = "Hello World";
// 因为 'constantString' 只能表示 1 个可能的字符串，它
// 有字面量类型表示
constantString;
```

就其本身而言，字面量类型并不是很有价值：

```ts twoslash
// @errors: 2322
let x: "hello" = "hello";
x = "hello";
x = "howdy";
```

拥有一个只能有一个值的变量并没有多大用处！

但通过将字面量 _组合_ 成联合，你可以表达一个更有用的概念——例如，只接受一组特定已知值的函数：

```ts twoslash
// @errors: 2345
function printText(s: string, alignment: "left" | "right" | "center") {
  // ...
}
printText("Hello, world", "left");
printText("G'day, mate", "centre");
```

数字字面量类型的工作方式相同：

```ts twoslash
function compare(a: string, b: string): -1 | 0 | 1 {
  return a === b ? 0 : a > b ? 1 : -1;
}
```

当然，你可以与非字面量类型联合使用：

```ts twoslash
// @errors: 2345
interface Options {
  width: number;
}
function configure(x: Options | "auto") {
  // ...
}
configure({ width: 100 });
configure("auto");
configure("automatic");
```

还有另一种字面量类型：布尔字面量。
只有两种布尔字面量类型，正如你可能猜到的，它们是 `true` 和 `false` 类型。
类型 `boolean` 本身实际上就是联合 `true | false` 的别名。

### 字面量推断

当你用对象初始化变量时，TypeScript 假设该对象的属性稍后可能会更改值。
例如，如果你写了这样的代码：

```ts twoslash
declare const someCondition: boolean;
// ---cut---
const obj = { counter: 0 };
if (someCondition) {
  obj.counter = 1;
}
```

TypeScript 不认为将 `1` 赋值给之前为 `0` 的字段是错误。
另一种说法是 `obj.counter` 必须具有 `number` 类型，而不是 `0`，因为类型用于确定 _读取_ 和 _写入_ 行为。

字符串也是如此：

```ts twoslash
// @errors: 2345
declare function handleRequest(url: string, method: "GET" | "POST"): void;

const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
```

在上面的示例中，`req.method` 被推断为 `string`，而不是 `"GET"`。
因为在创建 `req` 和调用 `handleRequest` 之间可能会评估将新字符串（如 `"GUESS"`）赋值给 `req.method` 的代码，TypeScript 认为这段代码有错误。

有两种方法可以解决这个问题。

1. 你可以通过在任何位置添加类型断言来更改推断：

   ```ts twoslash
   declare function handleRequest(url: string, method: "GET" | "POST"): void;
   // ---cut---
   // 更改 1：
   const req = { url: "https://example.com", method: "GET" as "GET" };
   // 更改 2
   handleRequest(req.url, req.method as "GET");
   ```

   更改 1 表示"我打算让 `req.method` 始终具有 _字面量类型_ `"GET""，防止之后可能将 `"GUESS"` 赋值给该字段。
   更改 2 表示"我出于其他原因知道 `req.method` 具有值 `"GET"".

2. 你可以使用 `as const` 将整个对象转换为类型字面量：

   ```ts twoslash
   declare function handleRequest(url: string, method: "GET" | "POST"): void;
   // ---cut---
   const req = { url: "https://example.com", method: "GET" } as const;
   handleRequest(req.url, req.method);
   ```

`as const` 后缀的作用类似于 `const`，但用于类型系统，确保所有属性都被分配字面量类型，而不是更通用的版本如 `string` 或 `number`。

## `null` 和 `undefined`

JavaScript 有两个原始值用于表示缺失或未初始化的值：`null` 和 `undefined`。

TypeScript 有两个相应的 _类型_ ，名称相同。这些类型的行为取决于你是否开启了 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 选项。

### `strictNullChecks` 关闭

当 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) _关闭_ 时，可能是 `null` 或 `undefined` 的值仍然可以正常访问，值 `null` 和 `undefined` 可以赋值给任何类型的属性。
这类似于没有 null 检查的语言（如 C#、Java）的行为方式。
缺乏对这些值的检查往往是 bug 的主要来源；如果可行，我们总是建议人们在他们的代码库中开启 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)。

### `strictNullChecks` 开启

当 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) _开启_ 时，当值为 `null` 或 `undefined` 时，你需要在使用该值的方法或属性之前测试这些值。
就像在使用可选属性之前检查 `undefined` 一样，我们可以使用 _窄化_ 来检查可能是 `null` 的值：

```ts twoslash
function doSomething(x: string | null) {
  if (x === null) {
    // 什么都不做
  } else {
    console.log("Hello, " + x.toUpperCase());
  }
}
```

### 非空断言运算符（后缀 `!`）

TypeScript 还有一个特殊的语法，用于在不进行任何显式检查的情况下从类型中移除 `null` 和 `undefined`。
在任何表达式后写 `!` 实际上是一个类型断言，表示该值不是 `null` 或 `undefined`：

```ts twoslash
function liveDangerously(x?: number | null) {
  // 没有错误
  console.log(x!.toFixed());
}
```

就像其他类型断言一样，这不会改变代码的运行时行为，所以只有当你知道该值 _不可能_ 是 `null` 或 `undefined` 时才使用 `!`。

## 枚举

枚举是 TypeScript 添加到 JavaScript 的一项特性，允许描述一个值可能是一组可能的命名常量之一。与大多数 TypeScript 特性不同，这 _不是_ JavaScript 的类型级添加，而是添加到语言和运行时中的东西。因此，这是一个你应该知道存在的特性，但除非确定，否则可能暂缓使用。你可以在[枚举参考页面](https://www.typescriptlang.org/docs/handbook/enums.html)阅读更多关于枚举的信息。

## 不常用的基本类型

值得提及 JavaScript 中其余在类型系统中表示的基本类型。
虽然我们不会在这里深入探讨。

#### `bigint`

从 ES2020 开始，JavaScript 中有一个用于非常大整数的原始类型 `BigInt`：

```ts twoslash
// @target: es2020

// 通过 BigInt 函数创建 bigint
const oneHundred: bigint = BigInt(100);

// 通过字面量语法创建 BigInt
const anotherHundred: bigint = 100n;
```

你可以在 [TypeScript 3.2 发布说明](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-2.html#bigint)中了解更多关于 BigInt 的信息。

#### `symbol`

JavaScript 中有一个原始类型，用于通过 `Symbol()` 函数创建全局唯一引用：

```ts twoslash
// @errors: 2367
const firstName = Symbol("name");
const secondName = Symbol("name");

if (firstName === secondName) {
  // 永远不会发生
}
```
