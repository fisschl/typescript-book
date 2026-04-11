---
title: 类型收窄
---

假设有一个名为 `padLeft` 的函数。

```ts twoslash
function padLeft(padding: number | string, input: string): string {
  throw new Error("Not implemented yet!");
}
```

如果 `padding` 是 `number`,它会将该值作为我们要前置到 `input` 的空格数。
如果 `padding` 是 `string`,它应该直接将 `padding` 前置到 `input`。
让我们尝试实现当 `padLeft` 接收到 `number` 类型的 `padding` 时的逻辑。

```ts twoslash
// @errors: 2345
function padLeft(padding: number | string, input: string): string {
  return " ".repeat(padding) + input;
}
```

这里 `padding` 报错了。
TypeScript 警告我们正在将类型为 `number | string` 的值传递给 `repeat` 函数,而该函数只接受 `number`,它是对的。
换句话说,我们没有先显式检查 `padding` 是否是 `number`,也没有处理它是 `string` 的情况,现在就来修复。

```ts twoslash
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

如果这看起来像无趣的 JavaScript 代码,那这就是重点。
除了我们添加的注解之外,这段 TypeScript 代码看起来就像 JavaScript。
TypeScript 的类型系统旨在让编写典型的 JavaScript 代码变得尽可能简单,而无需为了类型安全而大费周章。

虽然看起来不多,但实际上这里有很多底层机制在运行。
就像 TypeScript 使用静态类型分析运行时值一样,它也在 JavaScript 的运行时控制流构造(如 `if/else`、条件三元组、循环、真值检查等)之上叠加了类型分析,这些都可以影响那些类型。

在我们的 `if` 检查中,TypeScript 看到 `typeof padding === "number"` 并将其理解为一种称为 _类型守卫_ 的特殊代码形式。
TypeScript 跟踪程序可能采取的执行路径,以分析给定位置处值的最具体类型。
它查看这些特殊检查(称为 _类型守卫_)和赋值,将类型细化为比声明时更具体的类型的过程称为 _类型收窄_。
在许多编辑器中,我们可以观察到这些类型如何变化,我们甚至会在示例中这样做。

```ts twoslash
function padLeft(padding: number | string, input: string): string {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

TypeScript 有几种不同的用于收窄的构造。

## `typeof` 类型守卫

正如我们所见,JavaScript 支持 `typeof` 运算符,它可以提供关于运行时值类型的非常基本的信息。
TypeScript 期望它返回一组特定的字符串:

- `"string"`
- `"number"`
- `"bigint"`
- `"boolean"`
- `"symbol"`
- `"undefined"`
- `"object"`
- `"function"`

就像我们在 `padLeft` 中看到的那样,这个运算符在许多 JavaScript 库中经常出现,TypeScript 可以理解它来在不同分支中收窄类型。

在 TypeScript 中,检查 `typeof` 返回的值就是一个类型守卫。
因为 TypeScript 编码了 `typeof` 如何作用于不同类型的值,所以它了解 JavaScript 中的一些怪癖。
例如,注意上面的列表中,`typeof` 不会返回字符串 `null`。
看看下面的例子:

```ts twoslash
// @errors: 2531 18047
function printAll(strs: string | string[] | null) {
  if (typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  } else {
    // do nothing
  }
}
```

在 `printAll` 函数中,我们尝试检查 `strs` 是否是对象,以查看它是否是数组类型(现在可能是个好时机来强调数组是 JavaScript 中的对象类型)。
但事实证明,在 JavaScript 中,`typeof null` 实际上是 `"object"`!
这是历史上那些不幸的意外之一。

有足够经验的用户可能不会感到惊讶,但并不是每个人都在 JavaScript 中遇到过这种情况;幸运的是,TypeScript 让我们知道 `strs` 只是被收窄到 `string[] | null` 而不是仅仅 `string[]`。

这就引出了**真值**检查的概念。

## 真值收窄

真值可能不是在字典中能找到的词,但它是你在 JavaScript 中会经常听到的概念。

在 JavaScript 中,我们可以在条件、`&&`、`||`、`if` 语句、布尔否定(`!`)等中使用任何表达式。
例如,`if` 语句不期望其条件始终具有 `boolean` 类型。

```ts twoslash
function getUsersOnlineMessage(numUsersOnline: number) {
  if (numUsersOnline) {
    return `There are ${numUsersOnline} online now!`;
  }
  return "Nobody's here. :(";
}
```

在 JavaScript 中,像 `if` 这样的结构首先将它们的条件"强制"为 `boolean` 以便理解它们,然后根据结果是 `true` 还是 `false` 选择分支。
像这样的值

- `0`
- `NaN`
- `""`(空字符串)
- `0n`(零的 `bigint` 版本)
- `null`
- `undefined`

都会强制为 `false`,其他值会被强制为 `true`。
你总是可以通过 `Boolean` 函数运行值来将它们强制为 `boolean`,或者使用更短的双重布尔否定。(后者的优势在于 TypeScript 推断出一个窄的字面量布尔类型 `true`,而前者推断为 `boolean` 类型。)

```ts twoslash
// @errors: 2872
// both of these result in 'true'
Boolean("hello"); // type: boolean, value: true
!!"world"; // type: true,    value: true
```

利用这种行为相当普遍,特别是用于防止像 `null` 或 `undefined` 这样的值。
举个例子,让我们尝试将它用于我们的 `printAll` 函数。

```ts twoslash
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === "object") {
    for (const s of strs) {
      console.log(s);
    }
  } else if (typeof strs === "string") {
    console.log(strs);
  }
}
```

你会注意到我们通过检查 `strs` 是否为真值来消除了上面的错误。
这至少可以防止我们在运行代码时出现可怕的错误,如:

```txt
TypeError: null is not iterable
```

但请记住,对原始类型进行真值检查通常容易出错。
举个例子,考虑另一种编写 `printAll` 的尝试

```ts twoslash {class: "do-not-do-this"}
function printAll(strs: string | string[] | null) {
  // !!!!!!!!!!!!!!!!
  //  DON'T DO THIS!
  //   KEEP READING
  // !!!!!!!!!!!!!!!!
  if (strs) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    }
  }
}
```

我们将整个函数体包装在一个真值检查中,但这有一个细微的缺点:我们可能不再正确处理空字符串的情况。

TypeScript 不会阻止这种写法,但如果你不太熟悉 JavaScript,这种行为值得注意。
TypeScript 通常可以帮助你尽早发现 bug,但如果你选择对某个值 _什么都不做_,那么类型检查器能做的也有限。
建议使用 linter 来捕获此类问题。

关于真值收窄的最后一句话是,使用 `!` 的布尔否定会从否定的分支中过滤出去。

```ts twoslash
function multiplyAll(
  values: number[] | undefined,
  factor: number
): number[] | undefined {
  if (!values) {
    return values;
  } else {
    return values.map((x) => x * factor);
  }
}
```

## 相等性收窄

TypeScript 还使用 `switch` 语句和相等性检查如 `===`、`!==`、`==` 和 `!=` 来收窄类型。
例如:

```ts twoslash
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // We can now call any 'string' method on 'x' or 'y'.
    x.toUpperCase();
    y.toLowerCase();
  } else {
    console.log(x);
    console.log(y);
  }
}
```

当我们在上面的示例中检查 `x` 和 `y` 都相等时,TypeScript 知道它们的类型也必须相等。
由于 `string` 是 `x` 和 `y` 都能采用的唯一共同类型,TypeScript 知道在第一个分支中 `x` 和 `y` 必须是 `string`。

检查特定的字面量值(与变量相对)也有效。
在我们关于真值收窄的部分中,我们编写了一个 `printAll` 函数,它容易出错,因为它意外地没有正确处理空字符串。
相反,我们可以进行特定检查来排除 `null`,TypeScript 仍然正确地从 `strs` 的类型中移除 `null`。

```ts twoslash
function printAll(strs: string | string[] | null) {
  if (strs !== null) {
    if (typeof strs === "object") {
      for (const s of strs) {
        console.log(s);
      }
    } else if (typeof strs === "string") {
      console.log(strs);
    }
  }
}
```

JavaScript 使用 `==` 和 `!=` 进行较宽松的相等性检查也能正确收窄。
如果你不熟悉,检查某物 `== null` 实际上不仅检查它是否是特定值 `null` - 它还检查它是否可能是 `undefined`。
同样适用于 `== undefined`:它检查一个值是否是 `null` 或 `undefined`。

```ts twoslash
interface Container {
  value: number | null | undefined;
}

function multiplyValue(container: Container, factor: number) {
  // Remove both 'null' and 'undefined' from the type.
  if (container.value != null) {
    console.log(container.value);

    // Now we can safely multiply 'container.value'.
    container.value *= factor;
  }
}
```

## `in` 操作符收窄

JavaScript 有一个用于确定对象或其原型链是否具有特定名称属性的操作符:`in` 操作符。
TypeScript 将此作为一种收窄潜在类型的方法来考虑。

例如,使用代码:`"value" in x`,其中 `"value"` 是字符串字面量,`x` 是联合类型。
"true" 分支收窄具有可选或必需属性 `value` 的 `x` 的类型,"false" 分支收窄具有可选或缺失属性 `value` 的类型。

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    return animal.swim();
  }

  return animal.fly();
}
```

重申一下,可选属性在收窄的两边都存在。例如,一个人可以同时游泳和飞行(使用合适的设备),因此应该出现在 `in` 检查的两边:

<!-- prettier-ignore -->
```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
type Human = { swim?: () => void; fly?: () => void };

