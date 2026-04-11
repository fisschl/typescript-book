---
title: 对象类型
---

在 JavaScript 中，我们组合和传递数据的基本方式是通过对象。
在 TypeScript 中，我们用 _对象类型_ 来表示它们。

如前所见，它们可以是匿名的：

```ts twoslash
function greet(person: { name: string; age: number }) {
  //                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  return "Hello " + person.name;
}
```

或者通过 interface 命名：

```ts twoslash
interface Person {
  //      ^^^^^^
  name: string;
  age: number;
}

function greet(person: Person) {
  return "Hello " + person.name;
}
```

或者用 type 别名：

```ts twoslash
type Person = {
  // ^^^^^^
  name: string;
  age: number;
};

function greet(person: Person) {
  return "Hello " + person.name;
}
```

以上三个例子中，我们写的函数都接受包含 `name`（必须是 `string`）和 `age`（必须是 `number`）属性的对象。

## 快速参考

我们提供了 [`type` 和 `interface`](https://www.typescriptlang.org/cheatsheets) 的速查表，如果想快速了解日常重要语法，可以一览。

## 属性修饰符

对象类型中的每个属性可以指定几件事：类型、属性是否可选、以及属性是否可写入。

### 可选属性

很多时候，我们会遇到 _可能_ 设置了某个属性的对象。
这种情况下，我们可以在属性名末尾加问号（`?`）把这些属性标记为 _可选_：

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

// ---cut---
interface PaintOptions {
  shape: Shape;
  xPos?: number;
  //  ^
  yPos?: number;
  //  ^
}

function paintShape(opts: PaintOptions) {
  // ...
}

const shape = getShape();
paintShape({ shape });
paintShape({ shape, xPos: 100 });
paintShape({ shape, yPos: 100 });
paintShape({ shape, xPos: 100, yPos: 100 });
```

这个例子中，`xPos` 和 `yPos` 都是可选的。
我们可以选择提供其中任何一个，所以上面所有对 `paintShape` 的调用都是合法的。
可选性实际上只表示：如果该属性 _确实_ 设置了，它必须有特定的类型。

我们也可以读取这些属性——但在 [`strictNullChecks`](/tsconfig#strictNullChecks) 下，TypeScript 会告诉我们它们可能是 `undefined`。

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

// ---cut---
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos;
  //              ^?
  let yPos = opts.yPos;
  //              ^?
  // ...
}
```

在 JavaScript 中，即使属性从未被设置过，我们仍然可以访问它——只是会返回值 `undefined`。
我们可以通过检查来特殊处理 `undefined`。

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

// ---cut---
function paintShape(opts: PaintOptions) {
  let xPos = opts.xPos === undefined ? 0 : opts.xPos;
  //  ^?
  let yPos = opts.yPos === undefined ? 0 : opts.yPos;
  //  ^?
  // ...
}
```

注意，这种为未指定值设置默认值的模式非常常见，JavaScript 已经有语法来支持它。

```ts twoslash
interface Shape {}
declare function getShape(): Shape;

interface PaintOptions {
  shape: Shape;
  xPos?: number;
  yPos?: number;
}

// ---cut---
function paintShape({ shape, xPos = 0, yPos = 0 }: PaintOptions) {
  console.log("x coordinate at", xPos);
  //                             ^?
  console.log("y coordinate at", yPos);
  //                             ^?
  // ...
}
```

这里我们对 `paintShape` 的参数使用了[解构模式](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)，并为 `xPos` 和 `yPos` 提供了[默认值](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#Default_values)。
现在 `xPos` 和 `yPos` 在 `paintShape` 函数体内一定存在，但对任何调用 `paintShape` 的人来说仍然是可选的。

> 注意，目前无法在解构模式中添加类型注解。
> 因为以下语法在 JavaScript 中已经有不同含义：
>
> ```ts twoslash
> // @noImplicitAny: false
> // @errors: 2552 2304
> interface Shape {}
> declare function render(x: unknown);
> // ---cut---
> function draw({ shape: Shape, xPos: number = 100 /*...*/ }) {
>   render(shape);
>   render(xPos);
> }
> ```
>
> 在对象解构模式中，`shape: Shape` 表示"取出 `shape` 属性，把它重新命名为局部变量 `Shape`"。
> 同样 `xPos: number` 会创建一个名为 `number` 的变量，其值基于参数的 `xPos`。

### `readonly` 属性

TypeScript 中还可以把属性标记为 `readonly`。
虽然这不会改变运行时行为，但在类型检查期间，标记为 `readonly` 的属性不能被写入。

```ts twoslash
// @errors: 2540
interface SomeType {
  readonly prop: string;
}

function doSomething(obj: SomeType) {
  // 可以读取 'obj.prop'。
  console.log(`prop has the value '${obj.prop}'.`);

  // 但不能重新赋值。
  obj.prop = "hello";
}
```

使用 `readonly` 修饰符并不一定意味着值完全不可变——换句话说，其内部内容不能改变。
它只是表示属性本身不能被重新写入。

```ts twoslash
// @errors: 2540
interface Home {
  readonly resident: { name: string; age: number };
}

function visitForBirthday(home: Home) {
  // 可以读取和更新 'home.resident' 的属性。
  console.log(`Happy birthday ${home.resident.name}!`);
  home.resident.age++;
}

function evict(home: Home) {
  // 但不能写入 'Home' 上的 'resident' 属性本身。
  home.resident = {
    name: "Victor the Evictor",
    age: 42,
  };
}
```

理解 `readonly` 的含义很重要。
它有助于在开发阶段向 TypeScript 表明对象的使用意图。
TypeScript 在检查两个类型是否兼容时，不会考虑它们的属性是否 `readonly`，所以 `readonly` 属性也可以通过别名改变。

```ts twoslash
interface Person {
  name: string;
  age: number;
}

interface ReadonlyPerson {
  readonly name: string;
  readonly age: number;
}

let writablePerson: Person = {
  name: "Person McPersonface",
  age: 42,
};

// 合法
let readonlyPerson: ReadonlyPerson = writablePerson;

console.log(readonlyPerson.age); // 输出 '42'
writablePerson.age++;
console.log(readonlyPerson.age); // 输出 '43'
```

使用 [映射修饰符](/docs/handbook/2/mapped-types.html#mapping-modifiers)，可以移除 `readonly` 属性。

### 索引签名

有时你无法提前知道类型的所有属性名，但你知道值的形状。

这种情况下，你可以用索引签名来描述可能的值的类型，例如：

```ts twoslash
declare function getStringArray(): StringArray;
// ---cut---
interface StringArray {
  [index: number]: string;
}

const myArray: StringArray = getStringArray();
const secondItem = myArray[1];
//     ^?
```

上面我们有一个带索引签名的 `StringArray` 接口。
这个索引签名表示：当用 `number` 索引 `StringArray` 时，会返回一个 `string`。

索引签名属性只允许某些类型：`string`、`number`、`symbol`、模板字符串模式，以及仅由这些类型组成的联合类型。

<details>
    <summary>可以同时支持多种索引器类型...</summary>
    <p>可以同时支持多种索引器类型。注意，同时使用 `number` 和 `string` 索引器时，数字索引器返回的类型必须是字符串索引器返回类型的子类型。这是因为用 <code>number</code> 索引时，JavaScript 实际上会先将其转换为 <code>string</code> 再索引对象。也就是说，用 <code>100</code>（<code>number</code>）索引和用 <code>"100"</code>（<code>string</code>）索引是一回事，所以两者必须一致。</p>

```ts twoslash
// @errors: 2413
// @strictPropertyInitialization: false
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// 错误：用数字字符串索引可能会得到完全不同的 Animal 类型！
interface NotOkay {
  [x: number]: Animal;
  [x: string]: Dog;
}
```

</details>

虽然字符串索引签名是描述"字典"模式的强大方式，但它们也强制所有属性必须匹配其返回类型。
这是因为字符串索引声明了 `obj.property` 也可以通过 `obj["property"]` 访问。
下面例子中，`name` 的类型与字符串索引的类型不匹配，类型检查器会报错：

```ts twoslash
// @errors: 2411
interface NumberDictionary {
  [index: string]: number;

  length: number; //  OK
  name: string;
}
```

不过，如果索引签名是属性类型的联合类型，则允许不同类型的属性：

```ts twoslash
interface NumberOrStringDictionary {
  [index: string]: number | string;
  length: number; // OK，length 是 number
  name: string; // OK，name 是 string
}
```

最后，你可以把索引签名设为 `readonly`，以防止对索引进行赋值：

```ts twoslash
declare function getReadOnlyStringArray(): ReadonlyStringArray;
// ---cut---
// @errors: 2542
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let myArray: ReadonlyStringArray = getReadOnlyStringArray();
myArray[2] = "Mallory";
```

因为索引签名是 `readonly`，所以不能设置 `myArray[2]`。

## 额外属性检查

对象在何处、如何被赋值类型，在类型系统中会产生不同的效果。
其中一个关键例子就是额外属性检查，它会在对象创建并赋值给对象类型时更严格地验证对象。

```ts twoslash
// @errors: 2345 2739
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}

