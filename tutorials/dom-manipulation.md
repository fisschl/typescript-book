---
title: DOM 操作
---

## DOM 操作

### _探索 `HTMLElement` 类型_

自标准化以来的 20 多年里，JavaScript 已经取得了长足的进步。虽然在 2020 年，JavaScript 可以用于服务器、数据科学甚至物联网设备，但重要的是要记住它最流行的用例：Web 浏览器。

网站由 HTML 和/或 XML 文档组成。这些文档是静态的，不会改变。_文档对象模型（DOM）_ 是浏览器实现的一个编程接口，用于使静态网站具有交互功能。DOM API 可用于更改文档结构、样式和内容。这个 API 如此强大，以至于无数前端框架（jQuery、React、Angular 等）都围绕它开发，使动态网站更易于开发。

TypeScript 是 JavaScript 的类型化超集，它内置了 DOM API 的类型定义。这些定义在任何默认的 TypeScript 项目中都随时可用。在 _lib.dom.d.ts_ 的 20,000 多行定义中，有一个格外突出：`HTMLElement`。这个类型是 TypeScript 进行 DOM 操作的基础。

> 你可以探索 [DOM 类型定义](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) 的源代码

## 基本示例

给定一个简化的 _index.html_ 文件：

```html
<!DOCTYPE html>
<html lang="en">
  <head><title>TypeScript Dom Manipulation</title></head>
  <body>
    <div id="app"></div>
    <!-- Assume index.js is the compiled output of index.ts -->
    <script src="index.js"></script>
  </body>
</html>
```

让我们探索一个 TypeScript 脚本，它向 `#app` 元素添加一个 `<p>Hello, World!</p>` 元素。

```ts twoslash
// 1. Select the div element using the id property
const app = document.getElementById("app");

// 2. Create a new <p></p> element programmatically
const p = document.createElement("p");

// 3. Add the text content
p.textContent = "Hello, World!";

// 4. Append the p element to the div element
app?.appendChild(p);
```

在编译并运行 _index.html_ 页面后，生成的 HTML 将是：

```html
<div id="app">
  <p>Hello, World!</p>
</div>
```

## `Document` 接口

TypeScript 代码的第一行使用了一个全局变量 `document`。检查该变量可以发现它是由 _lib.dom.d.ts_ 文件中的 `Document` 接口定义的。代码片段中包含对两个方法的调用：`getElementById` 和 `createElement`。

### `Document.getElementById`

该方法的定义如下：

```ts
getElementById(elementId: string): HTMLElement | null;
```

传入一个元素 id 字符串，它将返回 `HTMLElement` 或 `null`。这个方法引入了一个最重要的类型 `HTMLElement`。它作为所有其他元素接口的基础接口。例如，代码示例中的 `p` 变量类型为 `HTMLParagraphElement`。另外，请注意这个方法可能返回 `null`。这是因为该方法在运行前无法确定是否真的能找到指定的元素。在代码片段的最后一行，使用新的 _可选链_ 操作符来调用 `appendChild`。

### `Document.createElement`

该方法的定义如下（我省略了 _已弃用_ 的定义）：

```ts
createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K];
createElement(tagName: string, options?: ElementCreationOptions): HTMLElement;
```

这是一个重载函数定义。第二个重载最简单，与 `getElementById` 方法的工作方式类似。传入任意 `string`，它将返回一个标准的 HTMLElement。这个定义使开发者能够创建独特的 HTML 元素标签。

例如，`document.createElement('xyz')` 返回一个 `<xyz></xyz>` 元素，显然这不是 HTML 规范中指定的元素。

> 对于感兴趣的人，你可以使用 `document.getElementsByTagName` 与自定义标签元素交互

对于 `createElement` 的第一个定义，它使用了一些高级的泛型模式。最好将其分解成块来理解，从泛型表达式开始：`<K extends keyof HTMLElementTagNameMap>`。这个表达式定义了一个泛型参数 `K`，它被 _约束_ 为接口 `HTMLElementTagNameMap` 的键。这个映射接口包含了每一个指定的 HTML 标签名称及其对应的类型接口。例如，以下是前 5 个映射值：

```ts
interface HTMLElementTagNameMap {
    "a": HTMLAnchorElement;
    "abbr": HTMLElement;
    "address": HTMLElement;
    "applet": HTMLAppletElement;
    "area": HTMLAreaElement;
        ...
}
```

有些元素没有独特的属性，因此它们只返回 `HTMLElement`，但其他类型确实有独特的属性和方法，所以它们返回其特定的接口（该接口将从 `HTMLElement` 扩展或实现）。

现在，来看 `createElement` 定义的其余部分：`(tagName: K, options?: ElementCreationOptions): HTMLElementTagNameMap[K]`。第一个参数 `tagName` 被定义为泛型参数 `K`。TypeScript 解释器足够智能，可以从此参数 _推断_ 出泛型参数。这意味着开发者在使用该方法时不必指定泛型参数；传递给 `tagName` 参数的任何值都将被推断为 `K`，因此可以在定义的其余部分使用。这正是发生的事情；返回值 `HTMLElementTagNameMap[K]` 接受 `tagName` 参数并使用它返回相应的类型。这个定义就是代码片段中的 `p` 变量如何获得 `HTMLParagraphElement` 类型的。如果代码是 `document.createElement('a')`，那么它将是 `HTMLAnchorElement` 类型的元素。

