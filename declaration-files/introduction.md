---
title: 简介
---

声明文件章节旨在教你如何编写高质量的 TypeScript 声明文件。我们需要假设你对 TypeScript 语言有基本的熟悉程度才能开始。

如果你还没有阅读过，你应该先阅读 [TypeScript 手册](/handbook-v2/the-handbook) 来熟悉基本概念，特别是类型和模块。

学习 .d.ts 文件工作原理最常见的情况是你要为没有类型的 npm 包添加类型。
在这种情况下，你可以直接跳转到 [模块 .d.ts](/declaration-files/templates/module-d-ts)。

声明文件章节分为以下几个部分。

## [声明参考](/declaration-files/by-example)

当我们只有底层库的示例作为指导时，我们经常面临编写声明文件的任务。
[声明参考](/declaration-files/by-example) 部分展示了许多常见的 API 模式以及如何为它们编写声明。
本指南面向可能还不熟悉 TypeScript 中每种语言构造的初学者。

## [库结构](/declaration-files/library-structures)

[库结构](/declaration-files/library-structures) 指南帮助你理解常见的库格式以及如何为每种格式编写适当的声明文件。
如果你正在编辑现有文件，可能不需要阅读本节。
强烈建议新声明文件的作者阅读本节，以正确理解库的格式如何影响声明文件的编写。

在模板部分，你会发现许多声明文件，它们在编写新文件时作为有用的起点。
如果你已经知道你的结构是什么，请参见侧边栏中的 d.ts 模板部分。

## [注意事项](./dos-and-donts)

声明文件中的许多常见错误都可以轻松避免。
[注意事项](./dos-and-donts) 部分识别常见错误，描述如何检测它们，以及如何修复它们。
每个人都应该阅读本节，以帮助自己避免常见错误。

## [深入探讨](/declaration-files/deep-dive)

对于对声明文件底层工作机制感兴趣的有经验的作者，
[深入探讨](/declaration-files/deep-dive) 部分解释了许多声明编写中的高级概念，
并展示如何利用这些概念来创建更简洁、更直观的声明文件。

## [发布到 npm](/declaration-files/publishing)

[发布](/declaration-files/publishing) 部分解释如何将你的声明文件发布到 npm 包，并展示如何管理你的依赖包。

## [查找和安装声明文件](/declaration-files/consumption)

对于 JavaScript 库用户，[使用](/declaration-files/consumption) 部分提供了一些简单的步骤来查找和安装相应的声明文件。
