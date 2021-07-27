---
title: 📄 Config File
---

All configuration for your houdini application is defined in a single file that is imported by both the runtime and the
command-line tool. Because of this, you must make sure that any imports and logic are resolvable in both environments.
This means that if you rely on `process.env` or other node-specifics you will have to use a
[plugin](https://www.npmjs.com/package/vite-plugin-replace) to replace the expression with something that can run in the browser.
