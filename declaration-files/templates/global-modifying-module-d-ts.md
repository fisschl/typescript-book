---
title: "全局：修改模块"
---

## _全局修改模块_

_全局修改模块_ 在导入时会改变全局作用域中的现有值。
例如，可能存在一个库，在导入时会向 `String.prototype` 添加新成员。
由于可能发生运行时冲突，这种模式有些危险，
但我们仍然可以为它编写声明文件。

## 识别全局修改模块

全局修改模块通常很容易从其文档中识别出来。
一般来说，它们类似于全局插件，但需要一个 `require` 调用来激活其效果。

你可能会看到如下文档：

```js
// 'require' call that doesn't use its return value
var unused = require("magic-string-time");
/* or */
require("magic-string-time");

var x = "hello, world";
// Creates new methods on built-in types
console.log(x.startsWithHello());

var y = [1, 2, 3];
// Creates new methods on built-in types
console.log(y.reverseAndSort());
```

这里有一个示例

```ts
// Type definitions for [~THE LIBRARY NAME~] [~OPTIONAL VERSION NUMBER~]
// Project: [~THE PROJECT NAME~]
// Definitions by: [~YOUR NAME~] <[~A URL FOR YOU~]>

/*~ This is the global-modifying module template file. You should rename it to index.d.ts
 *~ and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

/*~ Note: If your global-modifying module is callable or constructable, you'll
 *~ need to combine the patterns here with those in the module-class or module-function
 *~ template files
 */
declare global {
  /*~ Here, declare things that go in the global namespace, or augment
   *~ existing declarations in the global namespace
   */
  interface String {
    fancyFormat(opts: StringFormatOptions): string;
  }
}

/*~ If your module exports types or values, write them as usual */
export interface StringFormatOptions {
  fancinessLevel: number;
}

/*~ For example, declaring a method on the module (in addition to its global side effects) */
export function doSomething(): void;

/*~ If your module exports nothing, you'll need this line. Otherwise, delete it */
export {};
```
