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
              text: "面向函数式程序员的 TypeScript",
              link: "/get-started/typescript-in-5-minutes-func",
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
