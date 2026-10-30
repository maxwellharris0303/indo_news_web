const base = process.env.BASE_URL || "http://localhost:3001";
const email = process.env.E2E_EMAIL || "smartyoungdev@gmail.com";
const password = process.env.E2E_PASSWORD || "";

const errorPatterns = [
  "Application error",
  "Terjadi kesalahan",
  "Functions cannot be passed directly to Client Components",
  "Internal Server Error",
];

const staticRoutes = [
  "/",
  "/nasional",
  "/internasional",
  "/ekonomi",
  "/politik-hukum",
  "/olahraga",
  "/tekno",
  "/edukasi",
  "/gaya-hidup",
  "/daerah",
  "/daerah/provinsi/dki-jakarta",
  "/topik/ihsg",
  "/cek-fakta",
  "/cek-fakta/hoaks-blt-umkm-2026",
  "/opini",
  "/indeks",
  "/search?q=demo",
  "/login",
  "/redaksi",
  "/pedoman-media-siber",
  "/privasi",
  "/multimedia",
  "/multimedia/video-drone-karhutla-kalimantan",
  "/foto",
  "/en",
  "/plus",
  "/robots.txt",
  "/sitemap.xml",
  "/api/articles?offset=0&limit=8",
  "/nasional/pemerintah-tegaskan-komitmen-tangani-isu-publik-pasca-demo",
  "/nasional/e2e-automation-test-article",
];

let failed = 0;

function fail(label, detail) {
  console.error("FAIL", label, detail ?? "");
  failed++;
}

async function checkPage(path, cookieHeader = "") {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    redirect: "follow",
    headers: cookieHeader ? { Cookie: cookieHeader } : {},
  });
  const text = await res.text();
  const ok = res.status >= 200 && res.status < 400;
  const bad = errorPatterns.some((p) => text.includes(p));
  if (!ok || bad) {
    fail(path, `status=${res.status}`);
    return false;
  }
  console.log("OK", res.status, path);
  return true;
}

function collectSetCookies(res) {
  if (typeof res.headers.getSetCookie === "function") {
    return res.headers.getSetCookie();
  }
  const raw = res.headers.get("set-cookie");
  return raw ? [raw] : [];
}

function mergeCookies(jar, res) {
  for (const line of collectSetCookies(res)) {
    for (const part of line.split(",")) {
      const seg = part.split(";")[0]?.trim();
      if (!seg || !seg.includes("=")) continue;
      const eq = seg.indexOf("=");
      jar.set(seg.slice(0, eq), seg.slice(eq + 1));
    }
  }
}

function jarHeader(jar) {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

async function tryLogin(loginEmail, loginPassword) {
  const jar = new Map();
  const csrfRes = await fetch(`${base}/api/auth/csrf`);
  if (!csrfRes.ok) {
    fail("login/csrf", csrfRes.status);
    return "";
  }
  mergeCookies(jar, csrfRes);
  const { csrfToken } = await csrfRes.json();
  const body = new URLSearchParams({
    csrfToken,
    email: loginEmail,
    password: loginPassword,
    callbackUrl: `${base}/akun`,
    json: "true",
  });
  const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: jarHeader(jar),
    },
    body,
    redirect: "manual",
  });
  mergeCookies(jar, loginRes);
  const sessRes = await fetch(`${base}/api/auth/session`, {
    headers: { Cookie: jarHeader(jar) },
  });
  const session = await sessRes.json();
  if (!session?.user?.email) return "";
  console.log("OK login session", session.user.email);
  return jarHeader(jar);
}

async function login() {
  const attempts = [
    [email, password],
    ["admin@kabardesk.id", "admin123"],
  ].filter(([, pw]) => pw);
  if (!attempts.length) {
    console.log("SKIP login (set E2E_PASSWORD)");
    return "";
  }
  for (const [e, pw] of attempts) {
    const cookie = await tryLogin(e, pw);
    if (cookie) return cookie;
  }
  fail("login", "all attempts failed");
  return "";
}

async function fetchAllArticlePaths() {
  const paths = new Set();
  let offset = 0;
  for (let i = 0; i < 10; i++) {
    const res = await fetch(`${base}/api/articles?offset=${offset}&limit=24`);
    if (!res.ok) break;
    const data = await res.json();
    for (const a of data.items ?? []) {
      paths.add(`/${a.category}/${a.slug}`);
    }
    if (!data.items?.length || data.items.length < 24) break;
    offset = data.nextOffset ?? offset + data.items.length;
  }
  return [...paths];
}

console.log("E2E full against", base);

for (const path of staticRoutes) {
  await checkPage(path);
}

const dynamicPaths = await fetchAllArticlePaths();
console.log(`Checking ${dynamicPaths.length} articles from API...`);
for (const path of dynamicPaths) {
  await checkPage(path);
}

const sessionCookie = await login();
if (sessionCookie) {
  await checkPage("/akun", sessionCookie);
  await checkPage("/admin", sessionCookie);
  await checkPage("/admin/rss", sessionCookie);
  for (const path of dynamicPaths.slice(0, 5)) {
    await checkPage(path, sessionCookie);
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll E2E checks passed");
