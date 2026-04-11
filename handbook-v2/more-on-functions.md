---
title: 深入函数
---

函数是任何应用的基本构建块，无论是局部函数、从其他模块导入的函数，还是类的方法。
函数也是值，和其他值一样，TypeScript 提供了许多方式来描述如何调用函数。
让我们来学习如何编写描述函数的类型。

## 函数类型表达式

描述函数最简单的方式是使用 _函数类型表达式_。
这些类型的语法类似于箭头函数：

```ts twoslash
function greeter(fn: (a: string) => void) {
  fn("Hello, World");
}

function printToConsole(s: string) {
  console.log(s);
}

greeter(printToConsole);
```

语法 `(a: string) => void` 表示"一个函数，带有一个名为 `a`、类型为 `string` 的参数，没有返回值"。
与函数声明一样，如果没有指定参数类型，它会隐式地成为 `any`。

> 注意参数名是 **必需的**。函数类型 `(string) => void` 表示"一个函数，带有一个名为 `string`、类型为 `any` 的参数"！

当然，我们可以使用类型别名来命名一个函数类型：

```ts twoslash
type GreetFunction = (a: string) => void;
function greeter(fn: GreetFunction) {
  // ...
}
```

## 调用签名

在 JavaScript 中，函数除了可调用之外，还可以拥有属性。
然而，函数类型表达式语法不允许声明属性。
如果我们想描述一个带有属性的可调用对象，可以在对象类型中编写 _调用签名_：

```ts twoslash
type DescribableFunction = {
  description: string;
  (someArg: number): boolean;
};
function doSomething(fn: DescribableFunction) {
  console.log(fn.description + " returned " + fn(6));
}

function myFunc(someArg: number) {
  return someArg > 3;
}
myFunc.description = "default description";

doSomething(myFunc);
```

注意，与函数类型表达式相比，语法略有不同——在参数列表和返回类型之间使用 `:` 而不是 `=>`。

## 构造签名

JavaScript 函数也可以使用 `new` 运算符调用。
TypeScript 将这些函数称为 _构造函数_，因为它们通常会创建一个新对象。
你可以在调用签名前添加 `new` 关键字来编写 _构造签名_：

```ts twoslash
type SomeObject = any;
// ---cut---
type SomeConstructor = {
  new (s: string): SomeObject;
};
function fn(ctor: SomeConstructor) {
  return new ctor("hello");
}
```

有些对象，比如 JavaScript 的 `Date` 对象，可以使用或不使用 `new` 来调用。
你可以在同一个类型中任意组合调用签名和构造签名：

```ts twoslash
interface CallOrConstruct {
  (n?: number): string;
  new (s: string): Date;
}

function fn(ctor: CallOrConstruct) {
  // 传递 `number` 类型的参数给 `ctor` 会匹配
  // `CallOrConstruct` 接口中的第一个定义。
  console.log(ctor(10));

  // 类似地，传递 `string` 类型的参数给 `ctor` 会匹配
  // `CallOrConstruct` 接口中的第二个定义。
  console.log(new ctor("10"));
}

fn(Date);
```

## 泛型函数

编写函数时，输入的类型与输出的类型相关联，或者两个输入的类型以某种方式相关联，这种情况很常见。
让我们考虑一个返回数组第一个元素的函数：

```ts twoslash
function firstElement(arr: any[]) {
  return arr[0];
}
```

这个函数完成了它的任务，但不幸的是返回类型是 `any`。
如果函数返回数组元素的类型会更好。

在 TypeScript 中，_泛型_ 用于当我们想要描述两个值之间的对应关系时。
我们通过在函数签名中声明 _类型参数_ 来实现：

```ts twoslash
function firstElement<Type>(arr: Type[]): Type | undefined {
  return arr[0];
}
```

通过为这个函数添加类型参数 `Type` 并在两处使用它，我们在函数的输入（数组）和输出（返回值）之间创建了联系。
现在当我们调用它时，会得到更具体的类型：

```ts twoslash
declare function firstElement<Type>(arr: Type[]): Type | undefined;
// ---cut---
// s 的类型是 'string'
const s = firstElement(["a", "b", "c"]);
// n 的类型是 'number'
const n = firstElement([1, 2, 3]);
// u 的类型是 undefined
const u = firstElement([]);
```

### 类型推断