## `Node` 接口

`document.getElementById` 函数返回一个 `HTMLElement`。`HTMLElement` 接口扩展了 `Element` 接口，而 `Element` 接口又扩展了 `Node` 接口。这种原型扩展允许所有 `HTMLElement` 使用一组标准方法。在代码片段中，我们使用定义在 `Node` 接口上的属性将新的 `p` 元素追加到网站中。

### `Node.appendChild`

代码片段的最后一行是 `app?.appendChild(p)`。前面的 `document.getElementById` 部分详细介绍了这里使用 _可选链_ 操作符是因为 `app` 在运行时可能为 null。`appendChild` 方法定义如下：

```ts
appendChild<T extends Node>(newChild: T): T;
```

这个方法的工作方式与 `createElement` 方法类似，因为泛型参数 `T` 是从 `newChild` 参数推断出来的。`T` 被 _约束_ 为另一个基础接口 `Node`。

## `children` 和 `childNodes` 的区别

前面，本文档详细介绍了 `HTMLElement` 接口从 `Element` 扩展，而 `Element` 又从 `Node` 扩展。在 DOM API 中，有一个 _子元素_ 的概念。例如，在以下 HTML 中，`p` 标签是 `div` 元素的子元素

```tsx
<div>
  <p>Hello, World</p>
  <p>TypeScript!</p>
</div>;

const div = document.getElementsByTagName("div")[0];

div.children;
// HTMLCollection(2) [p, p]

div.childNodes;
// NodeList(2) [p, p]
```

捕获 `div` 元素后，`children` 属性将返回一个包含 `HTMLParagraphElements` 的 `HTMLCollection` 列表。`childNodes` 属性将返回一个类似的 `NodeList` 节点列表。每个 `p` 标签仍然是 `HTMLParagraphElements` 类型，但 `NodeList` 可以包含 `HTMLCollection` 列表无法包含的额外 _HTML 节点_。

通过删除其中一个 `p` 标签但保留文本来修改 HTML。

```tsx
<div>
  <p>Hello, World</p>
  TypeScript!
</div>;

const div = document.getElementsByTagName("div")[0];

div.children;
// HTMLCollection(1) [p]

div.childNodes;
// NodeList(2) [p, text]
```

看看两个列表如何变化。`children` 现在只包含 `<p>Hello, World</p>` 元素，而 `childNodes` 包含一个 `text` 节点而不是两个 `p` 节点。`NodeList` 的 `text` 部分是包含文本 `TypeScript!` 的字面量 `Node`。`children` 列表不包含这个 `Node`，因为它不被认为是 `HTMLElement`。

## `querySelector` 和 `querySelectorAll` 方法

这两个方法都是获取符合更独特约束条件的 DOM 元素列表的好工具。它们在 _lib.dom.d.ts_ 中定义如下：

```ts
/**
 * Returns the first element that is a descendant of node that matches selectors.
 */
querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null;
querySelector<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null;
querySelector<E extends Element = Element>(selectors: string): E | null;

/**
 * Returns all element descendants of node that match selectors.
 */
querySelectorAll<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
querySelectorAll<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
querySelectorAll<E extends Element = Element>(selectors: string): NodeListOf<E>;
```

`querySelectorAll` 定义与 `getElementsByTagName` 类似，只是它返回一个新类型：`NodeListOf`。这个返回类型本质上是标准 JavaScript 列表元素的自定义实现。可以说，将 `NodeListOf<E>` 替换为 `E[]` 会产生非常相似的用户体验。`NodeListOf` 只实现以下属性和方法：`length`、`item(index)`、`forEach((value, key, parent) => void)` 和数字索引。此外，这个方法返回一个 _元素_ 列表，而不是 _节点_，而 `.childNodes` 方法返回的是 `NodeList`。虽然这可能看起来不一致，但请注意接口 `Element` 是从 `Node` 扩展的。

要查看这些方法的实际应用，请将现有代码修改为：

```tsx
<ul>
  <li>First :)</li>
  <li>Second!</li>
  <li>Third times a charm.</li>
</ul>;

const first = document.querySelector("li"); // returns the first li element
const all = document.querySelectorAll("li"); // returns the list of all li elements
```

## 有兴趣了解更多？

_lib.dom.d.ts_ 类型定义最棒的一点是它们反映了 Mozilla 开发者网络（MDN）文档站点中注解的类型。例如，`HTMLElement` 接口由 MDN 上的这个 [HTMLElement 页面](https://developer.mozilla.org/docs/Web/API/HTMLElement) 记录。这些页面列出了所有可用的属性、方法，有时甚至还有示例。这些页面的另一个优点是它们提供了指向相应标准文档的链接。这里是 [W3C 对 HTMLElement 的推荐标准](https://www.w3.org/TR/html52/dom.html#htmlelement) 的链接。

来源：

- [ECMA-262 标准](http://www.ecma-international.org/ecma-262/10.0/index.html)
- [DOM 简介](https://developer.mozilla.org/docs/Web/API/Document_Object_Model/Introduction)
