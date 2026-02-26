# text-tools

A fast, browser-based tool to **normalize, clean, and format data lists**. Built with React, TypeScript, and Vite.

## Features

- **Input parsing**: Easily parse text separated by commas, semicolons, newlines, or pipes.
- **Custom transformations**:
  - Convert to UPPERCASE or lowercase.
  - Deduplicate lists instantly.
  - Trim unnecessary spaces.
- **Formatting options**:
  - Wrap values in single quotes `''`, double quotes `""`, or parentheses `()`.
  - Export with various delimiters (comma, semicolon, newline, custom, etc.).
- **Keyboard shortcuts**: Quick copy to clipboard using `⌘C` (or `Ctrl+C`).
- **Developer-friendly UI**: Sleek dark mode interface inspired by modern dev tools.

## CLI

You can also use `text-tools` directly from your terminal!

### Usage

```bash
text-tools <file>
# or via stdin
cat file.txt | text-tools
```

### Options

| Option | Description | Default |
| ------ | ----------- | ------- |
| `-w, --wrapper <type>` | Wrapper to apply (`single-quote`, `double-quote`, `parens`, `none`) | `single-quote` |
| `-d, --delimiter <type>` | Delimiter between outputs (`comma`, `semicolon`, `newline`, `comma+newline`, `pipe`, or custom) | `comma` |
| `-c, --case <mode>` | Case transformation (`upper`, `lower`, `none`) | `none` |
| `--no-dedup` | Keep duplicate values (dedup is ON by default) | |
| `--no-trim` | Keep leading/trailing spaces (trim is ON by default) | |

### Examples

```bash
# Basic file processing
text-tools data.txt

# Custom delimiter and uppercase
text-tools data.txt -d newline -w double-quote -c upper

# Keep duplicates and spaces
text-tools data.txt --no-dedup --no-trim

# Read from stdin and output without wrappers
cat data.txt | text-tools -d comma+newline -w none

# Custom string delimiter output to file
text-tools data.txt -d "| " -w parens > output.txt
```

## Development

First, run the development server:

```bash
npm install
npm run dev
# or with bun
bun install
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the application.

## Scripts

- `dev`: Starts the development server.
- `build`: Compiles TypeScript and builds the app for production.
- `lint`: Runs ESLint for code formatting and quality.
- `preview`: Previews the production build locally.

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Bundler:** Vite
