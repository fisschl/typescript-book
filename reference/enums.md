---
title: 枚举
---

枚举是 TypeScript 中少数几个不是 JavaScript 类型级别扩展的特性之一。

枚举允许开发者定义一组命名常量。使用枚举可以使意图更容易文档化，或者创建一组不同的案例。TypeScript 提供了数字枚举和基于字符串的枚举。

## 数字枚举

我们首先从数字枚举开始，如果你来自其他语言，这可能更熟悉。可以使用 `enum` 关键字定义枚举。

```ts twoslash
enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}
```

上面，我们有一个数字枚举，其中 `Up` 被初始化为 `1`。之后的所有成员都会从该点开始自动递增。换句话说，`Direction.Up` 的值为 `1`，`Down` 为 `2`，`Left` 为 `3`，`Right` 为 `4`。

如果需要，我们可以完全省略初始化器：

```ts twoslash
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

这里，`Up` 的值为 `0`，`Down` 为 `1`，以此类推。这种自动递增的行为在以下情况下很有用：我们可能不关心成员值本身，但确实关心每个值与同一枚举中其他值不同。

使用枚举很简单：只需将任何成员作为枚举本身的属性访问，并使用枚举名称声明类型：

```ts twoslash
enum UserResponse {
  No = 0,
  Yes = 1,
}

function respond(recipient: string, message: UserResponse): void {
  // ...
}

respond("Princess Caroline", UserResponse.Yes);
```

数字枚举可以与 [计算成员和常量成员（见下文）](#计算成员和常量成员) 混合使用。简而言之，没有初始化器的枚举要么需要排在第一位，要么必须跟在用数字常量或其他常量枚举成员初始化的数字枚举之后。换句话说，以下是不允许的：

```ts twoslash
// @errors: 1061
const getSomeValue = () => 23;
// ---cut---
enum E {
  A = getSomeValue(),
  B,
}
```

## 字符串枚举

字符串枚举是一个类似的概念，但有一些细微的 [运行时差异](#运行时枚举)，如下所述。在字符串枚举中，每个成员必须用字符串字面量或另一个字符串枚举成员常量初始化。

```ts twoslash
enum Direction {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}
```

虽然字符串枚举没有自动递增行为，但字符串枚举的好处是它们"序列化"得很好。换句话说，如果你在调试时必须读取数字枚举的运行时值，该值通常是不透明的——它本身不传达任何有用的含义（尽管 [反向映射](#反向映射) 通常可以帮助）。字符串枚举允许你在代码运行时给出有意义且可读的值，独立于枚举成员本身的名称。

## 异构枚举

从技术上讲，枚举可以与字符串和数字成员混合使用，但不清楚你为什么要这样做：

```ts twoslash
enum BooleanLikeHeterogeneousEnum {
  No = 0,
  Yes = "YES",
}
```

除非你真的想以一种巧妙的方式利用 JavaScript 的运行时行为，否则建议你不要这样做。

## 计算成员和常量成员

每个枚举成员都有一个与之关联的值，可以是 _常量_ 或 _计算_ 的。如果满足以下条件，枚举成员被视为常量：

- 它是枚举中的第一个成员且没有初始化器，在这种情况下它被赋值为 `0`：

  ```ts twoslash
  // E.X is constant:
  enum E {
    X,
  }
  ```

- 它没有初始化器，且前面的枚举成员是 _数字_ 常量。在这种情况下，当前枚举成员的值将是前面枚举成员的值加一。

  ```ts twoslash
  // All enum members in 'E1' and 'E2' are constant.

  enum E1 {
    X,
    Y,
    Z,
  }

  enum E2 {
    A = 1,
    B,
    C,
  }
  ```

- 枚举成员用常量枚举表达式初始化。常量枚举表达式是 TypeScript 表达式的一个子集，可以在编译时完全求值。如果表达式是以下情况，则它是常量枚举表达式：

  1. 字面量枚举表达式（基本上是字符串字面量或数字字面量）
  2. 对先前定义的常量枚举成员的引用（可以来自不同的枚举）
  3. 带括号的常量枚举表达式
  4. 应用于常量枚举表达式的 `+`、`-`、`~` 一元运算符之一
  5. `+`、`-`、`*`、`/`、`%`、`<<`、`>>`、`>>>`、`&`、`|`、`^` 二元运算符，操作数为常量枚举表达式

  常量枚举表达式求值为 `NaN` 或 `Infinity` 是编译时错误。

在所有其他情况下，枚举成员被视为计算成员。

```ts twoslash
enum FileAccess {
  // constant members
  None,
  Read = 1 << 1,
  Write = 1 << 2,
  ReadWrite = Read | Write,
  // computed member
  G = "123".length,
}
```

## 联合枚举和枚举成员类型

有一个特殊的常量枚举成员子集不是计算出来的：字面量枚举成员。字面量枚举成员是没有初始化值的常量枚举成员，或者用以下值初始化的成员：

- 任何字符串字面量（例如 `"foo"`、`"bar"`、`"baz"`）
- 任何数字字面量（例如 `1`、`100`）
- 应用于任何数字字面量的一元减号（例如 `-1`、`-100`）

当枚举中的所有成员都有字面量枚举值时，一些特殊的语义就会生效。

首先是枚举成员也会成为类型！例如，我们可以说某些成员 _只能_ 具有枚举成员的值：

```ts twoslash
// @errors: 2322
enum ShapeKind {
  Circle,
  Square,
}

