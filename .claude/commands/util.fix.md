---
description: Automatically fix lint, type, and build errors.
---

1. **Auto-fix Linting and Formatting**:
   - Run `npm run lint -- --fix` to automatically fix linting errors.
   - Run `npm run format` (if available) or `prettier --write .` to format code.

2. **Type Check & Fix Loop**:
   - Run `npm run type-check`.
   - **If errors found**:
     - Read the error output.
     - For each error:
       - Open the file.
       - Analyze the error.
       - Apply a fix.
     - Re-run `npm run type-check` to verify.
     - Repeat up to 3 times. If errors persist, stop and ask the user for guidance.

3. **Build & Fix Loop**:
   - Run `npm run build`.
   - **If errors found**:
     - Read the error output.
     - Analyze the build error.
     - Apply a fix.
     - Re-run `npm run build` to verify.
     - Repeat up to 3 times.

4. **Final Verification**:
   - Run all checks one last time to ensure the codebase is clean.
   ```bash
   npm run lint && npm run type-check && npm run build
   ```
