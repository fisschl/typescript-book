---
title: 泛型
---

软件工程的一个重要部分是构建不仅具有明确且一致 API，而且可复用的组件。
能够处理今天的数据以及明天的数据的组件，将为你构建大型软件系统提供最灵活的能力。

在 C# 和 Java 等语言中，创建可复用组件的主要工具之一是 _泛型_，即能够创建一个可在多种类型而非单一类型上工作的组件。
这允许用户使用这些组件并使用他们自己的类型。

## 泛型的 Hello World

首先，让我们来做泛型的"hello world"：identity 函数。
identity 函数是一个将返回传入的任何内容的函数。
你可以用类似于 `echo` 命令的方式来思考它。

如果没有泛型，我们可能不得不给 identity 函数一个特定的类型：

```ts twoslash
function identity(arg: number): number {
  return arg;
}
```

或者，我们可以使用 `any` 类型来描述 identity 函数：

```ts twoslash
function identity(arg: any): any {
  return arg;
}
```

虽然使用 `any` 确实是泛型的，因为它会使函数接受任何和所有类型的 `arg`，但我们实际上丢失了函数返回时该类型是什么的信息。
如果我们传入了一个数字，我们拥有的唯一信息是任何类型都可能被返回。

相反，我们需要一种捕获参数类型的方式，以便我们也可以用它的类型来表示返回的是什么。
在这里，我们将使用 _类型变量_，这是一种特殊的变量，它作用于类型而非值。

```ts twoslash
function identity<Type>(arg: Type): Type {
  return arg;
}
```

我们现在向 identity 函数添加了一个类型变量 `Type`。
这个 `Type` 允许我们捕获用户提供的类型（例如 `number`），以便我们可以稍后使用该信息。
在这里，我们再次使用 `Type` 作为返回类型。检查后，我们现在可以看到参数和返回类型使用了相同的类型。
这允许我们在函数的一端传入该类型信息，然后从另一端传出。

我们说这个版本的 `identity` 函数是泛型的，因为它适用于一系列类型。
与使用 `any` 不同，它也和使用数字作为参数和返回类型的第一个 `identity` 函数一样精确（即，它不会丢失任何信息）。

一旦我们编写了泛型 identity 函数，我们就可以用两种方式之一调用它。
第一种方式是将所有参数（包括类型参数）传递给函数：

```ts twoslash
function identity<Type>(arg: Type): Type {
  return arg;
}
// ---cut---
let output = identity<string>("myString");
//       ^?
```

在这里，我们显式地将 `Type` 设置为 `string`，作为函数调用的参数之一，使用 `<>` 而不是 `()` 包裹参数来表示。

第二种方式或许也是最常用的方式。在这里我们使用 _类型参数推断_——也就是说，我们希望编译器基于我们传入的参数的类型自动为我们设置 `Type` 的值：

```ts twoslash
function identity<Type>(arg: Type): Type {
  return arg;
}
// ---cut---
let output = identity("myString");
//       ^?
```

注意我们不需要显式地在尖括号（`<>`）中传递类型；编译器只需查看值 `"myString"`，并将 `Type` 设置为其类型。
虽然类型参数推断可以成为保持代码更简洁和更具可读性的有用工具，但当编译器无法推断类型时（如在更复杂的示例中可能发生的那样），你可能需要像上一个示例那样显式地传入类型参数。

## 使用泛型类型变量

当你开始使用泛型时，你会注意到当你创建像 `identity` 这样的泛型函数时，编译器会强制你在函数体中正确地使用任何泛型类型的参数。
也就是说，你实际上将这些参数视为它们可以是任何和所有类型。

让我们使用前面的 `identity` 函数：

```ts twoslash
function identity<Type>(arg: Type): Type {
  return arg;
}
```

如果我们还想在每次调用时将参数 `arg` 的长度记录到控制台怎么办？
我们可能会倾向于这样写：

```ts twoslash
// @errors: 2339
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}
```

