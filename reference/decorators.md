---
title: 装饰器
---

> 注意&nbsp; 本文档指的是实验性的 stage 2 装饰器实现。TypeScript 5.0 开始支持 stage 3 装饰器。
> 参见：[TypeScript 5.0 中的装饰器](https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators)

## 简介

随着 TypeScript 和 ES6 中类的引入，现在存在某些场景需要额外的功能来支持对类和类成员进行注解或修改。
装饰器提供了一种为类声明和成员添加注解和元编程语法的方式。

> 延伸阅读（stage 2）：[TypeScript 装饰器完全指南](https://saul-mirone.github.io/a-complete-guide-to-typescript-decorator/)

要启用实验性的装饰器支持，你必须在命令行或 `tsconfig.json` 中启用 [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators) 编译器选项：

**命令行**：

```shell
tsc --target ES5 --experimentalDecorators
```

**tsconfig.json**：

```json tsconfig
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true
  }
}
```

## 装饰器

_装饰器_ 是一种特殊的声明，可以附加到 [类声明](#类装饰器)、[方法](#方法装饰器)、[访问器](#访问器装饰器)、[属性](#属性装饰器) 或 [参数](#参数装饰器) 上。
装饰器使用 `@expression` 的形式，其中 `expression` 必须求值为一个函数，该函数将在运行时被调用，并传入被装饰声明的相关信息。

例如，给定装饰器 `@sealed`，我们可以这样编写 `sealed` 函数：

```ts
function sealed(target) {
  // do something with 'target' ...
}
```

## 装饰器工厂

如果我们想要自定义装饰器如何应用于声明，可以编写一个装饰器工厂。
_装饰器工厂_ 简单来说就是一个返回表达式的函数，该表达式将在运行时被装饰器调用。

我们可以按以下方式编写装饰器工厂：

```ts
function color(value: string) {
  // this is the decorator factory, it sets up
  // the returned decorator function
  return function (target) {
    // this is the decorator
    // do something with 'target' and 'value'...
  };
}
```

## 装饰器组合

多个装饰器可以应用于一个声明，例如在单行上：

```ts twoslash
// @experimentalDecorators
// @noErrors
function f() {}
function g() {}
// ---cut---
@f @g x
```

在多行上：

```ts twoslash
// @experimentalDecorators
// @noErrors
function f() {}
function g() {}
// ---cut---
@f
@g
x
```

当多个装饰器应用于单个声明时，它们的求值类似于 [数学中的函数组合](https://wikipedia.org/wiki/Function_composition)。在此模型中，当组合函数 _f_ 和 _g_ 时，生成的复合函数 (_f_ ∘ _g_)(_x_) 等价于 _f_(_g_(_x_))。

因此，在 TypeScript 中对单个声明求值多个装饰器时，会执行以下步骤：

1. 每个装饰器的表达式从上到下求值。
2. 然后将结果作为函数从下到上调用。

如果我们使用 [装饰器工厂](#装饰器工厂)，可以通过以下示例观察此求值顺序：

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
function first() {
  console.log("first(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("first(): called");
  };
}

function second() {
  console.log("second(): factory evaluated");
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("second(): called");
  };
}

class ExampleClass {
  @first()
  @second()
  method() {}
}
```

这将在控制台输出以下内容：

```shell
first(): factory evaluated
second(): factory evaluated
second(): called
first(): called
```

## 装饰器求值

装饰器应用于类内部各种声明的顺序有明确定义：

1. 对每个实例成员，先应用 _参数装饰器_，然后是 _方法_、_访问器_ 或 _属性装饰器_。
2. 对每个静态成员，先应用 _参数装饰器_，然后是 _方法_、_访问器_ 或 _属性装饰器_。
3. 对构造函数应用 _参数装饰器_。
4. 对类应用 _类装饰器_。

## 类装饰器

_类装饰器_ 在类声明之前声明。
类装饰器应用于类的构造函数，可用于观察、修改或替换类定义。
类装饰器不能在声明文件中使用，也不能在任何其他环境上下文中使用（例如在 `declare` 类上）。

类装饰器的表达式将在运行时作为函数被调用，以被装饰类的构造函数作为其唯一参数。

如果类装饰器返回一个值，它将用提供的构造函数替换类声明。

> 注意&nbsp; 如果你选择返回一个新的构造函数，必须注意维护原始原型。
> 运行时应用装饰器的逻辑 **不会** 为你执行此操作。

以下是将类装饰器（`@sealed`）应用于 `BugReport` 类的示例：

```ts twoslash
// @experimentalDecorators
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
// ---cut---
@sealed
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}
```

我们可以使用以下函数声明来定义 `@sealed` 装饰器：

```ts
function sealed(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}
```

当 `@sealed` 执行时，它将密封构造函数及其原型，从而阻止在运行时通过访问 `BugReport.prototype` 或在 `BugReport` 本身上定义属性来向此类添加或移除任何进一步的功能（注意 ES2015 类实际上只是基于原型的构造函数的语法糖）。此装饰器 **不会** 阻止类继承 `BugReport`。

接下来我们有一个如何覆盖构造函数以设置新默认值的示例。

<!-- prettier-ignore -->
```ts twoslash
// @errors: 2339
// @experimentalDecorators
function reportableClassDecorator<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    reportingURL = "http://www...";
  };
}

