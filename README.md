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
