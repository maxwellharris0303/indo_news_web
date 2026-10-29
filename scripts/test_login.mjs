const base = process.argv[2] ?? "http://23.88.20.96:3010";
const email = process.argv[3] ?? "smartyoungdev@gmail.com";
const password = process.argv[4] ?? "";

const csrfRes = await fetch(`${base}/api/auth/csrf`);
const { csrfToken } = await csrfRes.json();
const cookies = csrfRes.headers.getSetCookie?.() ?? [];

const body = new URLSearchParams({
  csrfToken,
  email,
  password,
  callbackUrl: `${base}/akun`,
  json: "true",
});

const loginRes = await fetch(`${base}/api/auth/callback/credentials`, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Cookie: cookies.map((c) => c.split(";")[0]).join("; "),
  },
  body,
  redirect: "manual",
});

const setCookie = loginRes.headers.getSetCookie?.() ?? [];
const ok =
  loginRes.status === 200 ||
  loginRes.status === 302 ||
  setCookie.some((c) => c.includes("session-token"));

console.log(
  JSON.stringify({
    status: loginRes.status,
    hasSessionCookie: setCookie.some((c) => /session-token|authjs/i.test(c)),
    setCookieCount: setCookie.length,
  }),
);

if (!ok) {
  const text = await loginRes.text();
  console.log(text.slice(0, 200));
  process.exit(1);
}
