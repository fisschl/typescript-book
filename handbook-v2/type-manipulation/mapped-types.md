---
title: 映射类型
---

当你不想重复自己时，有时一个类型需要基于另一个类型。

映射类型建立在索引签名的语法之上，索引签名用于声明那些尚未预先声明的属性的类型：

```ts twoslash
type Horse = {};
// ---cut---
type OnlyBoolsAndHorses = {
  [key: string]: boolean | Horse;
};

const conforms: OnlyBoolsAndHorses = {
  del: true,
  rodney: false,
};
```

映射类型是一种泛型类型，它使用 `PropertyKey` 的联合（通常通过 [`keyof`](/handbook-v2/type-manipulation/indexed-access-types) 创建）来遍历键以创建类型：

```ts twoslash
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
```

在此示例中，`OptionsFlags` 将获取类型 `Type` 的所有属性，并将其值更改为 `boolean`。

```ts twoslash
type OptionsFlags<Type> = {
  [Property in keyof Type]: boolean;
};
// ---cut---
type Features = {
  darkMode: () => void;
  newUserProfile: () => void;
};

type FeatureOptions = OptionsFlags<Features>;
//   ^?
```

### 映射修饰符

在映射过程中可以应用两个额外的修饰符：`readonly` 和 `?`，它们分别影响可变性和可选性。

你可以通过添加 `-` 或 `+` 前缀来移除或添加这些修饰符。如果不添加前缀，则假定为 `+`。

```ts twoslash
// Removes 'readonly' attributes from a type's properties
type CreateMutable<Type> = {
  -readonly [Property in keyof Type]: Type[Property];
};

type LockedAccount = {
  readonly id: string;
  readonly name: string;
};

type UnlockedAccount = CreateMutable<LockedAccount>;
//   ^?
```

```ts twoslash
// Removes 'optional' attributes from a type's properties
type Concrete<Type> = {
  [Property in keyof Type]-?: Type[Property];
};

type MaybeUser = {
  id: string;
  name?: string;
  age?: number;
};

type User = Concrete<MaybeUser>;
//   ^?
```

## 通过 `as` 进行键重映射

在 TypeScript 4.1 及更高版本中，你可以在映射类型中使用 `as` 子句重新映射键：

```ts
type MappedTypeWithNewProperties<Type> = {
    [Properties in keyof Type as NewKeyType]: Type[Properties]
}
```

你可以利用[模板字面量类型](/handbook-v2/type-manipulation/template-literal-types)等功能从先前的属性名创建新的属性名：

```ts twoslash
type Getters<Type> = {
    [Property in keyof Type as `get${Capitalize<string & Property>}`]: () => Type[Property]
};

interface Person {
    name: string;
    age: number;
    location: string;
}

type LazyPerson = Getters<Person>;
//   ^?
```

你可以通过条件类型生成 `never` 来过滤掉键：

```ts twoslash
// Remove the 'kind' property
type RemoveKindField<Type> = {
    [Property in keyof Type as Exclude<Property, "kind">]: Type[Property]
};

interface Circle {
    kind: "circle";
    radius: number;
}

type KindlessCircle = RemoveKindField<Circle>;
//   ^?
```

你可以映射任意的联合类型，而不仅仅是 `string | number | symbol` 的联合，而是任何类型的联合：

```ts twoslash
type EventConfig<Events extends { kind: string }> = {
    [E in Events as E["kind"]]: (event: E) => void;
}

type SquareEvent = { kind: "square", x: number, y: number };
type CircleEvent = { kind: "circle", radius: number };

type Config = EventConfig<SquareEvent | CircleEvent>
//   ^?
```

### 进一步探索

映射类型与本类型操作部分中的其他功能配合良好，例如这里有一个使用[条件类型](/handbook-v2/type-manipulation/conditional-types)的映射类型，它根据对象是否将属性 `pii` 设置为字面量 `true` 来返回 `true` 或 `false`：

```ts twoslash
type ExtractPII<Type> = {
  [Property in keyof Type]: Type[Property] extends { pii: true } ? true : false;
};

type DBFields = {
  id: { format: "incrementing" };
  name: { type: string; pii: true };
};

type ObjectsNeedingGDPRDeletion = ExtractPII<DBFields>;
//   ^?
```
