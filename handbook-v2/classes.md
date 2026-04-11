---
title: 类
---

<blockquote class='bg-reading'>
  <p>背景阅读：<br /><a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes'>Classes (MDN)</a></p>
</blockquote>

TypeScript 完全支持 ES2015 引入的 `class` 关键字。

与其他 JavaScript 语言特性一样，TypeScript 添加了类型注解和其他语法，允许你表达类与其他类型之间的关系。

## 类成员

这是最基本的类——一个空类：

```ts twoslash
class Point {}
```

这个类目前还没什么用，让我们开始添加一些成员。

### 字段

字段声明会在类上创建一个公共可写属性：

```ts twoslash
// @strictPropertyInitialization: false
class Point {
  x: number;
  y: number;
}

const pt = new Point();
pt.x = 0;
pt.y = 0;
```

与其他位置一样，类型注解是可选的，但如果不指定，将会是隐式的 `any`。

字段也可以有 _初始化器_；这些会在类实例化时自动运行：

```ts twoslash
class Point {
  x = 0;
  y = 0;
}

const pt = new Point();
// Prints 0, 0
console.log(`${pt.x}, ${pt.y}`);
```

就像使用 `const`、`let` 和 `var` 一样，类属性的初始化器将用于推断其类型：

```ts twoslash
// @errors: 2322
class Point {
  x = 0;
  y = 0;
}
// ---cut---
const pt = new Point();
pt.x = "0";
```

#### `--strictPropertyInitialization`