function move(animal: Fish | Bird | Human) {
  if ("swim" in animal) {
    animal;
  } else {
    animal;
  }
}
```

## `instanceof` 收窄

JavaScript 有一个用于检查值是否是另一个值的"实例"的操作符。
更具体地说,在 JavaScript 中 `x instanceof Foo` 检查 `x` 的 _原型链_ 是否包含 `Foo.prototype`。
虽然我们不会在这里深入探讨,当我们进入类章节时你会看到更多,但它们对于大多数可以用 `new` 构造的值仍然很有用。
正如你可能猜到的,`instanceof` 也是一个类型守卫,TypeScript 会在由 `instanceof` 守卫的分支中进行收窄。

```ts twoslash
function logValue(x: Date | string) {
  if (x instanceof Date) {
    console.log(x.toUTCString());
  } else {
    console.log(x.toUpperCase());
  }
}
```

## 赋值

正如我们之前提到的,当我们赋值给任何变量时,TypeScript 会查看赋值的右侧并相应地收窄左侧。

```ts twoslash
let x = Math.random() < 0.5 ? 10 : "hello world!";
x = 1;

console.log(x);
x = "goodbye!";

console.log(x);
```

注意这些赋值中的每一个都是有效的。
即使在我们的第一次赋值后 `x` 的观察类型变为 `number`,我们仍然能够将 `string` 赋值给 `x`。
这是因为 `x` 的 _声明类型_ —— `x` 开始时的类型 —— 是 `string | number`,而可赋值性总是针对声明类型进行检查。

如果我们赋值一个 `boolean` 给 `x`,我们会看到一个错误,因为那不是声明类型的一部分。

```ts twoslash
// @errors: 2322
let x = Math.random() < 0.5 ? 10 : "hello world!";
x = 1;

