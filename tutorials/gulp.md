---
title: Gulp
---

本快速入门指南将教你如何使用 [gulp](https://gulpjs.com) 构建 TypeScript，然后将 [Browserify](https://browserify.org)、[terser](https://terser.org) 或 [Watchify](https://github.com/substack/watchify) 添加到 gulp 管道中。
本指南还展示了如何使用 [Babelify](https://github.com/babel/babelify) 添加 [Babel](https://babeljs.io/) 功能。

我们假设你已经在使用 [Node.js](https://nodejs.org/) 和 [npm](https://www.npmjs.com/)。

## 最小项目

让我们从一个新目录开始。
我们暂时将其命名为 `proj`，但你可以将其更改为任何你想要的名称。

```shell
mkdir proj
cd proj
```

首先，我们将按以下方式构建我们的项目：

```
proj/
   ├─ src/
   └─ dist/
```

TypeScript 文件将从你的 `src` 文件夹开始，经过 TypeScript 编译器，最终到达 `dist`。

让我们搭建这个结构：

```shell
mkdir src
mkdir dist
```

### 初始化项目

现在我们将此文件夹转换为 npm 包。

```shell
npm init
```

你将看到一系列提示。
除了入口点外，你可以使用默认值。
对于入口点，使用 `./dist/main.js`。
你可以随时返回并在为你生成的 `package.json` 文件中更改这些设置。

### 安装依赖

现在我们可以使用 `npm install` 来安装包。
首先全局安装 `gulp-cli`（如果你使用 Unix 系统，可能需要在本指南中的 `npm install` 命令前加上 `sudo`）。

```shell
npm install -g gulp-cli
```

然后在项目的开发依赖中安装 `typescript`、`gulp` 和 `gulp-typescript`。
[Gulp-typescript](https://www.npmjs.com/package/gulp-typescript) 是一个用于 TypeScript 的 gulp 插件。

```shell
npm install --save-dev typescript gulp@4.0.0 gulp-typescript
```

### 编写简单示例

让我们编写一个 Hello World 程序。
在 `src` 中，创建文件 `main.ts`：

```ts
function hello(compiler: string) {
  console.log(`Hello from ${compiler}`);
}
hello("TypeScript");
```

在项目根目录 `proj` 中，创建文件 `tsconfig.json`：

```json tsconfig
{
  "files": ["src/main.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es5"
  }
}
```

### 创建 `gulpfile.js`

在项目根目录中，创建文件 `gulpfile.js`：

```js
var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

gulp.task("default", function () {
  return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest("dist"));
});
```

### 测试生成的应用

```shell
gulp
node dist/main.js
```

程序应该打印 "Hello from TypeScript!"。

## 向代码添加模块

在我们开始使用 Browserify 之前，让我们先扩展我们的代码并添加模块。
这是你在实际应用中更可能使用的结构。

创建一个名为 `src/greet.ts` 的文件：

```ts
export function sayHello(name: string) {
  return `Hello from ${name}`;
}
```

现在将 `src/main.ts` 中的代码更改为从 `greet.ts` 导入 `sayHello`：

```ts
import { sayHello } from "./greet";

console.log(sayHello("TypeScript"));
```

最后，将 `src/greet.ts` 添加到 `tsconfig.json`：

```json tsconfig
{
  "files": ["src/main.ts", "src/greet.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es5"
  }
}
```

通过运行 `gulp` 然后在 Node 中测试来确保模块正常工作：

```shell
gulp
node dist/main.js
```

请注意，尽管我们使用了 ES2015 模块语法，但 TypeScript 生成的是 Node 使用的 CommonJS 模块。
在本教程中，我们将坚持使用 CommonJS，但你可以设置选项对象中的 `module` 来更改这一点。

## Browserify

现在让我们将这个项目从 Node 迁移到浏览器。
为此，我们希望将所有模块打包到一个 JavaScript 文件中。
幸运的是，这正是 Browserify 所做的。
更好的是，它允许我们使用 Node 使用的 CommonJS 模块系统，这是 TypeScript 默认的生成方式。
这意味着我们的 TypeScript 和 Node 设置基本上可以原封不动地迁移到浏览器。

首先，安装 browserify、[tsify](https://www.npmjs.com/package/tsify) 和 vinyl-source-stream。
tsify 是一个 Browserify 插件，与 gulp-typescript 一样，可以访问 TypeScript 编译器。
vinyl-source-stream 让我们可以将 Browserify 的文件输出适配回 gulp 理解的称为 [vinyl](https://github.com/gulpjs/vinyl) 的格式。

```shell
npm install --save-dev browserify tsify vinyl-source-stream
```

### 创建页面

在 `src` 中创建一个名为 `index.html` 的文件：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Hello World!</title>
  </head>
  <body>
    <p id="greeting">Loading ...</p>
    <script src="bundle.js"></script>
  </body>
</html>
```

现在更改 `main.ts` 以更新页面：

```ts
import { sayHello } from "./greet";

function showHello(divName: string, name: string) {
  const elt = document.getElementById(divName);
  elt.innerText = sayHello(name);
}

showHello("greeting", "TypeScript");
```

调用 `showHello` 会调用 `sayHello` 来更改段落的文本。
现在将你的 gulpfile 更改为以下内容：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(gulp.dest("dist"));
  })
);
```

这添加了 `copy-html` 任务，并将其作为 `default` 的依赖项。
这意味着每次运行 `default` 时，`copy-html` 必须先运行。
我们还更改了 `default` 以使用 tsify 插件而不是 gulp-typescript 调用 Browserify。
方便的是，它们都允许我们向 TypeScript 编译器传递相同的选项对象。

在调用 `bundle` 后，我们使用 `source`（我们的 vinyl-source-stream 别名）将输出包命名为 `bundle.js`。

通过运行 gulp 然后在浏览器中打开 `dist/index.html` 来测试页面。
你应该会在页面上看到 "Hello from TypeScript"。

请注意，我们向 Browserify 指定了 `debug: true`。
这会导致 tsify 在打包的 JavaScript 文件内部生成 source map。
Source map 允许你在浏览器中调试原始 TypeScript 代码，而不是打包后的 JavaScript。
你可以通过打开浏览器的调试器并在 `main.ts` 中设置断点来测试 source map 是否正常工作。
当你刷新页面时，断点应该暂停页面，并允许你调试 `greet.ts`。

## Watchify、Babel 和 Terser

现在我们使用 Browserify 和 tsify 打包我们的代码，我们可以使用 browserify 插件向构建添加各种功能。

- Watchify 启动 gulp 并保持运行，在你保存文件时增量编译。
  这让你在浏览器中保持编辑-保存-刷新的循环。

- Babel 是一个非常灵活的编译器，可将 ES2015 及更高版本转换为 ES5 和 ES3。
  这允许你添加 TypeScript 不支持的广泛且自定义的转换。

- Terser 压缩你的代码，使其下载时间更短。

### Watchify

我们将从 Watchify 开始提供后台编译：

```shell
npm install --save-dev watchify fancy-log
```

现在将你的 gulpfile 更改为以下内容：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var fancy_log = require("fancy-log");
var paths = {
  pages: ["src/*.html"],
};

var watchedBrowserify = watchify(
  browserify({
    basedir: ".",
    debug: true,
    entries: ["src/main.ts"],
    cache: {},
    packageCache: {},
  }).plugin(tsify)
);

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

function bundle() {
  return watchedBrowserify
    .bundle()
    .on("error", fancy_log)
    .pipe(source("bundle.js"))
    .pipe(gulp.dest("dist"));
}

gulp.task("default", gulp.series(gulp.parallel("copy-html"), bundle));
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", fancy_log);
```

这里基本上有三个更改，但它们需要你稍微重构代码。

1. 我们将 `browserify` 实例包装在对 `watchify` 的调用中，然后保存结果。
2. 我们调用了 `watchedBrowserify.on('update', bundle);`，以便 Browserify 在你的 TypeScript 文件之一更改时运行 `bundle` 函数。
3. 我们调用了 `watchedBrowserify.on('log', fancy_log);` 以记录到控制台。

(1) 和 (2) 一起意味着我们必须将对 `browserify` 的调用移出 `default` 任务。
而且我们必须为 `default` 的函数命名，因为 Watchify 和 Gulp 都需要调用它。
添加 (3) 的日志记录是可选的，但对于调试设置非常有用。

现在当你运行 Gulp 时，它应该会启动并保持运行。
尝试更改 `main.ts` 中的 `showHello` 代码并保存它。
你应该会看到如下所示的输出：

```shell
proj$ gulp
[10:34:20] Using gulpfile ~/src/proj/gulpfile.js
[10:34:20] Starting 'copy-html'...
[10:34:20] Finished 'copy-html' after 26 ms
[10:34:20] Starting 'default'...
[10:34:21] 2824 bytes written (0.13 seconds)
[10:34:21] Finished 'default' after 1.36 s
[10:35:22] 2261 bytes written (0.02 seconds)
[10:35:24] 2808 bytes written (0.05 seconds)
```

### Terser

首先安装 Terser。
由于 Terser 的目的是混淆你的代码，我们还需要安装 vinyl-buffer 和 gulp-sourcemaps 以保持 sourcemap 正常工作。

```shell
npm install --save-dev gulp-terser vinyl-buffer gulp-sourcemaps
```

现在将你的 gulpfile 更改为以下内容：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var terser = require("gulp-terser");
var tsify = require("tsify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(terser())
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("dist"));
  })
);
```

请注意，`terser` 本身只有一个调用 —— 对 `buffer` 和 `sourcemaps` 的调用是为了确保 sourcemap 保持正常工作。
这些调用为我们提供了一个单独的 sourcemap 文件，而不是像以前一样使用内联 sourcemap。
现在你可以运行 Gulp 并检查 `bundle.js` 是否确实被压缩成了难以阅读的代码：

```shell
gulp
cat dist/bundle.js
```

### Babel

首先安装 Babelify 和用于 ES2015 的 Babel 预设。
与 Terser 一样，Babelify 会混淆代码，所以我们需要 vinyl-buffer 和 gulp-sourcemaps。
默认情况下，Babelify 只会处理扩展名为 `.js`、`.es`、`.es6` 和 `.jsx` 的文件，所以我们需要将 `.ts` 扩展名作为选项添加到 Babelify。

```shell
npm install --save-dev babelify@8 babel-core babel-preset-es2015 vinyl-buffer gulp-sourcemaps
```

现在将你的 gulpfile 更改为以下内容：

```js
var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var tsify = require("tsify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var paths = {
  pages: ["src/*.html"],
};

gulp.task("copy-html", function () {
  return gulp.src(paths.pages).pipe(gulp.dest("dist"));
});

gulp.task(
  "default",
  gulp.series(gulp.parallel("copy-html"), function () {
    return browserify({
      basedir: ".",
      debug: true,
      entries: ["src/main.ts"],
      cache: {},
      packageCache: {},
    })
      .plugin(tsify)
      .transform("babelify", {
        presets: ["es2015"],
        extensions: [".ts"],
      })
      .bundle()
      .pipe(source("bundle.js"))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest("dist"));
  })
);
```

我们还需要让 TypeScript 以 ES2015 为目标。
然后 Babel 将从 TypeScript 生成的 ES2015 代码生成 ES5。
让我们修改 `tsconfig.json`：

```json tsconfig
{
  "files": ["src/main.ts"],
  "compilerOptions": {
    "noImplicitAny": true,
    "target": "es2015"
  }
}
```

对于如此简单的脚本，Babel 的 ES5 输出应该与 TypeScript 的输出非常相似。
