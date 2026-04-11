# AGENTS.md

This file provides guidance to Qoder (qoder.com) when working with code in this repository.

## Critical Rules

**Windows Compatibility**: Never use `2>/dev/null` or any redirection to `nul` in commands. On Windows, this creates actual files named `nul` instead of suppressing output.

## Development Commands

```bash
pnpm run build    # Build for production
pnpm run preview  # Preview production build
```

**Note**: Do not run `pnpm run dev`. The development server is already running in another terminal.

## Project Structure

- `.vitepress/config.ts` - VitePress config with Twoslash transformer and sidebar
- `.vitepress/theme/index.ts` - Theme config for Twoslash client-side components
- `get-started/` - Markdown documentation files
- `TypeScript-Website/` - Git submodule with official TypeScript docs source

## Sidebar Navigation

**Source of truth**: `TypeScript-Website/packages/documentation/scripts/generateDocsNavigationPerLanguage.js`

The sidebar order MUST match the original website exactly. Current "Get Started" order:
1. TS for the New Programmer → `ts-for-the-new-programmer`
2. TS for JS Programmers → `ts-for-js-programmers`
3. TS for OOPers → (pending)
4. TS for Functional Programmers → `ts-for-functional-programmers`
5. TypeScript Tooling in 5 minutes → (pending)

## Twoslash Code Blocks

Use `ts twoslash` for TypeScript code with error annotations:

```markdown
```ts twoslash
// @errors: 2322
const user: User = { username: "Hayes" };
```
```

**Known Issue**: Incomplete syntax (e.g., `let a = (4`) with `@errors` causes crash: "Cannot read properties of undefined (reading 'children')". For such cases, use plain `ts` block with inline `// Error:` comment instead.

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
- Ensure code blocks match source
- Check image paths use relative format

### 4. Browser Test
- Update `.vitepress/config.ts` sidebar
- Verify page loads without errors
- Check code block rendering (especially Twoslash)
- Save screenshots to `.vitepress/cache/`

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