注意，在这个例子中，我们不必显式指定 `Type`。
类型是由 TypeScript _推断_ 出来的——自动选择的。

我们也可以使用多个类型参数。
例如，独立版本的 `map` 是这样的：

```ts twoslash
// prettier-ignore
function map<Input, Output>(arr: Input[], func: (arg: Input) => Output): Output[] {
  return arr.map(func);
}

// 参数 'n' 的类型是 'string'
// 'parsed' 的类型是 'number[]'
const parsed = map(["1", "2", "3"], (n) => parseInt(n));
```

注意，在这个例子中，TypeScript 可以推断出 `Input` 类型参数（根据给定的 `string` 数组），以及根据函数表达式的返回值推断出 `Output` 类型参数。

### 约束

我们之前写的泛型函数可以对 _任意_ 类型的值进行操作。
有时我们想要关联两个值，但只能对值的某个子集进行操作。
在这种情况下，我们可以使用 _约束_ 来限制类型参数可以接受的类型种类。

让我们编写一个函数，返回两个值中较长的一个。
为此，我们需要一个 `length` 属性，其类型为数字。
我们通过编写 `extends` 子句来 _约束_ 类型参数为该类型：

```ts twoslash
// @errors: 2345 2322
function longest<Type extends { length: number }>(a: Type, b: Type) {
  if (a.length >= b.length) {
    return a;
  } else {
    return b;
  }
}

// longerArray 的类型是 'number[]'
const longerArray = longest([1, 2], [1, 2, 3]);
// longerString 的类型是 'alice' | 'bob'
const longerString = longest("alice", "bob");
// 错误！数字没有 'length' 属性
const notOK = longest(10, 100);
```

这个例子中有一些值得注意的地方。
我们让 TypeScript _推断_ `longest` 的返回类型。
返回类型推断同样适用于泛型函数。

因为我们将 `Type` 约束为 `{ length: number }`，所以我们可以访问 `a` 和 `b` 参数的 `.length` 属性。
没有类型约束的话，我们将无法访问这些属性，因为这些值可能是其他没有 length 属性的类型。

`longerArray` 和 `longerString` 的类型是根据参数推断出来的。
记住，泛型的核心思想就是用相同的类型关联两个或多个值！

最后，正如我们所期望的，调用 `longest(10, 100)` 会被拒绝，因为 `number` 类型没有 `.length` 属性。

### 处理约束值

这是处理泛型约束时的一个常见错误：

```ts twoslash
// @errors: 2322
function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type {
  if (obj.length >= minimum) {
    return obj;
  } else {
    return { length: minimum };
  }
}
```

这个函数乍看没问题——`Type` 被约束为 `{ length: number }`，函数要么返回 `Type`，要么返回匹配该约束的值。
问题在于，函数承诺返回与传入对象 _相同_ 类型的对象，而不仅仅是 _某个_ 匹配约束的对象。
如果这段代码合法，你就会写出必然崩溃的代码：

```ts twoslash
declare function minimumLength<Type extends { length: number }>(
  obj: Type,
  minimum: number
): Type;
// ---cut---
// 'arr' 得到的值是 { length: 6 }
const arr = minimumLength([1, 2, 3], 6);
// 而在这里崩溃了，因为数组有
// 'slice' 方法，但返回的对象没有！
console.log(arr.slice(0));
```

### 指定类型参数

TypeScript 通常可以在泛型调用中推断预期的类型参数，但并非总是如此。
例如，假设你写了一个合并两个数组的函数：

```ts twoslash
function combine<Type>(arr1: Type[], arr2: Type[]): Type[] {
  return arr1.concat(arr2);
}
```

通常，用不匹配的数组调用这个函数会报错：

```ts twoslash
// @errors: 2322
declare function combine<Type>(arr1: Type[], arr2: Type[]): Type[];
// ---cut---
const arr = combine([1, 2, 3], ["hello"]);
```

但是，如果你打算这样做，可以手动指定 `Type`：

```ts twoslash
declare function combine<Type>(arr1: Type[], arr2: Type[]): Type[];
// ---cut---
const arr = combine<string | number>([1, 2, 3], ["hello"]);
```

### 写好泛型函数的准则

写泛型函数很有趣，但也很容易过度使用类型参数。
类型参数太多或在不需要时加约束，会让类型推断效果变差，让调用者感到沮丧。