当我们这样做时，编译器会给我们一个错误，指出我们使用了 `arg` 的 `.length` 成员，但我们从未说过 `arg` 有这个成员。
记住，我们之前说过这些类型变量代表任何和所有类型，所以使用这个函数的人可能传入了一个 `number`，它没有 `.length` 成员。

假设我们实际上打算这个函数作用于 `Type` 的数组而不是直接作用于 `Type`。因为我们处理的是数组，所以 `.length` 成员应该可用。
我们可以像创建其他类型数组一样来描述它：

```ts twoslash {1}
function loggingIdentity<Type>(arg: Type[]): Type[] {
  console.log(arg.length);
  return arg;
}
```

你可以将 `loggingIdentity` 的类型读作"泛型函数 `loggingIdentity` 接受一个类型参数 `Type`，以及一个 `arg` 参数，它是 `Type` 的数组，并返回 `Type` 的数组"。
如果我们传入一个数字数组，我们会得到一个数字数组返回，因为 `Type` 会绑定到 `number`。
这允许我们将泛型类型变量 `Type` 作为我们正在处理的类型的一部分使用，而不是整个类型，从而为我们提供了更大的灵活性。

我们也可以换一种方式来写这个示例：

```ts twoslash {1}
function loggingIdentity<Type>(arg: Array<Type>): Array<Type> {
  console.log(arg.length); // Array 有一个 .length，所以不再报错
  return arg;
}
```

你可能已经熟悉来自其他语言的这种类型风格。
在下一节中，我们将介绍如何创建像 `Array<Type>` 这样的泛型类型。

## 泛型类型

在前面的部分中，我们创建了适用于多种类型的泛型 identity 函数。
在本节中，我们将探讨函数本身的类型以及如何创建泛型接口。

泛型函数的类型与非泛型函数的类型一样，类型参数列在最前面，类似于函数声明：

```ts twoslash
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: <Type>(arg: Type) => Type = identity;
```

我们也可以对泛型类型参数使用不同的名称，只要类型变量的数量以及类型变量的使用方式对齐即可。

```ts twoslash
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: <Input>(arg: Input) => Input = identity;
```

我们还可以将泛型类型写为对象字面量类型的调用签名：

```ts twoslash
function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: { <Type>(arg: Type): Type } = identity;
```

这引导我们编写我们的第一个泛型接口。
让我们从前面的示例中获取对象字面量并将其移到接口中：

```ts twoslash
interface GenericIdentityFn {
  <Type>(arg: Type): Type;
}

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn = identity;
```

在另一个类似的示例中，我们可能希望将泛型参数移动到整个接口的参数。
这让我们可以看到我们泛型的是什么类型（例如 `Dictionary<string>` 而不是仅仅 `Dictionary`）。
这使得类型参数对接口中的所有其他成员可见。

```ts twoslash
interface GenericIdentityFn<Type> {
  (arg: Type): Type;
}

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: GenericIdentityFn<number> = identity;
```

注意我们的示例已经发生了一些变化。
我们现在不再描述一个泛型函数，而是有一个属于泛型类型的非泛型函数签名。
当我们使用 `GenericIdentityFn` 时，我们现在还需要指定相应的类型参数（这里是 `number`），有效地锁定底层调用签名将使用的类型。
理解何时将类型参数直接放在调用签名上以及何时将其放在接口本身上，将有助于描述类型的哪些方面是泛型的。

除了泛型接口，我们还可以创建泛型类。
注意不可能创建泛型枚举和命名空间。

## 泛型类

泛型类与泛型接口具有相似的形状。
泛型类在类名之后有尖括号（`<>`）中的泛型类型参数列表。

```ts twoslash
// @strict: false
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function (x, y) {
  return x + y;
};
```

这是对 `GenericNumber` 类的一个相当直接的用法，但你可能会注意到没有什么限制它只能使用 `number` 类型。
我们也可以使用 `string` 或更复杂的对象。

