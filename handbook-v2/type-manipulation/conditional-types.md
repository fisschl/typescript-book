---
title: 条件类型
---

在大多数有用的程序的核心，我们必须根据输入做出决策。
JavaScript 程序也不例外，但由于值可以很容易地被内省，这些决策也基于输入的类型。
_条件类型_ 帮助描述输入类型和输出类型之间的关系。

```ts twoslash
interface Animal {
  live(): void;
}
interface Dog extends Animal {
  woof(): void;
}

type Example1 = Dog extends Animal ? number : string;
//   ^?

type Example2 = RegExp extends Animal ? number : string;
//   ^?
```

条件类型的形式看起来有点像 JavaScript 中的条件表达式（`condition ? trueExpression : falseExpression`）：

```ts twoslash
type SomeType = any;
type OtherType = any;
type TrueType = any;
type FalseType = any;
type Stuff =
  // ---cut---
  SomeType extends OtherType ? TrueType : FalseType;
```

当 `extends` 左侧的类型可以赋值给右侧的类型时，你将获得第一个分支（"true" 分支）中的类型；否则你将获得后一个分支（"false" 分支）中的类型。

从上面的示例来看，条件类型可能看起来并不立刻有用——我们可以自己判断 `Dog extends Animal` 是否成立，然后选择 `number` 或 `string`！
但条件类型的力量在于与泛型一起使用。

例如，让我们看下面的 `createLabel` 函数：

```ts twoslash
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}

function createLabel(id: number): IdLabel;
function createLabel(name: string): NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel;
function createLabel(nameOrId: string | number): IdLabel | NameLabel {
  throw "unimplemented";
}
```

这些 `createLabel` 的重载描述了一个单一的 JavaScript 函数，它根据输入的类型做出选择。注意以下几点：

1. 如果一个库在其 API 中必须反复做出相同类型的选择，这会变得很繁琐。
2. 我们必须创建三个重载：一个用于我们 _确定_ 类型的每种情况（一个用于 `string`，一个用于 `number`），以及一个用于最一般的情况（接受 `string | number`）。`createLabel` 能处理的每个新类型，重载的数量都会呈指数级增长。

相反，我们可以将该逻辑编码为条件类型：

```ts twoslash
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}
// ---cut---
type NameOrId<T extends number | string> = T extends number
  ? IdLabel
  : NameLabel;
```

然后我们可以使用该条件类型将重载简化为单个函数，无需重载。

```ts twoslash
interface IdLabel {
  id: number /* some fields */;
}
interface NameLabel {
  name: string /* other fields */;
}
type NameOrId<T extends number | string> = T extends number
  ? IdLabel
  : NameLabel;
// ---cut---
function createLabel<T extends number | string>(idOrName: T): NameOrId<T> {
  throw "unimplemented";
}

let a = createLabel("typescript");
//  ^?

let b = createLabel(2.8);
//  ^?

let c = createLabel(Math.random() ? "hello" : 42);
//  ^?
```

### 条件类型约束

通常，条件类型中的检查会为我们提供一些新信息。
就像使用类型守卫进行收窄可以为我们提供更具体的类型一样，条件类型的 true 分支将通过我们检查的类型进一步约束泛型。

例如，让我们看下面的代码：

```ts twoslash
// @errors: 2536
type MessageOf<T> = T["message"];
```

在此示例中，TypeScript 报错，因为 `T` 不知道有一个名为 `message` 的属性。
我们可以约束 `T`，TypeScript 就不再抱怨了：

```ts twoslash
type MessageOf<T extends { message: unknown }> = T["message"];

interface Email {
  message: string;
}

type EmailMessageContents = MessageOf<Email>;
//   ^?
```

但是，如果我们希望 `MessageOf` 接受任何类型，并且在没有 `message` 属性时默认为类似 `never` 的东西呢？
我们可以通过将约束移出并引入条件类型来实现：

