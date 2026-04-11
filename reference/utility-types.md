---
title: 工具类型
---

TypeScript 提供了几个工具类型来促进常见的类型转换。这些工具类型在全球范围内可用。

## `Awaited<Type>`

<blockquote class=bg-reading>

发布于：
[4.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#the-awaited-type-and-promise-improvements)

</blockquote>

此类型用于模拟 `async` 函数中的 `await` 操作，或 `Promise` 上的 `.then()` 方法——特别是它们递归解包 `Promise` 的方式。

##### 示例

```ts twoslash
type A = Awaited<Promise<string>>;

type B = Awaited<Promise<Promise<number>>>;

type C = Awaited<boolean | Promise<number>>;
```

## `Partial<Type>`

<blockquote class=bg-reading>

发布于：
[2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

构造一个将 `Type` 的所有属性设置为可选的类型。此工具将返回一个表示给定类型所有子集的类型。

##### 示例

```ts twoslash
interface Todo {
  title: string;
  description: string;
}

function updateTodo(todo: Todo, fieldsToUpdate: Partial<Todo>) {
  return { ...todo, ...fieldsToUpdate };
}

const todo1 = {
  title: "organize desk",
  description: "clear clutter",
};

const todo2 = updateTodo(todo1, {
  description: "throw out trash",
});
```

## `Required<Type>`

<blockquote class=bg-reading>

发布于：
[2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#improved-control-over-mapped-type-modifiers)

</blockquote>

构造一个由 `Type` 的所有属性设置为必需的类型组成。与 [`Partial`](#partialtype) 相反。

##### 示例

```ts twoslash
// @errors: 2741
interface Props {
  a?: number;
  b?: string;
}

const obj: Props = { a: 5 };

const obj2: Required<Props> = { a: 5 };
```

## `Readonly<Type>`

<blockquote class=bg-reading>

发布于：
[2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

构造一个将 `Type` 的所有属性设置为 `readonly` 的类型，这意味着构造类型的属性不能被重新赋值。

##### 示例

```ts twoslash
// @errors: 2540
interface Todo {
  title: string;
}

const todo: Readonly<Todo> = {
  title: "Delete inactive users",
};

todo.title = "Hello";
```

此工具对于表示将在运行时失败的赋值表达式很有用（即尝试重新赋值 [冻结对象](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) 的属性时）。

##### `Object.freeze`

```ts
function freeze<Type>(obj: Type): Readonly<Type>;
```

## `Record<Keys, Type>`

<blockquote class=bg-reading>

发布于：
[2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

构造一个对象类型，其属性键为 `Keys`，属性值为 `Type`。此工具可用于将类型的属性映射到另一种类型。

##### 示例

```ts twoslash
type CatName = "miffy" | "boris" | "mordred";

interface CatInfo {
  age: number;
  breed: string;
}

const cats: Record<CatName, CatInfo> = {
  miffy: { age: 10, breed: "Persian" },
  boris: { age: 5, breed: "Maine Coon" },
  mordred: { age: 16, breed: "British Shorthair" },
};

cats.boris;
```

## `Pick<Type, Keys>`

<blockquote class=bg-reading>

发布于：
[2.1](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html#partial-readonly-record-and-pick)

</blockquote>

通过从 `Type` 中选取属性集 `Keys`（字符串字面量或字符串字面量的联合）来构造一个类型。

##### 示例

```ts twoslash
interface Todo {
  title: string;
  description: string;
  completed: boolean;
}

type TodoPreview = Pick<Todo, "title" | "completed">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
};

todo;
```

## `Omit<Type, Keys>`

<blockquote class=bg-reading>

发布于：
[3.5](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html#the-omit-helper-type)

</blockquote>

通过从 `Type` 中选取所有属性，然后删除 `Keys`（字符串字面量或字符串字面量的联合）来构造一个类型。与 [`Pick`](#picktype-keys) 相反。

##### 示例

```ts twoslash
interface Todo {
  title: string;
  description: string;
  completed: boolean;
  createdAt: number;
}

type TodoPreview = Omit<Todo, "description">;

const todo: TodoPreview = {
  title: "Clean room",
  completed: false,
  createdAt: 1615544252770,
};

todo;

type TodoInfo = Omit<Todo, "completed" | "createdAt">;

const todoInfo: TodoInfo = {
  title: "Pick up kids",
  description: "Kindergarten closes at 5pm",
};

todoInfo;
```

## `Exclude<UnionType, ExcludedMembers>`

<blockquote class=bg-reading>

发布于：
[2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

通过从 `UnionType` 中排除所有可赋值给 `ExcludedMembers` 的联合成员来构造一个类型。

##### 示例

```ts twoslash
type T0 = Exclude<"a" | "b" | "c", "a">;
type T1 = Exclude<"a" | "b" | "c", "a" | "b">;
type T2 = Exclude<string | number | (() => void), Function>;

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };

type T3 = Exclude<Shape, { kind: "circle" }>
```

## `Extract<Type, Union>`

<blockquote class=bg-reading>

发布于：
[2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

通过从 `Type` 中提取所有可赋值给 `Union` 的联合成员来构造一个类型。

##### 示例

```ts twoslash
type T0 = Extract<"a" | "b" | "c", "a" | "f">;
type T1 = Extract<string | number | (() => void), Function>;

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; x: number }
  | { kind: "triangle"; x: number; y: number };

type T2 = Extract<Shape, { kind: "circle" }>
```

## `NonNullable<Type>`

<blockquote class=bg-reading>

发布于：
[2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

通过从 `Type` 中排除 `null` 和 `undefined` 来构造一个类型。

##### 示例

```ts twoslash
type T0 = NonNullable<string | number | undefined>;
type T1 = NonNullable<string[] | null | undefined>;
```

## `Parameters<Type>`

<blockquote class=bg-reading>

发布于：
[3.1](https://github.com/microsoft/TypeScript/pull/26243)

</blockquote>

从函数类型 `Type` 的参数中使用的类型构造一个元组类型。

对于重载函数，这将是 _最后一个_ 签名的参数；参见 [在条件类型中推断](/handbook-v2/type-manipulation/conditional-types#inferring-within-conditional-types)。

##### 示例

```ts twoslash
// @errors: 2344
declare function f1(arg: { a: number; b: string }): void;

type T0 = Parameters<() => string>;
type T1 = Parameters<(s: string) => void>;
type T2 = Parameters<<T>(arg: T) => T>;
type T3 = Parameters<typeof f1>;
type T4 = Parameters<any>;
type T5 = Parameters<never>;
type T6 = Parameters<string>;
type T7 = Parameters<Function>;
```

## `ConstructorParameters<Type>`

<blockquote class=bg-reading>

发布于：
[3.1](https://github.com/microsoft/TypeScript/pull/26243)

</blockquote>

从构造函数类型的类型构造一个元组或数组类型。它生成一个包含所有参数类型的元组类型（如果 `Type` 不是函数，则为 `never` 类型）。

##### 示例

```ts twoslash
// @errors: 2344
// @strict: false
type T0 = ConstructorParameters<ErrorConstructor>;
type T1 = ConstructorParameters<FunctionConstructor>;
type T2 = ConstructorParameters<RegExpConstructor>;
class C {
  constructor(a: number, b: string) {}
}
type T3 = ConstructorParameters<typeof C>;
type T4 = ConstructorParameters<any>;

type T5 = ConstructorParameters<Function>;
```

## `ReturnType<Type>`

<blockquote class=bg-reading>

发布于：
[2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

构造一个由函数 `Type` 的返回类型组成的类型。

对于重载函数，这将是 _最后一个_ 签名的返回类型；参见 [在条件类型中推断](/handbook-v2/type-manipulation/conditional-types#inferring-within-conditional-types)。

##### 示例

```ts twoslash
// @errors: 2344 2344
declare function f1(): { a: number; b: string };

type T0 = ReturnType<() => string>;
type T1 = ReturnType<(s: string) => void>;
type T2 = ReturnType<<T>() => T>;
type T3 = ReturnType<<T extends U, U extends number[]>() => T>;
type T4 = ReturnType<typeof f1>;
type T5 = ReturnType<any>;
type T6 = ReturnType<never>;
type T7 = ReturnType<string>;
type T8 = ReturnType<Function>;
```

## `InstanceType<Type>`

<blockquote class=bg-reading>

发布于：
[2.8](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#predefined-conditional-types)

</blockquote>

构造一个由 `Type` 中构造函数函数的实例类型组成的类型。

##### 示例

```ts twoslash
// @errors: 2344 2344
// @strict: false
class C {
  x = 0;
  y = 0;
}

type T0 = InstanceType<typeof C>;
type T1 = InstanceType<any>;
type T2 = InstanceType<never>;
type T3 = InstanceType<string>;
type T4 = InstanceType<Function>;
```

## `NoInfer<Type>`

<blockquote class=bg-reading>

发布于：
[5.4](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html#the-noinfer-utility-type)

</blockquote>

阻止对包含类型的推断。除了阻止推断外，`NoInfer<Type>` 与 `Type` 完全相同。

##### 示例

```ts
function createStreetLight<C extends string>(
  colors: C[],
  defaultColor?: NoInfer<C>,
) {
  // ...
}

createStreetLight(["red", "yellow", "green"], "red");  // OK
createStreetLight(["red", "yellow", "green"], "blue");  // Error
```

## `ThisParameterType<Type>`

<blockquote class=bg-reading>

发布于：
[3.3](https://github.com/microsoft/TypeScript/pull/28920)

</blockquote>

提取函数类型的 [this](/handbook-v2/more-on-functions#this-parameters) 参数的类型，如果函数类型没有 `this` 参数，则为 [unknown](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-0.html#new-unknown-top-type)。

##### 示例

```ts twoslash
function toHex(this: Number) {
  return this.toString(16);
}

function numberToString(n: ThisParameterType<typeof toHex>) {
  return toHex.apply(n);
}
```

## `OmitThisParameter<Type>`

<blockquote class=bg-reading>

发布于：
[3.3](https://github.com/microsoft/TypeScript/pull/28920)

</blockquote>

从 `Type` 中移除 [`this`](/handbook-v2/more-on-functions#this-parameters) 参数。如果 `Type` 没有显式声明的 `this` 参数，结果就只是 `Type`。否则，会从 `Type` 创建一个没有 `this` 参数的新函数类型。泛型被擦除，只有最后一个重载签名被传播到新函数类型中。

##### 示例

```ts twoslash
function toHex(this: Number) {
  return this.toString(16);
}

const fiveToHex: OmitThisParameter<typeof toHex> = toHex.bind(5);

console.log(fiveToHex());
```

## `ThisType<Type>`

<blockquote class=bg-reading>

发布于：
[2.3](https://github.com/microsoft/TypeScript/pull/14141)

</blockquote>

此工具不返回转换后的类型。相反，它用作上下文 [`this`](/handbook-v2/more-on-functions#this) 类型的标记。注意，必须启用 [`noImplicitThis`](https://www.typescriptlang.org/tsconfig#noImplicitThis) 标志才能使用此工具。

##### 示例

```ts twoslash
// @noImplicitThis: true
type ObjectDescriptor<D, M> = {
  data?: D;
  methods?: M & ThisType<D & M>; // Type of 'this' in methods is D & M
};

function makeObject<D, M>(desc: ObjectDescriptor<D, M>): D & M {
  let data: object = desc.data || {};
  let methods: object = desc.methods || {};
  return { ...data, ...methods } as D & M;
}

let obj = makeObject({
  data: { x: 0, y: 0 },
  methods: {
    moveBy(dx: number, dy: number) {
      this.x += dx; // Strongly typed this
      this.y += dy; // Strongly typed this
    },
  },
});

obj.x = 10;
obj.y = 20;
obj.moveBy(5, 5);
```

在上面的示例中，`makeObject` 参数中的 `methods` 对象具有包含 `ThisType<D & M>` 的上下文类型，因此 `methods` 对象中方法的 [this](/handbook-v2/more-on-functions#this) 类型是 `{ x: number, y: number } & { moveBy(dx: number, dy: number): void }`。注意 `methods` 属性的类型如何同时是推断目标和 `methods` 中 `this` 类型的来源。

`ThisType<T>` 标记接口只是在 `lib.d.ts` 中声明的空接口。除了被识别为对象字面量的上下文类型外，该接口的行为与任何空接口一样。

## 内置字符串操作类型

### `Uppercase<StringType>`

### `Lowercase<StringType>`

### `Capitalize<StringType>`

### `Uncapitalize<StringType>`

为了帮助在模板字符串字面量周围进行字符串操作，TypeScript 包含一组可在类型系统内进行字符串操作的类型。你可以在 [模板字面量类型](/handbook-v2/type-manipulation/template-literal-types#uppercasestringtype) 文档中找到这些类型。