let mySquare = createSquare({ colour: "red", width: 100 });
```

注意传给 `createSquare` 的参数拼写是 _`colour`_ 而不是 `color`。
在纯 JavaScript 中，这种事会静默失败。

你可能会说这个程序的类型是正确的，因为 `width` 属性兼容，没有 `color` 属性出现，多余的 `colour` 属性也无伤大雅。

但 TypeScript 的立场是：这段代码很可能有 bug。
对象字面量会得到特殊对待，在赋值给其他变量或作为参数传递时，会进行 _额外属性检查_。
如果对象字面量包含"目标类型"没有的属性，你会收到错误：

```ts twoslash
// @errors: 2345 2739
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let mySquare = createSquare({ colour: "red", width: 100 });
```

绕过这些检查其实很简单。
最简单的方法就是使用类型断言：

```ts twoslash
// @errors: 2345 2739
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let mySquare = createSquare({ width: 100, opacity: 0.5 } as SquareConfig);
```

不过，更好的做法可能是添加字符串索引签名——如果你确定对象确实可以有一些以特殊方式使用的额外属性。
如果 `SquareConfig` 可以有上述类型的 `color` 和 `width` 属性，但 _还可能_ 有任意数量的其他属性，则可以这样定义：

```ts twoslash
interface SquareConfig {
  color?: string;
  width?: number;
  [propName: string]: unknown;
}
```

这里我们表示 `SquareConfig` 可以有任意数量的属性，只要它们不是 `color` 或 `width`，类型就无所谓。

最后一种绕过这些检查的方法可能有点令人惊讶：把对象先赋值给另一个变量。
因为赋值 `squareOptions` 时不会进行额外属性检查，编译器不会报错：

```ts twoslash
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let squareOptions = { colour: "red", width: 100 };
let mySquare = createSquare(squareOptions);
```

上面的变通方法只要 `squareOptions` 和 `SquareConfig` 之间有公共属性就能工作。
这个例子中是 `width` 属性。但如果变量没有任何公共对象属性，则会失败。例如：

```ts twoslash
// @errors: 2559
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
// ---cut---
let squareOptions = { colour: "red" };
let mySquare = createSquare(squareOptions);
```

请记住，对于上面这样简单的代码，你可能不应该试图"绕过"这些检查。
对于更复杂的包含方法和状态的对象字面量，你可能需要记住这些技巧，但大多数额外属性错误实际上都是 bug。

也就是说，如果你在类似选项包的东西上遇到额外属性检查问题，可能需要修改一些类型声明。
在这个例子中，如果向 `createSquare` 传递同时包含 `color` 或 `colour` 属性的对象是可以接受的，你应该修改 `SquareConfig` 的定义来反映这一点。

## 扩展类型

拥有作为其他类型更具体版本的类型是很常见的。
例如，我们可能有一个 `BasicAddress` 类型，描述在美国发送信件和包裹所需的字段。

```ts twoslash
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

