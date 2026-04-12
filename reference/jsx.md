---
title: JSX
---

[JSX](https://facebook.github.io/jsx/) 是一种可嵌入的类 XML 语法。
它旨在被转换为有效的 JavaScript，尽管该转换的语义是特定于实现的。
JSX 随着 [React](https://reactjs.org/) 框架的流行而兴起，但后来也出现了其他实现。
TypeScript 支持将 JSX 直接嵌入、类型检查和编译为 JavaScript。

## 基本用法

为了使用 JSX，你必须做两件事。

1. 将文件命名为 `.tsx` 扩展名
2. 启用 [`jsx`](https://www.typescriptlang.org/tsconfig#jsx) 选项

TypeScript 附带了几种 JSX 模式：`preserve`、`react`（经典运行时）、`react-jsx`（自动运行时）、`react-jsxdev`（自动开发运行时）和 `react-native`。
`preserve` 模式将保留 JSX 作为输出的一部分，以供另一个转换步骤进一步处理（例如 [Babel](https://babeljs.io/)）。
此外，输出将具有 `.jsx` 文件扩展名。
`react` 模式将生成 `React.createElement`，在使用前不需要经过 JSX 转换，输出将具有 `.js` 文件扩展名。
`react-native` 模式等同于 `preserve`，因为它保留所有 JSX，但输出将改为具有 `.js` 文件扩展名。

| 模式           | 输入      | 输出                                              | 输出文件扩展名 |
| -------------- | --------- | ------------------------------------------------- | -------------- |
| `preserve`     | `<div />` | `<div />`                                         | `.jsx`         |
| `react`        | `<div />` | `React.createElement("div")`                      | `.js`          |
| `react-native` | `<div />` | `<div />`                                         | `.js`          |
| `react-jsx`    | `<div />` | `_jsx("div", {}, void 0);`                        | `.js`          |
| `react-jsxdev` | `<div />` | `_jsxDEV("div", {}, void 0, false, {...}, this);` | `.js`          |

你可以使用 [`jsx`](https://www.typescriptlang.org/tsconfig#jsx) 命令行标志或 tsconfig.json 文件中相应的 [`jsx`](https://www.typescriptlang.org/tsconfig#jsx) 选项来指定此模式。

> \*注意：你可以使用 [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory) 选项指定在针对 react JSX 生成时要使用的 JSX 工厂函数（默认为 `React.createElement`）

## `as` 运算符

回想一下如何编写类型断言：

```ts
const foo = <Foo>bar;
```

这断言变量 `bar` 具有类型 `Foo`。
由于 TypeScript 也使用尖括号进行类型断言，将其与 JSX 的语法结合会引入某些解析困难。因此，TypeScript 禁止在 `.tsx` 文件中使用尖括号类型断言。

由于上述语法不能在 `.tsx` 文件中使用，应该使用另一种类型断言运算符：`as`。
该示例可以很容易地用 `as` 运算符重写。

```ts
const foo = bar as Foo;
```

`as` 运算符在 `.ts` 和 `.tsx` 文件中都可用，并且与尖括号类型断言风格在行为上完全相同。

## 类型检查

为了理解 JSX 的类型检查，你必须首先了解 _固有元素_（intrinsic elements）和 _基于值的元素_（value-based elements）之间的区别。
给定一个 JSX 表达式 `<expr />`，`expr` 可能指的是环境中固有的东西（例如 DOM 环境中的 `div` 或 `span`）或你创建的自定义组件。
这很重要，原因有二：

1. 对于 React，固有元素生成为字符串（`React.createElement("div")`），而你创建的组件则不是（`React.createElement(MyComponent)`）。
2. JSX 元素中传递的属性的类型应该以不同的方式查找。
   固有元素属性应该 _固有地_ 知道，而组件可能想要指定自己的一组属性。

TypeScript 使用 [与 React 相同的约定](http://facebook.github.io/react/docs/jsx-in-depth.html#html-tags-vs.-react-components) 来区分这些。
固有元素总是以小写字母开头，而基于值的元素总是以大写字母开头。

### `JSX` 命名空间

TypeScript 中的 JSX 由 `JSX` 命名空间进行类型定义。`JSX` 命名空间可以在不同的地方定义，具体取决于 `jsx` 编译器选项。

`jsx` 选项 `preserve`、`react` 和 `react-native` 使用经典运行时的类型定义。这意味着需要一个由 `jsxFactory` 编译器选项确定的变量在作用域内。`JSX` 命名空间应该指定在 JSX 工厂的最顶层标识符上。例如，React 使用默认工厂 `React.createElement`。这意味着它的 `JSX` 命名空间应该定义为 `React.JSX`。

```ts
export function createElement(): any;

export namespace JSX {
  // …
}
```

用户应该始终将 React 导入为 `React`。

```ts
import * as React from 'react';
```

Preact 使用 JSX 工厂 `h`。这意味着它的类型应该定义为 `h.JSX`。

```ts
export function h(props: any): any;

export namespace h.JSX {
  // …
}
```

用户应该使用命名导入来导入 `h`。

```ts
import { h } from 'preact';
```

对于 `jsx` 选项 `react-jsx` 和 `react-jsxdev`，`JSX` 命名空间应该从匹配的入口点导出。对于 `react-jsx`，这是 `${jsxImportSource}/jsx-runtime`。对于 `react-jsxdev`，这是 `${jsxImportSource}/jsx-dev-runtime`。由于这些不使用文件扩展名，你必须在 `package.json` 中使用 [`exports`](https://nodejs.org/api/packages.html#exports) 字段映射以支持 ESM 用户。

```json 
{
  "exports": {
    "./jsx-runtime": "./jsx-runtime.js",
    "./jsx-dev-runtime": "./jsx-dev-runtime.js",
  }
}
```

然后在 `jsx-runtime.d.ts` 和 `jsx-dev-runtime.d.ts` 中：

```ts
export namespace JSX {
  // …
}
```

请注意，虽然导出 `JSX` 命名空间足以进行类型检查，但生产运行时需要在运行时导出 `jsx`、`jsxs` 和 `Fragment`，而开发运行时需要 `jsxDEV` 和 `Fragment`。理想情况下，你也为它们添加类型。

如果 `JSX` 命名空间在适当的位置不可用，经典和自动运行时都会回退到全局 `JSX` 命名空间。

### 固有元素

固有元素在特殊接口 `JSX.IntrinsicElements` 上查找。
默认情况下，如果未指定此接口，则任何元素都可以，固有元素将不会被类型检查。
但是，如果此接口 _存在_，则固有元素的名称将作为属性在 `JSX.IntrinsicElements` 接口上查找。
例如：

```tsx
declare namespace JSX {
  interface IntrinsicElements {
    foo: any;
  }
}

<foo />; // ok
<bar />; // error
```

在上面的示例中，`<foo />` 可以正常工作，但 `<bar />` 会导致错误，因为它没有在 `JSX.IntrinsicElements` 上指定。

> 注意：你也可以在 `JSX.IntrinsicElements` 上指定一个捕获所有字符串索引器，如下所示：

```ts
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
```

### 基于值的元素

基于值的元素只是通过作用域内的标识符来查找。

```tsx
import MyComponent from "./myComponent";

<MyComponent />; // ok
<SomeOtherComponent />; // error
```

有两种方式定义基于值的元素：

1. 函数组件（FC）
2. 类组件

因为这两种类型的基于值的元素在 JSX 表达式中无法区分，所以 TS 首先尝试使用重载解析将表达式解析为函数组件。如果该过程成功，则 TS 将表达式解析完成到其声明。如果该值无法解析为函数组件，TS 将尝试将其解析为类组件。如果失败，TS 将报告错误。

#### 函数组件

顾名思义，该组件被定义为 JavaScript 函数，其第一个参数是 `props` 对象。
TS 强制要求其返回类型必须可赋值给 `JSX.Element`。

```tsx
interface FooProp {
  name: string;
  X: number;
  Y: number;
}

declare function AnotherComponent(prop: { name: string });
function ComponentFoo(prop: FooProp) {
  return <AnotherComponent name={prop.name} />;
}

const Button = (prop: { value: string }, context: { color: string }) => (
  <button />
);
```

因为函数组件只是一个 JavaScript 函数，所以也可以在这里使用函数重载：

```ts twoslash
// @noErrors
declare module JSX {
  interface Element {}
  interface IntrinsicElements {
    [s: string]: any;
  }
}
// ---cut---
interface ClickableProps {
  children: JSX.Element[] | JSX.Element;
}

interface HomeProps extends ClickableProps {
  home: JSX.Element;
}

interface SideProps extends ClickableProps {
  side: JSX.Element | string;
}

function MainButton(prop: HomeProps): JSX.Element;
function MainButton(prop: SideProps): JSX.Element;
function MainButton(prop: ClickableProps): JSX.Element {
  // ...
}
```

> 注意：函数组件以前被称为无状态函数组件（SFC）。由于函数组件在最新版本的 react 中不再被认为是无状态的，因此类型 `SFC` 及其别名 `StatelessComponent` 已被弃用。

#### 类组件

可以定义类组件的类型。
但是，要做到这一点，最好理解两个新术语：_元素类类型_ 和 _元素实例类型_。

给定 `<Expr />`，_元素类类型_ 是 `Expr` 的类型。
所以在上面的示例中，如果 `MyComponent` 是一个 ES6 类，类类型将是该类的构造函数和静态成员。
如果 `MyComponent` 是一个工厂函数，类类型将是该函数。

一旦确定了类类型，实例类型就由类类型的构造或调用签名的返回类型的并集确定（以存在的为准）。
所以同样，在 ES6 类的情况下，实例类型将是该类实例的类型，而在工厂函数的情况下，它将是函数返回的值的类型。

```ts
class MyComponent {
  render() {}
}

// use a construct signature
const myComponent = new MyComponent();

// element class type => MyComponent
// element instance type => { render: () => void }

function MyFactoryFunction() {
  return {
    render: () => {},
  };
}

// use a call signature
const myComponent = MyFactoryFunction();

// element class type => MyFactoryFunction
// element instance type => { render: () => void }
```

元素实例类型很有趣，因为它必须可赋值给 `JSX.ElementClass`，否则将导致错误。
默认情况下 `JSX.ElementClass` 是 `{}`，但它可以被扩充以限制 JSX 的使用仅限于符合适当接口的类型。

```tsx
declare namespace JSX {
  interface ElementClass {
    render: any;
  }
}

class MyComponent {
  render() {}
}
function MyFactoryFunction() {
  return { render: () => {} };
}

<MyComponent />; // ok
<MyFactoryFunction />; // ok

class NotAValidComponent {}
function NotAValidFactoryFunction() {
  return {};
}

<NotAValidComponent />; // error
<NotAValidFactoryFunction />; // error
```

### 属性类型检查

属性类型检查的第一步是确定 _元素属性类型_。
这在固有元素和基于值的元素之间略有不同。

对于固有元素，它是 `JSX.IntrinsicElements` 上属性的类型

```tsx
declare namespace JSX {
  interface IntrinsicElements {
    foo: { bar?: boolean };
  }
}

// element attributes type for 'foo' is '{bar?: boolean}'
<foo bar />;
```

对于基于值的元素，它稍微复杂一些。
它由先前确定的 _元素实例类型_ 上的属性类型确定。
使用哪个属性由 `JSX.ElementAttributesProperty` 确定。
它应该用一个属性声明。
然后使用该属性的名称。
从 TypeScript 2.8 开始，如果未提供 `JSX.ElementAttributesProperty`，则将使用类元素的构造函数或函数组件的调用的第一个参数的类型。

```tsx
declare namespace JSX {
  interface ElementAttributesProperty {
    props; // specify the property name to use
  }
}

class MyComponent {
  // specify the property on the element instance type
  props: {
    foo?: string;
  };
}

// element attributes type for 'MyComponent' is '{foo?: string}'
<MyComponent foo="bar" />;
```

元素属性类型用于类型检查 JSX 中的属性。
支持可选和必需属性。

```tsx
declare namespace JSX {
  interface IntrinsicElements {
    foo: { requiredProp: string; optionalProp?: number };
  }
}

<foo requiredProp="bar" />; // ok
<foo requiredProp="bar" optionalProp={0} />; // ok
<foo />; // error, requiredProp is missing
<foo requiredProp={0} />; // error, requiredProp should be a string
<foo requiredProp="bar" unknownProp />; // error, unknownProp does not exist
<foo requiredProp="bar" some-unknown-prop />; // ok, because 'some-unknown-prop' is not a valid identifier
```

> 注意：如果属性名称不是有效的 JS 标识符（如 `data-*` 属性），则如果未在元素属性类型中找到它，则不会被认为是错误。

此外，`JSX.IntrinsicAttributes` 接口可用于指定 JSX 框架使用的额外属性，这些属性通常不被组件的 props 或参数使用 - 例如 React 中的 `key`。进一步专门化，泛型 `JSX.IntrinsicClassAttributes<T>` 类型也可用于仅为类组件（而非函数组件）指定相同类型的额外属性。在此类型中，泛型参数对应于类实例类型。在 React 中，这用于允许 `ref` 属性类型为 `Ref<T>`。一般来说，这些接口上的所有属性都应该是可选的，除非你希望 JSX 框架的用户需要在每个标签上提供某些属性。

展开运算符也有效：

```tsx
const props = { requiredProp: "bar" };
<foo {...props} />; // ok

const badProps = {};
<foo {...badProps} />; // error
```

### 子元素类型检查

在 TypeScript 2.3 中，TS 引入了对 _子元素_ 的类型检查。_子元素_ 是 _元素属性类型_ 中的一个特殊属性，其中子 *JSXExpression* 被插入到属性中。
类似于 TS 如何使用 `JSX.ElementAttributesProperty` 来确定 _props_ 的名称，TS 使用 `JSX.ElementChildrenAttribute` 来确定这些 props 中 _子元素_ 的名称。
`JSX.ElementChildrenAttribute` 应该用一个属性声明。

```ts
declare namespace JSX {
  interface ElementChildrenAttribute {
    children: {}; // specify children name to use
  }
}
```

```tsx
<div>
  <h1>Hello</h1>
</div>;

<div>
  <h1>Hello</h1>
  World
</div>;

const CustomComp = (props) => <div>{props.children}</div>
<CustomComp>
  <div>Hello World</div>
  {"This is just a JS expression..." + 1000}
</CustomComp>
```

你可以像任何其他属性一样指定 _子元素_ 的类型。这将覆盖默认类型，例如如果你使用 [React 类型](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react)。

```tsx
interface PropsType {
  children: JSX.Element
  name: string
}

class Component extends React.Component<PropsType, {}> {
  render() {
    return (
      <h2>
        {this.props.children}
      </h2>
    )
  }
}

// OK
<Component name="foo">
  <h1>Hello World</h1>
</Component>

// Error: children is of type JSX.Element not array of JSX.Element
<Component name="bar">
  <h1>Hello World</h1>
  <h2>Hello World</h2>
</Component>

// Error: children is of type JSX.Element not array of JSX.Element or string.
<Component name="baz">
  <h1>Hello</h1>
  World
</Component>
```

## JSX 结果类型

默认情况下，JSX 表达式的结果类型为 `any`。
你可以通过指定 `JSX.Element` 接口来自定义类型。
但是，无法从此接口获取有关 JSX 的元素、属性或子元素的类型信息。
它是一个黑盒。

## JSX 函数返回类型

默认情况下，函数组件必须返回 `JSX.Element | null`。然而，这并不总是代表运行时行为。从 TypeScript 5.1 开始，你可以指定 `JSX.ElementType` 来覆盖什么是有效的 JSX 组件类型。请注意，这并不定义哪些 props 是有效的。props 的类型始终由传递的组件的第一个参数定义。默认值看起来像这样：

```ts
namespace JSX {
    export type ElementType =
        // All the valid lowercase tags
        | keyof IntrinsicElements
        // Function components
        | (props: any) => Element
        // Class components
        | new (props: any) => ElementClass;
    export interface IntrinsicAttributes extends /*...*/ {}
    export type Element = /*...*/;
    export type ElementClass = /*...*/;
}
```

## 嵌入表达式

JSX 允许你通过用花括号（`{ }`）包围表达式来在标签之间嵌入表达式。

```tsx
const a = (
  <div>
    {["foo", "bar"].map((i) => (
      <span>{i / 2}</span>
    ))}
  </div>
);
```

上面的代码将导致错误，因为你不能将字符串除以数字。
使用 `preserve` 选项时的输出如下所示：

```tsx
const a = (
  <div>
    {["foo", "bar"].map(function (i) {
      return <span>{i / 2}</span>;
    })}
  </div>
);
```

## React 集成

要将 JSX 与 React 一起使用，你应该使用 [React 类型](https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react)。
这些类型定义了适合与 React 一起使用的 `JSX` 命名空间。

```tsx
/// <reference path="react.d.ts" />

interface Props {
  foo: string;
}

class MyComponent extends React.Component<Props, {}> {
  render() {
    return <span>{this.props.foo}</span>;
  }
}

<MyComponent foo="bar" />; // ok
<MyComponent foo={0} />; // error
```

### 配置 JSX

有多个编译器标志可用于自定义你的 JSX，它们既可以用作编译器标志，也可以通过内联的每文件 pragma 使用。要了解更多信息，请参阅它们的 tsconfig 参考页面：

- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
