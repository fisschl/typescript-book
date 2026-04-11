---
title: 面向 Java/C# 程序员的 TypeScript
---

TypeScript 是习惯使用其他静态类型语言（如 C# 和 Java）的程序员的流行选择。

TypeScript 的类型系统提供了许多相同的好处，例如更好的代码补全、更早的错误检测以及程序各部分之间更清晰的通信。
虽然 TypeScript 为这些开发者提供了许多熟悉的功能，但值得退一步看看 JavaScript（因此也包括 TypeScript）与传统 OOP 语言的不同之处。
理解这些差异将帮助你编写更好的 JavaScript 代码，并避免那些直接从 C#/Java 转向 TypeScript 的程序员可能陷入的常见陷阱。

## 同时学习 JavaScript

如果你已经熟悉 JavaScript，但主要是 Java 或 C# 程序员，这个介绍性页面可以帮助解释一些你可能容易产生的常见误解和陷阱。
TypeScript 建模类型的某些方式与 Java 或 C# 有很大不同，在学习 TypeScript 时牢记这些差异很重要。

如果你是刚接触 JavaScript 的 Java 或 C# 程序员，我们建议先学习一点 _不带_ 类型的 JavaScript，以了解 JavaScript 的运行时行为。
因为 TypeScript 不会更改代码的 _运行_ 方式，所以你仍然需要学习 JavaScript 的工作原理才能编写实际执行的代码！

重要的是要记住，TypeScript 使用与 JavaScript 相同的 _运行时_ ，因此任何关于如何实现特定运行时行为的资源（将字符串转换为数字、显示警告、将文件写入磁盘等）都同样适用于 TypeScript 程序。
不要局限于 TypeScript 特定的资源！

## 重新思考类

C# 和 Java 可以被称为 _强制 OOP_ 语言。
在这些语言中， _类_ 是代码组织的基本单元，也是运行时所有数据 _和_ 行为的基本容器。
强制所有功能和数据都保存在类中可能是某些问题的良好领域模型，但并非每个领域 _都需要_ 以这种方式表示。

### 自由函数和数据

在 JavaScript 中，函数可以存在于任何地方，数据可以自由传递，而不必位于预定义的 `class` 或 `struct` 内部。
这种灵活性非常强大。
"自由"函数（不与类关联的函数）处理数据而不隐含 OOP 层次结构，这往往是编写 JavaScript 程序的首选模式。

### 静态类

此外，C# 和 Java 中的某些构造（如单例和静态类）在 TypeScript 中是不必要的。

## TypeScript 中的 OOP

也就是说，如果你愿意，你仍然可以使用类！
有些问题很适合用传统的 OOP 层次结构来解决，而 TypeScript 对 JavaScript 类的支持将使这些模型更加强大。
TypeScript 支持许多常见模式，如实现接口、继承和静态方法。

我们将在本指南后面介绍类。

## 重新思考类型

TypeScript 对 _类型_ 的理解实际上与 C# 或 Java 有很大不同。
让我们探讨一些差异。

### 标称具化类型系统

在 C# 或 Java 中，任何给定的值或对象都有一个确切的类型——要么是 `null`，要么是基本类型，要么是已知的类类型。
我们可以调用 `value.GetType()` 或 `value.getClass()` 等方法来在运行时查询确切的类型。
此类型的定义将存在于某个具有某个名称的类中，除非存在显式的继承关系或共同实现的接口，否则我们不能使用两个形状相似的类来相互替代。

这些方面描述了一个 _具化的、标称的_ 类型系统。
我们在代码中编写的类型在运行时存在，类型通过它们的声明相关联，而不是它们的结构。

### 类型作为集合

在 C# 或 Java 中，运行时类型与其编译时声明之间存在一对一的对应关系是有意义的。

在 TypeScript 中，最好将类型视为共享某些共同特征的 _值的集合_ 。
因为类型只是集合，所以一个特定的值可以同时属于 _多个_ 集合。

一旦你开始将类型视为集合，某些操作就会变得非常自然。
例如，在 C# 中，传递一个 _要么_ 是 `string` 要么是 `int` 的值是很尴尬的，因为没有单一的类型可以表示这种值。

