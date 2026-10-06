import { expect, test } from "bun:test";
import { DEFAULT_MEMO_TITLE } from "./content.ts";
import { createDefaultDiagramDocument, diagramFallbackMarkdown } from "./diagram.ts";
import { createDefaultTableDocument, tableFallbackMarkdown } from "./table.ts";
import { DEFAULT_AI_PROMPT_SEEDS } from "./ai-prompt-seeds.ts";

test("new note and merged-note titles are English", () => {
  expect(DEFAULT_MEMO_TITLE).toBe("Untitled note");
});

test("default diagram content and exported fallback text are English", () => {
  for (const kind of ["mind-map", "flowchart", "architecture"]) {
    const doc = createDefaultDiagramDocument(kind);
    expect(JSON.stringify(doc) + diagramFallbackMarkdown(doc)).not.toMatch(/\p{Script=Han}/u);
  }
});

test("default table content and fallback text are English", () => {
  const doc = createDefaultTableDocument();
  expect(JSON.stringify(doc) + tableFallbackMarkdown(doc)).not.toMatch(/\p{Script=Han}/u);
});

test("factory AI prompt fallback copy is English", () => {
  for (const seed of DEFAULT_AI_PROMPT_SEEDS) {
    expect(seed.name + seed.description + seed.instruction).not.toMatch(/\p{Script=Han}/u);
  }
});