#### 类型参数向下传递

下面是两种写法，看起来相似：

```ts twoslash
function firstElement1<Type>(arr: Type[]) {
  return arr[0];
}

function firstElement2<Type extends any[]>(arr: Type) {
  return arr[0];
}

// a: number（好）
const a = firstElement1([1, 2, 3]);
// b: any（不好）
const b = firstElement2([1, 2, 3]);
```

乍一看这两个函数一样，但 `firstElement1` 是更好的写法。
它的推断返回类型是 `Type`，而 `firstElement2` 的推断返回类型是 `any`，因为 TypeScript 必须用约束类型来解析 `arr[0]`，而不是"等"到调用时再解析元素。

> **准则**：能直接用类型参数本身，就不要约束它

#### 少用类型参数

再看一对相似的函数：

```ts twoslash
function filter1<Type>(arr: Type[], func: (arg: Type) => boolean): Type[] {
  return arr.filter(func);
}

function filter2<Type, Func extends (arg: Type) => boolean>(
  arr: Type[],
  func: Func
): Type[] {
  return arr.filter(func);
}
```

我们创建了一个 _不关联两个值_ 的类型参数 `Func`。
这总是一个危险信号，因为调用者想指定类型参数时，不得不毫无理由地多写一个。
`Func` 除了让函数更难读、更难理解之外，没有任何作用！

> **准则**：类型参数越少越好

#### 类型参数应该出现两次

有时候我们会忘记，函数可能根本不需要泛型：

```ts twoslash
function greet<Str extends string>(s: Str) {
  console.log("Hello, " + s);
}

greet("world");
```

完全可以写一个更简单的版本：

```ts twoslash
function greet(s: string) {
  console.log("Hello, " + s);
}
```

记住，类型参数用来 _关联多个值的类型_。
如果类型参数在函数签名里只用了一次，它就没有关联任何东西。
这包括推断的返回类型——例如，如果 `Str` 是 `greet` 推断返回类型的一部分，那它就关联了参数和返回类型，所以即使代码里只出现一次，实际上也被用了 _两次_。

> **准则**：类型参数如果只出现在一个位置，请仔细想想是否真的需要

## 可选参数

JavaScript 中的函数经常接受可变数量的参数。
例如，`number` 的 `toFixed` 方法接受一个可选的小数位数：

```ts twoslash
function f(n: number) {
  console.log(n.toFixed()); // 0 个参数
  console.log(n.toFixed(3)); // 1 个参数
}
```

我们可以用 `?` 把参数标记为 _可选_，在 TypeScript 中对这种行为建模：

```ts twoslash
function f(x?: number) {
  // ...
}
f(); // OK
f(10); // OK
```

虽然参数被指定为 `number` 类型，但 `x` 参数实际上具有 `number | undefined` 类型，因为 JavaScript 中没传的参数会得到 `undefined` 值。

你也可以给参数设 _默认值_：

```ts twoslash
function f(x = 10) {
  // ...
}
```

现在在 `f` 的函数体里，`x` 的类型是 `number`，因为任何 `undefined` 参数都会被替换为 `10`。
注意，参数可选时，调用者始终可以传 `undefined`，因为这只是模拟一个"没传"的参数：

```ts twoslash
declare function f(x?: number): void;
// ---cut---
// 全部 OK
f();
f(10);
f(undefined);
```

### 回调中的可选参数

了解了可选参数和函数类型表达式后，写调用回调的函数时很容易犯下面的错误：

```ts twoslash
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
}
```

人们写 `index?` 作为可选参数时，通常的意图是希望这两个调用都合法：

```ts twoslash
// @errors: 2532 18048
declare function myForEach(
  arr: any[],
  callback: (arg: any, index?: number) => void
): void;
// ---cut---
myForEach([1, 2, 3], (a) => console.log(a));
myForEach([1, 2, 3], (a, i) => console.log(a, i));
```

但这 _实际上_ 意味着 _`callback` 可能只会被传一个参数调用_。
换句话说，函数定义说实现可能长这样：

```ts twoslash
// @errors: 2532 18048
function myForEach(arr: any[], callback: (arg: any, index?: number) => void) {
  for (let i = 0; i < arr.length; i++) {
    // 今天不想传 index
    callback(arr[i]);
  }
}
```

