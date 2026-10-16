import assert from "node:assert/strict";
import { extractJson, presetFor, validatePlan } from "../src/chaos-core/plan.ts";

const steam = validatePlan({
  title: "  Kettle  ",
  summary: "Heat meets water.",
  code: "process.exit(1)",
  script: "alert(1)",
  reactionIds: ["steam-burst", "not-a-reaction", "steam-burst"],
  effectIds: ["steam", "laser"],
  placements: [
    { element: "fire", x: 0.4, y: 0.4, mode: "stamp" },
    { element: "plasma", x: 0.2, y: 0.2, mode: "stamp" },
    { element: "fire", x: 4, y: 0.2, mode: "stamp" },
  ],
});

assert.ok(steam);
assert.equal(steam?.title, "Kettle");
assert.deepEqual(steam?.reactionIds, ["steam-burst"]);
assert.deepEqual(steam?.effectIds, ["steam"]);
assert.ok(steam?.placements.some((item) => item.element === "water"));
assert.equal(
  steam?.placements.every((item) => item.element === "fire" || item.element === "water"),
  true,
);

assert.equal(validatePlan({ title: "nope", placements: [{ element: "void", x: 0.5, y: 0.5 }] }), null);
assert.equal(validatePlan("not an object"), null);

const fenced = extractJson('Sure\n```json\n{"title":"Arc","summary":"Bolts","reactionIds":["arc-bridge"],"effectIds":["spark"],"placements":[]}\n```');
const arc = validatePlan(fenced);
assert.equal(arc?.reactionIds[0], "arc-bridge");
assert.ok(arc?.placements.every((item) => item.element === "electricity"));

assert.equal(presetFor("Trap a storm inside a frozen lantern").title, "Frozen lantern");
assert.equal(presetFor("Let two flames fold into one").reactionIds[0], "inferno");
assert.equal(presetFor("Boil a still pool with a single flame").reactionIds[0], "steam-burst");

console.info("chaos-core plan checks passed");
