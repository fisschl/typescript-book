---
title: 注意事项
---

## 通用类型

### `Number`、`String`、`Boolean`、`Symbol` 和 `Object`

❌ **不要** 使用类型 `Number`、`String`、`Boolean`、`Symbol` 或 `Object`
这些类型指的是非原始包装对象，在 JavaScript 代码中几乎从未被正确使用。

```ts
/* WRONG */
function reverse(s: String): String;
```

✅ **应该** 使用类型 `number`、`string`、`boolean` 和 `symbol`。

```ts
/* OK */
function reverse(s: string): string;
```

不要使用 `Object`，而是使用非原始的 `object` 类型（[在 TypeScript 2.2 中添加](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#object-type)）。

### 泛型

❌ **不要** 让泛型不使用其类型参数。
更多详情请参见 [TypeScript FAQ 页面](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-type-inference-work-on-this-interface-interface-foot--)。

### any

❌ **不要** 使用 `any` 作为类型，除非你正在将 JavaScript 项目迁移到 TypeScript。编译器 _实际上_ 将 `any` 视为 "请对此项关闭类型检查"。这类似于在该变量的每个使用处放置 `@ts-ignore` 注释。这在首次将 JavaScript 项目迁移到 TypeScript 时非常有帮助，因为你可以将尚未迁移的内容的类型设置为 `any`，但在完整的 TypeScript 项目中，你正在禁用程序中使用它的任何部分的类型检查。

在你不知道要接受什么类型，或者你想接受任何东西因为你将盲目传递它而不与之交互的情况下，你可以使用 [`unknown`](https://www.typescriptlang.org/play/#example/unknown-and-never)。

<!-- TODO: More -->

## 回调类型

### 回调的返回类型

<!-- TODO: Reword; these examples make no sense in the context of a declaration file -->

❌ **不要** 对值将被忽略的回调使用返回类型 `any`：

```ts
/* WRONG */
function fn(x: () => any) {
  x();
}
```

✅ **应该** 对值将被忽略的回调使用返回类型 `void`：

```ts
/* OK */
function fn(x: () => void) {
  x();
}
```

❔ **原因：** 使用 `void` 更安全，因为它可以防止你以未检查的方式意外使用 `x` 的返回值：

```ts
function fn(x: () => void) {
  var k = x(); // oops! meant to do something else
  k.doSomething(); // error, but would be OK if the return type had been 'any'
}
```

### 回调中的可选参数

❌ **不要** 在回调中使用可选参数，除非你真的需要：

```ts
/* WRONG */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime?: number) => void): void;
}
```

这有一个非常具体的含义：`done` 回调可能用 1 个参数调用，也可能用 2 个参数调用。
作者可能想表达的是回调可能不关心 `elapsedTime` 参数，
但不需要将参数设为可选来实现这一点——
提供一个接受更少参数的回调总是合法的。

✅ **应该** 将回调参数写为非可选的：

```ts
/* OK */
interface Fetcher {
  getObject(done: (data: unknown, elapsedTime: number) => void): void;
}
```

### 重载和回调

❌ **不要** 编写仅在回调参数数量上不同的单独重载：

```ts
/* WRONG */
declare function beforeAll(action: () => void, timeout?: number): void;
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

✅ **应该** 使用最大参数数量编写单个重载：

```ts
/* OK */
declare function beforeAll(
  action: (done: DoneFn) => void,
  timeout?: number
): void;
```

❔ **原因：** 回调忽略参数总是合法的，所以不需要更短的重载。
先提供更短的回调允许传入类型不正确的函数，因为它们匹配第一个重载。

## 函数重载

### 排序

❌ **不要** 将更通用的重载放在更具体的重载之前：

```ts
/* WRONG */
declare function fn(x: unknown): unknown;
declare function fn(x: HTMLElement): number;
declare function fn(x: HTMLDivElement): string;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: unknown, wat?
```

✅ **应该** 通过将更具体的签名放在更通用的签名之后来排序重载：

```ts
/* OK */
declare function fn(x: HTMLDivElement): string;
declare function fn(x: HTMLElement): number;
declare function fn(x: unknown): unknown;

var myElem: HTMLDivElement;
var x = fn(myElem); // x: string, :)
```

❔ **原因：** TypeScript 在解析函数调用时选择 _第一个匹配的重载_。
当较早的重载比较晚的重载 "更通用" 时，较晚的重载实际上被隐藏且无法被调用。

### 使用可选参数

❌ **不要** 编写仅在尾部参数上不同的多个重载：

```ts
/* WRONG */
interface Example {
  diff(one: string): number;
  diff(one: string, two: string): number;
  diff(one: string, two: string, three: boolean): number;
}
```

✅ **应该** 尽可能使用可选参数：

```ts
/* OK */
interface Example {
  diff(one: string, two?: string, three?: boolean): number;
}
```

请注意，只有当所有重载具有相同的返回类型时，才应该进行这种合并。

❔ **原因：** 这很重要，有两个原因。

TypeScript 通过检查目标的任何签名是否可以用源的参数调用来解析签名兼容性，
_并且允许额外参数_。
例如，这段代码只有在签名正确使用可选参数编写时才会暴露 bug：

```ts
function fn(x: (a: string, b: number, c: number) => void) {}
var x: Example;
// When written with overloads, OK -- used first overload
// When written with optionals, correctly an error
fn(x.diff);
```

第二个原因是当消费者使用 TypeScript 的 "严格空值检查" 功能时。
因为未指定的参数在 JavaScript 中显示为 `undefined`，所以通常可以向带有可选参数的函数传递显式的 `undefined`。
例如，这段代码在严格空值下应该是可以的：

```ts
var x: Example;
// When written with overloads, incorrectly an error because of passing 'undefined' to 'string'
// When written with optionals, correctly OK
x.diff("something", true ? undefined : "hour");
```

### 使用联合类型

❌ **不要** 编写仅在单个参数位置上类型不同的重载：

```ts
/* WRONG */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number): Moment;
  utcOffset(b: string): Moment;
}
```

✅ **应该** 尽可能使用联合类型：

```ts
/* OK */
interface Moment {
  utcOffset(): number;
  utcOffset(b: number | string): Moment;
}
```

请注意，我们没有在这里将 `b` 设为可选，因为签名的返回类型不同。

❔ **原因：** 这对 "传递" 值给你的函数的人来说很重要：

```ts
function fn(x: string): Moment;
function fn(x: number): Moment;
function fn(x: number | string) {
  // When written with separate overloads, incorrectly an error
  // When written with union types, correctly OK
  return moment().utcOffset(x);
}
```
