import assert from "node:assert/strict";
import { test } from "node:test";
import { isPresentationState, moveSlide, validRoom } from "../src/lib/presentation.ts";

test("presenter clamps slide navigation and rejects invalid remote messages", () => {
  assert.equal(moveSlide(0, -1, 3), 0);
  assert.equal(moveSlide(0, 1, 3), 1);
  assert.equal(moveSlide(2, 1, 3), 2);
  assert.equal(moveSlide(0, 1, 0), 0);
  const state = { slug: "3-tuhan-allah-hadir", mode: "chord", index: 1, blank: false, dark: true, active: true, updatedAt: Date.now() };
  assert.ok(isPresentationState(state));
  for (const invalid of [null, {}, { ...state, index: -1 }, { ...state, index: 1.5 }, { ...state, mode: "bad" }, { ...state, blank: "false" }, { ...state, slug: "" }]) assert.ok(!isPresentationState(invalid));
  assert.ok(validRoom("1a849edf-8065-443b-9380-342c2a6b5a28"));
  assert.ok(!validRoom("../../other-room"));
});
