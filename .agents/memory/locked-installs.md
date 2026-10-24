---
name: Locked dependency installs
description: npm peer-resolution behavior encountered when setting up this imported project.
---

Prefer `npm ci` for restoring this project's existing dependencies.

**Why:** npm 10.8.2's peer resolver crashed with `Cannot read properties of null (reading 'edgesOut')` when installing explicit dependency lists, while the locked install succeeded after platform compatibility was corrected.

**How to apply:** Preserve the lockfile for routine setup. If a dependency update triggers the same resolver crash, distinguish it from platform compatibility errors rather than repeatedly retrying the same install.
