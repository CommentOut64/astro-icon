import assert from "node:assert/strict";
import { test } from "node:test";
import { posix, resolve, sep, win32 } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createPlugin } from "../dist/vite-plugin-astro-icon.js";

test("the old pathname implementation creates an invalid Windows path", () => {
  const windowsRootUrl = new URL("file:///C:/project/");
  const oldPath = win32.resolve(windowsRootUrl.pathname, "src/icons");

  assert.notEqual(oldPath, win32.resolve("C:\\project", "src/icons"));
  assert.match(oldPath, /\\C:\\project\\src\\icons$/);
});

test("file URLs resolve to native paths for both platform conventions", () => {
  const windowsRoot = new URL("file:///C:/project/");
  const posixRoot = new URL("file:///tmp/project/");

  assert.equal(
    win32.resolve(fileURLToPath(windowsRoot, { windows: true }), "src/icons"),
    "C:\\project\\src\\icons",
  );
  assert.equal(
    posix.resolve(fileURLToPath(posixRoot, { windows: false }), "src/icons"),
    "/tmp/project/src/icons",
  );
});

test("the plugin registers a native filesystem path on every platform", () => {
  const root = pathToFileURL(`${resolve("project")}${sep}`);
  const expectedPath = resolve(fileURLToPath(root), "src/icons");
  let watchedPath;

  const plugin = createPlugin({}, { root, output: "static", logger: {} });
  plugin.configureServer({
    watcher: {
      add(path) {
        watchedPath = path;
      },
      on() {},
    },
    moduleGraph: {},
  });

  assert.equal(watchedPath, expectedPath);
});
