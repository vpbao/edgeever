import { afterEach, describe, expect, test } from "bun:test";
import { defaultLocale, getBrowserLocale, getInitialLocale, normalizeLocale } from "./locales.ts";

const originalNavigator = globalThis.navigator;
const originalWindow = globalThis.window;

const setNavigatorLanguages = (languages, language = languages[0]) => {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { languages, language },
  });
};

afterEach(() => {
  if (originalNavigator === undefined) {
    delete globalThis.navigator;
  } else {
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: originalNavigator,
    });
  }
  if (originalWindow === undefined) {
    delete globalThis.window;
  } else {
    globalThis.window = originalWindow;
  }
});

describe("web locale resolution", () => {
  test("uses English for Chinese and English browser languages", () => {
    setNavigatorLanguages(["zh-TW", "en-US"]);
    expect(getBrowserLocale()).toBe("en-US");
    setNavigatorLanguages(["en-GB"]);
    expect(getBrowserLocale()).toBe("en-US");
    expect(normalizeLocale("zh-Hans")).toBe("en-US");
  });

  test("uses English for Japanese browser languages", () => {
    setNavigatorLanguages(["ja-JP", "ja"]);
    expect(getBrowserLocale()).toBe("en-US");
  });

  test("falls unmatched browser languages back to English instead of Chinese", () => {
    setNavigatorLanguages(["fr-FR", "de-DE"]);
    expect(getBrowserLocale()).toBe("en-US");
    setNavigatorLanguages(["ko-KR"]);
    expect(getInitialLocale()).toBe("en-US");
    expect(defaultLocale).toBe("en-US");
  });

  test("uses English regardless of browser language order", () => {
    setNavigatorLanguages(["ja-JP", "zh-CN"]);
    expect(getBrowserLocale()).toBe("en-US");
    setNavigatorLanguages(["fr-FR", "zh-CN"]);
    expect(getBrowserLocale()).toBe("en-US");
  });
});
