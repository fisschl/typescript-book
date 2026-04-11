---
title: 基础
---

JavaScript 中的每个值都有一组可以通过运行不同操作来观察的行为。
这听起来很抽象，但举个简单的例子，考虑一些我们可能在名为 `message` 的变量上运行的操作。

```js
// 访问 'message' 上的 'toLowerCase' 属性，然后调用它
message.toLowerCase();

// 直接调用 'message'
message();
```

如果我们分解一下，第一行可运行的代码访问了一个名为 `toLowerCase` 的属性，然后调用它。
第二行尝试直接调用 `message`。

但假设我们不知道 `message` 的值——这是相当常见的情况——我们无法可靠地说出尝试运行这些代码会得到什么结果。
每个操作的行为完全取决于我们最初拥有的值。

- `message` 是可调用的吗？
- 它上面有名为 `toLowerCase` 的属性吗？
- 如果有，`toLowerCase` 是可调用的吗？
- 如果这两个值都是可调用的，它们返回什么？

这些问题的答案通常是我们写 JavaScript 时记在脑子里的东西，我们必须希望我们把所有细节都弄对了。

假设 `message` 以以下方式定义。

```js
const message = "Hello World!";
```

正如你可能猜到的，如果我们尝试运行 `message.toLowerCase()`，我们会得到同样的字符串，只是小写了。

那第二行代码呢？
如果你熟悉 JavaScript，你会知道这会失败并抛出异常：

```txt
TypeError: message is not a function
```

如果我们能避免这样的错误就好了。

当我们运行代码时，JavaScript 运行时选择做什么的方式是通过确定值的 _类型_ ——它有什么类型的行为和能力。
这就是那个 `TypeError` 所暗示的部分——它说字符串 `"Hello World!"` 不能作为函数调用。

对于某些值，比如基本类型 `string` 和 `number`，我们可以在运行时使用 `typeof` 运算符识别它们的类型。
但对于其他东西，比如函数，没有相应的运行时机制来识别它们的类型。
例如，考虑这个函数：

```js
function fn(x) {
  return x.flip();
}
```

我们可以通过阅读代码 _观察_ 到这个函数只有在给定一个具有可调用的 `flip` 属性的对象时才能工作，但 JavaScript 并没有以我们可以在代码运行时检查的方式暴露这些信息。
在纯 JavaScript 中，告诉 `fn` 对特定值做什么的唯一方法是调用它并看看会发生什么。
这种行为使得在运行代码之前很难预测代码会做什么，这意味着在你编写代码时更难知道你的代码将要做什么。

从这个角度来看， _类型_ 是描述哪些值可以传递给 `fn` 以及哪些会崩溃的概念。
JavaScript 只真正提供 _动态_ 类型——运行代码看看会发生什么。

另一种选择是使用 _静态_ 类型系统，在代码运行 _之前_ 对代码预期做什么进行预测。

## 静态类型检查

回想一下我们之前尝试将 `string` 作为函数调用时得到的 `TypeError`。
_大多数人_ 不喜欢在运行代码时出现任何类型的错误——那些被认为是 bug！
当我们编写新代码时，我们尽最大努力避免引入新的 bug。

如果我们只添加一点代码，保存文件，重新运行代码，并立即看到错误，我们可能能够快速隔离问题；但情况并非总是如此。
我们可能没有足够彻底地测试该功能，所以我们可能永远不会遇到潜在的错误！
或者，如果我们足够幸运地目睹了错误，我们可能最终不得不进行大规模重构并添加很多不同的代码，我们被迫去挖掘。

理想情况下，我们可以有一个工具帮助我们在代码运行 _之前_ 找到这些 bug。
这就是像 TypeScript 这样的静态类型检查器所做的。
_静态类型系统_ 描述了我们运行程序时值的形状和行为。
像 TypeScript 这样的类型检查器使用这些信息，并在事情可能偏离轨道时告诉我们。

```ts twoslash
// @errors: 2349
const message = "hello!";

message();
```

用 TypeScript 运行最后一个示例会在我们第一次运行代码之前就给我们一个错误消息。

## 非异常失败

