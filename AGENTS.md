# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Critical Rules

**Windows Compatibility**: Never use `2>/dev/null` or any redirection to `nul` in commands. On Windows, this creates actual files named `nul` instead of suppressing output.

**No Shell-based Batch Text Replacement**: Never use `sed`, `powershell -replace`, or other shell commands to batch replace text content in files. Shell-based regex replacements can corrupt file encoding (especially UTF-8/Chinese characters) and lack context awareness. Instead:
1. Use `Grep` to find all matching instances
2. Review each match's context
3. Use the `Edit` tool to replace each instance individually with full context awareness
4. This ensures encoding safety and semantic correctness

## Development Commands

```bash
pnpm run dev      # Start development server on port 5173
pnpm run build    # Build for production
pnpm run preview  # Preview production build
```

### Development Server Workflow

When testing changes in the browser:

1. Check if port 5173 is in use: `netstat -ano | findstr ":5173"` (Windows)
2. If occupied, kill the process: `taskkill //PID <pid> //F`
3. Start the development server: `pnpm run dev`
4. Wait for the server to be ready on `http://localhost:5173/typescript-book/`
5. Use the browser-agent to open and test the page
6. Kill the server when done using `KillBash`

**Important**: Always use port 5173 (default). If the port is in use, kill the existing process first rather than letting VitePress pick a different port.

### Known Issues

- **Node.js 25 localStorage warning**: You may see `Warning: --localstorage-file was provided without a valid path`. This is a harmless warning from Node.js 25's experimental localStorage feature. It does not affect the dev server.
- **VitePress cache issues**: If a page shows incorrect content (e.g., basics page showing handbook content), clear the cache with `rm -rf .vitepress/cache` and restart the dev server.
- **Code comment translation**: Translators frequently convert English comments in code blocks to Chinese. Always verify code block comments match the source file exactly.
- **`// ^?` type query markers**: Source files contain `// ^?` lines for inline type display. These must be removed during translation.
- **@errors code mismatch**: TypeScript 6.0.2 may produce different error codes than earlier versions. Always verify `@errors` annotations by running `pnpm run build`.

## Link Conventions

### Internal Links

All internal links MUST use absolute paths starting with `/` (VitePress will auto-prepend the base `/typescript-book/`):

```markdown
✅ Correct: [手册](/handbook-v2/the-handbook)
❌ Wrong:   [手册](../handbook-v2/the-handbook.html)
❌ Wrong:   [手册](/typescript-book/handbook-v2/the-handbook)  <!-- Don't include base -->
```

Rules:
- Start with `/` (root-relative)
- No `.html` extension (VitePress handles this)
- No base path prefix (VitePress auto-adds it)
- Anchor links work: `/handbook-v2/everyday-types#字面量类型`

### External Links

All external links MUST use full `https://` URLs:

```markdown
✅ Correct: [Playground](https://www.typescriptlang.org/play)
❌ Wrong:   [Playground](/play)
```

### Links to Non-existent Pages

If a source file links to a page that hasn't been translated yet, either:
- Remove the link and keep just the text
- Link to the English version with full URL

### Common Link Mistakes

**Wrong tsconfig path**:
❌ Wrong: `[strictNullChecks](/tsconfig#strictNullChecks)`
✅ Correct: `[strictNullChecks](https://www.typescriptlang.org/tsconfig#strictNullChecks)`

**Wrong handbook path**:
❌ Wrong: `[Classes](/docs/handbook/2/classes)`
✅ Correct: `[类](/handbook-v2/classes)`

**Linking to untranslated pages**:
❌ Wrong: `[Mixins](/docs/handbook/mixins)`
✅ Correct: `[Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html)`

## Browser Testing

When testing pages in the browser:

1. **Check page title** - Verify the Chinese title appears correctly
2. **Check content** - Verify the page shows the correct translated content (not cached content from another page)
3. **Check Twoslash** - Code blocks with `ts twoslash` should show error annotations
4. **Test navigation** - Click sidebar links and internal page links
5. **Check console** - No JavaScript errors should appear

**Cache debugging tip**: If content appears wrong, try:
1. Hard refresh (Ctrl+Shift+R)
2. Clear `.vitepress/cache` and restart dev server

## Project Structure

- `.vitepress/config.ts` - VitePress config with Twoslash transformer and sidebar
- `.vitepress/theme/index.ts` - Theme config for Twoslash client-side components
- `.vitepress/cache/` - Browser test screenshots (save screenshots here, NOT in project root)
- `get-started/` - Markdown documentation files
- `handbook-v2/` - Handbook v2 translated pages (root-level pages + subdirectories like `type-manipulation/`)
- `TypeScript-Website/` - Git submodule with official TypeScript docs source
  - Source files: `TypeScript-Website/packages/documentation/copy/en/`

## Sidebar Navigation

**Source of truth**: `TypeScript-Website/packages/documentation/scripts/generateDocsNavigationPerLanguage.js`

The sidebar order MUST match the original website exactly.

### Handbook v2 Structure

