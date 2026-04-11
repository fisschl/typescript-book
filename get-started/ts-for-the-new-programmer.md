---
title: 面向新程序员的 TypeScript
---

恭喜你选择 TypeScript 作为你的第一门编程语言——你已经做出了明智的决定！

你可能已经听说过 TypeScript 是 JavaScript 的一种"风味"或"变体"。
TypeScript（TS）与 JavaScript（JS）之间的关系在现代编程语言中相当独特，因此了解更多关于这种关系将帮助你理解 TypeScript 如何为 JavaScript 增添价值。

## 什么是 JavaScript？简史

JavaScript（也称为 ECMAScript）最初是作为浏览器的简单脚本语言而诞生的。
在它被发明的时候，人们期望它被用于嵌入网页的短代码片段——写几十行以上的代码会被认为是不太寻常的。
因此，早期的网页浏览器执行这类代码的速度相当慢。
然而，随着时间的推移，JavaScript 变得越来越流行，网页开发者开始用它来创建交互式体验。

网页浏览器开发者通过优化执行引擎（动态编译）和扩展可执行的功能（添加 API）来应对 JavaScript 使用量的增加，这反过来又让网页开发者更加频繁地使用它。
在现代网站上，你的浏览器经常运行着数十万行代码的应用程序。
这就是"网络"漫长而渐进的发展过程，从一个简单的静态页面网络，演变成一个承载各种丰富应用程序的平台。

除此之外，JavaScript 已经流行到可以在浏览器之外的场景中使用，例如使用 node.js 实现 JavaScript 服务器。
JavaScript "随处可运行"的特性使其成为跨平台开发的诱人选择。
如今有许多开发者只使用 JavaScript 来编写他们的整个技术栈！

总而言之，我们有一种为快速使用而设计的语言，然后发展成为一个编写数百万行应用程序的成熟工具。
每种语言都有自己的*怪癖*——奇特之处和令人惊讶的地方，而 JavaScript 的 humble 开端让它拥有*很多*这样的特性。一些例子：

- JavaScript 的相等运算符（`==`）会*强制转换*其操作数，导致意想不到的行为：

  ```js
  if ("" == 0) {
    // 这是真的！但为什么呢？？
  }
  if (1 < x < 3) {
    // 对于 x 的*任何*值都为真！
  }
  ```

- JavaScript 还允许访问不存在的属性：

  ```js
  const obj = { width: 10, height: 15 };
  // 为什么这是 NaN？拼写太难了！
  const area = obj.width * obj.heigth;
  ```

大多数编程语言在发生这类错误时会抛出错误，有些会在编译时这样做——在代码运行之前。
在编写小程序时，这些怪癖虽然烦人但还可以管理；在编写成百上千行代码的应用程序时，这些持续的意外是一个严重的问题。

## TypeScript：静态类型检查器

我们之前说过，有些语言根本不允许那些有错误的程序运行。
在不运行代码的情况下检测错误被称为*静态检查*。
根据被操作值的类型来判断什么是错误、什么不是错误，被称为静态*类型*检查。

TypeScript 在执行前检查程序中的错误，并且基于*值的类型*来进行检查，这使它成为一个*静态类型检查器*。
例如，上面的最后一个例子有一个错误，是因为 `obj` 的*类型*。
以下是 TypeScript 发现的错误：

```ts twoslash
// @errors: 2551
const obj = { width: 10, height: 15 };
const area = obj.width * obj.heigth;
```

### JavaScript 的类型化超集

那么 TypeScript 与 JavaScript 有什么关系呢？

#### 语法

TypeScript 是 JavaScript 的*超集*：因此 JS 语法在 TS 中是合法的。
语法指的是我们编写文本以形成程序的方式。
例如，这段代码有一个*语法*错误，因为它缺少一个 `)`：

```ts
let a = (4 // Error: ')' expected.
```

TypeScript 不会因为语法而将任何 JavaScript 代码视为错误。
这意味着你可以将任何正常工作的 JavaScript 代码放入 TypeScript 文件中，而不用担心它是如何编写的。

#### 类型

