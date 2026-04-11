---
title: keyof 类型运算符
---

## `keyof` 类型运算符

`keyof` 运算符接受一个对象类型，并生成其键的字符串或数字字面量联合类型。
下面的类型 `P` 与 `type P = "x" | "y"` 是相同的类型：

```ts twoslash
type Point = { x: number; y: number };
type P = keyof Point;
//   ^?
```

如果该类型具有 `string` 或 `number` 索引签名，`keyof` 将返回这些类型：

```ts twoslash
type Arrayish = { [n: number]: unknown };
type A = keyof Arrayish;
//   ^?

type Mapish = { [k: string]: boolean };
type M = keyof Mapish;
//   ^?
```

注意，在这个例子中，`M` 是 `string | number`——这是因为 JavaScript 对象键总是会被强制转换为字符串，所以 `obj[0]` 始终与 `obj["0"]` 相同。

当 `keyof` 类型与映射类型结合使用时会变得特别有用，我们将在后面了解更多。