interface Circle {
  kind: ShapeKind.Circle;
  radius: number;
}

interface Square {
  kind: ShapeKind.Square;
  sideLength: number;
}

let c: Circle = {
  kind: ShapeKind.Square,
  radius: 100,
};
```

另一个变化是枚举类型本身实际上变成了每个枚举成员的 _联合_。使用联合枚举，类型系统能够利用它知道枚举本身中存在的确切值集合这一事实。因此，TypeScript 可以捕获我们可能错误比较值的错误。例如：

```ts twoslash
// @errors: 2367
enum E {
  Foo,
  Bar,
}

function f(x: E) {
  if (x !== E.Foo || x !== E.Bar) {
    //
  }
}
```

在那个例子中，我们首先检查 `x` 是否 _不是_ `E.Foo`。如果该检查成功，那么我们的 `||` 将短路，'if' 的主体将运行。但是，如果检查没有成功，那么 `x` 只能 _是_ `E.Foo`，所以检查它是否 _不等于_ `E.Bar` 是没有意义的。

## 运行时枚举

枚举是存在于运行时的真实对象。例如，以下枚举

```ts twoslash
enum E {
  X,
  Y,
  Z,
}
```

实际上可以传递给函数

```ts twoslash
enum E {
  X,
  Y,
  Z,
}

function f(obj: { X: number }) {
  return obj.X;
}

// Works, since 'E' has a property named 'X' which is a number.
f(E);
```

## 编译时枚举

尽管枚举是存在于运行时的真实对象，但 `keyof` 关键字的工作方式与你对典型对象的预期不同。相反，使用 `keyof typeof` 来获取一个类型，该类型将所有枚举键表示为字符串。

```ts twoslash
enum LogLevel {
  ERROR,
  WARN,
  INFO,
  DEBUG,
}

/**
 * This is equivalent to:
 * type LogLevelStrings = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
 */
type LogLevelStrings = keyof typeof LogLevel;

function printImportant(key: LogLevelStrings, message: string) {
  const num = LogLevel[key];
  if (num <= LogLevel.WARN) {
    console.log("Log level key is:", key);
    console.log("Log level value is:", num);
    console.log("Log level message is:", message);
  }
}
printImportant("ERROR", "This is a message");
```

### 反向映射

除了创建一个带有成员属性名称的对象外，数字枚举成员还会获得一个从枚举值到枚举名称的 _反向映射_。例如，在这个例子中：

```ts twoslash
enum Enum {
  A,
}

let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

TypeScript 将其编译为以下 JavaScript：

```ts twoslash
// @showEmit
enum Enum {
  A,
}

let a = Enum.A;
let nameOfA = Enum[a]; // "A"
```

在这个生成的代码中，枚举被编译成一个对象，该对象存储正向（`name` -> `value`）和反向（`value` -> `name`）映射。对其他枚举成员的引用总是作为属性访问发出，从不内联。

请记住，字符串枚举成员 _不会_ 获得任何反向映射生成。

### `const` 枚举

在大多数情况下，枚举是一个完全有效的解决方案。然而，有时要求更严格。为了避免支付额外生成代码的成本和访问枚举值时的额外间接性，可以使用 `const` 枚举。Const 枚举是在我们的枚举上使用 `const` 修饰符定义的：

```ts twoslash
const enum Enum {
  A = 1,
  B = A * 2,
}
```

Const 枚举只能使用常量枚举表达式，与常规枚举不同，它们在编译期间被完全移除。Const 枚举成员在使用点被内联。这是可能的，因为 const 枚举不能有计算成员。

```ts twoslash
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
];
```

在生成的代码中将变成

