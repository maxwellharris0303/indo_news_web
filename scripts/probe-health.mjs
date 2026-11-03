const base = (process.env.BASE_URL || "http://127.0.0.1:3010").replace(/\/$/, "");

const res = await fetch(`${base}/api/health`, {
  headers: { accept: "application/json" },
});
const body = await res.text();
let json;
try {
  json = JSON.parse(body);
} catch {
  console.error(`Health check failed: non-JSON (${res.status})`, body.slice(0, 200));
  process.exit(1);
}

if (!res.ok || !json.ok) {
  console.error("Health check failed:", res.status, json);
  process.exit(1);
}

console.log("Health OK:", json.ts);