在某些情况下这已经足够了，但如果一个地址对应的建筑有多个单元，地址通常会关联一个单元号。
此时我们可以描述一个 `AddressWithUnit`。

<!-- prettier-ignore -->
```ts twoslash
interface AddressWithUnit {
  name?: string;
  unit: string;
//^^^^^^^^^^^^^
  street: string;
  city: string;
  country: string;
  postalCode: string;
}
```

这样做可以完成任务，但缺点是当我们的更改 purely 是添加性质时，不得不重复 `BasicAddress` 中的所有其他字段。
相反，我们可以扩展原始的 `BasicAddress` 类型，只添加 `AddressWithUnit` 独有的新字段。

```ts twoslash
interface BasicAddress {
  name?: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
}

interface AddressWithUnit extends BasicAddress {
  unit: string;
}
```

`interface` 上的 `extends` 关键字允许我们有效地从其他命名类型中复制成员，并添加任何想要的新成员。
这有助于减少我们必须编写的类型声明样板代码，并且能够表达意图：多个相同的属性声明可能是相关联的。
例如，`AddressWithUnit` 不需要重复 `street` 属性，而且由于 `street` 来源于 `BasicAddress`，读者会知道这两个类型以某种方式相关联。

`interface` 还可以从多个类型扩展。

```ts twoslash
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

interface ColorfulCircle extends Colorful, Circle {}

const cc: ColorfulCircle = {
  color: "red",
  radius: 42,
};
```

