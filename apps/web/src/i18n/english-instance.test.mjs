import { expect, test } from "bun:test";
import { getInitialLocale, supportedLocales } from "./locales.ts";
import { resolveSupportedLocale } from "@edgeever/shared/i18n/locales";
import { createDefaultNotebookRows } from "../../../api/src/workspace-provisioning.ts";

test("the instance stays English when a browser has a saved Chinese preference", () => {
  const original = globalThis.window;
  globalThis.window = { localStorage: { getItem: () => "zh-CN" } };
  try {
    expect(getInitialLocale()).toBe("en-US");
    expect(supportedLocales).toEqual(["en-US"]);
  } finally {
    globalThis.window = original;
  }
});

test("seed and API locale resolution stays English for legacy and foreign clients", () => {
  for (const locale of [null, "zh-CN", "ja-JP", "en-US", "vi-VN"]) {
    expect(resolveSupportedLocale(locale)).toBe("en-US");
  }
});

test("new workspaces have English notebook names", () => {
  expect(createDefaultNotebookRows("new").map((row) => row.name)).toEqual([
    "Inbox", "Work Projects", "Learning Resources", "Creative Ideas", "Personal Life",
  ]);
});