到目前为止，我们一直在讨论运行时错误之类的事情——JavaScript 运行时告诉我们它认为某些事情毫无意义的情况。
这些情况出现是因为 [ECMAScript 规范](https://tc39.github.io/ecma262/) 有明确的说明，说明当语言遇到意外情况时应该如何表现。

例如，规范说尝试调用不可调用的东西应该抛出错误。
也许这听起来像是"显而易见的行为"但你可以想象，访问对象上不存在的属性也应该抛出错误。
相反，JavaScript 给了我们不同的行为并返回值 `undefined`：

```js
const user = {
  name: "Daniel",
  age: 26,
};

user.location; // 返回 undefined
```

最终，静态类型系统必须决定哪些代码应该在其系统中被标记为错误，即使它是"有效的"JavaScript，不会立即抛出错误。
在 TypeScript 中，以下代码会产生关于 `location` 未定义的错误：

```ts twoslash
// @errors: 2339
const user = {
  name: "Daniel",
  age: 26,
};

user.location;
```

虽然有时这意味着在你可以表达的内容上需要权衡，但目的是捕捉我们程序中的合法 bug。
而 TypeScript 能捕捉 _很多_ 合法 bug。

例如：拼写错误，

```ts twoslash
// @noErrors
const announcement = "Hello World!";

// 你能多快发现拼写错误？
announcement.toLocaleLowercase();
announcement.toLocalLowerCase();

// 我们可能想写的是这个...
announcement.toLocaleLowerCase();
```

未调用的函数，

```ts twoslash
// @errors: 2365 6133
function flipCoin() {
  // 应该是 Math.random()
  return Math.random < 0.5;
}
```

或基本逻辑错误。

```ts twoslash
// @errors: 2367
const value = Math.random() < 0.5 ? "a" : "b";
if (value !== "a") {
  // ...
} else if (value === "b") {
  // 哎呀，不可达
}
```

## 工具的类型

TypeScript 可以在我们在代码中犯错时捕捉 bug。
这很好，但 TypeScript 也可以 _阻止_ 我们犯这些错误。

类型检查器有信息来检查我们是否正在访问变量和其他属性的正确属性。
一旦它有了这些信息，它也可以开始 _建议_ 你可能想要使用哪些属性。

这意味着 TypeScript 也可以用于编辑代码，核心类型检查器可以在编辑器中输入时提供错误消息和代码补全。
这就是人们谈论 TypeScript 中的工具时经常提到的部分。

<!-- prettier-ignore -->
```ts twoslash
// @noErrors
// @esModuleInterop
import express from "express";
const app = express();

app.get("/", function (req, res) {
  res.sen
//       ^|
});

app.listen(3000);
```

TypeScript 认真对待工具，这超越了输入时的补全和错误。
支持 TypeScript 的编辑器可以提供"快速修复"来自动修复错误，重构以轻松重新组织代码，以及有用的导航功能，用于跳转到变量的定义，或查找对给定变量的所有引用。
所有这些都是建立在类型检查器之上的，并且完全跨平台，所以很可能[你喜欢的编辑器有可用的 TypeScript 支持](https://github.com/Microsoft/TypeScript/wiki/TypeScript-Editor-Support)。

## `tsc`，TypeScript 编译器

我们一直在谈论类型检查，但我们还没有使用我们的类型 _检查器_。
让我们认识一下我们的新朋友 `tsc`，TypeScript 编译器。
首先我们需要通过 npm 获取它。

```sh
npm install -g typescript
```

> 这会全局安装 TypeScript 编译器 `tsc`。
> 如果你更愿意从本地 `node_modules` 包运行 `tsc`，你可以使用 `npx` 或类似的工具。

现在让我们移动到一个空文件夹，尝试编写我们的第一个 TypeScript 程序：`hello.ts`：

```ts twoslash
// 向世界问好。
console.log("Hello world!");
```

注意这里没有花哨的东西；这个 "hello world" 程序看起来与你为 "hello world" 程序编写的 JavaScript 完全相同。
现在让我们通过运行 `typescript` 包为我们安装的 `tsc` 命令来类型检查它。

```sh
tsc hello.ts
```

好了！

等等，"好了" _什么_？
我们运行了 `tsc`，什么也没发生！
好吧，没有类型错误，所以我们在控制台没有得到任何输出，因为没有什么要报告的。

但再检查一下——我们得到了一些 _文件_ 输出。
如果我们查看当前目录，我们会看到 `hello.ts` 旁边有一个 `hello.js` 文件。
那是我们的 `hello.ts` 文件在 `tsc` _编译_ 或 _转换_ 成纯 JavaScript 文件后的输出。
如果我们检查内容，我们会看到 TypeScript 处理 `.ts` 文件后输出的内容：

```js
// 向世界问好。
console.log("Hello world!");
```

在这种情况下，TypeScript 需要转换的内容很少，所以它看起来与我们写的完全相同。
编译器尝试生成看起来像是人写的干净可读的代码。
虽然这并不总是那么容易，但 TypeScript 缩进一致，注意我们的代码何时跨越多行，并试图保留注释。

如果我们 _确实_ 引入了类型检查错误呢？
让我们重写 `hello.ts`：

```ts twoslash
// @noErrors
// 这是一个工业级的通用问候函数：
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date}!`);
}

