/**
 * Smoke test for AI IEP Platform routes and APIs.
 * Run: node scripts/smoke-test.mjs
 * Optional auth cookie for protected routes: set AUTH_COOKIE env var.
 */

const BASE = process.env.BASE_URL ?? "http://localhost:3000";

const publicPages = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/confirm",
  "/auth/reset-password",
];

const protectedPages = [
  "/dashboard",
  "/dashboard/students",
  "/dashboard/iep",
  "/dashboard/iep/new",
  "/dashboard/students/new",
];

async function fetchStatus(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual", ...options });
  return { status: res.status, location: res.headers.get("location") };
}

async function main() {
  console.log(`\n=== AI IEP Platform Smoke Test ===\nBase: ${BASE}\n`);

  let passed = 0;
  let failed = 0;

  function ok(label) {
    passed += 1;
    console.log(`✓ ${label}`);
  }

  function fail(label, detail) {
    failed += 1;
    console.log(`✗ ${label}${detail ? ` — ${detail}` : ""}`);
  }

  for (const path of publicPages) {
    try {
      const { status } = await fetchStatus(path);
      if (status === 200) ok(`GET ${path} -> 200`);
      else fail(`GET ${path}`, `status ${status}`);
    } catch (err) {
      fail(`GET ${path}`, err.message);
    }
  }

  for (const path of protectedPages) {
    try {
      const { status, location } = await fetchStatus(path);
      if (status === 307 && location?.includes("/auth/login")) {
        ok(`GET ${path} -> 307 redirect to login`);
      } else {
        fail(`GET ${path}`, `status ${status}, location ${location}`);
      }
    } catch (err) {
      fail(`GET ${path}`, err.message);
    }
  }

  const apiTests = [
    { method: "GET", path: "/api/iep/generate", expect: 405 },
    { method: "GET", path: "/api/iep/progress", expect: 405 },
    { method: "POST", path: "/api/iep/generate", body: "{}", expect: 401 },
    { method: "PATCH", path: "/api/iep/progress", body: "{}", expect: 401 },
    {
      method: "GET",
      path: "/api/iep/test-id/export?format=word",
      expect: 401,
    },
    {
      method: "GET",
      path: "/api/iep/test-id/export?format=pdf",
      expect: 401,
    },
    {
      method: "GET",
      path: "/api/iep/test-id/export?format=progress",
      expect: 401,
    },
  ];

  for (const test of apiTests) {
    try {
      const res = await fetch(`${BASE}${test.path}`, {
        method: test.method,
        headers: test.body ? { "Content-Type": "application/json" } : {},
        body: test.body,
      });
      if (res.status === test.expect) ok(`${test.method} ${test.path} -> ${test.expect}`);
      else fail(`${test.method} ${test.path}`, `expected ${test.expect}, got ${res.status}`);
    } catch (err) {
      fail(`${test.method} ${test.path}`, err.message);
    }
  }

  console.log(`\n--- Summary: ${passed} passed, ${failed} failed ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