## 交叉类型

`interface` 允许我们通过扩展从其他类型构建新类型。
TypeScript 提供了另一种称为 _交叉类型_ 的结构，主要用于组合现有的对象类型。

交叉类型使用 `&` 运算符定义。

```ts twoslash
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;
```

这里，我们将 `Colorful` 和 `Circle` 交叉，产生了一个具有 `Colorful` _和_ `Circle` 所有成员的新类型。

```ts twoslash
// @errors: 2345
interface Colorful {
  color: string;
}
interface Circle {
  radius: number;
}
// ---cut---
function draw(circle: Colorful & Circle) {
  console.log(`Color was ${circle.color}`);
  console.log(`Radius was ${circle.radius}`);
}

// 正确
draw({ color: "blue", radius: 42 });

// 错误
draw({ color: "red", raidus: 42 });
```

## 接口扩展 vs. 交叉类型

我们刚刚看到了两种组合类型的方式，它们很相似，但实际上有着微妙的差别。
使用接口时，我们可以使用 `extends` 子句从其他类型扩展，使用交叉类型时我们也可以做类似的事情，并用类型别名命名结果。
两者之间的主要区别在于如何处理冲突，而这个区别通常是你在接口和交叉类型的类型别名之间选择的主要原因之一。

如果使用相同的名称定义接口，TypeScript 会尝试合并它们（前提是属性兼容）。如果属性不兼容（即属性名相同但类型不同），TypeScript 会报错。

对于交叉类型，具有不同类型的属性会自动合并。当稍后使用该类型时，TypeScript 会期望属性同时满足两种类型，这可能会产生意想不到的结果。

例如，以下代码会报错，因为属性不兼容：

```ts
interface Person {
  name: string;
}

interface Person {
  name: number;
}
```

相比之下，以下代码可以编译，但会导致 `never` 类型：

```ts twoslash
interface Person1 {
  name: string;
}

interface Person2 {
  name: number;
}

type Staff = Person1 & Person2

declare const staffer: Staff;
staffer.name;
//       ^?
```

在这个例子中，`Staff` 要求 `name` 属性同时是 `string` 和 `number`，这导致属性类型为 `never`。

## 泛型对象类型

让我们想象一个 `Box` 类型，它可以包含任何值——`string`、`number`、`Giraffe`，Whatever。

```ts twoslash
interface Box {
  contents: any;
}
```

目前，`contents` 属性被类型为 `any`，这可以工作，但可能会导致后续意外。

我们也可以用 `unknown`，但这意味着在我们已经知道 `contents` 类型的情况下，需要做预防性检查，或使用容易出错的类型断言。

```ts twoslash
interface Box {
  contents: unknown;
}

let x: Box = {
  contents: "hello world",
};

// 我们可以检查 'x.contents'
if (typeof x.contents === "string") {
  console.log(x.contents.toLowerCase());
}

// 或者我们可以使用类型断言
console.log((x.contents as string).toLowerCase());
```

一种类型安全的方法是为每种 `contents` 类型构建不同的 `Box` 类型。