console.log(x);
x = true;

console.log(x);
```

## 控制流分析

到目前为止,我们已经通过一些基本示例了解了 TypeScript 如何在特定分支中进行收窄。
但实际上还有更多的机制,而不仅仅是从每个变量向上查找 `if`、`while`、条件等中的类型守卫。
例如

```ts twoslash
function padLeft(padding: number | string, input: string) {
  if (typeof padding === "number") {
    return " ".repeat(padding) + input;
  }
  return padding + input;
}
```

`padLeft` 在其第一个 `if` 块内返回。
TypeScript 能够分析这段代码,并看到在 `padding` 是 `number` 的情况下,剩余的代码(`return padding + input;`)是 _不可达的_。
因此,它能够从 `padding` 的类型中移除 `number`(从 `string | number` 收窄到 `string`)以用于函数的其余部分。

这种基于可达性的代码分析称为 _控制流分析_,TypeScript 使用这种流分析在遇到类型守卫和赋值时收窄类型。
当分析一个变量时,控制流可以反复分出和重新合并,并且该变量可以在每个点观察到具有不同的类型。

```ts twoslash
function example() {
  let x: string | number | boolean;

  x = Math.random() < 0.5;

  console.log(x);

  if (Math.random() < 0.5) {
    x = "hello";
    console.log(x);
  } else {
    x = 100;
    console.log(x);
  }

  return x;
}
```

## 使用类型谓词

到目前为止,我们已经使用现有的 JavaScript 构造来处理收窄,但有时你想更直接地控制类型如何在代码中变化。

要定义用户定义的类型守卫,我们只需定义一个返回类型为 _类型谓词_ 的函数:

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
// ---cut---
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
```

