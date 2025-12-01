# User Preferences (Taste Profile)

> Personal coding preferences. Agent MUST follow these rules.
> When user corrects agent behavior → add rule here.

---

## TypeScript Style

| Preference        | Rule                                            |
| ----------------- | ----------------------------------------------- |
| `any`             | PROHIBITED. Use `unknown` + type guards instead |
| Exports           | Named exports only, NO default exports          |
| Optional chaining | Prefer `?.` over explicit null checks           |

## Code Organization

| Preference      | Rule                                               |
| --------------- | -------------------------------------------------- |
| Function length | Max 30 lines, split if longer                      |
| Comments        | Russian for explanations, English for code/commits |
| TODOs           | Format: `// TODO(feature-###): description`        |

## Patterns

| Pattern         | Rule                          |
| --------------- | ----------------------------- |
| Early returns   | Always use for guard clauses  |
| Destructuring   | Prefer in function params     |
| Spread operator | Use for immutable updates     |
| Ternary         | Single level only, no nesting |

---

## Learning Log

> When user corrects agent, add entry here with date.

| Date       | Correction    | Rule Added      |
| ---------- | ------------- | --------------- |
| 2024-12-01 | Initial setup | All above rules |

---

**Update Protocol**: When user corrects your code style, immediately add the preference here before proceeding.