```ts twoslash
// @strict: false
class GenericNumber<NumType> {
  zeroValue: NumType;
  add: (x: NumType, y: NumType) => NumType;
}
// ---cut---
let stringNumeric = new GenericNumber<string>();
stringNumeric.zeroValue = "";
stringNumeric.add = function (x, y) {
  return x + y;
};

console.log(stringNumeric.add(stringNumeric.zeroValue, "test"));
```

与接口一样，将类型参数放在类本身可以确保类的所有属性都使用相同的类型。

正如我们在 [类的章节](/docs/handbook/2/classes.html) 中介绍的，类在其类型方面有两面：静态面和实例面。
泛型类只对其实例面而非静态面是泛型的，因此在使用类时，静态成员不能使用类的类型参数。

## 泛型约束

如果你还记得前面示例中的内容，你可能有时想要编写一个泛型函数，它适用于一组你对其中的类型具有 _某些_ 能力有了解的类型。
在我们的 `loggingIdentity` 示例中，我们希望能够访问 `arg` 的 `.length` 属性，但编译器无法证明每种类型都有 `.length` 属性，所以它警告我们不能做出这种假设。

```ts twoslash
// @errors: 2339
function loggingIdentity<Type>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}
```

与其使用任何和所有类型，我们更希望将这个函数约束为也 _具有_ `.length` 属性的任何和所有类型。
只要类型有这个成员，我们就允许它，但它至少必须有这个成员。
为此，我们必须将我们的要求列为 `Type` 可以是什么的约束。

为此，我们将创建一个描述我们约束的接口。
在这里，我们将创建一个具有单个 `.length` 属性的接口，然后我们将使用此接口和 `extends` 关键字来表示我们的约束：

```ts twoslash
interface Lengthwise {
  length: number;
}

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length); // 现在我们知道它有 .length 属性，所以不再报错
  return arg;
}
```

因为泛型函数现在被约束了，它将不再适用于任何和所有类型：

```ts twoslash
// @errors: 2345
interface Lengthwise {
  length: number;
}

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}
// ---cut---
loggingIdentity(3);
```

相反，我们需要传入其类型具有所有必需属性的值：

```ts twoslash
interface Lengthwise {
  length: number;
}

function loggingIdentity<Type extends Lengthwise>(arg: Type): Type {
  console.log(arg.length);
  return arg;
}
// ---cut---
loggingIdentity({ length: 10, value: 3 });
```

## 在泛型约束中使用类型参数

你可以声明一个受另一个类型参数约束的类型参数。
例如，这里我们想从对象中根据其名称获取属性。
我们想确保我们没有意外地获取一个在 `obj` 上不存在的属性，所以我们将在两种类型之间放置一个约束：

```ts twoslash
// @errors: 2345
function getProperty<Type, Key extends keyof Type>(obj: Type, key: Key) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, "a");
getProperty(x, "m");
```

## 在泛型中使用类类型

当在 TypeScript 中使用泛型创建工厂时，需要通过构造函数引用来引用类类型。例如：

```ts twoslash
function create<Type>(c: { new (): Type }): Type {
  return new c();
}
```

一个更高级的示例使用 prototype 属性来推断和约束构造函数和类类型实例面之间的关系。

```ts twoslash
// @strict: false
class BeeKeeper {
  hasMask: boolean = true;
}

class ZooKeeper {
  nametag: string = "Mikle";
}

class Animal {
  numLegs: number = 4;
}

class Bee extends Animal {
  numLegs = 6;
  keeper: BeeKeeper = new BeeKeeper();
}

class Lion extends Animal {
  keeper: ZooKeeper = new ZooKeeper();
}

function createInstance<A extends Animal>(c: new () => A): A {
  return new c();
}

createInstance(Lion).keeper.nametag;
createInstance(Bee).keeper.hasMask;
```

这个模式用于支持 [mixins](/docs/handbook/mixins.html) 设计模式。