```ts twoslash
// @errors: 2322
interface NumberBox {
  contents: number;
}

interface StringBox {
  contents: string;
}

interface BooleanBox {
  contents: boolean;
}
```

但这意味着我们必须创建不同的函数，或函数的重载，来操作这些类型。

```ts twoslash
interface NumberBox {
  contents: number;
}

interface StringBox {
  contents: string;
}

interface BooleanBox {
  contents: boolean;
}
// ---cut---
function setContents(box: StringBox, newContents: string): void;
function setContents(box: NumberBox, newContents: number): void;
function setContents(box: BooleanBox, newContents: boolean): void;
function setContents(box: { contents: any }, newContents: any) {
  box.contents = newContents;
}
```

这里有大量的样板代码。而且，我们以后可能还需要引入新的类型和重载。
这令人沮丧，因为我们的 box 类型和重载实际上都是相同的。

相反，我们可以创建一个 _泛型_ `Box` 类型，它声明一个 _类型参数_。

```ts twoslash
interface Box<Type> {
  contents: Type;
}
```

你可以这样理解："`Type` 的 `Box` 是 `contents` 具有 `Type` 类型的东西"。
稍后，当我们引用 `Box` 时，必须提供一个 _类型参数_ 来替代 `Type`。

```ts twoslash
interface Box<Type> {
  contents: Type;
}
// ---cut---
let box: Box<string>;
```

把 `Box` 看作是一个真实类型的模板，其中 `Type` 是一个占位符，将来会被替换为其他类型。
当 TypeScript 看到 `Box<string>` 时，它会将 `Box<Type>` 中 `Type` 的每个实例都替换为 `string`，最终得到类似 `{ contents: string }` 的东西。
换句话说，`Box<string>` 和我们之前的 `StringBox` 工作方式完全相同。

```ts twoslash
interface Box<Type> {
  contents: Type;
}
interface StringBox {
  contents: string;
}

let boxA: Box<string> = { contents: "hello" };
boxA.contents;
//   ^?

let boxB: StringBox = { contents: "world" };
boxB.contents;
//   ^?
```

`Box` 是可复用的，因为 `Type` 可以替换为任何类型。这意味着当我们需要一个新类型的 box 时，根本不需要声明新的 `Box` 类型（当然，如果我们愿意也可以）。

```ts twoslash
interface Box<Type> {
  contents: Type;
}

interface Apple {
  // ....
}

// 等同于 '{ contents: Apple }'。
type AppleBox = Box<Apple>;
```