greet("Brendan");
```

如果我们再次运行 `tsc hello.ts`，注意我们在命令行上得到了一个错误！

```txt
Expected 2 arguments, but got 1.
```

TypeScript 告诉我们忘记给 `greet` 函数传递参数了，这是理所当然的。
到目前为止，我们只写了标准的 JavaScript，但类型检查仍然能够发现我们代码中的问题。
谢谢 TypeScript！

## 出错时仍生成代码

你可能没有注意到上一件事，就是我们的 `hello.js` 文件又变了。
如果我们打开那个文件，我们会看到内容仍然基本上与我们的输入文件相同。
这可能有点令人惊讶，因为 `tsc` 报告了我们代码的错误，但这是基于 TypeScript 的核心价值观之一：很多时候， _你_ 会比 TypeScript 更清楚。

重申一下，类型检查代码限制了你可运行的程序类型，因此在类型检查器认为可接受的内容上需要权衡。
大多数时候这没问题，但在某些情况下，这些检查会碍事。
例如，想象你自己将 JavaScript 代码迁移到 TypeScript 并引入类型检查错误。
最终你会清理类型检查器的问题，但原来的 JavaScript 代码已经在工作了！
为什么把它转换成 TypeScript 会阻止你运行它呢？

所以 TypeScript 不会妨碍你。
当然，随着时间的推移，你可能想要对错误更加防御，让 TypeScript 表现得更严格一些。
在这种情况下，你可以使用 [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError) 编译器选项。
尝试修改你的 `hello.ts` 文件并用该标志运行 `tsc`：

```sh
tsc --noEmitOnError hello.ts
```

你会注意到 `hello.js` 永远不会被更新。

## 显式类型

到目前为止，我们还没有告诉 TypeScript `person` 或 `date` 是什么。
让我们编辑代码，告诉 TypeScript `person` 是一个 `string`，`date` 应该是一个 `Date` 对象。
我们还将使用 `date` 上的 `toDateString()` 方法。

```ts twoslash
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
```

我们所做的是在 `person` 和 `date` 上添加 _类型注解_ ，描述 `greet` 可以用什么类型的值调用。
你可以将该签名理解为"`greet` 接受一个类型为 `string` 的 `person`，和一个类型为 `Date` 的 `date`"。

有了这些，TypeScript 可以告诉我们 `greet` 可能被错误调用的其他情况。
例如...

```ts twoslash
// @errors: 2345
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", Date());
```

嗯？
TypeScript 在我们的第二个参数上报告了错误，但为什么呢？

也许令人惊讶的是，在 JavaScript 中调用 `Date()` 返回一个 `string`。
另一方面，用 `new Date()` 构造一个 `Date` 实际上给了我们期望的结果。

无论如何，我们可以快速修复错误：

```ts twoslash {4}
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", new Date());
```

请记住，我们并不总是必须写显式类型注解。
在很多情况下，TypeScript 甚至可以为我们 _推断_ （或"找出"）类型，即使我们省略了它们。

```ts twoslash
let msg = "hello there!";
```

即使我们没有告诉 TypeScript `msg` 的类型是 `string`，它也能推断出来。
这是一个特性，当类型系统最终会推断出相同类型时， _最好_ 不要添加注解。

> 注意：前面代码示例中的消息气泡是如果你将鼠标悬停在单词上时编辑器会显示的内容。

## 擦除的类型

让我们看看当我们用 `tsc` 编译上面的 `greet` 函数以输出 JavaScript 时会发生什么：

```ts twoslash
// @showEmit
// @target: es5
function greet(person: string, date: Date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}

greet("Maddison", new Date());
```

注意这里的两件事：

1. 我们的 `person` 和 `date` 参数不再有类型注解。
2. 我们的"模板字符串"——那个使用反引号（`` ` `` 字符）的字符串——被转换为带有连接的普通字符串。

稍后再说第二点，现在让我们关注第一点。
类型注解不是 JavaScript（或者准确地说 ECMAScript）的一部分，所以实际上没有任何浏览器或其他运行时可以直接运行未经修改的 TypeScript。
这就是为什么 TypeScript 首先需要一个编译器——它需要某种方式来剥离或转换任何 TypeScript 特定的代码，以便你可以运行它。
大多数 TypeScript 特定的代码都会被擦除，同样，这里我们的类型注解也被完全擦除了。

