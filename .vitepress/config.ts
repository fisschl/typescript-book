import { defineConfig } from "vitepress";
import { transformerTwoslash } from "@shikijs/vitepress-twoslash";
import { createFileSystemTypesCache } from "@shikijs/vitepress-twoslash/cache-fs";

export default defineConfig({
  title: "TypeScript 手册",
  base: "/typescript-book/",
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
