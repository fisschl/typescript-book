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