相应地，TypeScript 会按这个理解来检查，然后报一些实际上不会发生的错误：

<!-- prettier-ignore -->
```ts twoslash
// @errors: 2532 18048
declare function myForEach(
  arr: any[],
  callback: (arg: any, index?: number) => void
): void;
// ---cut---
myForEach([1, 2, 3], (a, i) => {
  console.log(i.toFixed());
});
```

在 JavaScript 中，调用函数时传的实参比形参多，多余的实参会被直接忽略。
TypeScript 也一样。
参数少的函数（类型相同的话）总能代替参数多的函数。

> **准则**：给回调写函数类型时，_绝不_ 要写可选参数，除非你真的打算 _调用_ 时不传这个参数

## 函数重载

有些 JavaScript 函数可以用多种实参数量和类型来调用。
例如，你可能想写一个创建 `Date` 的函数，接受时间戳（一个参数）或月/日/年（三个参数）。

在 TypeScript 中，我们可以通过写 _重载签名_ 来指定函数可以用不同方式调用。
具体做法：先写一批函数签名（通常两个或更多），然后写函数体：

```ts twoslash
// @errors: 2575
function makeDate(timestamp: number): Date;
function makeDate(m: number, d: number, y: number): Date;
function makeDate(mOrTimestamp: number, d?: number, y?: number): Date {
  if (d !== undefined && y !== undefined) {
    return new Date(y, mOrTimestamp, d);
  } else {
    return new Date(mOrTimestamp);
  }
}
const d1 = makeDate(12345678);
const d2 = makeDate(5, 5, 5);
const d3 = makeDate(1, 3);
```

这个例子中，我们写了两个重载：一个接受一个参数，另一个接受三个参数。
前两个签名叫 _重载签名_。

然后，我们写了一个兼容签名的函数实现。
函数有一个 _实现签名_，但这个签名不能被直接调用。
即使我们在必需参数之后写了两个可选参数，它也不能用两个参数调用！

### 重载签名和实现签名

这里经常让人困惑。
很多人会写出这样的代码，然后不明白为什么报错：

```ts twoslash
// @errors: 2554
function fn(x: string): void;
function fn() {
  // ...
}
// 期望能零参数调用
fn();
```

同样，写函数体的那个签名从外面是"看不见"的。

> _实现_ 的签名从外面不可见。
> 写重载函数时，实现上面应该始终有 _两个_ 或更多签名。

实现签名也必须和重载签名 _兼容_。
比如这些函数会报错，因为实现签名和重载匹配方式不对：

```ts twoslash
// @errors: 2394
function fn(x: boolean): void;
// 参数类型不对
function fn(x: string): void;
function fn(x: boolean) {}
```

```ts twoslash
// @errors: 2394
function fn(x: string): string;
// 返回类型不对
function fn(x: number): boolean;
function fn(x: string | number) {
  return "oops";
}
```

### 写好重载

和泛型一样，用函数重载也有一些准则。
遵循这些准则可以让你的函数更好调用、更好理解、更好实现。

考虑一个返回字符串或数组长度的函数：

```ts twoslash
function len(s: string): number;
function len(arr: any[]): number;
function len(x: any) {
  return x.length;
}
```

这个函数没问题，可以用字符串或数组调用。
但是，不能用一个可能是字符串 _或_ 数组的值来调用，因为 TypeScript 只能把函数调用解析到单个重载：

```ts twoslash
// @errors: 2769
declare function len(s: string): number;
declare function len(arr: any[]): number;
// ---cut---
len(""); // OK
len([0]); // OK
len(Math.random() > 0.5 ? "hello" : [0]);
```

因为两个重载实参数量相同、返回类型相同，可以改写成非重载版本：

```ts twoslash
function len(x: any[] | string) {
  return x.length;
}
```

好多了！
调用者可以用任一类型的值来调用，而且我们也不用纠结实现签名怎么写。

> 能用联合类型参数的时候，优先用联合类型，别用重载

## 在函数中声明 `this`

TypeScript 会通过控制流分析推断函数中的 `this` 是什么，比如下面：

```ts twoslash
const user = {
  id: 123,

  admin: false,
  becomeAdmin: function () {
    this.admin = true;
  },
};
```