@reportableClassDecorator
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }
}

const bug = new BugReport("Needs dark mode");
console.log(bug.title); // Prints "Needs dark mode"
console.log(bug.type); // Prints "report"

// Note that the decorator _does not_ change the TypeScript type
// and so the new property `reportingURL` is not known
// to the type system:
bug.reportingURL;
```

## 方法装饰器

_方法装饰器_ 在方法声明之前声明。
装饰器应用于方法的 _属性描述符_，可用于观察、修改或替换方法定义。
方法装饰器不能在声明文件中使用，不能在重载上使用，也不能在任何其他环境上下文中使用（例如在 `declare` 类中）。

方法装饰器的表达式将在运行时作为函数被调用，并传入以下三个参数：

1. 对于静态成员，是类的构造函数；对于实例成员，是类的原型。
2. 成员的名称。
3. 该成员的 _属性描述符_。

> 注意&emsp; 如果你的脚本目标小于 `ES5`，_属性描述符_ 将是 `undefined`。

如果方法装饰器返回一个值，它将用作方法的 _属性描述符_。

> 注意&emsp; 如果你的脚本目标小于 `ES5`，返回值将被忽略。

以下是将方法装饰器（`@enumerable`）应用于 `Greeter` 类方法的示例：

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
function enumerable(value: boolean) {
  return function (target: any,propertyKey: string,descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
// ---cut---
class Greeter {
  greeting: string;
  constructor(message: string) {
    this.greeting = message;
  }

  @enumerable(false)
  greet() {
    return "Hello, " + this.greeting;
  }
}
```

我们可以使用以下函数声明来定义 `@enumerable` 装饰器：

<!-- prettier-ignore -->
```ts twoslash
function enumerable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.enumerable = value;
  };
}
```

