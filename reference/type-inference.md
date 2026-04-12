---
title: 类型推断
---

在 TypeScript 中，有多个地方会使用类型推断来在没有显式类型注解时提供类型信息。例如，在这段代码中

```ts twoslash
let x = 3;
```

变量 `x` 的类型被推断为 `number`。
这种推断发生在初始化变量和成员、设置参数默认值以及确定函数返回类型时。

在大多数情况下，类型推断是简单直接的。
在下面的章节中，我们将探讨类型推断的一些细微之处。

## 最佳通用类型

当从多个表达式进行类型推断时，会使用这些表达式的类型来计算一个"最佳通用类型"。例如：

```ts twoslash
let x = [0, 1, null];
```

要推断上面示例中 `x` 的类型，我们必须考虑每个数组元素的类型。
这里数组的类型有两个选择：`number` 和 `null`。
最佳通用类型算法会考虑每个候选类型，并选择与其他所有候选类型兼容的类型。

由于最佳通用类型必须从提供的候选类型中选择，因此在某些情况下，类型共享一个共同结构，但没有一个类型是所有候选类型的超类型。例如：

```ts twoslash
// @strict: false
class Animal {}
class Rhino extends Animal {
  hasHorn: true;
}
class Elephant extends Animal {
  hasTrunk: true;
}
class Snake extends Animal {
  hasLegs: false;
}
// ---cut---
let zoo = [new Rhino(), new Elephant(), new Snake()];
```

理想情况下，我们可能希望 `zoo` 被推断为 `Animal[]`，但由于数组中没有严格属于 `Animal` 类型的对象，我们无法推断数组元素类型。
要纠正这一点，当没有一个类型是所有其他候选类型的超类型时，请显式提供类型：

```ts twoslash
// @strict: false
class Animal {}
class Rhino extends Animal {
  hasHorn: true;
}
class Elephant extends Animal {
  hasTrunk: true;
}
class Snake extends Animal {
  hasLegs: false;
}
// ---cut---
let zoo: Animal[] = [new Rhino(), new Elephant(), new Snake()];
```

当找不到最佳通用类型时，结果推断将是联合数组类型 `(Rhino | Elephant | Snake)[]`。

## 上下文类型

在某些情况下，类型推断在 TypeScript 中也以"相反的方向"工作。
这被称为"上下文类型"。当表达式的类型由其位置暗示时，就会发生上下文类型推断。例如：

```ts twoslash
// @errors: 2339
window.onmousedown = function (mouseEvent) {
  console.log(mouseEvent.button);
  console.log(mouseEvent.kangaroo);
};
```

在这里，TypeScript 类型检查器使用 `Window.onmousedown` 函数的类型来推断赋值右侧函数表达式的类型。
当它这样做时，能够推断 `mouseEvent` 参数的 [类型](https://developer.mozilla.org/docs/Web/API/MouseEvent)，该类型包含 `button` 属性，但不包含 `kangaroo` 属性。

这是因为 window 已经在其类型中声明了 `onmousedown`：

```ts
// Declares there is a global variable called 'window'
declare var window: Window & typeof globalThis;

// Which is declared as (simplified):
interface Window extends GlobalEventHandlers {
  // ...
}

// Which defines a lot of known handler events
interface GlobalEventHandlers {
  onmousedown: ((this: GlobalEventHandlers, ev: MouseEvent) => any) | null;
  // ...
}
```

TypeScript 也足够智能，可以在其他上下文中推断类型：

```ts twoslash
// @errors: 2339
window.onscroll = function (uiEvent) {
  console.log(uiEvent.button);
};
```

基于上述函数被赋值给 `Window.onscroll` 的事实，TypeScript 知道 `uiEvent` 是一个 [UIEvent](https://developer.mozilla.org/docs/Web/API/UIEvent)，而不是像前一个示例那样的 [MouseEvent](https://developer.mozilla.org/docs/Web/API/MouseEvent)。`UIEvent` 对象不包含 `button` 属性，因此 TypeScript 会抛出错误。

如果此函数不处于上下文类型位置，函数的参数将隐式具有 `any` 类型，并且不会发出错误（除非你使用了 [`noImplicitAny`](https://www.typescriptlang.org/tsconfig#noImplicitAny) 选项）：

```ts twoslash
// @noImplicitAny: false
const handler = function (uiEvent) {
  console.log(uiEvent.button); // <- OK
};
```

我们还可以显式地为函数的参数提供类型信息以覆盖任何上下文类型：

```ts twoslash
window.onscroll = function (uiEvent: any) {
  console.log(uiEvent.button); // <- Now, no error is given
};
```

然而，这段代码将输出 `undefined`，因为 `uiEvent` 没有名为 `button` 的属性。

上下文类型适用于许多情况。
常见情况包括函数调用参数、赋值右侧、类型断言、对象和数组字面量成员以及返回语句。
上下文类型也作为最佳通用类型中的候选类型。例如：

```ts twoslash
// @strict: false
class Animal {}
class Rhino extends Animal {
  hasHorn: true;
}
class Elephant extends Animal {
  hasTrunk: true;
}
class Snake extends Animal {
  hasLegs: false;
}
// ---cut---
function createZoo(): Animal[] {
  return [new Rhino(), new Elephant(), new Snake()];
}
```

在这个示例中，最佳通用类型有四个候选：`Animal`、`Rhino`、`Elephant` 和 `Snake`。
其中，`Animal` 可以被最佳通用类型算法选择。