然而，TypeScript 是一个*类型化*的超集，这意味着它添加了关于不同种类的值如何使用的规则。
之前关于 `obj.heigth` 的错误不是*语法*错误：它是以不正确的方式使用某种值（*类型*）的错误。

再举一个例子，这是你可以在你的浏览器中运行的 JavaScript 代码，它*会*输出一个值：

```js
console.log(4 / []);
```

这个语法合法的程序输出 `Infinity`。
然而，TypeScript 认为用数字除以数组是一个无意义的操作，并会发出错误：

```ts twoslash
// @errors: 2363
console.log(4 / []);
```

有可能你真的*确实*打算用数字除以数组，也许只是为了看看会发生什么，但大多数时候，这是一个编程错误。
TypeScript 的类型检查器旨在让正确的程序通过，同时尽可能多地捕获常见错误。
（稍后，我们将学习可用于配置 TypeScript 如何严格检查代码的设置。）

如果你将一些代码从 JavaScript 文件移动到 TypeScript 文件，根据代码的编写方式，你可能会看到*类型错误*。
这些可能是代码的合法问题，也可能是 TypeScript 过于保守。
在本指南中，我们将演示如何添加各种 TypeScript 语法来消除此类错误。

#### 运行时行为

TypeScript 也是一种保留 JavaScript *运行时行为*的编程语言。
例如，在 JavaScript 中除以零会产生 `Infinity` 而不是抛出运行时异常。
作为一项原则，TypeScript **从不**改变 JavaScript 代码的运行时行为。

这意味着如果你将代码从 JavaScript 移动到 TypeScript，它**保证**以相同的方式运行，即使 TypeScript 认为代码有类型错误。

保持与 JavaScript 相同的运行时行为是 TypeScript 的基础承诺，因为这意味着你可以轻松地在两种语言之间转换，而不用担心可能导致程序停止工作的细微差别。

#### 擦除类型

大致来说，一旦 TypeScript 的编译器完成代码检查，它会*擦除*类型以生成最终的"编译后"代码。
这意味着一旦你的代码被编译，生成的纯 JS 代码不包含任何类型信息。

这也意味着 TypeScript 从不根据推断的类型改变程序的*行为*。
底线是，虽然你在编译期间可能会看到类型错误，但类型系统本身对程序运行时的行为没有影响。

最后，TypeScript 不提供任何额外的运行时库。
你的程序将使用与 JavaScript 程序相同的标准库（或外部库），因此没有额外的 TypeScript 特定框架需要学习。

## 学习 JavaScript 和 TypeScript

我们经常看到这个问题："我应该学习 JavaScript 还是 TypeScript？"

答案是，不学习 JavaScript 就无法学习 TypeScript！
TypeScript 与 JavaScript 共享语法和运行时行为，所以你学习的任何关于 JavaScript 的知识都在同时帮助你学习 TypeScript。

有许多许多资源可供程序员学习 JavaScript；如果你正在编写 TypeScript，你*不应该*忽视这些资源。
例如，StackOverflow 上标记为 `javascript` 的问题大约是 `typescript` 的 20 倍，但*所有* `javascript` 问题同样适用于 TypeScript。

如果你发现自己在搜索类似"如何在 TypeScript 中对列表进行排序"的问题，请记住：**TypeScript 是带有编译时类型检查器的 JavaScript 运行时**。
在 TypeScript 中对列表进行排序的方式与在 JavaScript 中完全相同。
如果你找到一个直接使用 TypeScript 的资源，那也很好，但不要局限于认为你需要 TypeScript 特定的答案来解决关于如何完成运行时任务的日常问题。

## 下一步

这是对日常 TypeScript 中使用的语法和工具的简要概述。从这里开始，你可以：

- 学习一些 JavaScript 基础知识，我们推荐以下之一：

  - [Microsoft 的 JavaScript 资源](https://developer.microsoft.com/javascript/) 或
  - [Mozilla Web 文档上的 JavaScript 指南](https://developer.mozilla.org/docs/Web/JavaScript/Guide)

- 继续阅读 [面向 JavaScript 程序员的 TypeScript](/docs/handbook/typescript-in-5-minutes.html)
- 从头到尾阅读完整的[手册](/docs/handbook/intro.html)
- 探索 [Playground 示例](/play#show-examples)