TypeScript 理解 `user.becomeAdmin` 函数的 `this` 就是外部对象 `user`。对很多场景来说，这就够了。但还有很多场景你需要更好地控制 `this` 指向什么对象。JavaScript 规范规定你不能有一个叫 `this` 的参数，所以 TypeScript 利用了这个语法空间让你声明函数体内 `this` 的类型。

```ts twoslash
interface User {
  id: number;
  admin: boolean;
}
declare const getDB: () => DB;
// ---cut---
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}

const db = getDB();
const admins = db.filterUsers(function (this: User) {
  return this.admin;
});
```

这种模式在回调式 API 中很常见，通常由另一个对象控制什么时候调用你的函数。注意，你需要用 `function` 而不是箭头函数来获得这个行为：

```ts twoslash
// @errors: 7041 7017 2532
interface User {
  id: number;
  admin: boolean;
}
declare const getDB: () => DB;
// ---cut---
interface DB {
  filterUsers(filter: (this: User) => boolean): User[];
}

const db = getDB();
const admins = db.filterUsers(() => this.admin);
```

## 其他需要知道的类型

还有一些额外的类型你需要了解，在处理函数类型时经常遇到。
和所有类型一样，你可以在任何地方用它们，但这些在函数的上下文里尤其相关。

### `void`

`void` 表示不返回值的函数的返回值。
它是没有 `return` 语句的函数，或没有从 return 语句返回任何明确值的函数，推断出的类型：

```ts twoslash
// 推断的返回类型是 void
function noop() {
  return;
}
```

在 JavaScript 中，不返回任何值的函数会隐式返回 `undefined`。
但在 TypeScript 中，`void` 和 `undefined` 不是一回事。
本章末尾有更多详细信息。

> `void` 和 `undefined` 不一样。

### `object`

特殊类型 `object` 指任何不是原始类型的值（`string`、`number`、`bigint`、`boolean`、`symbol`、`null` 或 `undefined`）。
这和 _空对象类型_ `{ }` 不同，也和全局类型 `Object` 不同。
你大概率永远不会用 `Object`。

> `object` 不是 `Object`。**始终** 用 `object`！

注意，在 JavaScript 中，函数值是对象：有属性，原型链上有 `Object.prototype`，`instanceof Object` 为 true，可以在上面调用 `Object.keys`，等等。
所以，TypeScript 中函数类型也被视为 `object`。

### `unknown`

`unknown` 类型表示 _任意_ 值。
这和 `any` 类型类似，但更安全，因为对 `unknown` 值做任何操作都是不合法的：

```ts twoslash
// @errors: 2571 18046
function f1(a: any) {
  a.b(); // OK
}
function f2(a: unknown) {
  a.b();
}
```

这在描述函数类型时很有用，因为你可以描述接受任何值的函数，而不用在函数体里放 `any` 值。

反过来，你也可以描述一个返回 unknown 类型值的函数：

```ts twoslash
declare const someRandomString: string;
// ---cut---
function safeParse(s: string): unknown {
  return JSON.parse(s);
}

// 需要小心处理 'obj'！
const obj = safeParse(someRandomString);
```

### `never`

有些函数 _从不_ 返回值：

```ts twoslash
function fail(msg: string): never {
  throw new Error(msg);
}
```

`never` 类型表示 _永不_ 会被观察到的值。
在返回类型中，这意味着函数抛出异常或终止程序执行。

当 TypeScript 确定联合类型中什么都不剩时，也会出现 `never`。

```ts twoslash
function fn(x: string | number) {
  if (typeof x === "string") {
    // 做点什么
  } else if (typeof x === "number") {
    // 做点别的
  } else {
    x; // 类型是 'never'！
  }
}
```

### `Function`

全局类型 `Function` 描述了 JavaScript 中所有函数值上都有的属性，比如 `bind`、`call`、`apply` 等。
它还有一个特殊属性，`Function` 类型的值总能被调用，这些调用返回 `any`：

```ts twoslash
function doSomething(f: Function) {
  return f(1, 2, 3);
}
```

这是一个 _未指定类型的函数调用_，通常最好避免，因为会返回不安全的 `any` 类型。

如果你需要接收一个任意函数但不打算调用它，用 `() => void` 类型通常更安全。

## 剩余参数和展开参数

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters'>剩余参数</a><br/>
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax'>展开语法</a><br/>
   </p>
</blockquote>

