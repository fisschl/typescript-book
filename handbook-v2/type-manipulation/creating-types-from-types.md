---
title: 从类型创建类型
---

TypeScript 的类型系统非常强大，因为它允许 _用其他类型来表达类型_。

这个想法最简单的形式就是泛型。此外，我们还有各种各样的 _类型运算符_ 可供使用。
我们还可以根据已经拥有的 _值_ 来表达类型。

通过组合各种类型运算符，我们可以以简洁、可维护的方式表达复杂的操作和值。
在本节中，我们将介绍如何根据现有类型或值来表达一个新类型。

- [泛型](/handbook-v2/type-manipulation/generics) - 接受参数的类型
- [keyof 类型运算符](/handbook-v2/type-manipulation/keyof-type-operator) - 使用 `keyof` 运算符创建新类型
- [typeof 类型运算符](/handbook-v2/type-manipulation/typeof-type-operator) - 使用 `typeof` 运算符创建新类型
- [索引访问类型](/handbook-v2/type-manipulation/indexed-access-types) - 使用 `Type['a']` 语法访问类型的子集
- [条件类型](/handbook-v2/type-manipulation/conditional-types) - 在类型系统中充当 if 语句的类型
- [映射类型](/handbook-v2/type-manipulation/mapped-types) - 通过映射现有类型中的每个属性来创建类型
- [模板字面量类型](/handbook-v2/type-manipulation/template-literal-types) - 通过模板字面量字符串更改属性的映射类型