The Handbook v2 pages follow this structure in the source:
```
handbook-v2/
├── The Handbook.md
├── Basics.md
├── Everyday Types.md
├── Narrowing.md
├── More on Functions.md
├── Object Types.md
├── Type Manipulation/
│   ├── _Creating Types from Types.md
│   ├── Generics.md
│   ├── Keyof Type Operator.md
│   ├── Typeof Type Operator.md
│   ├── Indexed Access Types.md
│   ├── Conditional Types.md
│   ├── Mapped Types.md
│   └── Template Literal Types.md
├── Classes.md
└── Modules.md
```

Translated files go to `handbook-v2/` with matching structure:
- Root-level pages: `handbook-v2/basics.md`
- Subdirectory pages: `handbook-v2/type-manipulation/keyof-type-operator.md`

**Important**: The VitePress sidebar config in `.vitepress/config.ts` must be updated to include new pages. The sidebar structure should mirror the source navigation exactly.

## Twoslash Code Blocks

Use `ts twoslash` for TypeScript code with error annotations:

```markdown
```ts twoslash
// @errors: 2322
const user: User = { username: "Hayes" };
```
```

**Known Issue**: Incomplete syntax (e.g., `let a = (4`) with `@errors` causes crash: "Cannot read properties of undefined (reading 'children')". For such cases, use plain `ts` block with inline `// Error:` comment instead.

### Code Comments Must Stay in English

**CRITICAL**: All comments inside code blocks must remain in their original English. Do NOT translate code comments. This includes single-line comments (`// ...`), multi-line comments (`/* ... */`), and JSDoc comments.

### Remove `// ^?` Type Query Lines

Do NOT include `// ^?` (Twoslash type query) lines in translated code blocks. These markers create always-visible type annotations that clutter the display. Users can hover over any identifier to see its type instead. When copying code from source files, systematically remove all `// ^?` lines.

### @errors Compatibility with TypeScript 6.0

The project uses TypeScript 6.0.2, which has different error codes from earlier versions. After translation, verify that `@errors` annotations match actual compiler output. Run `pnpm run build` to confirm.

### External Library Imports in Twoslash

When a code block requires imports from libraries not available in Twoslash (e.g., `import "reflect-metadata"`), use plain `ts` instead of `ts twoslash`.

### UMD Module Blocks

When using `// @module: umd` in Twoslash blocks, add `// @moduleResolution: node` for TypeScript 6.0.2 compatibility.

## Translation Workflow

All translation work follows this 4-step process:

### 1. Explore
- Locate source file in `TypeScript-Website/packages/documentation/copy/en/`
- Check sidebar order in `generateDocsNavigationPerLanguage.js`
- Review file for: code blocks with @errors/@noErrors, images, special formatting

### 2. Translate
- Create file with lowercase + hyphens naming
- Keep frontmatter minimal (title only)
- Preserve all code blocks exactly (use `ts twoslash` where appropriate)
- Add spaces around `_italic_` and `**bold**` markers when adjacent to Chinese
- Use standard technical terms:
  - `emit` → "生成" (not "发射")
  - `opt-in` → "渐进式"
  - `downleveling` → "降级"
  - `reified` → "具化"
  - `nominal` → "标称"

### 3. Review
- Check for formatting issues (italics/bold spacing)
- Verify technical term translations
- Ensure code blocks match source:
  - **Verify all comments remain in English** (most common translation error)
  - Remove any `// ^?` type query lines
  - Verify `@errors` codes match TypeScript 6.0.2 output
  - For blocks with external imports (e.g., `reflect-metadata`), use plain `ts` instead of `ts twoslash`
- Check image paths use relative format

### 4. Browser Test
- Update `.vitepress/config.ts` sidebar if this is a new page
- Verify page loads without errors
- Check code block rendering (especially Twoslash)
- Save screenshots to `.vitepress/cache/` (NOT in project root)

## Screenshot Management

**NEVER save screenshots in the project root directory.** Always save to `.vitepress/cache/`:

```bash
# Correct
cp page-name.png .vitepress/cache/page-name.png

# Then delete from root if accidentally created there
rm page-name.png
```

After browser testing, clean up any screenshots that ended up in the root:
```bash
git status  # Check for unexpected .png files in root
```

## File Naming

Convert source filenames to lowercase + hyphens:
- Source: `TS for JS Programmers.md` → File: `ts-for-js-programmers.md`
- Source: `TS for the New Programmer.md` → File: `ts-for-the-new-programmer.md`

## Markdown Formatting

**Italic/Bold with Chinese**: When using `_italic_` or `**bold**` adjacent to Chinese characters, add spaces around the markers:
- ❌ `一点_不带_类型` → ✅ `一点 _不带_ 类型`
- ❌ `被称为_强制 OOP_语言` → ✅ `被称为 _强制 OOP_ 语言`

This ensures Markdown engines render formatting correctly.

## Images

Place images in `assets/` directory (not `public/`) to enable VitePress processing. Use relative paths:
- Location: `assets/images/docs/greet_person.png`
- Reference: `![Alt text](../assets/images/docs/greet_person.png)`

## tsconfig Link Format

The tsconfig reference pages are NOT translated. Links to tsconfig options must use full external URLs:

```markdown
Source: [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError)
Keep as:  [`noEmitOnError`](https://www.typescriptlang.org/tsconfig#noEmitOnError)
```

Do NOT convert these to short paths like `/tsconfig#xxx` since those pages don't exist in the translated site.
