---
title: TypeScript 手册
---

## 关于本手册

在 JavaScript 被引入编程社区 20 多年后，它现在已成为有史以来最广泛的跨平台语言之一。从最初的用于为网页添加简单交互的小型脚本语言，JavaScript 已发展成为前端和后端应用程序的首选语言，无论规模大小。虽然用 JavaScript 编写的程序的规模、范围和复杂性呈指数级增长，但 JavaScript 语言表达代码不同单元之间关系的能力却没有。结合 JavaScript 相当特殊的运行时语义，这种语言与程序复杂性之间的不匹配使得 JavaScript 开发成为一项难以大规模管理的任务。

程序员编写的最常见的错误可以被描述为类型错误：在期望使用不同类型值的地方使用了某种类型的值。这可能是由于简单的拼写错误、未能理解库的 API 表面、对运行时行为的错误假设或其他错误。TypeScript 的目标是成为 JavaScript 程序的静态类型检查器——换句话说，一个在你代码运行之前运行的工具（静态），并确保程序的类型是正确的（类型检查）。

如果你是抱着将 TypeScript 作为第一门语言的想法而来，没有 JavaScript 背景，我们建议你首先阅读 [Microsoft Learn JavaScript 教程](https://developer.microsoft.com/javascript/) 或 [Mozilla Web Docs 上的 JavaScript](https://developer.mozilla.org/docs/Web/JavaScript/Guide) 文档。
如果你有其他语言的经验，你应该能够通过阅读本手册很快掌握 JavaScript 语法。

## 本手册的结构

本手册分为两个部分：

- **手册**

  TypeScript 手册旨在成为向日常程序员解释 TypeScript 的综合性文档。你可以通过左侧导航从上到下阅读手册。

  你应该期望每一章或每一页都能让你对给定的概念有深入的理解。TypeScript 手册不是完整的语言规范，但它旨在成为该语言所有特性和行为的综合指南。

  完成通读的读者应该能够：

  - 阅读和理解常用的 TypeScript 语法和模式
  - 解释重要编译器选项的效果
  - 在大多数情况下正确预测类型系统的行为

  为了清晰和简洁起见，手册的主要内容不会探讨所涵盖特性的每一个边缘情况或细节。你可以在参考文章中找到关于特定概念的更多详细信息。

- **参考文件**

  导航中手册下方的参考部分旨在提供对 TypeScript 特定部分如何工作的更深入理解。你可以从上到下阅读它，但每个部分都旨在对单个概念进行更深入的解释——这意味着没有连续性的目标。

### 非目标

手册还旨在成为一份简洁的文档，可以在几个小时内舒适地阅读。为了保持简短，某些主题不会被涵盖。

具体来说，手册不会完整介绍核心 JavaScript 基础知识，如函数、类和闭包。在适当的情况下，我们会包含背景阅读材料的链接，你可以使用这些链接来阅读这些概念。

手册也不打算取代语言规范。在某些情况下，为了更易于理解的高级解释，会跳过边缘情况或行为的正式描述。相反，有单独的参考页面更精确和正式地描述 TypeScript 行为的许多方面。参考页面不打算供不熟悉 TypeScript 的读者阅读，因此它们可能使用高级术语或引用你尚未阅读的主题。

最后，除非必要，手册不会涵盖 TypeScript 如何与其他工具交互。如何配置 TypeScript 与 webpack、rollup、parcel、react、babel、closure、lerna、rush、bazel、preact、vue、angular、svelte、jquery、yarn 或 npm 等主题超出了范围——你可以在网上其他地方找到这些资源。

## 开始使用

在开始阅读 [基础](/handbook-v2/basics) 之前，我们建议你阅读以下介绍性页面之一。这些介绍旨在突出 TypeScript 与你喜欢的编程语言之间的关键异同，并澄清这些语言特有的常见误解。

- [面向新程序员的 TypeScript](/get-started/ts-for-the-new-programmer)
- [面向 JavaScript 程序员的 TypeScript](/get-started/ts-for-js-programmers)
- [面向 Java/C# 程序员的 TypeScript](/get-started/ts-for-oopers)
- [面向函数式程序员的 TypeScript](/get-started/ts-for-functional-programmers)

否则，直接跳转到 [基础](/handbook-v2/basics)。
