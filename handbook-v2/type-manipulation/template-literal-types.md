---
title: 模板字面量类型
---

模板字面量类型建立在[字符串字面量类型](/handbook-v2/everyday-types#字面量类型)之上，并且能够通过联合类型扩展为多个字符串。

它们具有与 [JavaScript 中的模板字符串](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)相同的语法，但用于类型位置。
当与具体的字面量类型一起使用时，模板字面量通过连接内容产生一个新的字符串字面量类型。

```ts twoslash
type World = "world";

type Greeting = `hello ${World}`;
//   ^?
```

当在插值位置使用联合类型时，该类型是每个联合成员可能表示的每个字符串字面量的集合：

```ts twoslash
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";

type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
//   ^?
```

对于模板字面量中的每个插值位置，联合类型会 _交叉相乘_：

```ts twoslash
type EmailLocaleIDs = "welcome_email" | "email_heading";
type FooterLocaleIDs = "footer_title" | "footer_sendoff";
// ---cut---
type AllLocaleIDs = `${EmailLocaleIDs | FooterLocaleIDs}_id`;
type Lang = "en" | "ja" | "pt";

type LocaleMessageIDs = `${Lang}_${AllLocaleIDs}`;
//   ^?
```

我们通常建议人们预先生成大型字符串联合类型，但这在较小的场景下很有用。

### 类型中的字符串联合类型

模板字面量的强大之处在于基于类型内部的信息定义新字符串。

考虑一个函数（`makeWatchedObject`）向传入的对象添加一个名为 `on()` 的新函数的情况。在 JavaScript 中，其调用可能如下所示：`makeWatchedObject(baseObject)`。我们可以想象基础对象看起来像这样：

```ts twoslash
// @noErrors
const passedObject = {
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
};
```

将添加到基础对象的 `on` 函数期望两个参数，一个 `eventName`（一个 `string`）和一个 `callback`（一个 `function`）。

`eventName` 应该是 `attributeInThePassedObject + "Changed"` 的形式；因此，从基础对象中的属性 `firstName` 派生出 `firstNameChanged`。

调用 `callback` 函数时：
  * 应该传入与名称 `attributeInThePassedObject` 关联的类型的值；因此，由于 `firstName` 的类型为 `string`，`firstNameChanged` 事件的回调期望在调用时传入一个 `string`。类似地，与 `age` 关联的事件应该期望使用 `number` 参数调用
  * 应该有 `void` 返回类型（为了演示简单起见）

因此，`on()` 的简单函数签名可能是：`on(eventName: string, callback: (newValue: any) => void)`。然而，在前面的描述中，我们确定了希望在代码中记录的重要类型约束。模板字面量类型让我们能够将这些约束引入我们的代码。

```ts twoslash
// @noErrors
declare function makeWatchedObject(obj: any): any;
// ---cut---
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26,
});

// makeWatchedObject 已向匿名对象添加了 `on`

person.on("firstNameChanged", (newValue) => {
  console.log(`firstName was changed to ${newValue}!`);
});
```

注意 `on` 监听的是事件 `"firstNameChanged"`，而不仅仅是 `"firstName"`。如果我们确保合格的事件名称集受到监视对象中属性名称联合加上末尾的 "Changed" 的约束，我们对 `on()` 的简单规范可以更加健壮。虽然我们习惯于在 JavaScript 中进行这样的计算，即 ``Object.keys(passedObject).map(x => `${x}Changed`)``，但 _在类型系统中_ 的模板字面量提供了一种类似的字符串操作方法：

```ts twoslash
type PropEventSource<Type> = {
    on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};

/// 创建一个带有 `on` 方法的"监视对象"
/// 以便你可以监视属性的变化。
declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;
```

有了这个，我们可以构建一个在传入错误属性时报错的东西：

```ts twoslash
// @errors: 2345
type PropEventSource<Type> = {
    on(eventName: `${string & keyof Type}Changed`, callback: (newValue: any) => void): void;
};

declare function makeWatchedObject<T>(obj: T): T & PropEventSource<T>;
// ---cut---
const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26
});

person.on("firstNameChanged", () => {});

// 防止人为错误（使用键而不是事件名称）
person.on("firstName", () => {});

// 具有抗拼写错误能力
person.on("frstNameChanged", () => {});
```

### 使用模板字面量进行推断

请注意，我们并没有从原始传入对象中提供的所有信息中受益。给定 `firstName` 的变化（即 `firstNameChanged` 事件），我们应该期望回调将接收一个 `string` 类型的参数。类似地，`age` 变化的回调应该接收一个 `number` 参数。我们天真地使用 `any` 来类型化 `callback` 的参数。同样，模板字面量类型可以确保属性的数据类型与该属性的回调的第一个参数类型相同。

使这成为可能的关键见解是：我们可以使用带有泛型的函数，使得：

1. 第一个参数中使用的字面量被捕获为字面量类型
2. 该字面量类型可以被验证为在泛型的有效属性联合中
3. 验证后的属性的类型可以使用索引访问在泛型的结构中查找
4. 然后可以将此类型信息 _应用_ 以确保回调函数的参数类型相同


```ts twoslash
type PropEventSource<Type> = {
    on<Key extends string & keyof Type>
        (eventName: `${Key}Changed`, callback: (newValue: Type[Key]) => void): void;
};

declare function makeWatchedObject<Type>(obj: Type): Type & PropEventSource<Type>;

const person = makeWatchedObject({
  firstName: "Saoirse",
  lastName: "Ronan",
  age: 26
});

person.on("firstNameChanged", newName => {
    //                        ^?
    console.log(`new name is ${newName.toUpperCase()}`);
});

person.on("ageChanged", newAge => {
    //                  ^?
    if (newAge < 0) {
        console.warn("warning! negative age");
    }
})
```

这里我们将 `on` 变成了一个泛型方法。

当用户使用字符串 `"firstNameChanged"` 调用时，TypeScript 将尝试推断 `Key` 的正确类型。
为此，它会将 `Key` 与 `"Changed"` 之前的内容匹配，并推断出字符串 `"firstName"`。
一旦 TypeScript 弄清楚这一点，`on` 方法就可以获取原始对象上 `firstName` 的类型，在本例中是 `string`。
类似地，当使用 `"ageChanged"` 调用时，TypeScript 找到属性 `age` 的类型，即 `number`。

推断可以以不同的方式组合，通常用于解构字符串，并以不同的方式重建它们。

## 内置字符串操作类型

为了帮助进行字符串操作，TypeScript 包含一组可用于字符串操作的类型。这些类型内置于编译器中以获得性能，无法在 TypeScript 附带的 `.d.ts` 文件中找到。

### `Uppercase<StringType>`

将字符串中的每个字符转换为大写版本。

##### 示例

```ts twoslash
type Greeting = "Hello, world"
type ShoutyGreeting = Uppercase<Greeting>
//   ^?

type ASCIICacheKey<Str extends string> = `ID-${Uppercase<Str>}`
type MainID = ASCIICacheKey<"my_app">
//   ^?
```

### `Lowercase<StringType>`

将字符串中的每个字符转换为小写版本。

##### 示例

```ts twoslash
type Greeting = "Hello, world"
type QuietGreeting = Lowercase<Greeting>
//   ^?

type ASCIICacheKey<Str extends string> = `id-${Lowercase<Str>}`
type MainID = ASCIICacheKey<"MY_APP">
//   ^?
```

### `Capitalize<StringType>`

将字符串中的第一个字符转换为大写版本。

##### 示例

```ts twoslash
type LowercaseGreeting = "hello, world";
type Greeting = Capitalize<LowercaseGreeting>;
//   ^?
```

### `Uncapitalize<StringType>`

将字符串中的第一个字符转换为小写版本。

##### 示例

```ts twoslash
type UppercaseGreeting = "HELLO WORLD";
type UncomfortableGreeting = Uncapitalize<UppercaseGreeting>;
//   ^?
```

<details>
    <summary>关于内置字符串操作类型的技术细节</summary>
    <p>从 TypeScript 4.1 开始，这些内置函数的代码直接使用 JavaScript 字符串运行时函数进行操作，并且不具备区域感知能力。</p>
    <code><pre>
function applyStringMapping(symbol: Symbol, str: string) {
    switch (intrinsicTypeKinds.get(symbol.escapedName as string)) {
        case IntrinsicTypeKind.Uppercase: return str.toUpperCase();
        case IntrinsicTypeKind.Lowercase: return str.toLowerCase();
        case IntrinsicTypeKind.Capitalize: return str.charAt(0).toUpperCase() + str.slice(1);
        case IntrinsicTypeKind.Uncapitalize: return str.charAt(0).toLowerCase() + str.slice(1);
    }
    return str;
}</pre></code>
</details>