## 泛型参数默认值

通过为泛型类型参数声明默认值，你可以使相应的类型参数成为可选的。例如，一个创建新 `HTMLElement` 的函数。不带参数调用该函数会生成一个 `HTMLDivElement`；带一个元素作为第一个参数调用该函数会生成一个参数类型的元素。你还可以选择传入一个子元素列表。以前你必须这样定义函数：


```ts twoslash
type Container<T, U> = {
  element: T;
  children: U;
};

// ---cut---
declare function create(): Container<HTMLDivElement, HTMLDivElement[]>;
declare function create<T extends HTMLElement>(element: T): Container<T, T[]>;
declare function create<T extends HTMLElement, U extends HTMLElement>(
  element: T,
  children: U[]
): Container<T, U[]>;
```

有了泛型参数默认值，我们可以将其简化为：

```ts twoslash
type Container<T, U> = {
  element: T;
  children: U;
};

// ---cut---
declare function create<T extends HTMLElement = HTMLDivElement, U extends HTMLElement[] = T[]>(
  element?: T,
  children?: U
): Container<T, U>;

const div = create();
//    ^?

const p = create(new HTMLParagraphElement());
//    ^?
```

泛型参数默认值遵循以下规则：

- 如果类型参数有默认值，则它被认为是可选的。
- 必需的类型参数不能跟在可选类型参数之后。
- 类型参数的默认类型必须满足类型参数的约束（如果存在的话）。
- 在指定类型参数时，你只需要为必需的类型参数指定类型参数。未指定的类型参数将解析为它们的默认类型。
- 如果指定了默认类型且推断无法选择候选项，则推断默认类型。
- 与现有类或接口声明合并的类或接口声明可以为现有类型参数引入默认值。
- 与现有类或接口声明合并的类或接口声明可以引入新类型参数，只要它指定了默认值。

## 变型注解

> 这是一个用于解决非常特定问题的高级功能，只有在你已识别出使用它的理由时才应使用