> **记住**：类型注解永远不会改变程序的运行时行为。

## 降级

上面的另一个区别是我们的模板字符串被重写了

```js
`Hello ${person}, today is ${date.toDateString()}!`;
```

变成

```js
"Hello ".concat(person, ", today is ").concat(date.toDateString(), "!");
```

为什么会这样？

模板字符串是一个来自名为 ECMAScript 2015（又名 ECMAScript 6、ES2015、ES6 等—— _别问_ ）的 ECMAScript 版本的特性。
TypeScript 有能力将代码从较新版本的 ECMAScript 重写为较旧的版本，如 ECMAScript 3 或 ECMAScript 5（又名 ES5）。
这种从较新或"较高"版本的 ECMAScript 移动到较旧或"较低"版本的过程有时被称为 _降级_ 。

默认情况下，TypeScript 目标是 ES5，一个极其古老的 ECMAScript 版本。
我们可以使用 [`target`](https://www.typescriptlang.org/tsconfig#target) 选项选择更近期的版本。
使用 `--target es2015` 运行会将 TypeScript 更改为目标 ECMAScript 2015，意味着代码应该能够在支持 ECMAScript 2015 的任何地方运行。
所以运行 `tsc --target es2015 hello.ts` 给我们以下输出：

```js
function greet(person, date) {
  console.log(`Hello ${person}, today is ${date.toDateString()}!`);
}
greet("Maddison", new Date());
```

> 虽然默认目标是 ES5，但绝大多数当前浏览器支持 ES2015。
> 因此，除非与某些古老浏览器的兼容性很重要，否则大多数开发者可以安全地将 ES2015 或更高版本指定为目标。

## 严格性

不同的用户来寻找 TypeScript 时期望类型检查器提供不同的东西。
有些人正在寻找更宽松的渐进式体验，可以帮助验证他们程序的某些部分，并且仍然拥有不错的工具。
这是 TypeScript 的默认体验，类型是可选的，推断采用最宽松的类型，并且不检查潜在的 `null`/`undefined` 值。
就像 `tsc` 在面对错误时仍生成输出一样，这些默认设置是为了不碍你的事。
如果你正在迁移现有的 JavaScript，这可能是理想的第一步。

相比之下，很多用户更喜欢让 TypeScript 立即尽可能多地验证，这就是该语言也提供严格性设置的原因。
这些严格性设置将静态类型检查从开关（要么检查你的代码，要么不检查）变成更接近旋钮的东西。
你把旋钮转得越高，TypeScript 为你检查的东西就越多。
这可能需要一点额外的工作，但一般来说，从长远来看，这是值得的，并且可以实现更彻底的检查和更准确的工具。
如果可能的话，新代码库应该始终打开这些严格性检查。

TypeScript 有几个可以打开或关闭的类型检查严格性标志，除非另有说明，否则我们所有的示例都将启用所有这些标志。
CLI 中的 [`strict`](https://www.typescriptlang.org/tsconfig#strict) 标志，或 [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) 中的 `"strict": true` 会同时切换它们，但我们可以单独选择退出。
你应该了解的两个最重要的是 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 和 [`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks)。

## `noImplicitAny`

回想一下，在某些地方，TypeScript 不会尝试为我们推断类型，而是回退到最宽松的类型： `any` 。
这并不是可能发生的最糟糕的事情——毕竟，回退到 `any` 只是普通的 JavaScript 体验。

然而，使用 `any` 往往会违背最初使用 TypeScript 的目的。
你的程序类型越多，你将获得的验证和工具就越多，意味着你在编码时会遇到更少的 bug。
打开 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 标志会对任何类型被隐式推断为 `any` 的变量发出错误。

## `strictNullChecks`

默认情况下，像 `null` 和 `undefined` 这样的值可以赋值给任何其他类型。
这可以使编写某些代码更容易，但忘记处理 `null` 和 `undefined` 是世界上无数 bug 的原因——有些人认为这是一个[十亿美元的错误](https://www.youtube.com/watch?v=ybrQvs4x0Ps)！
[`strictNullChecks`](https://www.typescriptlang.org/tsconfig#strictNullChecks) 标志使处理 `null` 和 `undefined` 更加明确，并 _让我们_ 免于担心是否 _忘记_ 处理 `null` 和 `undefined`。
