import assert from "node:assert/strict";
import { parseArticleSources } from "../src/lib/article-sources";

const legacy = parseArticleSources([
  "Berdasarkan laporan Sindonews (https://ekbis.sindonews.com/read/1766301/34/example)",
  "Sindonews",
  "https://ekbis.sindonews.com/read/1766301/34/example",
]);
assert.equal(legacy.length, 1);
assert.ok(legacy[0]?.href?.includes("sindonews"));

const structured = parseArticleSources([
  JSON.stringify({
    label: "Sindonews",
    href: "https://ekbis.sindonews.com/read/1",
    note: "Berdasarkan laporan Sindonews",
  }),
]);
assert.equal(structured.length, 1);
assert.equal(structured[0]?.label, "Sindonews");

console.log("OK article-sources tests");