在 TypeScript 中，一旦你意识到每个类型都只是一个集合，这就变得非常自然。
如何描述一个属于 `string` 集合或 `number` 集合的值？
它简单地属于这些集合的 _并集_ ：`string | number`。

TypeScript 提供了许多以集合论方式处理类型的机制，如果你将类型视为集合，你会发现它们更直观。

### 擦除的结构类型

在 TypeScript 中，对象 _不是_ 单一确切的类型。
例如，如果我们构造一个满足接口的对象，我们可以在需要该接口的地方使用这个对象，即使两者之间没有声明关系。

```ts twoslash
interface Pointlike {
  x: number;
  y: number;
}
interface Named {
  name: string;
}

function logPoint(point: Pointlike) {
  console.log("x = " + point.x + ", y = " + point.y);
}

function logName(x: Named) {
  console.log("Hello, " + x.name);
}

const obj = {
  x: 0,
  y: 0,
  name: "Origin",
};

logPoint(obj);
logName(obj);
```

TypeScript 的类型系统是 _结构的_ ，而不是标称的：我们可以将 `obj` 用作 `Pointlike`，因为它具有 `x` 和 `y` 属性，且都是数字。
类型之间的关系由它们包含的属性决定，而不是由它们是否以某种特定关系声明决定。

TypeScript 的类型系统也是 _非具化的_ ：运行时没有任何东西会告诉我们 `obj` 是 `Pointlike`。
事实上，`Pointlike` 类型在运行时 _完全不存在_ 。

回到 _类型作为集合_ 的概念，我们可以将 `obj` 视为同时属于 `Pointlike` 值集和 `Named` 值集的成员。

### 结构类型的后果

OOP 程序员通常对结构类型的两个方面感到惊讶。

#### 空类型

第一个是 _空类型_ 似乎违背了预期：

```ts twoslash
class Empty {}

function fn(arg: Empty) {
  // do something?
}

// No error, but this isn't an 'Empty' ?
fn({ k: 10 });
```

TypeScript 通过查看提供的参数是否是有效的 `Empty` 来确定此处对 `fn` 的调用是否有效。
它通过检查 `{ k: 10 }` 和 `class Empty { }` 的 _结构_ 来做到这一点。
我们可以看到 `{ k: 10 }` 具有 `Empty` 的所有属性，因为 `Empty` 没有属性。
因此，这是一个有效的调用！

这可能看起来令人惊讶，但它最终与在标称 OOP 语言中强制执行的关系非常相似。
子类不能 _删除_ 其基类的属性，因为这样做会破坏派生类与其基类之间的自然子类型关系。
结构类型系统只是通过用具有兼容类型的属性来描述子类型来隐式地识别这种关系。

#### 相同类型

另一个常见的惊讶来源来自相同类型：

```ts
class Car {
  drive() {
    // hit the gas
  }
}
class Golfer {
  drive() {
    // hit the ball far
  }
}

// No error?
let w: Car = new Golfer();
```

同样，这不是错误，因为这些类的 _结构_ 是相同的。
虽然这可能看起来是混淆的潜在来源，但在实践中，不应该相关的相同类并不常见。

我们将在类章节中了解更多关于类如何相互关联的内容。

### 反射

OOP 程序员习惯于能够查询任何值的类型，即使是泛型值：

```csharp
// C#
static void LogType<T>() {
    Console.WriteLine(typeof(T).Name);
}
```

因为 TypeScript 的类型系统是完全擦除的，所以关于泛型类型参数实例化的信息在运行时不可用。

JavaScript 确实有一些有限的原语，如 `typeof` 和 `instanceof`，但请记住，这些运算符仍然在类型擦除输出代码中存在的值上工作。
例如，`typeof (new Car())` 将是 `"object"`，而不是 `Car` 或 `"Car"`。

## 下一步

这是对日常 TypeScript 中使用的语法和工具的简要概述。从这里开始，你可以：

- 从头到尾阅读完整的[手册](/docs/handbook/intro.html)
- 探索 [Playground 示例](/play#show-examples)