```ts twoslash
// @showEmit
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

let directions = [
  Direction.Up,
  Direction.Down,
  Direction.Left,
  Direction.Right,
];
```

#### Const 枚举的陷阱

内联枚举值起初很简单，但有微妙的含义。这些陷阱仅适用于 _环境_ const 枚举（基本上是 `.d.ts` 文件中的 const 枚举）并在项目之间共享它们，但如果你正在发布或消费 `.d.ts` 文件，这些陷阱可能适用于你，因为 `tsc --declaration` 将 `.ts` 文件转换为 `.d.ts` 文件。

1. 由于 [`isolatedModules` 文档](https://www.typescriptlang.org/tsconfig#references-to-const-enum-members) 中阐述的原因，该模式根本与环境 const 枚举不兼容。这意味着如果你发布环境 const 枚举，下游消费者将无法同时使用 [`isolatedModules`](https://www.typescriptlang.org/tsconfig#isolatedModules) 和那些枚举值。
2. 你可以很容易地在编译时从依赖的版本 A 内联值，并在运行时导入版本 B。如果你不小心，版本 A 和 B 的枚举可以有不同的值，导致 [令人惊讶的错误](https://github.com/microsoft/TypeScript/issues/5219#issue-110947903)，比如走 `if` 语句的错误分支。这些错误特别难以发现，因为通常在构建项目的同时运行自动化测试，使用相同的依赖版本，这完全错过了这些错误。
3. [`importsNotUsedAsValues: "preserve"`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues) 不会删除用作值的 const 枚举的导入，但环境 const 枚举不保证运行时 `.js` 文件存在。无法解析的导入会导致运行时错误。通常明确删除导入的方法是 [仅类型导入](https://www.typescriptlang.org/docs/handbook/modules/reference.html#type-only-imports-and-exports)，目前 [不允许 const 枚举值](https://github.com/microsoft/TypeScript/issues/40344)。

以下是避免这些陷阱的两种方法：

1. 完全不使用 const 枚举。你可以很容易地在 linter 的帮助下 [禁止 const 枚举](https://typescript-eslint.io/linting/troubleshooting#how-can-i-ban-specific-language-feature)。显然这避免了 const 枚举的任何问题，但阻止了你的项目内联自己的枚举。与内联其他项目的枚举不同，内联项目自己的枚举没有问题，并且有性能影响。
2. 不要发布环境 const 枚举，而是借助 [`preserveConstEnums`](https://www.typescriptlang.org/tsconfig#preserveConstEnums) 将它们"去 const 化"。这是 [TypeScript 项目本身](https://github.com/microsoft/TypeScript/pull/5422) 内部采用的方法。[`preserveConstEnums`](https://www.typescriptlang.org/tsconfig#preserveConstEnums) 为 const 枚举生成与普通枚举相同的 JavaScript。然后你可以在构建步骤中安全地从 `.d.ts` 文件中删除 `const` 修饰符 [在构建步骤中](https://github.com/microsoft/TypeScript/blob/1a981d1df1810c868a66b3828497f049a944951c/Gulpfile.js#L144)。

   这样下游消费者不会从你的项目内联枚举，避免了上述陷阱，但项目仍然可以内联自己的枚举，与完全禁止 const 枚举不同。

## 环境枚举

环境枚举用于描述已存在枚举类型的形状。

```ts twoslash
declare enum Enum {
  A = 1,
  B,
  C = 2,
}
```

环境枚举和非环境枚举之间的一个重要区别是，在常规枚举中，没有初始化器的成员如果其前面的枚举成员被视为常量，则会被视为常量。相比之下，没有初始化器的环境（和非 const）枚举成员 _总是_ 被视为计算成员。

## 对象与枚举

在现代 TypeScript 中，当带有 `as const` 的对象足够用时，你可能不需要枚举：

```ts twoslash
const enum EDirection {
  Up,
  Down,
  Left,
  Right,
}

const ODirection = {
  Up: 0,
  Down: 1,
  Left: 2,
  Right: 3,
} as const;

EDirection.Up;
//         ^?

ODirection.Up;
//         ^?

// Using the enum as a parameter
function walk(dir: EDirection) {}

// It requires an extra line to pull out the values
type Direction = typeof ODirection[keyof typeof ODirection];
function run(dir: Direction) {}

walk(EDirection.Left);
run(ODirection.Right);
```

支持这种格式而不是 TypeScript 的 `enum` 的最大理由是，它使你的代码库与 JavaScript 的状态保持一致，并且 [当/如果](https://github.com/rbuckton/proposal-enum) 枚举被添加到 JavaScript 时，你可以迁移到额外的语法。