[协变和逆变](https://en.wikipedia.org/wiki/Covariance_and_contravariance_(computer_science)) 是类型论术语，用于描述两个泛型类型之间的关系。
这里简要介绍一下这个概念。

例如，如果你有一个接口表示可以 `make` 某种类型的对象：
```ts
interface Producer<T> {
  make(): T;
}
```
我们可以在期望 `Producer<Animal>` 的地方使用 `Producer<Cat>`，因为 `Cat` 是 `Animal`。
这种关系称为 _协变_：从 `Producer<T>` 到 `Producer<U>` 的关系与从 `T` 到 `U` 的关系相同。

相反，如果你有一个可以 `consume` 某种类型的接口：
```ts
interface Consumer<T> {
  consume: (arg: T) => void;
}
```
那么我们可以在期望 `Consumer<Cat>` 的地方使用 `Consumer<Animal>`，因为任何能够接受 `Animal` 的函数也必须能够接受 `Cat`。
这种关系称为 _逆变_：从 `Consumer<T>` 到 `Consumer<U>` 的关系与从 `U` 到 `T` 的关系相同。
注意与协变相比的方向反转！这就是为什么逆变"互相抵消"而协变不会的原因。

在像 TypeScript 这样的结构类型系统中，协变和逆变是从类型定义中自然产生的行为。
即使在没有泛型的情况下，我们也会看到协变（和逆变）关系：
```ts
interface AnimalProducer {
  make(): Animal;
}

// CatProducer 可以在任何需要
// AnimalProducer 的地方使用
interface CatProducer {
  make(): Cat;
}
```

TypeScript 有一个结构类型系统，所以在比较两个类型时，例如查看 `Producer<Cat>` 是否可以在期望 `Producer<Animal>` 的地方使用，通常的算法是在结构上展开这两个定义，并比较它们的结构。
但是，变型允许一个非常有用的优化：如果 `Producer<T>` 在 `T` 上是协变的，那么我们可以简单地检查 `Cat` 和 `Animal`，因为我们知道它们将与 `Producer<Cat>` 和 `Producer<Animal>` 具有相同的关系。

注意此逻辑只能在我们检查同一类型的两个实例化时使用。
如果我们有一个 `Producer<T>` 和一个 `FastProducer<U>`，无法保证 `T` 和 `U` 必然指代这些类型中的相同位置，所以这个检查将始终以结构方式执行。

因为变型是结构类型的自然属性，TypeScript 会自动 _推断_ 每个泛型类型的变型。
**在极少数情况下**，涉及某些类型的循环类型，这种测量可能不准确。
如果发生这种情况，你可以向类型参数添加变型注解来强制特定的变型：
```ts
// 逆变注解
interface Consumer<in T> {
  consume: (arg: T) => void;
}

// 协变注解
interface Producer<out T> {
  make(): T;
}

// 不变注解
interface ProducerConsumer<in out T> {
  consume: (arg: T) => void;
  make(): T;
}
```
只有当你写的变型与 _应该_ 在结构上发生的变型相同时才这样做。

> 永远不要写与结构变型不匹配的变型注解！

强化这一点非常重要：变型注解只在基于实例化的比较期间生效。
它们在结构比较期间没有效果。
例如，你不能使用变型注解来"强制"类型实际不变：
```ts
// 不要这样做 - 变型注解
// 与结构行为不匹配
interface Producer<in out T> {
  make(): T;
}

// 不是类型错误 - 这是一个结构
// 比较，所以变型注解
// 不生效
const p: Producer<string | number> = {
    make(): number {
        return 42;
    }
}
```
在这里，对象字面量的 `make` 函数返回 `number`，我们可能期望会报错，因为 `number` 不是 `string | number`。
但是，这不是基于实例化的比较，因为对象字面量是匿名类型，不是 `Producer<string | number>`。

> 变型注解不改变结构行为，只在特定情况下被咨询

只在你绝对知道为什么这样做、它们的局限性是什么以及它们何时不生效的情况下，才写变型注解。
TypeScript 使用基于实例化的比较还是结构比较不是指定的行为，可能会因正确性或性能原因而从版本到版本发生变化，所以你应该只在变型注解与类型的结构行为相匹配时才写它们。
不要使用变型注解来尝试"强制"特定的变型；这将导致代码中出现不可预测的行为。

> 不要写变型注解，除非它们与类型的结构行为相匹配

记住，TypeScript 可以自动从你的泛型类型推断变型。
几乎从来不需要写变型注解，只有当你已识别出特定需求时才应该这样做。
变型注解 _不会_ 改变类型的结构行为，根据情况，你可能会看到在你期望基于实例化的比较时进行了结构比较。
变型注解不能用于修改类型在这些结构上下文中的行为，不应该写除非注解与结构定义相同。
因为这很难做对，而且 TypeScript 在绝大多数情况下可以正确推断变型，你不应该在普通代码中发现自己在写变型注解。

> 不要尝试使用变型注解来改变类型检查行为；这不是它们的用途

你 _可能_ 在"类型调试"情况下发现临时变型注解有用，因为变型注解会被检查。
如果注解的变型明显错误，TypeScript 会报错：
```ts
// 报错，这个接口在 T 上肯定是逆变的
interface Foo<out T> {
  consume: (arg: T) => void;
}
```
但是，变型注解允许更严格（例如，如果实际变型是协变的，`in out` 也是有效的）。
调试完成后一定要删除你的变型注解。

最后，如果你尝试最大化你的类型检查性能，_并且_ 已经运行了分析器，_并且_ 已经识别出特定的类型很慢，_并且_ 已经识别出变型推断特别慢，_并且_ 已经仔细验证了你想写的变型注解，你 _可能_ 通过在极其复杂的类型中添加变型注解看到小的性能提升。

> 不要尝试使用变型注解来改变类型检查行为；这不是它们的用途
