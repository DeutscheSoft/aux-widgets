# Agent guidelines

## Documentation and comments

Never put thinking, discovery notes, process commentary, or prompt leftovers into
code or documentation.

- Public APIs (including `.d.ts` helpers) describe **what** they are and how to
  use them — not why an earlier approach failed, what TypeScript footguns exist,
  or how the implementation was arrived at.
- Internal docs and TODOs may record decisions and open work, but must not read
  like a debug log or a reply to a chat prompt.
- Do not narrate temporary experiments in comments that ship with the library.
