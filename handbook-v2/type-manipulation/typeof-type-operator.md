---
title: typeof 类型运算符
---

## `typeof` 类型运算符

JavaScript 已经有一个可以在 _表达式_ 上下文中使用的 `typeof` 运算符：

```ts twoslash
// 打印 "string"
console.log(typeof "Hello world");
```

TypeScript 添加了一个可以在 _类型_ 上下文中使用的 `typeof` 运算符，用于引用变量或属性的 _类型_：

```ts twoslash
let s = "hello";
let n: typeof s;
//  ^?
```

这对于基本类型来说不是很有用，但与其他类型运算符结合使用时，可以方便地表达许多模式。
举个例子，让我们先看看预定义类型 `ReturnType<T>`。
它接受一个 _函数类型_ 并生成其返回类型：

```ts twoslash
type Predicate = (x: unknown) => boolean;
type K = ReturnType<Predicate>;
//   ^?
```

如果我们尝试在函数名上使用 `ReturnType`，会看到一个有启发性的错误：

```ts twoslash
// @errors: 2749
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<f>;
```

记住 _值_ 和 _类型_ 不是同一个东西。
要引用 _值 `f`_ 所拥有的 _类型_，我们使用 `typeof`：

```ts twoslash
function f() {
  return { x: 10, y: 3 };
}
type P = ReturnType<typeof f>;
//   ^?
```

### 限制

TypeScript 有意限制了可以使用 `typeof` 的表达式种类。

具体来说，只对标识符（即变量名）或其属性使用 `typeof` 才是合法的。
这有助于避免陷入编写你以为在执行、但实际并没有的代码的困惑：

```ts twoslash
// @errors: 1005
declare const msgbox: (prompt: string) => boolean;
// type msgbox = any;
// ---cut---
// 本意是使用 = ReturnType<typeof msgbox>
let shouldContinue: typeof msgbox("Are you sure you want to continue?");
```