### 剩余参数

除了用可选参数或重载让函数接受固定数量的不同参数，我们还可以用 _剩余参数_ 来定义接受 _无限_ 数量参数的函数。

剩余参数在所有其他参数之后，用 `...` 语法：

```ts twoslash
function multiply(n: number, ...m: number[]) {
  return m.map((x) => n * x);
}
// 'a' 得到值 [10, 20, 30, 40]
const a = multiply(10, 1, 2, 3, 4);
```

在 TypeScript 中，这些参数的类型注解隐式是 `any[]` 而不是 `any`，任何给定的类型注解必须是 `Array<T>` 或 `T[]` 的形式，或元组类型（后面会学）。

### 展开参数

反过来，我们可以用展开语法从可迭代对象（比如数组）中 _提供_ 可变数量的参数。
例如，数组的 `push` 方法接受任意数量的参数：

```ts twoslash
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
arr1.push(...arr2);
```

注意，TypeScript 一般不假设数组是不可变的。
这可能会导致一些令人意外的行为：

```ts twoslash
// @errors: 2556
// 推断类型是 number[] —— "零个或多个数字的数组"，
// 而不是特指两个数字
const args = [8, 5];
const angle = Math.atan2(...args);
```

最佳修复方案取决于你的代码，但一般来说，用 `const` 上下文是最直接的解决方案：

```ts twoslash
// 推断为长度为 2 的元组
const args = [8, 5] as const;
// OK
const angle = Math.atan2(...args);
```

使用剩余参数时，如果目标是较老的运行环境，可能需要开启 [`downlevelIteration`](https://www.typescriptlang.org/tsconfig#downlevelIteration)。

<!-- TODO link to downlevel iteration -->

## 参数解构

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment'>解构赋值</a><br/>
   </p>
</blockquote>

你可以用参数解构把传入的对象方便地解包到函数体中的一个或多个局部变量里。
JavaScript 中长这样：

```js
function sum({ a, b, c }) {
  console.log(a + b + c);
}
sum({ a: 10, b: 3, c: 9 });
```

对象的类型注解放在解构语法后面：

```ts twoslash
function sum({ a, b, c }: { a: number; b: number; c: number }) {
  console.log(a + b + c);
}
```

这看起来可能有点冗长，但你也可以在这里用命名类型：

```ts twoslash
// 和前面的例子一样
type ABC = { a: number; b: number; c: number };
function sum({ a, b, c }: ABC) {
  console.log(a + b + c);
}
```

## 函数的可赋值性

### 返回类型 `void`

函数的 `void` 返回类型会产生一些不寻常但符合预期的行为。

`void` 返回类型的上下文类型 **不** 会强制函数 **不** 返回东西。换句话说，上下文函数类型是 `void` 返回类型时（`type voidFunc = () => void`），实现时可以返回 _任何_ 其他值，但这个值会被忽略。

所以，以下 `() => void` 类型的实现都是合法的：

```ts twoslash
type voidFunc = () => void;

const f1: voidFunc = () => {
  return true;
};

const f2: voidFunc = () => true;

const f3: voidFunc = function () {
  return true;
};
```

当这些函数的返回值被赋值给另一个变量时，它会保持 `void` 类型：

```ts twoslash
type voidFunc = () => void;

const f1: voidFunc = () => {
  return true;
};

const f2: voidFunc = () => true;

const f3: voidFunc = function () {
  return true;
};
// ---cut---
const v1 = f1();

const v2 = f2();

const v3 = f3();
```

有这个行为是因为以下代码是合法的，即使 `Array.prototype.push` 返回数字，而 `Array.prototype.forEach` 方法期望一个返回类型为 `void` 的函数。

```ts twoslash
const src = [1, 2, 3];
const dst = [0];

src.forEach((el) => dst.push(el));
```

还有另一个特殊情况需要注意，当函数定义的字面量返回值是 `void` 类型时，该函数 **不能** 返回任何内容。

```ts twoslash
function f2(): void {
  // @ts-expect-error
  return true;
}

const f3 = function (): void {
  // @ts-expect-error
  return true;
};
```

关于 `void` 的更多信息，参考以下文档：

- [FAQ - "为什么返回非 void 的函数可以赋值给返回 void 的函数？"](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-functions-returning-non-void-assignable-to-function-returning-void)