`pet is Fish` 就是我们示例中的类型谓词。
谓词的形式为 `parameterName is Type`,其中 `parameterName` 必须是当前函数签名中的参数名。

每当使用某个变量调用 `isFish` 时,如果原始类型兼容,TypeScript 会将该变量 _收窄_ 到该特定类型。

```ts twoslash
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
// ---cut---
// Both calls to 'swim' and 'fly' are now okay.
let pet = getSmallPet();

if (isFish(pet)) {
  pet.swim();
} else {
  pet.fly();
}
```

注意 TypeScript 不仅知道在 `if` 分支中 `pet` 是 `Fish`;
它也知道在 `else` 分支中,你 _没有_ `Fish`,所以你必须有 `Bird`。

你可以使用类型守卫 `isFish` 来过滤 `Fish | Bird` 数组并获得 `Fish` 数组:

```ts twoslash
type Fish = { swim: () => void; name: string };
type Bird = { fly: () => void; name: string };
declare function getSmallPet(): Fish | Bird;
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
// ---cut---
const zoo: (Fish | Bird)[] = [getSmallPet(), getSmallPet(), getSmallPet()];
const underWater1: Fish[] = zoo.filter(isFish);
// or, equivalently
const underWater2: Fish[] = zoo.filter(isFish) as Fish[];

// The predicate may need repeating for more complex examples
const underWater3: Fish[] = zoo.filter((pet): pet is Fish => {
  if (pet.name === "sharkey") return false;
  return isFish(pet);
});
```

此外,类可以使用 `this is Type` 来收窄它们的类型。

## 断言函数

类型也可以使用断言函数进行收窄。

## 判别联合

到目前为止我们的大多数示例都集中在收窄具有简单类型(如 `string`、`boolean` 和 `number`)的单个变量。
虽然这很常见,但在 JavaScript 中大多数时候我们会处理稍微复杂的结构。

为了提供一些动机,让我们想象一下我们试图编码像圆形和正方形这样的形状。
圆形跟踪它们的半径,正方形跟踪它们的边长。
我们将使用一个名为 `kind` 的字段来告诉我们正在处理哪种形状。
这是定义 `Shape` 的第一次尝试。

```ts twoslash
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}
```

注意我们使用的是字符串字面量类型的联合:`"circle"` 和 `"square"` 来告诉我们是应该将形状视为圆形还是正方形。
通过使用 `"circle" | "square"` 而不是 `string`,我们可以避免拼写错误。

```ts twoslash
// @errors: 2367
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function handleShape(shape: Shape) {
  // oops!
  if (shape.kind === "rect") {
    // ...
  }
}
```

我们可以编写一个 `getArea` 函数,根据它处理的是圆形还是正方形来应用正确的逻辑。
我们将首先尝试处理圆形。

```ts twoslash
// @errors: 2532 18048
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function getArea(shape: Shape) {
  return Math.PI * shape.radius ** 2;
}
```

<!-- TODO -->

在 `strictNullChecks` 下这会给我们一个错误 —— 这是合适的,因为 `radius` 可能未定义。
但如果我们对 `kind` 属性执行适当的检查呢?

```ts twoslash
// @errors: 2532 18048
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
}
```

嗯,TypeScript 仍然不知道该怎么做。
我们已经达到了一个点:我们对值的了解比类型检查器更多。
我们可以尝试使用非空断言(在 `shape.radius` 后加 `!`)来说 `radius` 肯定存在。

```ts twoslash
interface Shape {
  kind: "circle" | "square";
  radius?: number;
  sideLength?: number;
}

// ---cut---
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius! ** 2;
  }
}
```

但这感觉不理想。
我们不得不对类型检查器大喊大叫(使用那些非空断言(`!`))来说服它 `shape.radius` 已定义,但如果我们开始移动代码,这些断言容易出错。
此外,在 `strictNullChecks` 之外,我们仍然可以意外地访问任何这些字段(因为在读取时,可选属性只是被假定为始终存在)。
我们绝对可以做得更好。

