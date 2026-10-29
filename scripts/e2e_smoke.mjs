const base = process.env.BASE_URL || "http://localhost:3001";

const routes = [
  "/",
  "/nasional",
  "/internasional",
  "/ekonomi",
  "/politik-hukum",
  "/olahraga",
  "/tekno",
  "/gaya-hidup",
  "/daerah",
  "/daerah/dki-jakarta",
  "/topik/ihsg",
  "/cek-fakta",
  "/cek-fakta/hoaks-blt-umkm-2026",
  "/opini",
  "/indeks",
  "/search?q=demo",
  "/login",
  "/redaksi",
  "/nasional/pemerintah-tegaskan-komitmen-tangani-isu-publik-pasca-demo",
];

let failed = 0;
for (const path of routes) {
  const url = `${base}${path}`;
  const res = await fetch(url, { redirect: "follow" });
  const ok = res.status >= 200 && res.status < 400;
  const text = await res.text();
  const hasError = text.includes("Application error") || text.includes("Terjadi kesalahan");
  if (!ok || hasError) {
    console.error("FAIL", res.status, path);
    failed++;
  } else {
    console.log("OK", res.status, path);
  }
}

if (failed) process.exit(1);
