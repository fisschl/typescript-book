---
title: Symbols
---

从 ECMAScript 2015 开始，`symbol` 是一种原始数据类型，就像 `number` 和 `string` 一样。

`symbol` 值通过调用 `Symbol` 构造函数来创建。

```ts
let sym1 = Symbol();

let sym2 = Symbol("key"); // optional string key
```

Symbols 是不可变的，并且是唯一的。

```ts
let sym2 = Symbol("key");
let sym3 = Symbol("key");

sym2 === sym3; // false, symbols are unique
```

就像字符串一样，symbols 可以用作对象属性的键。

```ts
const sym = Symbol();

let obj = {
  [sym]: "value",
};

console.log(obj[sym]); // "value"
```

Symbols 还可以与计算属性声明结合使用，以声明对象属性和类成员。

```ts
const getClassNameSymbol = Symbol();

class C {
  [getClassNameSymbol]() {
    return "C";
  }
}

let c = new C();
let className = c[getClassNameSymbol](); // "C"
```

## `unique symbol`

为了支持将 symbols 视为唯一字面量，可以使用特殊的类型 `unique symbol`。`unique symbol` 是 `symbol` 的子类型，只能从调用 `Symbol()` 或 `Symbol.for()` 产生，或来自显式类型注解。这种类型只允许在 `const` 声明和 `readonly static` 属性上使用，并且为了引用特定的唯一 symbol，你必须使用 `typeof` 运算符。对每个唯一 symbol 的引用都意味着一个完全唯一的身份，该身份与给定的声明相关联。

```ts twoslash
// @errors: 1332
declare const sym1: unique symbol;

// sym2 can only be a constant reference.
let sym2: unique symbol = Symbol();

// Works - refers to a unique symbol, but its identity is tied to 'sym1'.
let sym3: typeof sym1 = sym1;

// Also works.
class C {
  static readonly StaticSymbol: unique symbol = Symbol();
}
```

因为每个 `unique symbol` 都有一个完全独立的身份，所以两个 `unique symbol` 类型之间不可赋值或比较。

```ts twoslash
// @errors: 2367
const sym2 = Symbol();
const sym3 = Symbol();

if (sym2 === sym3) {
  // ...
}
```

## Well-known Symbols

除了用户定义的 symbols 之外，还有众所周知的内置 symbols。
内置 symbols 用于表示内部语言行为。

以下是众所周知的 symbols 列表：

### `Symbol.asyncIterator`

一种方法，返回对象的异步迭代器，兼容用于 for await..of 循环。

### `Symbol.hasInstance`

一种方法，确定构造函数对象是否将对象识别为其构造函数的实例之一。由 instanceof 运算符的语义调用。

### `Symbol.isConcatSpreadable`

一个布尔值，指示对象应该被 Array.prototype.concat 扁平化为其数组元素。

### `Symbol.iterator`

一种方法，返回对象的默认迭代器。由 for-of 语句的语义调用。

### `Symbol.match`

一种正则表达式方法，将正则表达式与字符串匹配。由 `String.prototype.match` 方法调用。

### `Symbol.replace`

一种正则表达式方法，替换字符串的匹配子串。由 `String.prototype.replace` 方法调用。

### `Symbol.search`

一种正则表达式方法，返回字符串中与正则表达式匹配的索引。由 `String.prototype.search` 方法调用。

### `Symbol.species`

一个函数值的属性，是用作创建派生对象的构造函数。

### `Symbol.split`

一种正则表达式方法，在匹配正则表达式的索引处拆分字符串。
由 `String.prototype.split` 方法调用。

### `Symbol.toPrimitive`

一种方法，将对象转换为相应的原始值。
由 `ToPrimitive` 抽象操作调用。

### `Symbol.toStringTag`

一个字符串值，用于创建对象的默认字符串描述。
由内置方法 `Object.prototype.toString` 调用。

### `Symbol.unscopables`

一个对象，其自身属性名称是关联对象的 'with' 环境绑定中排除的属性名称。