这里的 `@enumerable(false)` 装饰器是一个 [装饰器工厂](#装饰器工厂)。
当调用 `@enumerable(false)` 装饰器时，它会修改属性描述符的 `enumerable` 属性。

## 访问器装饰器

_访问器装饰器_ 在访问器声明之前声明。
访问器装饰器应用于访问器的 _属性描述符_，可用于观察、修改或替换访问器的定义。
访问器装饰器不能在声明文件中使用，也不能在任何其他环境上下文中使用（例如在 `declare` 类中）。

> 注意&emsp; TypeScript 不允许为单个成员同时装饰 `get` 和 `set` 访问器。
> 相反，该成员的所有装饰器必须应用于文档顺序中指定的第一个访问器。
> 这是因为装饰器应用于 _属性描述符_，它组合了 `get` 和 `set` 访问器，而不是分别应用于每个声明。

访问器装饰器的表达式将在运行时作为函数被调用，并传入以下三个参数：

1. 对于静态成员，是类的构造函数；对于实例成员，是类的原型。
2. 成员的名称。
3. 该成员的 _属性描述符_。

> 注意&emsp; 如果你的脚本目标小于 `ES5`，_属性描述符_ 将是 `undefined`。

如果访问器装饰器返回一个值，它将用作该成员的 _属性描述符_。

> 注意&emsp; 如果你的脚本目标小于 `ES5`，返回值将被忽略。

以下是将访问器装饰器（`@configurable`）应用于 `Point` 类成员的示例：

```ts twoslash
// @experimentalDecorators
function configurable(value: boolean) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.configurable = value;
  };
}
// ---cut---
class Point {
  private _x: number;
  private _y: number;
  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() {
    return this._x;
  }

  @configurable(false)
  get y() {
    return this._y;
  }
}
```

我们可以使用以下函数声明来定义 `@configurable` 装饰器：

<!-- prettier-ignore -->
```ts
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}
```

## 属性装饰器

_属性装饰器_ 在属性声明之前声明。
属性装饰器不能在声明文件中使用，也不能在任何其他环境上下文中使用（例如在 `declare` 类中）。

属性装饰器的表达式将在运行时作为函数被调用，并传入以下两个参数：

1. 对于静态成员，是类的构造函数；对于实例成员，是类的原型。
2. 成员的名称。

> 注意&emsp; _属性描述符_ 不会作为参数传递给属性装饰器，这是由于属性装饰器在 TypeScript 中的初始化方式。
> 这是因为目前没有机制在定义原型成员时描述实例属性，也没有办法观察或修改属性的初始化器。返回值也会被忽略。
> 因此，属性装饰器只能用于观察具有特定名称的属性是否已为类声明。

我们可以使用这些信息来记录关于属性的元数据，如以下示例所示：

```ts
class Greeter {
  @format("Hello, %s")
  greeting: string;

  constructor(message: string) {
    this.greeting = message;
  }

  greet() {
    let formatString = getFormat(this, "greeting");
    return formatString.replace("%s", this.greeting);
  }
}
```

然后我们可以使用以下函数声明来定义 `@format` 装饰器和 `getFormat` 函数：

```ts
import "reflect-metadata";

const formatMetadataKey = Symbol("format");

function format(formatString: string) {
  return Reflect.metadata(formatMetadataKey, formatString);
}

function getFormat(target: any, propertyKey: string) {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
```

这里的 `@format("Hello, %s")` 装饰器是一个 [装饰器工厂](#装饰器工厂)。
当调用 `@format("Hello, %s")` 时，它使用 `reflect-metadata` 库的 `Reflect.metadata` 函数为属性添加元数据条目。
当调用 `getFormat` 时，它会读取格式的元数据值。

> 注意&emsp; 此示例需要 `reflect-metadata` 库。
> 有关 `reflect-metadata` 库的更多信息，请参见 [元数据](#元数据)。

## 参数装饰器

_参数装饰器_ 在参数声明之前声明。
参数装饰器应用于类构造函数或方法声明的函数。
参数装饰器不能在声明文件中使用，不能在重载上使用，也不能在任何其他环境上下文中使用（例如在 `declare` 类中）。

参数装饰器的表达式将在运行时作为函数被调用，并传入以下三个参数：

1. 对于静态成员，是类的构造函数；对于实例成员，是类的原型。
2. 成员的名称。
3. 参数在函数参数列表中的序号索引。

> 注意&emsp; 参数装饰器只能用于观察参数是否已在方法上声明。

参数装饰器的返回值被忽略。

以下是将参数装饰器（`@required`）应用于 `BugReport` 类成员参数的示例：

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {}
function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {}
// ---cut---
class BugReport {
  type = "report";
  title: string;

  constructor(t: string) {
    this.title = t;
  }

  @validate
  print(@required verbose: boolean) {
    if (verbose) {
      return `type: ${this.type}\ntitle: ${this.title}`;
    } else {
     return this.title; 
    }
  }
}
```

然后我们可以使用以下函数声明来定义 `@required` 和 `@validate` 装饰器：

<!-- prettier-ignore -->
```ts twoslash
// @experimentalDecorators
// @emitDecoratorMetadata
import "reflect-metadata";
const requiredMetadataKey = Symbol("required");

function required(target: Object, propertyKey: string | symbol, parameterIndex: number) {
  let existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
  existingRequiredParameters.push(parameterIndex);
  Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);
}

function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
  let method = descriptor.value!;

  descriptor.value = function () {
    let requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
    if (requiredParameters) {
      for (let parameterIndex of requiredParameters) {
        if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
          throw new Error("Missing required argument.");
        }
      }
    }
    return method.apply(this, arguments);
  };
}
```

`@required` 装饰器添加一个元数据条目，将参数标记为必需的。
`@validate` 装饰器然后将现有的 `print` 方法包装在一个函数中，该函数在调用原始方法之前验证参数。

> 注意&emsp; 此示例需要 `reflect-metadata` 库。
> 有关 `reflect-metadata` 库的更多信息，请参见 [元数据](#元数据)。

## 元数据

某些示例使用 `reflect-metadata` 库，它为 [实验性元数据 API](https://github.com/rbuckton/ReflectDecorators) 添加了 polyfill。
此库尚未成为 ECMAScript（JavaScript）标准的一部分。
但是，一旦装饰器被正式采纳为 ECMAScript 标准的一部分，这些扩展将被提议采纳。

你可以通过 npm 安装此库：

```shell
npm i reflect-metadata --save
```

TypeScript 包含对为带有装饰器的声明生成某些类型元数据的实验性支持。
要启用此实验性支持，你必须在命令行或 `tsconfig.json` 中设置 [`emitDecoratorMetadata`](https://www.typescriptlang.org/tsconfig#emitDecoratorMetadata) 编译器选项：

**命令行**：

```shell
tsc --target ES5 --experimentalDecorators --emitDecoratorMetadata
```

**tsconfig.json**：

```json tsconfig
{
  "compilerOptions": {
    "target": "ES5",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

启用后，只要已导入 `reflect-metadata` 库，额外的设计时类型信息将在运行时暴露。

我们可以在以下示例中看到这一点：

<!-- prettier-ignore -->
```ts twoslash
// @emitDecoratorMetadata
// @experimentalDecorators
// @strictPropertyInitialization: false
import "reflect-metadata";

class Point {
  constructor(public x: number, public y: number) {}
}

class Line {
  private _start: Point;
  private _end: Point;

  @validate
  set start(value: Point) {
    this._start = value;
  }

  get start() {
    return this._start;
  }

  @validate
  set end(value: Point) {
    this._end = value;
  }

  get end() {
    return this._end;
  }
}

function validate<T>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
  let set = descriptor.set!;
  
  descriptor.set = function (value: T) {
    let type = Reflect.getMetadata("design:type", target, propertyKey);

    if (!(value instanceof type)) {
      throw new TypeError(`Invalid type, got ${typeof value} not ${type.name}.`);
    }

    set.call(this, value);
  };
}

const line = new Line()
line.start = new Point(0, 0)

// @ts-ignore
// line.end = {}

// Fails at runtime with:
// > Invalid type, got object not Point

```

TypeScript 编译器将使用 `@Reflect.metadata` 装饰器注入设计时类型信息。
你可以将其视为等效于以下 TypeScript：

```ts
class Line {
  private _start: Point;
  private _end: Point;

  @validate
  @Reflect.metadata("design:type", Point)
  set start(value: Point) {
    this._start = value;
  }
  get start() {
    return this._start;
  }

  @validate
  @Reflect.metadata("design:type", Point)
  set end(value: Point) {
    this._end = value;
  }
  get end() {
    return this._end;
  }
}
```

> 注意&emsp; 装饰器元数据是一个实验性功能，可能会在未来版本中引入破坏性更改。