[`strictPropertyInitialization`](https://www.typescriptlang.org/tsconfig#strictPropertyInitialization) 设置控制类字段是否需要在构造函数中初始化。

```ts twoslash
// @errors: 2564
class BadGreeter {
  name: string;
}
```

```ts twoslash
class GoodGreeter {
  name: string;

  constructor() {
    this.name = "hello";
  }
}
```

注意，字段需要在 _构造函数本身_ 中初始化。
TypeScript 不会分析你从构造函数调用的方法来检测初始化，因为派生类可能会覆盖这些方法而未能初始化成员。

如果你确定要通过构造函数以外的方式初始化字段（例如，可能是外部库正在为你填充类的一部分），你可以使用 _明确赋值断言运算符_，`!`：

```ts twoslash
class OKGreeter {
  // Not initialized, but no error
  name!: string;
}
```

### `readonly`

字段可以加上 `readonly` 修饰符前缀。
这会阻止在构造函数之外对字段进行赋值。

```ts twoslash
// @errors: 2540 2540
class Greeter {
  readonly name: string = "world";

  constructor(otherName?: string) {
    if (otherName !== undefined) {
      this.name = otherName;
    }
  }

  err() {
    this.name = "not ok";
  }
}
const g = new Greeter();
g.name = "also not ok";
```

### 构造函数

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/constructor'>Constructor (MDN)</a><br/>
   </p>
</blockquote>

类构造函数与函数非常相似。
你可以添加带类型注解的参数、默认值和重载：

```ts twoslash
class Point {
  x: number;
  y: number;

  // Normal signature with defaults
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}
```

```ts twoslash
class Point {
  x: number = 0;
  y: number = 0;

  // Constructor overloads
  constructor(x: number, y: number);
  constructor(xy: string);
  constructor(x: string | number, y: number = 0) {
    // Code logic here
  }
}
```

类构造函数签名与函数签名之间只有几个区别：

- 构造函数不能有类型参数——这些属于外部类声明，我们稍后会学到
- 构造函数不能有返回类型注解——总是返回类实例类型

#### Super 调用

就像在 JavaScript 中一样，如果你有基类，你需要在构造函数体中使用任何 `this.` 成员之前调用 `super()`：

```ts twoslash
// @errors: 17009
class Base {
  k = 4;
}

class Derived extends Base {
  constructor() {
    // Prints a wrong value in ES5; throws exception in ES6
    console.log(this.k);
    super();
  }
}
```

忘记调用 `super` 是 JavaScript 中很容易犯的错误，但 TypeScript 会在必要时告诉你。

### 方法

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Method_definitions'>Method definitions</a><br/>
   </p>
</blockquote>

类上的函数属性称为 _方法_。
方法可以使用与函数和构造函数相同的所有类型注解：

```ts twoslash
class Point {
  x = 10;
  y = 10;

  scale(n: number): void {
    this.x *= n;
    this.y *= n;
  }
}
```

除了标准类型注解之外，TypeScript 没有为方法添加任何新内容。

注意，在方法体内部，仍然必须通过 `this.` 访问字段和其他方法。
方法体中的非限定名称将始终引用封闭作用域中的内容：

```ts twoslash
// @errors: 2322
let x: number = 0;

class C {
  x: string = "hello";

  m() {
    // This is trying to modify 'x' from line 1, not the class property
    x = "world";
  }
}
```

### Getter / Setter

类也可以有 _访问器_：

```ts twoslash
class C {
  _length = 0;
  get length() {
    return this._length;
  }
  set length(value) {
    this._length = value;
  }
}
```

> 注意，一个由字段支持的 get/set 对，如果没有额外逻辑，在 JavaScript 中很少有用。
> 如果你不需要在 get/set 操作期间添加额外逻辑，直接暴露公共字段就可以了。

TypeScript 对访问器有一些特殊的推断规则：

- 如果存在 `get` 但没有 `set`，属性自动为 `readonly`
- 如果没有指定 setter 参数的类型，它将从 getter 的返回类型推断

从 [TypeScript 4.3](https://devblogs.microsoft.com/typescript/announcing-typescript-4-3/) 开始，可以让 getter 和 setter 具有不同的类型。

```ts twoslash
class Thing {
  _size = 0;

  get size(): number {
    return this._size;
  }

  set size(value: string | number | boolean) {
    let num = Number(value);

    // Don't allow NaN, Infinity, etc

    if (!Number.isFinite(num)) {
      this._size = 0;
      return;
    }

    this._size = num;
  }
}
```

### 索引签名

类可以声明索引签名；这些与[其他对象类型的索引签名](/handbook-v2/object-types#索引签名)工作方式相同：

```ts twoslash
class MyClass {
  [s: string]: boolean | ((s: string) => boolean);

  check(s: string) {
    return this[s] as boolean;
  }
}
```

因为索引签名类型还需要捕获方法的类型，所以很难有效地使用这些类型。
通常最好将索引数据存储在其他地方，而不是在类实例本身上。

## 类继承

像其他具有面向对象特性的语言一样，JavaScript 中的类可以继承自基类。

### `implements` 子句

你可以使用 `implements` 子句来检查类是否满足特定的 `interface`。
如果类未能正确实现它，将会发出错误：

```ts twoslash
// @errors: 2420
interface Pingable {
  ping(): void;
}

class Sonar implements Pingable {
  ping() {
    console.log("ping!");
  }
}

class Ball implements Pingable {
  pong() {
    console.log("pong!");
  }
}
```

类也可以实现多个接口，例如 `class C implements A, B {`。

#### 注意事项

重要的是要理解，`implements` 子句只是检查类是否可以被视为接口类型。
它根本不会改变类或其方法的类型 _丝毫_。
一个常见的错误是假设 `implements` 子句会改变类的类型——它不会！

```ts twoslash
// @errors: 7006
interface Checkable {
  check(name: string): boolean;
}

class NameChecker implements Checkable {
  check(s) {
    // Notice no error here
    return s.toLowerCase() === "ok";
  }
}
```

在这个例子中，我们可能期望 `s` 的类型会受到 `check` 的 `name: string` 参数的影响。
但事实并非如此——`implements` 子句不会改变类体的检查方式或其类型的推断。

同样，实现带有可选属性的接口不会创建该属性：

```ts twoslash
// @errors: 2339
interface A {
  x: number;
  y?: number;
}
class C implements A {
  x = 0;
}
const c = new C();
c.y = 10;
```

### `extends` 子句

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/extends'>extends keyword (MDN)</a><br/>
   </p>
</blockquote>

类可以 `extend` 自基类。
派生类具有基类的所有属性和方法，还可以定义额外的成员。

```ts twoslash
class Animal {
  move() {
    console.log("Moving along!");
  }
}

class Dog extends Animal {
  woof(times: number) {
    for (let i = 0; i < times; i++) {
      console.log("woof!");
    }
  }
}

const d = new Dog();
// Base class method
d.move();
// Derived class method
d.woof(3);
```

#### 覆盖方法

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/super'>super keyword (MDN)</a><br/>
   </p>
</blockquote>

派生类也可以覆盖基类字段或属性。
你可以使用 `super.` 语法访问基类方法。
注意，因为 JavaScript 类是一个简单的查找对象，所以不存在"超类字段"的概念。

TypeScript 强制要求派生类始终是基类的子类型。

例如，这是一种合法的覆盖方法的方式：

```ts twoslash
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  greet(name?: string) {
    if (name === undefined) {
      super.greet();
    } else {
      console.log(`Hello, ${name.toUpperCase()}`);
    }
  }
}

const d = new Derived();
d.greet();
d.greet("reader");
```

重要的是，派生类要遵循其基类的契约。
请记住，通过基类引用指向派生类实例是非常常见（而且总是合法的！）的：

```ts twoslash
class Base {
  greet() {
    console.log("Hello, world!");
  }
}
class Derived extends Base {}
const d = new Derived();
// ---cut---
// Alias the derived instance through a base class reference
const b: Base = d;
// No problem
b.greet();
```

如果 `Derived` 不遵循 `Base` 的契约会怎样？

```ts twoslash
// @errors: 2416
class Base {
  greet() {
    console.log("Hello, world!");
  }
}

class Derived extends Base {
  // Make this parameter required
  greet(name: string) {
    console.log(`Hello, ${name.toUpperCase()}`);
  }
}
```

如果我们尽管有错误也编译这段代码，这个示例就会崩溃：

```ts twoslash
declare class Base {
  greet(): void;
}
declare class Derived extends Base {}
// ---cut---
const b: Base = new Derived();
// Crashes because "name" will be undefined
b.greet();
```

#### 仅类型字段声明

当 `target >= ES2022` 或 [`useDefineForClassFields`](https://www.typescriptlang.org/tsconfig#useDefineForClassFields) 为 `true` 时，类字段在父类构造函数完成后初始化，会覆盖父类设置的任何值。当你只想为继承的字段重新声明更准确的类型时，这可能是个问题。为了处理这些情况，你可以写 `declare` 来告诉 TypeScript 这个字段声明不应该有运行时效果。

```ts twoslash
interface Animal {
  dateOfBirth: any;
}

interface Dog extends Animal {
  breed: any;
}

class AnimalHouse {
  resident: Animal;
  constructor(animal: Animal) {
    this.resident = animal;
  }
}

class DogHouse extends AnimalHouse {
  // Does not emit JavaScript code,
  // only ensures the types are correct
  declare resident: Dog;
  constructor(dog: Dog) {
    super(dog);
  }
}
```

#### 初始化顺序

JavaScript 类初始化的顺序在某些情况下可能会令人惊讶。
让我们考虑这段代码：

```ts twoslash
class Base {
  name = "base";
  constructor() {
    console.log("My name is " + this.name);
  }
}

class Derived extends Base {
  name = "derived";
}

// Prints "base", not "derived"
const d = new Derived();
```

这里发生了什么？

根据 JavaScript 的定义，类初始化的顺序是：

- 基类字段初始化
- 基类构造函数运行
- 派生类字段初始化
- 派生类构造函数运行

这意味着基类构造函数在其自身的构造函数期间看到自己的 `name` 值，因为派生类字段初始化尚未运行。

#### 继承内置类型

> 注意：如果你不打算继承 `Array`、`Error`、`Map` 等内置类型，或者你的编译目标明确设置为 `ES6`/`ES2015` 或更高版本，可以跳过本节

在 ES2015 中，返回对象的构造函数会隐式地将 `this` 的值替换为任何 `super(...)` 调用者。
生成的构造函数代码需要捕获 `super(...)` 的任何潜在返回值并用 `this` 替换它。

因此，子类化 `Error`、`Array` 等可能不再按预期工作。
这是因为 `Error`、`Array` 等的构造函数函数使用 ECMAScript 6 的 `new.target` 来调整原型链；
然而，在 ECMAScript 5 中调用构造函数时无法确保 `new.target` 的值。
其他降级编译器通常也有相同的默认限制。

对于如下子类：

```ts twoslash
class MsgError extends Error {
  constructor(m: string) {
    super(m);
  }
  sayHello() {
    return "hello " + this.message;
  }
}
```

你可能会发现：

- 在通过构造这些子类返回的对象上，方法可能是 `undefined`，所以调用 `sayHello` 会导致错误。
- `instanceof` 会在子类实例和它们的实例之间被破坏，所以 `(new MsgError()) instanceof MsgError` 会返回 `false`。

作为建议，你可以在任何 `super(...)` 调用后立即手动调整原型。

```ts twoslash
class MsgError extends Error {
  constructor(m: string) {
    super(m);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, MsgError.prototype);
  }

  sayHello() {
    return "hello " + this.message;
  }
}
```

然而，`MsgError` 的任何子类也必须手动设置原型。
对于不支持 [`Object.setPrototypeOf`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf) 的运行时，你可以改用 [`__proto__`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/proto)。

不幸的是，[这些变通方法在 Internet Explorer 10 及更早版本上不起作用](<https://msdn.microsoft.com/en-us/library/s4esdbwz(v=vs.94).aspx>)。
可以手动将方法从原型复制到实例本身（即 `MsgError.prototype` 到 `this`），但原型链本身无法修复。

## 成员可见性

你可以使用 TypeScript 来控制某些方法或属性在类外部是否可见。

### `public`

类成员的默认可见性是 `public`。
`public` 成员可以在任何地方访问：

```ts twoslash
class Greeter {
  public greet() {
    console.log("hi!");
  }
}
const g = new Greeter();
g.greet();
```

因为 `public` 已经是默认的可见性修饰符，你 _永远不需要_ 在类成员上写它，但可能出于风格/可读性原因选择这样做。

### `protected`

`protected` 成员只在声明它们的类的子类中可见。

```ts twoslash
// @errors: 2445
class Greeter {
  public greet() {
    console.log("Hello, " + this.getName());
  }
  protected getName() {
    return "hi";
  }
}

class SpecialGreeter extends Greeter {
  public howdy() {
    // OK to access protected member here
    console.log("Howdy, " + this.getName());
    //                          ^^^^^^^^^^^^^^
  }
}
const g = new SpecialGreeter();
g.greet(); // OK
g.getName();
```

#### `protected` 成员的暴露

派生类需要遵循其基类契约，但可以选择公开具有更多功能的基类子类型。
这包括将 `protected` 成员变为 `public`：

```ts twoslash
class Base {
  protected m = 10;
}
class Derived extends Base {
  // No modifier, so default is 'public'
  m = 15;
}
const d = new Derived();
console.log(d.m); // OK
```

注意 `Derived` 已经可以自由读写 `m`，所以这不会实质性地改变这种情况的"安全性"。
这里主要要注意的是，在派生类中，如果这种暴露不是故意的，我们需要小心重复 `protected` 修饰符。

#### 跨层级 `protected` 访问

TypeScript 不允许在类层次结构中访问兄弟类的 `protected` 成员：

```ts twoslash
// @errors: 2445
class Base {
  protected x: number = 1;
}
class Derived1 extends Base {
  protected x: number = 5;
}
class Derived2 extends Base {
  f1(other: Derived2) {
    other.x = 10;
  }
  f2(other: Derived1) {
    other.x = 10;
  }
}
```

这是因为在 `Derived2` 中访问 `x` 应该只从 `Derived2` 的子类中合法，而 `Derived1` 不是其中之一。
此外，如果通过 `Derived1` 引用访问 `x` 是非法的（它当然应该是！），那么通过基类引用访问它永远不应该改善这种情况。

另请参阅 [Why Can't I Access A Protected Member From A Derived Class?](https://blogs.msdn.microsoft.com/ericlippert/2005/11/09/why-cant-i-access-a-protected-member-from-a-derived-class/)，其中解释了 C# 在同一主题上的更多推理。

### `private`

`private` 类似于 `protected`，但不允许甚至从子类访问成员：

```ts twoslash
// @errors: 2341
class Base {
  private x = 0;
}
const b = new Base();
// Can't access from outside the class
console.log(b.x);
```

```ts twoslash
// @errors: 2341
class Base {
  private x = 0;
}
// ---cut---
class Derived extends Base {
  showX() {
    // Can't access in subclasses
    console.log(this.x);
  }
}
```

因为 `private` 成员对派生类不可见，所以派生类不能提高它们的可见性：

```ts twoslash
// @errors: 2415
class Base {
  private x = 0;
}
class Derived extends Base {
  x = 1;
}
```

#### 跨实例 `private` 访问

不同的 OOP 语言对于同一类的不同实例是否可以访问彼此的 `private` 成员存在分歧。
虽然 Java、C#、C++、Swift 和 PHP 允许这样做，但 Ruby 不允许。

TypeScript 允许跨实例 `private` 访问：

```ts twoslash
class A {
  private x = 10;

  public sameAs(other: A) {
    // No error
    return other.x === this.x;
  }
}
```

#### 注意事项

与 TypeScript 类型系统的其他方面一样，`private` 和 `protected` [只在类型检查期间强制执行](https://www.typescriptlang.org/play?removeComments=true&target=99&ts=4.3.4#code/PTAEGMBsEMGddAEQPYHNQBMCmVoCcsEAHPASwDdoAXLUAM1K0gwQFdZSA7dAKWkoDK4MkSoByBAGJQJLAwAeAWABQIUH0HDSoiTLKUaoUggAW+DHorUsAOlABJcQlhUy4KpACeoLJzrI8cCwMGxU1ABVPIiwhESpMZEJQTmR4lxFQaQxWMm4IZABbIlIYKlJkTlDlXHgkNFAAbxVQTIAjfABrAEEC5FZOeIBeUAAGAG5mmSw8WAroSFIqb2GAIjMiIk8VieVJ8Ar01ncAgAoASkaAXxVr3dUwGoQAYWpMHBgCYn1rekZmNg4eUi0Vi2icoBWJCsNBWoA6WE8AHcAiEwmBgTEtDovtDaMZQLM6PEoQZbA5wSk0q5SO4vD4-AEghZoJwLGYEIRwNBoqAzFRwCZCFUIlFMXECdSiAhId8YZgclx0PsiiVqOVOAAaUAFLAsxWgKiC35MFigfC0FKgSAVVDTSyk+W5dB4fplHVVR6gF7xJrKFotEk-HXIRE9PoDUDDcaTAPTWaceaLZYQlmoPBbHYx-KcQ7HPDnK43FQqfY5+IMDDISPJLCIuqoc47UsuUCofAME3Vzi1r3URvF5QV5A2STtPDdXqunZDgDaYlHnTDrrEAF0dm28B3mDZg6HJwN1+2-hg57ulwNV2NQGoZbjYfNrYiENBwEFaojFiZQK08C-4fFKTVCozWfTgfFgLkeT5AUqiAA)。

这意味着 JavaScript 运行时构造如 `in` 或简单的属性查找仍然可以访问 `private` 或 `protected` 成员：

```ts twoslash
class MySafe {
  private secretKey = 12345;
}
```

```js
// In a JavaScript file...
const s = new MySafe();
// Will print 12345
console.log(s.secretKey);
```

`private` 还允许在类型检查期间使用括号表示法访问。这使得 `private` 声明的字段对于单元测试等事情可能更容易访问，缺点是这些字段是 _软私有_ 的，并不严格执行隐私。

```ts twoslash
// @errors: 2341
class MySafe {
  private secretKey = 12345;
}

const s = new MySafe();

// Not allowed during type checking
console.log(s.secretKey);

// OK
console.log(s["secretKey"]);
```

与 TypeScript 的 `private` 不同，JavaScript 的 [私有字段](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) (`#`) 在编译后仍然保持私有，并且不提供前面提到的括号表示法访问等逃生通道，使它们成为 _硬私有_。

```ts twoslash
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

```ts twoslash
// @target: esnext
// @showEmit
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

当编译到 ES2021 或更低版本时，TypeScript 将使用 WeakMaps 代替 `#`。

```ts twoslash
// @target: es2015
// @showEmit
class Dog {
  #barkAmount = 0;
  personality = "happy";

  constructor() {}
}
```

如果你需要保护类中的值免受恶意行为者的侵害，你应该使用提供硬运行时隐私的机制，如闭包、WeakMaps 或私有字段。请注意，这些运行时额外的隐私检查可能会影响性能。

## 静态成员

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/static'>Static Members (MDN)</a><br/>
   </p>
</blockquote>

类可以有 `static` 成员。
这些成员不与类的特定实例关联。
它们可以通过类构造函数对象本身访问：

```ts twoslash
class MyClass {
  static x = 0;
  static printX() {
    console.log(MyClass.x);
  }
}
console.log(MyClass.x);
MyClass.printX();
```

静态成员也可以使用相同的 `public`、`protected` 和 `private` 可见性修饰符：

```ts twoslash
// @errors: 2341
class MyClass {
  private static x = 0;
}
console.log(MyClass.x);
```

静态成员也会被继承：

```ts twoslash
class Base {
  static getGreeting() {
    return "Hello world";
  }
}
class Derived extends Base {
  myGreeting = Derived.getGreeting();
}
```

### 特殊静态名称

通常覆盖 `Function` 原型的属性是不安全/不可能的。
因为类本身是可以用 `new` 调用的函数，某些 `static` 名称不能使用。
像 `name`、`length` 和 `call` 这样的函数属性不能定义为 `static` 成员：

```ts twoslash
// @errors: 2699
class S {
  static name = "S!";
}
```

### 为什么没有静态类？

TypeScript（和 JavaScript）没有像 C# 那样的 `static class` 构造。

这些构造 _只_ 存在是因为那些语言强制所有数据和函数必须在类内部；因为 TypeScript 中没有这个限制，所以不需要它们。
只有一个实例的类通常在 JavaScript/TypeScript 中只是用一个普通的 _对象_ 表示。

例如，我们在 TypeScript 中不需要"静态类"语法，因为普通对象（甚至顶层函数）也能同样好地完成工作：

```ts twoslash
// Unnecessary "static" class
class MyStaticClass {
  static doSomething() {}
}

// Preferred (alternative 1)
function doSomething() {}

// Preferred (alternative 2)
const MyHelperObject = {
  dosomething() {},
};
```

## 类中的 `static` 块

静态块允许你编写具有自己作用域的语句序列，可以访问包含类中的私有字段。这意味着我们可以编写具有编写语句的所有功能的初始化代码，没有变量泄漏，并且可以完全访问我们类的内部。

```ts twoslash
declare function loadLastInstances(): any[]
// ---cut---
class Foo {
    static #count = 0;

    get count() {
        return Foo.#count;
    }

    static {
        try {
            const lastInstances = loadLastInstances();
            Foo.#count += lastInstances.length;
        }
        catch {}
    }
}
```

## 泛型类

类与接口一样，可以是泛型的。
当使用 `new` 实例化泛型类时，其类型参数的推断方式与函数调用相同：

```ts twoslash
class Box<Type> {
  contents: Type;
  constructor(value: Type) {
    this.contents = value;
  }
}

const b = new Box("hello!");
```

类可以像接口一样使用泛型约束和默认值。

### 静态成员中的类型参数

这段代码不合法，原因可能不明显：

```ts twoslash
// @errors: 2302
class Box<Type> {
  static defaultValue: Type;
}
```

记住类型总是被完全擦除！
在运行时，只有 _一个_ `Box.defaultValue` 属性槽。
这意味着设置 `Box<string>.defaultValue`（如果可能的话）也会改变 `Box<number>.defaultValue`——不好。
泛型类的 `static` 成员永远不能引用类的类型参数。

## 类中运行时的 `this`

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this'>this keyword (MDN)</a><br/>
   </p>
</blockquote>

重要的是要记住，TypeScript 不会改变 JavaScript 的运行时行为，而 JavaScript 因其一些奇特的运行时行为而闻名。

JavaScript 对 `this` 的处理确实不寻常：

```ts twoslash
class MyClass {
  name = "MyClass";
  getName() {
    return this.name;
  }
}
const c = new MyClass();
const obj = {
  name: "obj",
  getName: c.getName,
};

// Prints "obj", not "MyClass"
console.log(obj.getName());
```

长话短说，默认情况下，函数内部 `this` 的值取决于 _函数被调用的方式_。
在这个例子中，因为函数是通过 `obj` 引用调用的，所以它的 `this` 值是 `obj` 而不是类实例。

这很少是你想要发生的！
TypeScript 提供了一些方法来缓解或防止这种错误。

### 箭头函数

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions'>Arrow functions (MDN)</a><br/>
   </p>
</blockquote>

如果你有一个经常以丢失其 `this` 上下文的方式调用的函数，使用箭头函数属性而不是方法定义可能是有意义的：

```ts twoslash
class MyClass {
  name = "MyClass";
  getName = () => {
    return this.name;
  };
}
const c = new MyClass();
const g = c.getName;
// Prints "MyClass" instead of crashing
console.log(g());
```

这有一些权衡：

- `this` 值在运行时是保证正确的，即使对于未经 TypeScript 检查的代码也是如此
- 这会使用更多内存，因为每个类实例都会有自己的函数副本
- 你不能在派生类中使用 `super.getName`，因为原型链中没有条目可以获取基类方法

### `this` 参数

在方法或函数定义中，名为 `this` 的初始参数在 TypeScript 中具有特殊含义。
这些参数在编译期间会被擦除：

```ts twoslash
type SomeType = any;
// ---cut---
// 带 'this' 参数的 TypeScript 输入
function fn(this: SomeType, x: number) {
  /* ... */
}
```

```js
// JavaScript 输出
function fn(x) {
  /* ... */
}
```

TypeScript 检查使用 `this` 参数调用函数时是否具有正确的上下文。
我们可以向方法定义添加 `this` 参数，以静态强制方法被正确调用：

```ts twoslash
// @errors: 2684
class MyClass {
  name = "MyClass";
  getName(this: MyClass) {
    return this.name;
  }
}
const c = new MyClass();
// OK
c.getName();

// Error, would crash
const g = c.getName;
console.log(g());
```

这种方法与箭头函数方法的权衡相反：

- JavaScript 调用者可能仍然会在不知情的情况下错误地使用类方法
- 每个类定义只分配一个函数，而不是每个类实例一个
- 仍然可以通过 `super` 调用基方法定义。

## `this` 类型

在类中，一个名为 `this` 的特殊类型 _动态地_ 引用当前类的类型。
让我们看看这有什么用：

<!-- prettier-ignore -->
```ts twoslash
class Box {
  contents: string = "";
  set(value: string) {
    this.contents = value;
    return this;
  }
}
```

这里，TypeScript 推断 `set` 的返回类型为 `this`，而不是 `Box`。
现在让我们创建一个 `Box` 的子类：

```ts twoslash
class Box {
  contents: string = "";
  set(value: string) {
    this.contents = value;
    return this;
  }
}
// ---cut---
class ClearableBox extends Box {
  clear() {
    this.contents = "";
  }
}

const a = new ClearableBox();
const b = a.set("hello");
```

你也可以在参数类型注解中使用 `this`：

```ts twoslash
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}
```

这与写 `other: Box` 不同——如果你有派生类，它的 `sameAs` 方法现在只接受该派生类的其他实例：

```ts twoslash
// @errors: 2345
class Box {
  content: string = "";
  sameAs(other: this) {
    return other.content === this.content;
  }
}

class DerivedBox extends Box {
  otherContent: string = "?";
}

const base = new Box();
const derived = new DerivedBox();
derived.sameAs(base);
```

### 基于 `this` 的类型守卫

你可以在类和接口的方法返回位置使用 `this is Type`。
当与类型收窄（例如 `if` 语句）结合使用时，目标对象的类型将被收窄到指定的 `Type`。

<!-- prettier-ignore -->
```ts twoslash
// @strictPropertyInitialization: false
class FileSystemObject {
  isFile(): this is FileRep {
    return this instanceof FileRep;
  }
  isDirectory(): this is Directory {
    return this instanceof Directory;
  }
  isNetworked(): this is Networked & this {
    return this.networked;
  }
  constructor(public path: string, private networked: boolean) {}
}

class FileRep extends FileSystemObject {
  constructor(path: string, public content: string) {
    super(path, false);
  }
}

class Directory extends FileSystemObject {
  children: FileSystemObject[];
}

interface Networked {
  host: string;
}

const fso: FileSystemObject = new FileRep("foo/bar.txt", "foo");

if (fso.isFile()) {
  fso.content;
} else if (fso.isDirectory()) {
  fso.children;
} else if (fso.isNetworked()) {
  fso.host;
}
```

基于 this 的类型守卫的一个常见用例是允许对特定字段进行延迟验证。例如，这种情况在验证 `hasValue` 为 true 时从 box 中持有的值中移除 `undefined`：

```ts twoslash
class Box<T> {
  value?: T;

  hasValue(): this is { value: T } {
    return this.value !== undefined;
  }
}

const box = new Box<string>();
box.value = "Gameboy";

box.value;

if (box.hasValue()) {
  box.value;
}
```

## 参数属性

TypeScript 提供了特殊的语法，可以将构造函数参数转换为具有相同名称和值的类属性。
这些被称为 _参数属性_，通过在构造函数参数前加上可见性修饰符 `public`、`private`、`protected` 或 `readonly` 之一来创建。
结果字段获得这些修饰符：

```ts twoslash
// @errors: 2341
class Params {
  constructor(
    public readonly x: number,
    protected y: number,
    private z: number
  ) {
    // No body necessary
  }
}
const a = new Params(1, 2, 3);
console.log(a.x);
console.log(a.z);
```

## 类表达式

<blockquote class='bg-reading'>
   <p>背景阅读：<br />
   <a href='https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/class'>Class expressions (MDN)</a><br/>
   </p>
</blockquote>

类表达式与类声明非常相似。
唯一的真正区别是类表达式不需要名称，尽管我们可以通过它们最终绑定到的任何标识符来引用它们：

```ts twoslash
const someClass = class<Type> {
  content: Type;
  constructor(value: Type) {
    this.content = value;
  }
};

const m = new someClass("Hello, world");
```

## 构造函数签名

JavaScript 类使用 `new` 运算符实例化。给定类本身的类型，[InstanceType](/reference/utility-types#instancetypetype) 工具类型模拟此操作。

```ts twoslash
class Point {
  createdAt: number;
  x: number;
  y: number
  constructor(x: number, y: number) {
    this.createdAt = Date.now()
    this.x = x;
    this.y = y;
  }
}
type PointInstance = InstanceType<typeof Point>

function moveRight(point: PointInstance) {
  point.x += 5;
}

const point = new Point(3, 4);
moveRight(point);
point.x; // => 8
```

## `abstract` 类和成员

TypeScript 中的类、方法和字段可以是 _抽象_ 的。

_抽象方法_ 或 _抽象字段_ 是尚未提供实现的方法或字段。
这些成员必须存在于 _抽象类_ 中，抽象类不能直接实例化。

抽象类的作用是作为子类的基类，这些子类实现所有抽象成员。
当类没有任何抽象成员时，它被称为 _具体_ 的。

让我们看一个例子：

```ts twoslash
// @errors: 2511
abstract class Base {
  abstract getName(): string;

  printName() {
    console.log("Hello, " + this.getName());
  }
}

const b = new Base();
```

我们不能用 `new` 实例化 `Base`，因为它是抽象的。
相反，我们需要创建一个派生类并实现抽象成员：

```ts twoslash
abstract class Base {
  abstract getName(): string;
  printName() {}
}
// ---cut---
class Derived extends Base {
  getName() {
    return "world";
  }
}

const d = new Derived();
d.printName();
```

注意，如果我们忘记实现基类的抽象成员，我们会得到一个错误：

```ts twoslash
// @errors: 2515
abstract class Base {
  abstract getName(): string;
  printName() {}
}
// ---cut---
class Derived extends Base {
  // forgot to do anything
}
```

### 抽象构造签名

有时你想接受某个类构造函数函数，它产生一个派生自某个抽象类的类的实例。

例如，你可能想写这样的代码：

```ts twoslash
// @errors: 2511
abstract class Base {
  abstract getName(): string;
  printName() {}
}
class Derived extends Base {
  getName() {
    return "";
  }
}
// ---cut---
function greet(ctor: typeof Base) {
  const instance = new ctor();
  instance.printName();
}
```

TypeScript 正确地告诉你，你正在试图实例化一个抽象类。
毕竟，给定 `greet` 的定义，写这样的代码是完全合法的，最终会构造一个抽象类：

```ts twoslash
declare const greet: any, Base: any;
// ---cut---
// Bad!
greet(Base);
```

相反，你想写一个接受具有构造签名的事物的函数：

```ts twoslash
// @errors: 2345
abstract class Base {
  abstract getName(): string;
  printName() {}
}
class Derived extends Base {
  getName() {
    return "";
  }
}
// ---cut---
function greet(ctor: new () => Base) {
  const instance = new ctor();
  instance.printName();
}
greet(Derived);
greet(Base);
```

现在 TypeScript 正确地告诉你哪些类构造函数函数可以被调用——`Derived` 可以，因为它是具体的，但 `Base` 不能。

## 类之间的关系

在大多数情况下，TypeScript 中的类是结构比较的，与其他类型一样。

例如，这两个类可以互换使用，因为它们是相同的：

```ts twoslash
class Point1 {
  x = 0;
  y = 0;
}

class Point2 {
  x = 0;
  y = 0;
}

// OK
const p: Point1 = new Point2();
```

同样，即使没有显式继承，类之间也存在子类型关系：

```ts twoslash
// @strict: false
class Person {
  name: string;
  age: number;
}

class Employee {
  name: string;
  age: number;
  salary: number;
}

// OK
const p: Person = new Employee();
```

这听起来很简单，但有些情况看起来比其他情况更奇怪。

空类没有成员。
在结构类型系统中，没有成员的类型通常是任何其他类型的超类型。
所以如果你写一个空类（不要这样做！），任何东西都可以代替它：

```ts twoslash
class Empty {}

function fn(x: Empty) {
  // can't do anything with 'x', so I won't
}

// All OK!
fn(window);
fn({});
fn(fn);
```
