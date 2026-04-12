---
title: 迭代器和生成器
---

## 可迭代对象

如果一个对象实现了 [`Symbol.iterator`](https://www.typescriptlang.org/docs/handbook/symbols.html#symboliterator) 属性，那么它就被认为是可迭代的。
一些内置类型如 `Array`、`Map`、`Set`、`String`、`Int32Array`、`Uint32Array` 等都已经实现了它们的 `Symbol.iterator` 属性。
对象上的 `Symbol.iterator` 函数负责返回要迭代的值列表。

### `Iterable` 接口

如果我们想要接收上述可迭代的类型，可以使用 `Iterable` 类型。下面是一个例子：

```ts
function toArray<X>(xs: Iterable<X>): X[] {
  return [...xs]
}
```

### `for..of` 语句

`for..of` 循环遍历可迭代对象，调用对象上的 `Symbol.iterator` 属性。
下面是一个在数组上使用 `for..of` 的简单循环：

```ts
let someArray = [1, "string", false];

for (let entry of someArray) {
  console.log(entry); // 1, "string", false
}
```

### `for..of` 与 `for..in` 语句

`for..of` 和 `for..in` 语句都会遍历列表；但它们迭代的值不同，`for..in` 返回被迭代对象上 _键_ 的列表，而 `for..of` 返回被迭代对象数字属性 _值_ 的列表。

下面是一个演示这种区别的例子：

```ts
let list = [4, 5, 6];

for (let i in list) {
  console.log(i); // "0", "1", "2",
}

for (let i of list) {
  console.log(i); // 4, 5, 6
}
```

另一个区别是 `for..in` 可以操作任何对象；它作为检查该对象属性的方式。
而 `for..of` 主要关注可迭代对象的值。像 `Map` 和 `Set` 这样的内置对象实现了 `Symbol.iterator` 属性，允许访问存储的值。

```ts
let pets = new Set(["Cat", "Dog", "Hamster"]);
pets["species"] = "mammals";

for (let pet in pets) {
  console.log(pet); // "species"
}

for (let pet of pets) {
  console.log(pet); // "Cat", "Dog", "Hamster"
}
```

### 代码生成

#### 目标为 ES5

当目标为兼容 ES5 的引擎时，迭代器只允许在 `Array` 类型的值上使用。
即使在实现了 `Symbol.iterator` 属性的非数组值上使用 `for..of` 循环也是错误的。

编译器会为 `for..of` 循环生成一个简单的 `for` 循环，例如：

```ts
let numbers = [1, 2, 3];
for (let num of numbers) {
  console.log(num);
}
```

将被生成为：

```js
var numbers = [1, 2, 3];
for (var _i = 0; _i < numbers.length; _i++) {
  var num = numbers[_i];
  console.log(num);
}
```

#### 目标为 ECMAScript 2015 及更高版本

当目标为兼容 ECMAScript 2015 的引擎时，编译器将生成 `for..of` 循环以目标引擎中的内置迭代器实现。
