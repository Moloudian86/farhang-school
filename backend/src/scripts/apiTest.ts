/**
 * Automatic API check for beginners.
 *
 * 1) Start the server in one PowerShell window:   npm run dev
 * 2) In a SECOND PowerShell window run:           npm run api:test
 *
 * It sends real requests to the running server and prints ✔ / ✘ for each one.
 * It never deletes anything. Two small test rows are left behind (see SETUP-API.md).
 */
import "dotenv/config";

const BASE = `http://localhost:${process.env.PORT ?? 5000}/api/v1`;

let passed = 0;
let failed = 0;

function check(name: string, ok: boolean, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✔ ${name}`);
  } else {
    failed++;
    console.log(`  ✘ ${name}${detail ? "  →  " + detail : ""}`);
  }
}

interface Reply {
  status: number;
  json: any;
  cookie?: string;
}

async function call(method: string, path: string, opts: { body?: unknown; cookie?: string } = {}): Promise<Reply> {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(opts.body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(opts.cookie ? { Cookie: opts.cookie } : {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* not JSON */
  }
  const setCookie = res.headers.getSetCookie?.()[0];
  return { status: res.status, json, cookie: setCookie ? setCookie.split(";")[0] : undefined };
}

const section = (title: string) => console.log(`\n${title}`);

async function main() {
  console.log(`Testing ${BASE}`);

  // Is the server even running?
  try {
    await fetch(BASE + "/health");
  } catch {
    console.log("\n✘ Cannot reach the server. Start it first in another window with:  npm run dev");
    process.exit(1);
  }

  section("Health");
  let r = await call("GET", "/health");
  check("server is alive", r.status === 200 && r.json?.success === true);
  r = await call("GET", "/health/db");
  check("database connection works", r.status === 200);

  section("Public data (seed data must exist)");
  r = await call("GET", "/school-info");
  check("school info", r.status === 200 && Boolean(r.json?.data?.name), `status ${r.status}`);
  r = await call("GET", "/statistics");
  check("statistics (5 rows)", r.status === 200 && r.json?.data?.length >= 5, `got ${r.json?.data?.length}`);
  r = await call("GET", "/facilities");
  check("facilities (8 rows)", r.status === 200 && r.json?.data?.length >= 8, `got ${r.json?.data?.length}`);
  r = await call("GET", "/teachers");
  check("teachers (8 rows)", r.status === 200 && r.json?.data?.length >= 8, `got ${r.json?.data?.length}`);
  check("teachers do not leak userId", r.json?.data?.[0] && !("userId" in r.json.data[0]));

  section("News");
  r = await call("GET", "/news?limit=50");
  const slugs: string[] = (r.json?.data ?? []).map((n: any) => n.slug);
  check("6 published news", r.status === 200 && r.json?.meta?.total === 6, `total ${r.json?.meta?.total}`);
  check("draft news is hidden from the public", !slugs.includes("draft-end-of-term-party"));
  r = await call("GET", "/news/draft-end-of-term-party");
  check("draft news detail gives 404", r.status === 404, `status ${r.status}`);
  r = await call("GET", "/news/weekly-reading-hour");
  check("published news detail works", r.status === 200 && Boolean(r.json?.data?.content));
  r = await call("GET", "/news/categories");
  check("news categories", r.status === 200 && r.json?.data?.length >= 6);
  r = await call("GET", "/news?category=sports");
  check("filter by category", r.status === 200 && r.json?.data?.every((n: any) => n.category.slug === "sports"));
  r = await call("GET", "/news?page=abc");
  check("bad page number gives 400", r.status === 400, `status ${r.status}`);

  section("Events and gallery");
  r = await call("GET", "/events?upcoming=true");
  check("upcoming events (6 rows)", r.status === 200 && r.json?.meta?.total >= 6, `total ${r.json?.meta?.total}`);
  const eventId = r.json?.data?.[0]?.id;
  r = await call("GET", `/events/${eventId}`);
  check("event detail", r.status === 200 && r.json?.data?.id === eventId);
  r = await call("GET", "/gallery?limit=50");
  check("gallery (15 images)", r.status === 200 && r.json?.meta?.total >= 15, `total ${r.json?.meta?.total}`);
  r = await call("GET", "/gallery/categories");
  const firstCat = r.json?.data?.[0]?.slug;
  r = await call("GET", `/gallery?category=${firstCat}`);
  check("gallery filter by category", r.status === 200 && r.json?.data?.length > 0);

  section("Forms: validation");
  r = await call("POST", "/enrollments", { body: { firstName: "" } });
  check("empty enrollment form gives 400 + Persian errors", r.status === 400 && r.json?.errors?.length > 3);
  r = await call("POST", "/enrollments", {
    body: {
      firstName: "تست", lastName: "خودکار", nationalCode: "1234567890", birthDate: "2018-05-10", gradeLevel: 1,
      fatherName: "پدر تست", parentPhone: "09120000000", address: "تهران، آدرس آزمایشی برای تست خودکار",
    },
  });
  check("wrong national code is rejected", r.status === 400 && r.json?.errors?.some((e: any) => e.field === "nationalCode"));
  r = await call("POST", "/contact", { body: { name: "ا", email: "not-an-email", subject: "x", message: "کوتاه" } });
  check("bad contact form gives 400", r.status === 400);

  section("Forms: real submissions");
  // Persian digits in the national code are accepted too (0013542419 is a valid test code).
  r = await call("POST", "/enrollments", {
    body: {
      firstName: "تست", lastName: "خودکار", nationalCode: "۰۰۱۳۵۴۲۴۱۹", birthDate: "2018-05-10", gradeLevel: 1,
      fatherName: "پدر تست", parentPhone: "۰۹۱۲۰۰۰۰۰۰۰", address: "تهران، آدرس آزمایشی برای تست خودکار",
      notes: "AUTOMATIC API TEST - you can reject this row",
    },
  });
  check("valid enrollment saved (or already saved by an earlier run)", r.status === 201 || r.status === 409, `status ${r.status}`);
  r = await call("POST", "/contact", {
    body: { name: "تست خودکار", email: "test@example.com", subject: "تست خودکار API", message: "این پیام توسط تست خودکار ارسال شده است." },
  });
  check("valid contact message saved", r.status === 201, `status ${r.status}`);

  section("Login and roles");
  r = await call("GET", "/auth/me");
  check("/auth/me without login gives 401", r.status === 401);
  r = await call("GET", "/enrollments");
  check("admin list without login gives 401", r.status === 401);
  r = await call("POST", "/auth/login", { body: { email: "admin@farhang.school", password: "wrong-password" } });
  check("wrong password gives 401", r.status === 401);

  r = await call("POST", "/auth/login", { body: { email: "teacher@farhang.school", password: "Teacher@12345" } });
  check("teacher can log in", r.status === 200 && Boolean(r.cookie), `status ${r.status}`);
  const teacherCookie = r.cookie;
  r = await call("GET", "/enrollments", { cookie: teacherCookie });
  check("teacher is blocked from admin data (403)", r.status === 403, `status ${r.status}`);

  r = await call("POST", "/auth/login", { body: { email: "admin@farhang.school", password: "Admin@12345" } });
  check("admin can log in", r.status === 200 && r.json?.data?.user?.role === "ADMIN", `status ${r.status}`);
  check("password hash is never returned", !JSON.stringify(r.json).includes("passwordHash"));
  const admin = r.cookie;
  r = await call("GET", "/auth/me", { cookie: admin });
  check("/auth/me with admin cookie", r.status === 200 && r.json?.data?.user?.email === "admin@farhang.school");
  r = await call("GET", "/enrollments", { cookie: admin });
  check("admin sees enrollments", r.status === 200 && r.json?.meta?.total >= 1);
  r = await call("GET", "/contact", { cookie: admin });
  check("admin sees contact messages", r.status === 200 && typeof r.json?.data?.unread === "number");
  r = await call("GET", "/news/admin/all?status=DRAFT", { cookie: admin });
  check("admin sees the draft news", r.status === 200 && r.json?.data?.some((n: any) => n.slug === "draft-end-of-term-party"));

  section("Admin: create and edit news (stays a hidden DRAFT)");
  const category = (await call("GET", "/news/categories")).json?.data?.[0]?.id;
  r = await call("POST", "/news", {
    cookie: admin,
    body: {
      title: "خبر آزمایشی تست خودکار", slug: "automated-api-test-draft", summary: "این خبر فقط برای آزمایش API ساخته شده است.",
      content: "متن آزمایشی خبر که بیش از بیست کاراکتر دارد.", author: "تست خودکار", categoryId: category, status: "DRAFT",
    },
  });
  check("admin can create a news item", r.status === 201 || r.status === 409, `status ${r.status}`);
  r = await call("GET", "/news/admin/all?status=DRAFT", { cookie: admin });
  const testNews = r.json?.data?.find((n: any) => n.slug === "automated-api-test-draft");
  check("test news exists", Boolean(testNews));
  if (testNews) {
    r = await call("PUT", `/news/${testNews.id}`, { cookie: admin, body: { author: "تست خودکار (ویرایش‌شده)" } });
    check("admin can edit it", r.status === 200 && r.json?.data?.author.includes("ویرایش"), `status ${r.status}`);
    r = await call("GET", "/news/automated-api-test-draft");
    check("it is still invisible to the public (draft)", r.status === 404);
  }
  r = await call("POST", "/news", { body: { title: "x" } });
  check("creating news without login gives 401", r.status === 401);

  r = await call("POST", "/auth/logout", { cookie: admin });
  check("logout works", r.status === 200);

  console.log(`\n${failed === 0 ? "ALL GOOD" : "SOME CHECKS FAILED"}:  ${passed} passed, ${failed} failed.`);
  if (failed > 0) console.log("Copy the lines marked ✘ and send them to me.");
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Test crashed:", e);
  process.exit(1);
});
