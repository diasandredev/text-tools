Product Requirements Document (PRD): Text-Tools
1. Overview
Project Name: Text-Tools

Objective: A developer-centric utility to normalize, clean, and reformat raw lists of data (UUIDs, IDs, strings) from various messy sources into a standardized output.

2. User Problem
Developers often copy lists of IDs from database logs, spreadsheets, or CSVs that come with inconsistent formatting (mixed quotes, extra spaces, different delimiters). Reformatting these manually for SQL queries (IN clauses) or JSON arrays is time-consuming and prone to error.

3. Functional Requirements
Smart Input Parser: Detect and extract individual values regardless of current delimiters (comma, semicolon, newline, spaces) or wrapping (single/double quotes).

Transformation Engine:

Wrappers: Option to wrap each value in ', ", ( ), or none.

Delimiters: Option to separate values by ,, ;, \n, |, or custom strings.

Clean-up: Automatic trimming of whitespace and removal of empty entries.

Deduplication: Toggle to remove duplicate values.

Case Conversion: Toggle for Uppercase/Lowercase.

Clipboard Integration: One-click "Copy to Clipboard" for the result.

Live Preview: The output updates instantly as the user changes settings or input.

4. Technical Stack
Runtime: Bun

Framework: React 18+ (Vite)

Language: TypeScript

Styling: Tailwind CSS (for rapid UI development)