```ts twoslash
type MessageOf<T> = T extends { message: unknown } ? T["message"] : never;

interface Email {
  message: string;
}

interface Dog {
  bark(): void;
}

type EmailMessageContents = MessageOf<Email>;
//   ^?

type DogMessageContents = MessageOf<Dog>;
//   ^?
```

在 true 分支中，TypeScript 知道 `T` _将_ 有一个 `message` 属性。

作为另一个示例，我们还可以编写一个名为 `Flatten` 的类型，将数组类型扁平化为其元素类型，但在其他情况下保持不变：

```ts twoslash
type Flatten<T> = T extends any[] ? T[number] : T;

// 提取元素类型。
type Str = Flatten<string[]>;
//   ^?

// 保持类型不变。
type Num = Flatten<number>;
//   ^?
```

当 `Flatten` 被赋予数组类型时，它使用带 `number` 的索引访问来提取 `string[]` 的元素类型。
否则，它只返回给定的类型。

### 在条件类型中推断

我们刚才发现自己使用条件类型来应用约束并提取类型。
这最终成为一种非常常见的操作，条件类型使其更容易。

条件类型为我们提供了一种在 true 分支中使用 `infer` 关键字从我们比较的类型中推断的方法。
例如，我们可以在 `Flatten` 中推断元素类型，而不是使用索引访问类型"手动"提取它：

```ts twoslash
type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
```

在这里，我们使用 `infer` 关键字声明式地引入了一个名为 `Item` 的新泛型类型变量，而不是指定如何在 true 分支中检索 `Type` 的元素类型。
这使我们不必考虑如何深入探究我们正在感兴趣的类型的结构。

我们可以使用 `infer` 关键字编写一些有用的辅助类型别名。
例如，在简单的情况下，我们可以从函数类型中提取返回类型：

```ts twoslash
type GetReturnType<Type> = Type extends (...args: never[]) => infer Return
  ? Return
  : never;

type Num = GetReturnType<() => number>;
//   ^?

type Str = GetReturnType<(x: string) => string>;
//   ^?

type Bools = GetReturnType<(a: boolean, b: boolean) => boolean[]>;
//   ^?
```

当从具有多个调用签名的类型（例如重载函数的类型）推断时，推断是从 _最后一个_ 签名进行的（大概这是最宽松的包罗所有情况的分支）。无法基于参数类型列表执行重载解析。

```ts twoslash
declare function stringOrNum(x: string): number;
declare function stringOrNum(x: number): string;
declare function stringOrNum(x: string | number): string | number;

type T1 = ReturnType<typeof stringOrNum>;
//   ^?
```

## 分配条件类型

当条件类型作用于泛型类型时，它们在给定联合类型时会变成 _分配的_。
例如，看下面的代码：

```ts twoslash
type ToArray<Type> = Type extends any ? Type[] : never;
```

如果我们将联合类型插入 `ToArray`，那么条件类型将应用于该联合的每个成员。

```ts twoslash
type ToArray<Type> = Type extends any ? Type[] : never;

type StrArrOrNumArr = ToArray<string | number>;
//   ^?
```

这里发生的是 `ToArray` 分配在：

```ts twoslash
type StrArrOrNumArr =
  // ---cut---
  string | number;
```

并映射联合类型的每个成员类型，实际上是：

```ts twoslash
type ToArray<Type> = Type extends any ? Type[] : never;
type StrArrOrNumArr =
  // ---cut---
  ToArray<string> | ToArray<number>;
```

这给我们留下了：

```ts twoslash
type StrArrOrNumArr =
  // ---cut---
  string[] | number[];
```

通常，分配性是期望的行为。
要避免这种行为，你可以用方括号包围 `extends` 关键字的每一侧。

```ts twoslash
type ToArrayNonDist<Type> = [Type] extends [any] ? Type[] : never;

// 'ArrOfStrOrNum' 不再是联合类型。
type ArrOfStrOrNum = ToArrayNonDist<string | number>;
//   ^?
```