这种 `Shape` 编码的问题在于,类型检查器无法根据 `kind` 属性判断 `radius` 或 `sideLength` 是否存在。
我们需要向类型检查器传达我们 _知道_ 的信息。
考虑到这一点,让我们再次尝试定义 `Shape`。

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;
```

在这里,我们正确地将 `Shape` 分离为两种类型,它们的 `kind` 属性值不同,但 `radius` 和 `sideLength` 在它们各自的类型中被声明为必需属性。

让我们看看当我们尝试访问 `Shape` 的 `radius` 时会发生什么。

```ts twoslash
// @errors: 2339
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

// ---cut---
function getArea(shape: Shape) {
  return Math.PI * shape.radius ** 2;
}
```

就像我们对 `Shape` 的第一个定义一样,这仍然是一个错误。
当 `radius` 是可选的时,我们收到了一个错误(在启用 `strictNullChecks` 的情况下),因为 TypeScript 无法判断该属性是否存在。
现在 `Shape` 是一个联合,TypeScript 告诉我们 `shape` 可能是 `Square`,而 `Square` 没有在其上定义 `radius`!
这两种解释都是正确的,但只有联合编码的 `Shape` 会导致无论 `strictNullChecks` 如何配置都会出现错误。

但如果我们再次尝试检查 `kind` 属性呢?

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

// ---cut---
function getArea(shape: Shape) {
  if (shape.kind === "circle") {
    return Math.PI * shape.radius ** 2;
  }
}
```

这消除了错误!
当联合中的每个类型都包含具有字面量类型的公共属性时,TypeScript 会将其视为 _判别联合_,并可以收窄联合的成员。

在这种情况下,`kind` 是那个公共属性(这被认为是 `Shape` 的 _判别_ 属性)。
检查 `kind` 属性是否是 `"circle"` 会移除 `Shape` 中所有没有类型为 `"circle"` 的 `kind` 属性的类型。
这将 `shape` 收窄到 `Circle` 类型。

相同的检查也适用于 `switch` 语句。
现在我们可以尝试编写完整的 `getArea`,而没有任何讨厌的 `!` 非空断言。

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

// ---cut---
function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
  }
}
```

这里重要的是 `Shape` 的编码。
向 TypeScript 传达正确的信息 —— `Circle` 和 `Square` 是真正具有特定 `kind` 字段的两种独立类型 —— 是至关重要的。
这样做使我们能够编写类型安全的 TypeScript 代码,这些代码看起来与我们否则将编写的 JavaScript 没有什么不同。
从那里,类型系统能够做"正确"的事情,并找出 `switch` 语句每个分支中的类型。

> 顺便说一句,试试上面的示例,移除一些 return 关键字。
> 你会看到类型检查可以帮助避免在 `switch` 语句的不同子句中意外穿透时的 bug。

判别联合不仅适用于谈论圆形和正方形。
它们适用于表示 JavaScript 中的任何消息传递方案,例如在网络上传送消息时(客户端/服务器通信),或在状态管理框架中编码变更。

## `never` 类型

在收窄时,你可以将联合的选项减少到你已经移除所有可能性并且什么都不剩的程度。
在这些情况下,TypeScript 会使用 `never` 类型来表示不应存在的状态。

## 穷尽性检查

`never` 类型可赋值给每个类型;然而,没有类型可赋值给 `never`(除了 `never` 本身)。这意味着你可以使用收窄并依赖 `never` 出现来在 `switch` 语句中进行穷尽性检查。

例如,在我们的 `getArea` 函数中添加一个 `default`,它尝试将 shape 赋值给 `never`,当所有可能的情况都已处理时不会引发错误。

```ts twoslash
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}
// ---cut---
type Shape = Circle | Square;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```

向 `Shape` 联合添加新成员会导致 TypeScript 错误:

```ts twoslash
// @errors: 2322
interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}
// ---cut---
interface Triangle {
  kind: "triangle";
  sideLength: number;
}

type Shape = Circle | Square | Triangle;

function getArea(shape: Shape) {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
    default:
      const _exhaustiveCheck: never = shape;
      return _exhaustiveCheck;
  }
}
```
