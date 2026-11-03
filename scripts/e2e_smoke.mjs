const base = process.env.BASE_URL || "http://localhost:3001";

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
  "/opini",
  "/indeks",
  "/search?q=demo",
  "/login",
  "/redaksi",
  "/multimedia",
  "/foto",
  "/en",
  "/plus",
  "/api/articles?offset=0&limit=4",
];

async function firstArticlePath(category) {
  const url = `${base}/api/articles?category=${encodeURIComponent(category)}&limit=1`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data.items?.[0];
    if (!item?.slug) return null;
    if (category === "daerah") return `/daerah/${item.slug}`;
    return `/${category}/${item.slug}`;
  } catch {
    return null;
  }
}

async function dynamicRoutes() {
  const paths = [];
  for (const category of ["nasional", "multimedia", "daerah"]) {
    const path = await firstArticlePath(category);
    if (path) paths.push(path);
  }
  return paths;
}

async function checkPath(path) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const ok = res.status >= 200 && res.status < 400;
  const text = await res.text();
  const hasError =
    text.includes("Application error") || text.includes("Terjadi kesalahan");
  return { ok: ok && !hasError, status: res.status };
}

const routes = [...staticRoutes, ...(await dynamicRoutes())];

let failed = 0;
for (const path of routes) {
  const { ok, status } = await checkPath(path);
  if (!ok) {
    console.error("FAIL", status, path);
    failed++;
  } else {
    console.log("OK", status, path);
  }
}

if (failed) process.exit(1);
