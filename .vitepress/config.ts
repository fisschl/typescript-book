import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { createFileSystemTypesCache } from "@shikijs/vitepress-twoslash/cache-fs";

export default defineConfig({
  title: "TypeScript 手册",
  base: "/typescript-book/",
  srcExclude: ["TypeScript-Website/**"],
  head: [
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/typescript-book/vitepress-logo-mini.svg",
      },
    ],
  ],
  themeConfig: {
    sidebar: {
      "/": [
        {
          text: "入门",
          items: [
            {
              text: "面向新程序员的 TypeScript",
              link: "/get-started/ts-for-the-new-programmer",
            },
            {
              text: "面向 JavaScript 程序员的 TypeScript",
              link: "/get-started/ts-for-js-programmers",
            },
            {
              text: "面向 Java/C# 程序员的 TypeScript",
              link: "/get-started/ts-for-oopers",
            },
            {
              text: "面向函数式程序员的 TypeScript",
              link: "/get-started/ts-for-functional-programmers",
            },
            {
              text: "5 分钟了解 TypeScript 工具",
              link: "/tutorials/typescript-tooling-in-5-minutes",
            },
          ],
        },
        {
          text: "手册",
          items: [
            {
              text: "TypeScript 手册",
              link: "/handbook-v2/the-handbook",
            },
            {
              text: "基础",
              link: "/handbook-v2/basics",
            },
            {
              text: "日常类型",
              link: "/handbook-v2/everyday-types",
            },
            {
              text: "类型收窄",
              link: "/handbook-v2/narrowing",
            },
            {
              text: "深入函数",
              link: "/handbook-v2/more-on-functions",
            },
            {
              text: "对象类型",
              link: "/handbook-v2/object-types",
            },
            {
              text: "类型操作",
              items: [
                {
                  text: "从类型创建类型",
                  link: "/handbook-v2/type-manipulation/creating-types-from-types",
                },
                {
                  text: "泛型",
                  link: "/handbook-v2/type-manipulation/generics",
                },
                {
                  text: "keyof 类型运算符",
                  link: "/handbook-v2/type-manipulation/keyof-type-operator",
                },
                {
                  text: "typeof 类型运算符",
                  link: "/handbook-v2/type-manipulation/typeof-type-operator",
                },
                {
                  text: "索引访问类型",
                  link: "/handbook-v2/type-manipulation/indexed-access-types",
                },
                {
                  text: "条件类型",
                  link: "/handbook-v2/type-manipulation/conditional-types",
                },
                {
                  text: "映射类型",
                  link: "/handbook-v2/type-manipulation/mapped-types",
                },
                {
                  text: "模板字面量类型",
                  link: "/handbook-v2/type-manipulation/template-literal-types",
                },
              ],
            },
            {
              text: "类",
              link: "/handbook-v2/classes",
            },
            {
              text: "模块",
              link: "/handbook-v2/modules",
            },
          ],
        },
        {
          text: "参考",
          items: [
            { text: "工具类型", link: "/reference/utility-types" },
            { text: "装饰器", link: "/reference/decorators" },
            { text: "声明合并", link: "/reference/declaration-merging" },
            { text: "枚举", link: "/reference/enums" },
            {
              text: "迭代器和生成器",
              link: "/reference/iterators-and-generators",
            },
            { text: "JSX", link: "/reference/jsx" },
            { text: "混入", link: "/reference/mixins" },
            { text: "命名空间", link: "/reference/namespaces" },
            {
              text: "命名空间和模块",
              link: "/reference/namespaces-and-modules",
            },
            { text: "Symbols", link: "/reference/symbols" },
            { text: "三斜杠指令", link: "/reference/triple-slash-directives" },
            { text: "类型兼容性", link: "/reference/type-compatibility" },
            { text: "类型推断", link: "/reference/type-inference" },
            { text: "变量声明", link: "/reference/variable-declarations" },
          ],
        },
        {
          text: "模块参考",
          items: [
            { text: "介绍", link: "/modules-reference/introduction" },
            { text: "理论", link: "/modules-reference/theory" },
            {
              text: "指南",
              items: [
                {
                  text: "选择编译器选项",
                  link: "/modules-reference/guides/choosing-compiler-options",
                },
              ],
            },
            { text: "参考", link: "/modules-reference/reference" },
            {
              text: "附录",
              items: [
                {
                  text: "ESM/CJS 互操作性",
                  link: "/modules-reference/appendices/esm-cjs-interop",
                },
              ],
            },
          ],
        },
        {
          text: "教程",
          items: [
            {
              text: "ASP.NET Core",
              link: "/tutorials/asp-net-core",
            },
            {
              text: "Gulp",
              link: "/tutorials/gulp",
            },
            {
              text: "DOM 操作",
              link: "/tutorials/dom-manipulation",
            },
            {
              text: "从 JavaScript 迁移",
              link: "/tutorials/migrating-from-javascript",
            },
            {
              text: "在 TypeScript 中使用 Babel",
              link: "/tutorials/babel-with-typescript",
            },
          ],
        },
        {
          text: "声明文件",
          items: [
            {
              text: "介绍",
              link: "/declaration-files/introduction",
            },
            {
              text: "声明参考",
              link: "/declaration-files/by-example",
            },
            {
              text: "库结构",
              link: "/declaration-files/library-structures",
            },
            {
              text: ".d.ts 模板",
              items: [
                {
                  text: "模块：.d.ts",
                  link: "/declaration-files/templates/module-d-ts",
                },
                {
                  text: "模块：插件",
                  link: "/declaration-files/templates/module-plugin-d-ts",
                },
                {
                  text: "模块：类",
                  link: "/declaration-files/templates/module-class-d-ts",
                },
                {
                  text: "模块：函数",
                  link: "/declaration-files/templates/module-function-d-ts",
                },
                {
                  text: "全局 .d.ts",
                  link: "/declaration-files/templates/global-d-ts",
                },
                {
                  text: "全局修改模块",
                  link: "/declaration-files/templates/global-modifying-module-d-ts",
                },
              ],
            },
            {
              text: "注意事项",
              link: "/declaration-files/dos-and-donts",
            },
            {
              text: "深入",
              link: "/declaration-files/deep-dive",
            },
            {
              text: "发布",
              link: "/declaration-files/publishing",
            },
            {
              text: "使用",
              link: "/declaration-files/consumption",
            },
          ],
        },
        {
          text: "JavaScript",
          items: [
            {
              text: "使用 TypeScript 的 JS 项目",
              link: "/javascript/intro-to-js-ts",
            },
            {
              text: "类型检查 JavaScript 文件",
              link: "/javascript/type-checking-javascript-files",
            },
            {
              text: "JSDoc 参考",
              link: "/javascript/jsdoc-reference",
            },
            {
              text: "从 JS 文件创建 .d.ts 文件",
              link: "/javascript/creating-dts-files-from-js",
            },
          ],
        },
      ],
    },
  },
  markdown: {
    codeTransformers: [
      transformerTwoslash({
        typesCache: createFileSystemTypesCache(),
      }),
    ],
    languages: ["js", "jsx", "ts", "tsx"],
  },
});
