---
title: 混入
---

除了传统的面向对象层次结构外，另一种从可重用组件构建类的流行方式是通过组合更简单的部分类来构建它们。
你可能熟悉 Scala 等语言中的混入或特质的概念，这种模式在 JavaScript 社区中也获得了一定的流行度。

## 混入如何工作？

该模式依赖于使用泛型和类继承来扩展基类。
TypeScript 最佳的混入支持是通过类表达式模式实现的。
你可以在 [这里](https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/) 阅读有关此模式在 JavaScript 中如何工作的更多信息。

首先，我们需要一个将应用混入的类：

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
```

然后你需要一个类型和一个工厂函数，该函数返回一个扩展基类的类表达式。

```ts twoslash
// To get started, we need a type which we'll use to extend
// other classes from. The main responsibility is to declare
// that the type being passed in is a class.

type Constructor = new (...args: any[]) => {};

// This mixin adds a scale property, with getters and setters
// for changing it with an encapsulated private property:

function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Mixins may not declare private/protected properties
    // however, you can use ES2020 private fields
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
```

设置好这些后，你就可以创建一个代表应用了混入的基类的类：

```ts twoslash
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Constructor = new (...args: any[]) => {};
function Scale<TBase extends Constructor>(Base: TBase) {
  return class Scaling extends Base {
    // Mixins may not declare private/protected properties
    // however, you can use ES2020 private fields
    _scale = 1;

    setScale(scale: number) {
      this._scale = scale;
    }

    get scale(): number {
      return this._scale;
    }
  };
}
// ---cut---
// Compose a new class from the Sprite class,
// with the Mixin Scale applier:
const EightBitSprite = Scale(Sprite);

const flappySprite = new EightBitSprite("Bird");
flappySprite.setScale(0.8);
console.log(flappySprite.scale);
```

## 受约束的混入

在上述形式中，混入对类没有底层了解，这可能使得创建你想要的设计变得困难。

为了对此建模，我们修改原始构造函数类型以接受泛型参数。

```ts twoslash
// This was our previous constructor:
type Constructor = new (...args: any[]) => {};
// Now we use a generic version which can apply a constraint on
// the class which this mixin is applied to
type GConstructor<T = {}> = new (...args: any[]) => T;
```

这允许创建仅适用于受约束基类的类：

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
// ---cut---
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
```

然后你可以创建仅在具有特定基类时才起作用的混入：

```ts twoslash
type GConstructor<T = {}> = new (...args: any[]) => T;
class Sprite {
  name = "";
  x = 0;
  y = 0;

  constructor(name: string) {
    this.name = name;
  }
}
type Positionable = GConstructor<{ setPos: (x: number, y: number) => void }>;
type Spritable = GConstructor<Sprite>;
type Loggable = GConstructor<{ print: () => void }>;
// ---cut---

function Jumpable<TBase extends Positionable>(Base: TBase) {
  return class Jumpable extends Base {
    jump() {
      // This mixin will only work if it is passed a base
      // class which has setPos defined because of the
      // Positionable constraint.
      this.setPos(0, 20);
    }
  };
}
```

## 替代模式

本文档的早期版本推荐了一种编写混入的方式，即分别创建运行时和类型层次结构，然后在最后合并它们：

```ts twoslash
// @strict: false
// Each mixin is a traditional ES class
class Jumpable {
  jump() {}
}

class Duckable {
  duck() {}
}

// Including the base
class Sprite {
  x = 0;
  y = 0;
}

// Then you create an interface which merges
// the expected mixins with the same name as your base
interface Sprite extends Jumpable, Duckable {}
// Apply the mixins into the base class via
// the JS at runtime
applyMixins(Sprite, [Jumpable, Duckable]);

let player = new Sprite();
player.jump();
console.log(player.x, player.y);

// This can live anywhere in your codebase:
function applyMixins(derivedCtor: any, constructors: any[]) {
  constructors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
          Object.create(null)
      );
    });
  });
}
```

这种模式较少依赖编译器，更多依赖你的代码库来确保运行时和类型系统都正确保持同步。

## 约束

混入模式通过代码流分析在 TypeScript 编译器中得到原生支持。
有几种情况你可能会遇到原生支持的边界。

#### 装饰器和混入 [`#4881`](https://github.com/microsoft/TypeScript/issues/4881)

你不能使用装饰器通过代码流分析来提供混入：

```ts twoslash
// @experimentalDecorators
// @errors: 2339
// A decorator function which replicates the mixin pattern:
const Pausable = (target: typeof Player) => {
  return class Pausable extends target {
    shouldFreeze = false;
  };
};

@Pausable
class Player {
  x = 0;
  y = 0;
}

// The Player class does not have the decorator's type merged:
const player = new Player();
player.shouldFreeze;

// The runtime aspect could be manually replicated via
// type composition or interface merging.
type FreezablePlayer = Player & { shouldFreeze: boolean };

const playerTwo = (new Player() as unknown) as FreezablePlayer;
playerTwo.shouldFreeze;
```

#### 静态属性混入 [`#17829`](https://github.com/microsoft/TypeScript/issues/17829)

与其说是一个约束，不如说是一个需要注意的地方。
类表达式模式创建单例，因此它们无法在类型系统中映射以支持不同的变量类型。

你可以通过使用函数来返回基于泛型不同的类来解决这个问题：

```ts twoslash
function base<T>() {
  class Base {
    static prop: T;
  }
  return Base;
}

function derived<T>() {
  class Derived extends base<T>() {
    static anotherProp: T;
  }
  return Derived;
}

class Spec extends derived<string>() {}

Spec.prop; // string
Spec.anotherProp; // string
```