这也意味着我们可以通过使用 [泛型函数](/docs/handbook/2/functions.html#泛型函数) 来完全避免重载。

```ts twoslash
interface Box<Type> {
  contents: Type;
}

// ---cut---
function setContents<Type>(box: Box<Type>, newContents: Type) {
  box.contents = newContents;
}
```

值得注意的是，类型别名也可以是泛型的。我们可以使用类型别名来定义我们新的 `Box<Type>` 接口：

```ts twoslash
interface Box<Type> {
  contents: Type;
}
```

改为使用类型别名：

```ts twoslash
type Box<Type> = {
  contents: Type;
};
```

由于类型别名不像接口那样只能描述对象类型，我们还可以用它们编写其他类型的泛型辅助类型。

```ts twoslash
// @errors: 2575
type OrNull<Type> = Type | null;

type OneOrMany<Type> = Type | Type[];

type OneOrManyOrNull<Type> = OrNull<OneOrMany<Type>>;
//   ^?

type OneOrManyOrNullStrings = OneOrManyOrNull<string>;
//   ^?
```

我们稍后会再回到类型别名的话题。

### `Array` 类型

泛型对象类型通常是某种容器类型，它们独立于所包含的元素类型工作。
数据结构以这种方式工作是理想的，因为它们可以在不同的数据类型之间复用。

事实证明，我们在整个手册中一直在使用一个这样的类型：`Array` 类型。
每当我们写出 `number[]` 或 `string[]` 这样的类型时，它们实际上只是 `Array<number>` 和 `Array<string>` 的简写。

```ts twoslash
function doSomething(value: Array<string>) {
  // ...
}

let myArray: string[] = ["hello", "world"];

// 这两种方式都可以！
doSomething(myArray);
doSomething(new Array("hello", "world"));
```

和上面的 `Box` 类型非常相似，`Array` 本身也是一个泛型类型。

```ts twoslash
// @noLib: true
interface Number {}
interface String {}
interface Boolean {}
interface Symbol {}
// ---cut---
interface Array<Type> {
  /**
   * 获取或设置数组的长度。
   */
  length: number;

  /**
   * 从数组中删除最后一个元素并返回它。
   */
  pop(): Type | undefined;

  /**
   * 将新元素追加到数组中，并返回数组的新长度。
   */
  push(...items: Type[]): number;

  // ...
}
```

现代 JavaScript 还提供了其他泛型数据结构，如 `Map<K, V>`、`Set<T>` 和 `Promise<T>`。
这实际上只意味着因为 `Map`、`Set` 和 `Promise` 的行为方式，它们可以与任何类型集合一起工作。

### `ReadonlyArray` 类型

`ReadonlyArray` 是一种特殊类型，描述不应更改的数组。

```ts twoslash
// @errors: 2339
function doStuff(values: ReadonlyArray<string>) {
  // 我们可以从 'values' 读取...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...但不能修改 'values'。
  values.push("hello!");
}
```

就像属性的 `readonly` 修饰符一样，它主要是我们用来表达意图的工具。
当我们看到一个返回 `ReadonlyArray` 的函数时，它告诉我们不应该更改其中的内容，当我们看到一个消费 `ReadonlyArray` 的函数时，它告诉我们我们可以将任何数组传递给该函数，而不必担心它会更改其内容。

与 `Array` 不同，没有我们可以使用的 `ReadonlyArray` 构造函数。

```ts twoslash
// @errors: 2693
new ReadonlyArray("red", "green", "blue");
```

相反，我们可以将普通的 `Array` 赋值给 `ReadonlyArray`。

```ts twoslash
const roArray: ReadonlyArray<string> = ["red", "green", "blue"];
```

正如 TypeScript 为 `Array<Type>` 提供了 `Type[]` 的简写语法一样，它也为 `ReadonlyArray<Type>` 提供了 `readonly Type[]` 的简写语法。

```ts twoslash
// @errors: 2339
function doStuff(values: readonly string[]) {
  //                     ^^^^^^^^^^^^^^^^^
  // 我们可以从 'values' 读取...
  const copy = values.slice();
  console.log(`The first value is ${values[0]}`);

  // ...但不能修改 'values'。
  values.push("hello!");
}
```

最后要注意的一件事是，与 `readonly` 属性修饰符不同，普通 `Array` 和 `ReadonlyArray` 之间的赋值不是双向的。

```ts twoslash
// @errors: 4104
let x: readonly string[] = [];
let y: string[] = [];

x = y;
y = x;
```

### 元组类型

_元组类型_ 是另一种 `Array` 类型，它确切地知道包含多少个元素，以及在特定位置包含什么类型。

```ts twoslash
type StringNumberPair = [string, number];
//                      ^^^^^^^^^^^^^^^^
```

这里，`StringNumberPair` 是 `string` 和 `number` 的元组类型。
与 `ReadonlyArray` 一样，它在运行时没有表示，但对 TypeScript 很重要。
对类型系统来说，`StringNumberPair` 描述了 `0` 索引包含 `string` 且 `1` 索引包含 `number` 的数组。

```ts twoslash
function doSomething(pair: [string, number]) {
  const a = pair[0];
  //    ^?
  const b = pair[1];
  //    ^?
  // ...
}

doSomething(["hello", 42]);
```

如果我们尝试索引超过元素数量，会收到错误。

```ts twoslash
// @errors: 2493
function doSomething(pair: [string, number]) {
  // ...

  const c = pair[2];
}
```

我们还可以使用 JavaScript 的数组解构来 [解构元组](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment#数组解构)。

```ts twoslash
function doSomething(stringHash: [string, number]) {
  const [inputString, hash] = stringHash;

  console.log(inputString);
  //          ^?

  console.log(hash);
  //          ^?
}
```

> 元组类型在基于重度约定的 API 中很有用，其中每个元素的含义都很"明显"。
> 这使我们在解构时可以灵活地命名变量。
> 在上面的例子中，我们能够将元素 `0` 和 `1` 命名为任何我们想要的名称。
>
> 但是，由于并非每个用户都对什么是"明显"持有相同的看法，因此值得重新考虑是否使用具有描述性属性名称的对象对你的 API 更好。

除了这些长度检查之外，像这样的简单元组类型等同于 `Array` 的版本，它们为特定索引声明属性，并用数字字面量类型声明 `length`。

```ts twoslash
interface StringNumberPair {
  // 专用属性
  length: 2;
  0: string;
  1: number;

  // 其他 'Array<string | number>' 成员...
  slice(start?: number, end?: number): Array<string | number>;
}
```

你可能还感兴趣的是，元组可以通过在元素类型后写问号（`?`）来具有可选属性。
可选元组元素只能出现在末尾，还会影响 `length` 的类型。

```ts twoslash
type Either2dOr3d = [number, number, number?];

function setCoordinate(coord: Either2dOr3d) {
  const [x, y, z] = coord;
  //           ^?

  console.log(`Provided coordinates had ${coord.length} dimensions`);
  //                                            ^?
}
```

元组还可以有剩余元素，必须是数组/元组类型。

```ts twoslash
type StringNumberBooleans = [string, number, ...boolean[]];
type StringBooleansNumber = [string, ...boolean[], number];
type BooleansStringNumber = [...boolean[], string, number];
```

- `StringNumberBooleans` 描述了一个元组，其前两个元素分别是 `string` 和 `number`，但可以跟随任意数量的 `boolean`。
- `StringBooleansNumber` 描述了一个元组，其第一个元素是 `string`，然后是任意数量的 `boolean`，最后以 `number` 结尾。
- `BooleansStringNumber` 描述了一个元组，其起始元素是任意数量的 `boolean`，最后以 `string` 然后是 `number` 结尾。

具有剩余元素的元组没有固定的"长度"——它只有一组在不同位置的已知元素。

```ts twoslash
type StringNumberBooleans = [string, number, ...boolean[]];
// ---cut---
const a: StringNumberBooleans = ["hello", 1];
const b: StringNumberBooleans = ["beautiful", 2, true];
const c: StringNumberBooleans = ["world", 3, true, false, true, false, true];
```

为什么可选和剩余元素有用？
好吧，它允许 TypeScript 将元组与参数列表对应。
元组类型可以在 [剩余参数和参数](/docs/handbook/2/functions.html#剩余参数和参数) 中使用，因此以下内容：

```ts twoslash
function readButtonInput(...args: [string, number, ...boolean[]]) {
  const [name, version, ...input] = args;
  // ...
}
```

基本等同于：

```ts twoslash
function readButtonInput(name: string, version: number, ...input: boolean[]) {
  // ...
}
```

当你想要使用剩余参数接受可变数量的参数，并且你需要最少量的元素，但又不想引入中间变量时，这很方便。

### `readonly` 元组类型

关于元组类型的最后一点——元组类型有 `readonly` 变体，可以在它们前面加上 `readonly` 修饰符来指定——就像数组简写语法一样。

```ts twoslash
function doSomething(pair: readonly [string, number]) {
  //                       ^^^^^^^^^^^^^^^^^^^^^^^^^
  // ...
}
```

正如你可能预期的那样，在 TypeScript 中不允许写入 `readonly` 元组的任何属性。

```ts twoslash
// @errors: 2540
function doSomething(pair: readonly [string, number]) {
  pair[0] = "hello!";
}
```

在大多数代码中，元组倾向于被创建后保持不变，因此在可能的情况下将类型注解为 `readonly` 元组是一个好的默认选择。
这也很重要，因为带有 `const` 断言的数组字面量将使用 `readonly` 元组类型进行推断。

```ts twoslash
// @errors: 2345
let point = [3, 4] as const;

function distanceFromOrigin([x, y]: [number, number]) {
  return Math.sqrt(x ** 2 + y ** 2);
}

distanceFromOrigin(point);
```

这里，`distanceFromOrigin` 从不修改其元素，但期望一个可变元组。
由于 `point` 的类型被推断为 `readonly [3, 4]`，它与 `[number, number]` 不兼容，因为该类型无法保证 `point` 的元素不会被修改。
