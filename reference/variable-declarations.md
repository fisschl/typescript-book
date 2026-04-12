---
title: 变量声明
---

`let` 和 `const` 是 JavaScript 中变量声明的两个相对较新的概念。
[正如我们之前提到的](/handbook-v2/everyday-types#关于-let-的说明)，`let` 在某些方面类似于 `var`，但允许用户避免一些 JavaScript 中常见的"陷阱"。

`const` 是 `let` 的增强版，它可以防止变量被重新赋值。

由于 TypeScript 是 JavaScript 的扩展，该语言自然支持 `let` 和 `const`。
这里我们将更详细地阐述这些新声明方式，以及为什么它们比 `var` 更可取。

如果你只是偶尔使用 JavaScript，下一节可能是刷新你记忆的好方法。
如果你非常熟悉 JavaScript 中 `var` 声明的所有怪癖，你可能会发现跳过这部分更容易。

## `var` 声明

在 JavaScript 中声明变量传统上一直使用 `var` 关键字完成。

```ts
var a = 10;
```

正如你可能已经猜到的，我们刚刚声明了一个名为 `a` 的变量，其值为 `10`。

我们还可以在函数内部声明变量：

```ts
function f() {
  var message = "Hello, world!";

  return message;
}
```

我们也可以在其它函数中访问这些相同的变量：

```ts
function f() {
  var a = 10;
  return function g() {
    var b = a + 1;
    return b;
  };
}

var g = f();
g(); // returns '11'
```

在上面的例子中，`g` 捕获了在 `f` 中声明的变量 `a`。
在 `g` 被调用的任何时候，`a` 的值都将与 `f` 中 `a` 的值绑定。
即使 `f` 运行结束后调用 `g`，它仍然能够访问和修改 `a`。

```ts
function f() {
  var a = 1;

  a = 2;
  var b = g();
  a = 3;

  return b;

  function g() {
    return a;
  }
}

f(); // returns '2'
```

### 作用域规则

对于那些习惯使用其他语言的人来说，`var` 声明有一些奇怪的作用域规则。
请看下面的例子：

```ts
function f(shouldInitialize: boolean) {
  if (shouldInitialize) {
    var x = 10;
  }

  return x;
}

f(true); // returns '10'
f(false); // returns 'undefined'
```

有些读者可能会对这个例子感到惊讶。
变量 `x` 是 _在 `if` 块内_ 声明的，但我们却能够从该块外部访问它。
这是因为 `var` 声明可以在其包含的函数、模块、命名空间或全局作用域的任何地方访问——所有这些我们稍后会讲到——而不管包含块是什么。
有些人称之为 _`var` 作用域_ 或 _函数作用域_。
参数也是函数作用域的。

这些作用域规则可能导致几种类型的错误。
它们加剧的一个问题是，多次声明同一个变量并不是错误：

```ts
function sumMatrix(matrix: number[][]) {
  var sum = 0;
  for (var i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (var i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }

  return sum;
}
```

也许对一些有经验的 JavaScript 开发者来说很容易发现，但内部的 `for` 循环会意外地覆盖变量 `i`，因为 `i` 引用的是同一个函数作用域变量。
正如有经验的开发者现在所知道的，类似的 bug 会逃过代码审查，可能成为无尽的挫败来源。

### 变量捕获的怪癖

花几秒钟猜猜下面代码片段的输出是什么：

```ts
for (var i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

对于不熟悉的人来说，`setTimeout` 会尝试在一定的毫秒数后执行一个函数（尽管会等待其他东西停止运行）。

准备好了吗？看看结果：

```
10
10
10
10
10
10
10
10
10
10
```

许多 JavaScript 开发者非常熟悉这种行为，但如果你感到惊讶，你绝对不是一个人。
大多数人期望的输出是

```
0
1
2
3
4
5
6
7
8
9
```

还记得我们之前提到的关于变量捕获的内容吗？
我们传递给 `setTimeout` 的每个函数表达式实际上都引用来自同一作用域的同一个 `i`。

让我们花一分钟考虑一下这意味着什么。
`setTimeout` 会在若干毫秒后运行一个函数，_但只有在_ `for` 循环停止执行之后；
当 `for` 循环停止执行时，`i` 的值是 `10`。
所以每次给定的函数被调用时，它都会打印出 `10`！

一个常见的解决方法是使用 IIFE——立即调用函数表达式——来捕获每次迭代时的 `i`：

```ts
for (var i = 0; i < 10; i++) {
  // capture the current state of 'i'
  // by invoking a function with its current value
  (function (i) {
    setTimeout(function () {
      console.log(i);
    }, 100 * i);
  })(i);
}
```

这种看起来奇怪的模式实际上相当常见。
参数列表中的 `i` 实际上遮蔽了 `for` 循环中声明的 `i`，但由于我们将它们命名为相同的名称，我们不必过多修改循环体。

## `let` 声明

现在你已经发现 `var` 有一些问题，这正是引入 `let` 语句的原因。
除了使用的关键字外，`let` 语句的写法与 `var` 语句相同。

```ts
let hello = "Hello!";
```

关键的区别不在于语法，而在于语义，我们现在就来深入探讨。

### 块级作用域

当使用 `let` 声明变量时，它使用一些人所说的 _词法作用域_ 或 _块级作用域_。
与使用 `var` 声明的变量其作用域泄漏到包含函数不同，块级作用域变量在其最近的包含块或 `for` 循环之外不可见。

```ts
function f(input: boolean) {
  let a = 100;

  if (input) {
    // Still okay to reference 'a'
    let b = a + 1;
    return b;
  }

  // Error: 'b' doesn't exist here
  return b;
}
```

这里，我们有两个局部变量 `a` 和 `b`。
`a` 的作用域限于 `f` 的主体，而 `b` 的作用域限于包含的 `if` 语句块。

在 `catch` 子句中声明的变量也有类似的作用域规则。

```ts
try {
  throw "oh no!";
} catch (e) {
  console.log("Oh well.");
}

// Error: 'e' doesn't exist here
console.log(e);
```

块级作用域变量的另一个特性是，在实际声明之前不能读取或写入它们。
虽然这些变量在其作用域内"存在"，但在声明之前的所有点都是其 _暂时性死区_ 的一部分。
这只是说你不能在 `let` 语句之前访问它们的一种复杂说法，幸运的是 TypeScript 会告诉你这一点。

```ts
a++; // illegal to use 'a' before it's declared;
let a;
```

需要注意的是，你仍然可以在声明之前 _捕获_ 一个块级作用域变量。
唯一的限制是在声明之前调用该函数是非法的。
如果目标是 ES2015，现代运行时会抛出错误；但是，目前 TypeScript 是宽松的，不会将此报告为错误。

```ts
function foo() {
  // okay to capture 'a'
  return a;
}

// illegal call 'foo' before 'a' is declared
// runtimes should throw an error here
foo();

let a;
```

有关暂时性死区的更多信息，请参阅 [Mozilla Developer Network](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/let#Temporal_dead_zone_and_errors_with_let) 上的相关内容。

### 重新声明和遮蔽

对于 `var` 声明，我们提到过无论你声明多少次变量都无所谓；你只会得到一个。

```ts
function f(x) {
  var x;
  var x;

  if (true) {
    var x;
  }
}
```

在上面的例子中，所有对 `x` 的声明实际上都引用 _同一个_ `x`，这是完全有效的。
这往往成为 bug 的来源。
幸运的是，`let` 声明不那么宽容。

```ts
let x = 10;
let x = 20; // error: can't re-declare 'x' in the same scope
```

变量不必都是块级作用域的，TypeScript 也能告诉我们存在问题。

```ts
function f(x) {
  let x = 100; // error: interferes with parameter declaration
}

function g() {
  let x = 100;
  var x = 100; // error: can't have both declarations of 'x'
}
```

这并不是说块级作用域变量永远不能与函数作用域变量一起声明。
块级作用域变量只需要在一个明显不同的块中声明即可。

```ts
function f(condition, x) {
  if (condition) {
    let x = 100;
    return x;
  }

  return x;
}

f(false, 0); // returns '0'
f(true, 0); // returns '100'
```

在更嵌套的作用域中引入新名称的行为称为 _遮蔽_。
它是一把双刃剑，因为如果在意外遮蔽的情况下，它可能会引入某些 bug，同时也能防止某些 bug。
例如，想象一下如果我们使用 `let` 变量编写了之前的 `sumMatrix` 函数。

```ts
function sumMatrix(matrix: number[][]) {
  let sum = 0;
  for (let i = 0; i < matrix.length; i++) {
    var currentRow = matrix[i];
    for (let i = 0; i < currentRow.length; i++) {
      sum += currentRow[i];
    }
  }

  return sum;
}
```

这个版本的循环实际上会正确执行求和，因为内部循环的 `i` 遮蔽了外部循环的 `i`。

为了编写更清晰的代码，_通常_ 应该避免遮蔽。
虽然有一些场景可能适合利用它，但你应该运用你的最佳判断。

### 块级作用域变量捕获

当我们第一次讨论使用 `var` 声明的变量捕获时，我们简要地介绍了变量一旦被捕获后的行为。
为了更好地理解这一点，每次运行作用域时，它都会创建一个变量的"环境"。
该环境及其捕获的变量即使在作用域内的所有内容都执行完毕后也可以存在。

```ts
function theCityThatAlwaysSleeps() {
  let getCity;

  if (true) {
    let city = "Seattle";
    getCity = function () {
      return city;
    };
  }

  return getCity();
}
```

因为我们从它的环境中捕获了 `city`，所以我们仍然能够访问它，尽管 `if` 块已经执行完毕。

回想一下我们之前的 `setTimeout` 例子，我们最终需要使用 IIFE 来捕获 `for` 循环每次迭代时变量的状态。
实际上，我们是在为捕获的变量创建一个新的变量环境。
这有点痛苦，但幸运的是，你在 TypeScript 中再也不需要这样做了。

当作为循环的一部分声明时，`let` 声明具有截然不同的行为。
这些声明不仅仅是为循环本身引入一个新环境，而是在每次迭代时创建一个新作用域。
由于这正是我们用 IIFE 所做的，我们可以将旧的 `setTimeout` 示例改为只使用 `let` 声明。

```ts
for (let i = 0; i < 10; i++) {
  setTimeout(function () {
    console.log(i);
  }, 100 * i);
}
```

正如预期的那样，这将打印出

```
0
1
2
3
4
5
6
7
8
9
```

## `const` 声明

`const` 声明是声明变量的另一种方式。

```ts
const numLivesForCat = 9;
```

它们类似于 `let` 声明，但正如其名称所暗示的，一旦绑定，它们的值就不能被改变。
换句话说，它们具有与 `let` 相同的作用域规则，但你不能对它们重新赋值。

这不应与它们引用的值是 _不可变_ 的概念混淆。

```ts
const numLivesForCat = 9;
const kitty = {
  name: "Aurora",
  numLives: numLivesForCat,
};

// Error
kitty = {
  name: "Danielle",
  numLives: numLivesForCat,
};

// all "okay"
kitty.name = "Rory";
kitty.name = "Kitty";
kitty.name = "Cat";
kitty.numLives--;
```

除非你采取特定措施来避免，`const` 变量的内部状态仍然是可修改的。
幸运的是，TypeScript 允许你指定对象的成员为 `readonly`。
[接口章节](/handbook-v2/object-types) 有详细说明。

## `let` vs. `const`

鉴于我们有两种具有类似作用域语义的声明类型，很自然地会问自己该使用哪一个。
像大多数宽泛的问题一样，答案是：视情况而定。

应用[最小权限原则](https://wikipedia.org/wiki/Principle_of_least_privilege)，除你计划修改的声明外，所有声明都应使用 `const`。
理由是，如果一个变量不需要被写入，在同一代码库工作的其他人不应该能够自动写入该对象，并且需要仔细考虑是否真的需要重新赋值给该变量。
使用 `const` 还能使代码在推理数据流时更具可预测性。

运用你的最佳判断，如果适用的话，与团队其他成员讨论此事。

本手册的大部分内容使用 `let` 声明。

## 解构

TypeScript 具有的另一项 ECMAScript 2015 特性是解构。
有关完整参考，请参阅 [Mozilla Developer Network 上的文章](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)。
在本节中，我们将给出一个简短的概述。

### 数组解构

最简单的解构形式是数组解构赋值：

```ts
let input = [1, 2];
let [first, second] = input;
console.log(first); // outputs 1
console.log(second); // outputs 2
```

这创建了两个名为 `first` 和 `second` 的新变量。
这相当于使用索引，但更加方便：

```ts
first = input[0];
second = input[1];
```

解构也适用于已声明的变量：

```ts
// swap variables
[first, second] = [second, first];
```

以及函数的参数：

```ts
function f([first, second]: [number, number]) {
  console.log(first);
  console.log(second);
}
f([1, 2]);
```

你可以使用 `...` 语法为列表中的剩余项创建一个变量：

```ts
let [first, ...rest] = [1, 2, 3, 4];
console.log(first); // outputs 1
console.log(rest); // outputs [ 2, 3, 4 ]
```

当然，因为这是 JavaScript，你可以直接忽略你不关心的尾部元素：

```ts
let [first] = [1, 2, 3, 4];
console.log(first); // outputs 1
```

或者其他元素：

```ts
let [, second, , fourth] = [1, 2, 3, 4];
console.log(second); // outputs 2
console.log(fourth); // outputs 4
```

### 元组解构

元组可以像数组一样解构；解构变量获得相应元组元素的类型：

```ts
let tuple: [number, string, boolean] = [7, "hello", true];

let [a, b, c] = tuple; // a: number, b: string, c: boolean
```

对超出其元素范围的元组进行解构是错误的：

```ts
let [a, b, c, d] = tuple; // Error, no element at index 3
```

与数组一样，你可以用 `...` 解构元组的其余部分，以获得更短的元组：

```ts
let [a, ...bc] = tuple; // bc: [string, boolean]
let [a, b, c, ...d] = tuple; // d: [], the empty tuple
```

或者忽略尾部元素，或其他元素：

```ts
let [a] = tuple; // a: number
let [, b] = tuple; // b: string
```

### 对象解构

你也可以解构对象：

```ts
let o = {
  a: "foo",
  b: 12,
  c: "bar",
};
let { a, b } = o;
```

这会从 `o.a` 和 `o.b` 创建新变量 `a` 和 `b`。
注意，如果你不需要 `c`，可以跳过它。

与数组解构一样，你可以在没有声明的情况下进行赋值：

```ts
({ a, b } = { a: "baz", b: 101 });
```

注意我们必须用括号包围这个语句。
JavaScript 通常将 `{` 解析为块的开始。

你可以使用 `...` 语法为对象中的剩余项创建一个变量：

```ts
let { a, ...passthrough } = o;
let total = passthrough.b + passthrough.c.length;
```

#### 属性重命名

你也可以给属性不同的名称：

```ts
let { a: newName1, b: newName2 } = o;
```

这里的语法开始变得令人困惑。
你可以将 `a: newName1` 读作"`a` 作为 `newName1`"。
方向是从左到右，就像你写了：

```ts
let newName1 = o.a;
let newName2 = o.b;
```

令人困惑的是，这里的冒号 _不_ 表示类型。
类型，如果你指定的话，仍然需要写在整个解构之后：

```ts
let { a: newName1, b: newName2 }: { a: string; b: number } = o;
```

#### 默认值

默认值允许你在属性为 undefined 时指定一个默认值：

```ts
function keepWholeObject(wholeObject: { a: string; b?: number }) {
  let { a, b = 1001 } = wholeObject;
}
```

在这个例子中，`b?` 表示 `b` 是可选的，所以它可能是 `undefined`。
`keepWholeObject` 现在有一个 `wholeObject` 的变量以及属性 `a` 和 `b`，即使 `b` 是 undefined。

## 函数声明

解构也适用于函数声明。
对于简单情况，这很直接：

```ts
type C = { a: string; b?: number };
function f({ a, b }: C): void {
  // ...
}
```

但对于参数指定默认值更为常见，而使用解构时正确处理默认值可能会很棘手。
首先，你需要记住将模式放在默认值之前。

```ts
function f({ a = "", b = 0 } = {}): void {
  // ...
}
f();
```

> 上面的代码片段是类型推断的一个例子，在手册前面已经解释过了。

然后，你需要记住在解构属性上为可选属性提供默认值，而不是在主初始化器上。
记住 `C` 定义时 `b` 是可选的：

```ts
function f({ a, b = 0 } = { a: "" }): void {
  // ...
}
f({ a: "yes" }); // ok, default b = 0
f(); // ok, default to { a: "" }, which then defaults b = 0
f({}); // error, 'a' is required if you supply an argument
```

谨慎使用解构。
正如前面的例子所示，除了最简单的解构表达式外，其他都会令人困惑。
对于深度嵌套的解构尤其如此，即使没有加上重命名、默认值和类型注解，它也 _真的_ 很难理解。
尽量保持解构表达式小而简单。
你总是可以自己编写解构会生成的赋值语句。

## 展开

展开运算符与解构相反。
它允许你将一个数组展开到另一个数组中，或将一个对象展开到另一个对象中。
例如：

```ts
let first = [1, 2];
let second = [3, 4];
let bothPlus = [0, ...first, ...second, 5];
```

这会给 bothPlus 赋值为 `[0, 1, 2, 3, 4, 5]`。
展开会创建 `first` 和 `second` 的浅拷贝。
它们不会被展开改变。

你也可以展开对象：

```ts
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { ...defaults, food: "rich" };
```

现在 `search` 是 `{ food: "rich", price: "$$", ambiance: "noisy" }`。
对象展开比数组展开更复杂。
与数组展开一样，它从左到右进行，但结果仍然是一个对象。
这意味着在展开对象中靠后的属性会覆盖靠前的属性。
所以如果我们修改前面的例子，在末尾展开：

```ts
let defaults = { food: "spicy", price: "$$", ambiance: "noisy" };
let search = { food: "rich", ...defaults };
```

那么 `defaults` 中的 `food` 属性会覆盖 `food: "rich"`，这不是我们想要的结果。

对象展开还有几个其他令人惊讶的限制。
首先，它只包含对象的
[自身可枚举属性](https://developer.mozilla.org/docs/Web/JavaScript/Enumerability_and_ownership_of_properties)。
基本上，这意味着当你展开对象实例时会丢失方法：

```ts
class C {
  p = 12;
  m() {}
}
let c = new C();
let clone = { ...c };
clone.p; // ok
clone.m(); // error!
```

其次，TypeScript 编译器不允许展开泛型函数中的类型参数。
该功能预计将在未来版本的语言中实现。

## `using` 声明

`using` 声明是 JavaScript 的一项即将推出的功能，它是
[Stage 3 显式资源管理](https://github.com/tc39/proposal-explicit-resource-management)提案的一部分。
`using` 声明非常类似于 `const` 声明，只是它将值绑定的 _生命周期_ 与变量的 _作用域_ 耦合在一起。

当控制退出包含 `using` 声明的块时，会执行声明值的 `[Symbol.dispose]()` 方法，这允许该值执行清理：

```ts
function f() {
  using x = new C();
  doSomethingWith(x);
} // `x[Symbol.dispose]()` is called
```

在运行时，这 _大致_ 相当于以下内容：

```ts
function f() {
  const x = new C();
  try {
    doSomethingWith(x);
  }
  finally {
    x[Symbol.dispose]();
  }
}
```

`using` 声明在避免使用持有原生引用（如文件句柄）的 JavaScript 对象时的内存泄漏方面非常有用

```ts
{
  using file = await openFile();
  file.write(text);
  doSomethingThatMayThrow();
} // `file` is disposed, even if an error is thrown
```

或像追踪这样的作用域操作

```ts
function f() {
  using activity = new TraceActivity("f"); // traces entry into function
  // ...
} // traces exit of function

```

与 `var`、`let` 和 `const` 不同，`using` 声明不支持解构。

### `null` 和 `undefined`

需要注意的是，值可以是 `null` 或 `undefined`，在这种情况下，块结束时不会进行任何处理：

```ts
{
  using x = b ? new C() : null;
  // ...
}
```

这 _大致_ 相当于：

```ts
{
  const x = b ? new C() : null;
  try {
    // ...
  }
  finally {
    x?.[Symbol.dispose]();
  }
}
```

这允许你在声明 `using` 声明时有条件地获取资源，而无需复杂的分支或重复。

### 定义可处置资源

你可以通过实现 `Disposable` 接口来表明你产生的类或对象是可处置的：

```ts
// from the default lib:
interface Disposable {
  [Symbol.dispose](): void;
}

// usage:
class TraceActivity implements Disposable {
  readonly name: string;
  constructor(name: string) {
    this.name = name;
    console.log(`Entering: ${name}`);
  }

  [Symbol.dispose](): void {
    console.log(`Exiting: ${name}`);
  }
}

function f() {
  using _activity = new TraceActivity("f");
  console.log("Hello world!");
}

f();
// prints:
//   Entering: f
//   Hello world!
//   Exiting: f
```

## `await using` 声明

某些资源或操作可能需要异步执行清理。为了适应这种情况，
[显式资源管理](https://github.com/tc39/proposal-explicit-resource-management)提案还引入了
`await using` 声明：

```ts
async function f() {
  await using x = new C();
} // `await x[Symbol.asyncDispose]()` is invoked
```

当控制离开包含块时，`await using` 声明会调用并 _等待_ 其值的 `[Symbol.asyncDispose]()` 方法。这允许异步清理，例如数据库事务执行回滚或提交，
或文件流在关闭前将任何待处理的写入刷新到存储。

与 `await` 一样，`await using` 只能在 `async` 函数或方法中使用，或在模块的顶层使用。

### 定义异步可处置资源

正如 `using` 依赖于 `Disposable` 对象一样，`await using` 依赖于 `AsyncDisposable` 对象：

```ts
// from the default lib:
interface AsyncDisposable {
  [Symbol.asyncDispose]: PromiseLike<void>;
}

// usage:
class DatabaseTransaction implements AsyncDisposable {
  public success = false;
  private db: Database | undefined;

  private constructor(db: Database) {
    this.db = db;
  }

  static async create(db: Database) {
    await db.execAsync("BEGIN TRANSACTION");
    return new DatabaseTransaction(db);
  }

  async [Symbol.asyncDispose]() {
    if (this.db) {
      const db = this.db:
      this.db = undefined;
      if (this.success) {
        await db.execAsync("COMMIT TRANSACTION");
      }
      else {
        await db.execAsync("ROLLBACK TRANSACTION");
      }
    }
  }
}

async function transfer(db: Database, account1: Account, account2: Account, amount: number) {
  using tx = await DatabaseTransaction.create(db);
  if (await debitAccount(db, account1, amount)) {
    await creditAccount(db, account2, amount);
  }
  // if an exception is thrown before this line, the transaction will roll back
  tx.success = true;
  // now the transaction will commit
}
```

### `await using` vs `await`

作为 `await using` 声明一部分的 `await` 关键字仅表示资源的 _处置_ 是
`await`-ed 的。它 *不* `await` 值本身：

```ts
{
  await using x = getResourceSynchronously();
} // performs `await x[Symbol.asyncDispose]()`

{
  await using y = await getResourceAsynchronously();
} // performs `await y[Symbol.asyncDispose]()`
```

### `await using` 和 `return`

需要注意的是，如果你在返回 `Promise` 而没有先 `await` 它的 `async` 函数中使用 `await using` 声明，
这种行为会有一个小问题：

```ts
function g() {
  return Promise.reject("error!");
}

async function f() {
  await using x = new C();
  return g(); // missing an `await`
}
```

由于返回的 promise 没有被 `await`-ed，JavaScript 运行时可能会报告一个未处理的
rejection，因为执行在 `await`-ing `x` 的异步处置时暂停，而没有订阅返回的
promise。然而，这不是 `await using` 独有的问题，因为在使用 `try..finally` 的 `async`
函数中也可能发生这种情况：

```ts
async function f() {
  try {
    return g(); // also reports an unhandled rejection
  }
  finally {
    await somethingElse();
  }
}
```

为避免这种情况，建议你在返回值可能是 `Promise` 时 `await` 它：

```ts
async function f() {
  await using x = new C();
  return await g();
}
```

## `for` 和 `for..of` 语句中的 `using` 和 `await using`

`using` 和 `await using` 都可以在 `for` 语句中使用：

```ts
for (using x = getReader(); !x.eof; x.next()) {
  // ...
}
```

在这种情况下，`x` 的生命周期作用于整个 `for` 语句，只有当控制由于 `break`、`return`、`throw` 或当循环条件为假而离开循环时才会被处置。

除了 `for` 语句外，这两种声明也可以在 `for..of` 语句中使用：

```ts
function * g() {
  yield createResource1();
  yield createResource2();
}

for (using x of g()) {
  // ...
}
```

这里，`x` 在 _每次循环迭代结束时_ 被处置，然后用下一个值重新初始化。这
在消费由生成器逐个产生的资源时特别有用。

## 旧运行时中的 `using` 和 `await using`

只要你使用兼容的 `Symbol.dispose`/`Symbol.asyncDispose` polyfill（例如最近
NodeJS 版本中默认提供的那个），`using` 和 `await using` 声明就可以在针对旧版 ECMAScript 版本时使用。
