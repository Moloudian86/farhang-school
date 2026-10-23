/**
 * Seed = filling the empty database with sample (demo) data.
 *
 * Run with:  npx prisma db seed
 *
 * SAFE TO RUN MORE THAN ONCE: this file never deletes anything.
 * For every table it first checks "is this table empty?". If the table already
 * has data, that part is skipped.
 */
import { PrismaClient, NewsStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedAcademic } from "./seedAcademic";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DAY = 24 * 60 * 60 * 1000;

/** A date N days from today (negative = in the past), at midnight UTC. */
function dayOffset(n: number): Date {
  const d = new Date(Date.now() + n * DAY);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/** Unsplash photo link (free license). Width 1200 is good for all cards. */
const img = (photoId: string) =>
  `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1200&q=80`;

// Photos found on Unsplash (see docs). Each constant = one photo.
const PHOTO = {
  schoolClockTower: "/uploads/school.jpg",
  schoolExterior: "/uploads/school.jpg",

  kidsSoccer: "/uploads/soccer.jpg",

  boyReading: "/uploads/books.jpg",
  childLibrary: "/uploads/library2.jpg",

  chess: "/uploads/chess.jpg",

  playground: "/uploads/schoolYard.jpg",
  playStructure: "/uploads/schoolYardBase.jpg",

  artClass: "/uploads/classroom.jpg",
  classroom: "/uploads/classroom.jpg",

  gym: "/uploads/soccer.jpg",

  auditorium: "/uploads/salonEjtemat.jpg",
  auditorium2: "/uploads/marasem.jpg",

  library: "/uploads/library.jpg",

  hiking: "/uploads/ordoo.jpg",
};

function log(ok: boolean, text: string) {
  console.log((ok ? "  [created] " : "  [skipped] ") + text);
}

// ---------------------------------------------------------------------------
// 1) School info + statistics
// ---------------------------------------------------------------------------

async function seedSchoolInfo() {
  if ((await prisma.schoolInfo.count()) > 0) return log(false, "school_info already has data");

  await prisma.schoolInfo.create({
    data: {
      name: "مدرسه فرهنگ",
      slogan: "آغاز یک مسیر روشن برای ساختن آینده‌ای بهتر",
      shortIntro:
        "دبستان پسرانهٔ فرهنگ با تکیه بر آموزش پویا، تربیت اخلاقی و پرورش خلاقیت، محیطی امن و پرنشاط برای رشد دانش‌آموزان پایهٔ اول تا ششم فراهم کرده است.",
      about:
        "مدرسه فرهنگ از سال ۱۳۸۷ با هدف ارائهٔ آموزش باکیفیت و تربیت نسلی مسئولیت‌پذیر آغاز به کار کرد. در این مدرسه، معلمان باتجربه در کنار کلاس‌های هوشمند، آزمایشگاه علوم، کتابخانه و فضاهای ورزشی، مسیر یادگیری را برای هر دانش‌آموز لذت‌بخش و اثربخش می‌کنند.\n\nما معتقدیم هر کودک استعدادی منحصربه‌فرد دارد و وظیفهٔ مدرسه کشف و پرورش آن استعداد در کنار آموزش مهارت‌های پایهٔ زندگی است. ارتباط نزدیک با خانواده‌ها یکی از ارکان اصلی کار ماست.",
      philosophy:
        "یادگیری باید همراه با کنجکاوی، تجربهٔ عملی و احترام به شخصیت کودک باشد. ما کنار هم رشد علمی، مهارت‌های اجتماعی، سلامت جسمی و ارزش‌های اخلاقی را دنبال می‌کنیم.",
      address: "اصفهان، خیابان چهارباغ بالا، کوچهٔ بهار، پلاک ۱۲",
      phone: "۰۳۱-۳۲۲۲۰۰۰۰",
      email: "info@farhang-school.ir",
      workingHours: "شنبه تا چهارشنبه، ۷:۳۰ تا ۱۴:۰۰ | پنجشنبه‌ها تعطیل",
      latitude: 32.6546,
      longitude: 51.668,
      heroImageUrl: PHOTO.schoolClockTower,
      aboutImageUrl: PHOTO.classroom,
    },
  });
  log(true, "school_info (1 row)");
}

async function seedStatistics() {
  if ((await prisma.schoolStatistic.count()) > 0) return log(false, "school_statistics already has data");

  await prisma.schoolStatistic.createMany({
    data: [
      { label: "دانش‌آموز", value: 420, suffix: "+", icon: "users", sortOrder: 1 },
      { label: "معلم و مربی", value: 28, suffix: "", icon: "graduation-cap", sortOrder: 2 },
      { label: "سال تجربه", value: 18, suffix: "+", icon: "calendar", sortOrder: 3 },
      { label: "افتخار و رتبهٔ برتر", value: 64, suffix: "", icon: "trophy", sortOrder: 4 },
      { label: "برنامهٔ آموزشی و فوق‌برنامه", value: 12, suffix: "", icon: "book-open", sortOrder: 5 },
    ],
  });
  log(true, "school_statistics (5 rows)");
}

// ---------------------------------------------------------------------------
// 2) Facilities
// ---------------------------------------------------------------------------

async function seedFacilities() {
  if ((await prisma.facility.count()) > 0) return log(false, "facilities already has data");

  // imageUrl null = the website shows a colored icon card instead of a photo.
  await prisma.facility.createMany({
    data: [
      {
        title: "کلاس‌های هوشمند",
        description:
          "همهٔ کلاس‌ها به تخته‌هوشمند، پروژکتور و اینترنت مجهزند تا درس‌ها با تصویر، انیمیشن و فعالیت گروهی جذاب‌تر شوند.",
        icon: "monitor",
        imageUrl: PHOTO.classroom,
        sortOrder: 1,
      },
      {
        title: "آزمایشگاه علوم",
        description:
          "دانش‌آموزان در آزمایشگاه با میکروسکوپ و وسایل ایمن، آزمایش‌های ساده علوم را خودشان انجام می‌دهند و علم را لمس می‌کنند.",
        icon: "flask-conical",
        imageUrl: null,
        sortOrder: 2,
      },
      {
        title: "کتابخانه",
        description:
          "کتابخانه‌ای آرام و رنگارنگ با بیش از ۵۰۰۰ جلد کتاب داستان، علمی و آموزشی مناسب هر پایه و ساعت مطالعهٔ هفتگی.",
        icon: "library",
        imageUrl: PHOTO.library,
        sortOrder: 3,
      },
      {
        title: "سالن ورزشی",
        description:
          "سالن سرپوشیده برای فوتسال، بسکتبال و حرکات اصلاحی؛ با نظارت مربی ورزش و رعایت اصول ایمنی.",
        icon: "dumbbell",
        imageUrl: PHOTO.gym,
        sortOrder: 4,
      },
      {
        title: "نمازخانه",
        description:
          "فضایی آرام و تمیز برای اقامهٔ نماز جماعت و آشنایی دانش‌آموزان با آداب دینی در کنار مربی پرورشی.",
        icon: "moon-star",
        imageUrl: null,
        sortOrder: 5,
      },
      {
        title: "سایت کامپیوتر",
        description:
          "سایتی با ۲۰ سیستم برای آموزش مهارت‌های رایانه، برنامه‌نویسی ساده با اسکرچ و آشنایی اولیه با رباتیک.",
        icon: "laptop",
        imageUrl: null,
        sortOrder: 6,
      },
      {
        title: "سالن اجتماعات",
        description:
          "سالن مجهز به سیستم صوتی و تصویری برای جشن‌ها، مراسم صبحگاهی، نمایش‌ها و جلسات اولیا و مربیان.",
        icon: "presentation",
        imageUrl: PHOTO.auditorium,
        sortOrder: 7,
      },
      {
        title: "حیاط و فضای سبز",
        description:
          "حیاطی وسیع با درخت، زمین بازی و فضای سبز که زنگ‌های تفریح را امن و پرنشاط می‌کند.",
        icon: "trees",
        imageUrl: PHOTO.playground,
        sortOrder: 8,
      },
    ],
  });
  log(true, "facilities (8 rows)");
}

// ---------------------------------------------------------------------------
// 3) Teachers (fictional names; photos can be uploaded later by the admin)
// ---------------------------------------------------------------------------

async function seedTeachers() {
  if ((await prisma.teacher.count()) > 0) return log(false, "teachers already has data");

  await prisma.teacher.createMany({
    data: [
      {
        firstName: "رضا",
        lastName: "کاظمی",
        position: "مدیر مدرسه",
        subject: "مدیریت آموزشی",
        degree: "کارشناسی ارشد مدیریت آموزشی",
        experienceYears: 20,
        bio: "با دو دهه تجربه در مدیریت مدارس ابتدایی، تمرکزش بر ایجاد فضایی امن، پرانگیزه و مبتنی بر همکاری با خانواده‌هاست.",
        sortOrder: 1,
      },
      {
        firstName: "محمد",
        lastName: "احمدی",
        position: "دبیر ریاضی",
        subject: "ریاضی",
        degree: "کارشناسی ارشد ریاضی",
        experienceYears: 12,
        bio: "ریاضی را با بازی، معما و مثال‌های روزمره درس می‌دهد تا دانش‌آموزان از آن نترسند و لذت ببرند.",
        sortOrder: 2,
      },
      {
        firstName: "علی",
        lastName: "رضایی",
        position: "معلم پایهٔ اول",
        subject: "آموزش ابتدایی (پایهٔ اول)",
        degree: "کارشناسی آموزش ابتدایی",
        experienceYears: 9,
        bio: "با صبر و مهربانی، دانش‌آموزان کلاس اول را در قدم‌های اول خواندن و نوشتن همراهی می‌کند.",
        sortOrder: 3,
      },
      {
        firstName: "حسین",
        lastName: "نوری",
        position: "معلم علوم تجربی",
        subject: "علوم تجربی",
        degree: "کارشناسی ارشد زیست‌شناسی",
        experienceYears: 14,
        bio: "مسئول آزمایشگاه مدرسه است و کلاس‌های علوم را با آزمایش‌های عملی و پروژه‌های گروهی برگزار می‌کند.",
        sortOrder: 4,
      },
      {
        firstName: "مهدی",
        lastName: "صادقی",
        position: "معلم فارسی و ادبیات",
        subject: "فارسی",
        degree: "کارشناسی ادبیات فارسی",
        experienceYears: 11,
        bio: "علاقه‌مند به قصه‌گویی و شعرخوانی است و برنامهٔ کتابخوانی هفتگی مدرسه را اجرا می‌کند.",
        sortOrder: 5,
      },
      {
        firstName: "امیر",
        lastName: "حسینی",
        position: "مربی تربیت‌بدنی",
        subject: "تربیت‌بدنی",
        degree: "کارشناسی تربیت‌بدنی",
        experienceYears: 8,
        bio: "مربی تیم فوتسال مدرسه؛ تقویت روحیهٔ کار تیمی، نظم و سلامت جسمی را هدف اصلی می‌داند.",
        sortOrder: 6,
      },
      {
        firstName: "سارا",
        lastName: "کریمی",
        position: "معلم زبان انگلیسی",
        subject: "زبان انگلیسی",
        degree: "کارشناسی ارشد آموزش زبان انگلیسی",
        experienceYears: 10,
        bio: "با روش‌های تصویری، آهنگ و بازی زبان را برای کودکان شیرین می‌کند.",
        sortOrder: 7,
      },
      {
        firstName: "مصطفی",
        lastName: "فرهادی",
        position: "مربی کامپیوتر و رباتیک",
        subject: "کامپیوتر",
        degree: "کارشناسی مهندسی کامپیوتر",
        experienceYears: 6,
        bio: "کودکان را با برنامه‌نویسی بلوکی، تفکر منطقی و ساخت ربات‌های ساده آشنا می‌کند.",
        sortOrder: 8,
      },
    ],
  });
  log(true, "teachers (8 rows)");
}

// ---------------------------------------------------------------------------
// 4) News (6 published + 1 draft that must NOT appear on the website)
// ---------------------------------------------------------------------------

async function seedNews() {
  const categoryData = [
    { name: "اطلاعیه", slug: "announcements" },
    { name: "آموزشی", slug: "educational" },
    { name: "فرهنگی", slug: "cultural" },
    { name: "ورزشی", slug: "sports" },
    { name: "مسابقات", slug: "competitions" },
    { name: "اردو", slug: "camps" },
  ];
  const cats: Record<string, number> = {};
  for (const c of categoryData) {
    const row = await prisma.newsCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
    cats[c.slug] = row.id;
  }

  if ((await prisma.news.count()) > 0) return log(false, "news already has data (categories checked)");

  await prisma.news.createMany({
    data: [
      {
        title: "آغاز ثبت‌نام سال تحصیلی جدید",
        slug: "enrollment-new-academic-year",
        summary: "ثبت‌نام دانش‌آموزان جدید پایه‌های اول تا ششم برای سال تحصیلی آینده آغاز شد.",
        content:
          "ثبت‌نام دانش‌آموزان جدید برای سال تحصیلی آینده از امروز آغاز شده است. والدین گرامی می‌توانند از طریق بخش «ثبت‌نام» همین وب‌سایت فرم را تکمیل کنند.\n\nپس از ثبت درخواست، همکاران دفتر مدرسه با شما تماس می‌گیرند و زمان مصاحبه و ارائهٔ مدارک را هماهنگ می‌کنند.\n\nظرفیت هر پایه محدود است؛ پیشنهاد می‌کنیم هرچه زودتر اقدام کنید.",
        imageUrl: PHOTO.schoolClockTower,
        author: "دفتر مدرسه",
        categoryId: cats["announcements"],
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 2 * DAY),
      },
      {
        title: "برگزاری کارگاه روش‌های مطالعهٔ مؤثر برای والدین",
        slug: "parents-study-skills-workshop",
        summary: "کارگاه یک‌روزهٔ آشنایی والدین با روش‌های ایجاد عادت مطالعه در کودکان برگزار شد.",
        content:
          "این کارگاه با حضور مشاور مدرسه و معلمان پایه‌های پایین برگزار شد و والدین با تکنیک‌های ساده‌ای مثل ساعت ثابت مطالعه، تشویق به‌جای سرزنش و انتخاب کتاب مناسب آشنا شدند.\n\nشرکت‌کنندگان از فضای صمیمی و کاربردی بودن مطالب رضایت داشتند و درخواست برگزاری جلسات بعدی را مطرح کردند.",
        imageUrl: PHOTO.classroom,
        author: "معاونت آموزشی",
        categoryId: cats["educational"],
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 5 * DAY),
      },
      {
        title: "ساعت کتاب‌خوانی هفتگی در کتابخانهٔ مدرسه",
        slug: "weekly-reading-hour",
        summary: "از این هفته هر پایه یک ساعت در هفته را به مطالعهٔ آزاد در کتابخانه اختصاص می‌دهد.",
        content:
          "برای تقویت عادت کتاب‌خوانی، از این هفته برنامهٔ «ساعت کتاب‌خوانی» در کتابخانهٔ مدرسه اجرا می‌شود. دانش‌آموزان کتاب دلخواه خود را انتخاب می‌کنند و در پایان، دربارهٔ آن برای دوستانشان تعریف می‌کنند.\n\nبه برترین کتاب‌خوان‌های ماه جایزهٔ ویژه اهدا خواهد شد.",
        imageUrl: PHOTO.library,
        author: "گروه فرهنگی",
        categoryId: cats["cultural"],
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 9 * DAY),
      },
      {
        title: "قهرمانی تیم فوتسال مدرسه در مسابقات منطقه",
        slug: "futsal-team-district-champion",
        summary: "تیم فوتسال دانش‌آموزان پایه‌های چهارم تا ششم مقام اول مسابقات منطقه را کسب کرد.",
        content:
          "تیم فوتسال مدرسه فرهنگ پس از چهار بازی نزدیک و جذاب، در فینال مسابقات منطقه به پیروزی رسید و قهرمان شد.\n\nمربی تیم، موفقیت را حاصل تمرین منظم و روحیهٔ همکاری بچه‌ها دانست و از حمایت اولیا تشکر کرد.",
        imageUrl: PHOTO.kidsSoccer,
        author: "گروه ورزش",
        categoryId: cats["sports"],
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 14 * DAY),
      },
      {
        title: "درخشش دانش‌آموزان ما در مسابقات شطرنج",
        slug: "chess-competition-results",
        summary: "سه دانش‌آموز پایهٔ پنجم در مسابقات شطرنج شهرستان به مقام‌های برتر رسیدند.",
        content:
          "در مسابقات شطرنج دانش‌آموزی شهرستان، نمایندگان مدرسه فرهنگ با بازی‌های هوشمندانه توانستند سه مقام برتر را به خود اختصاص دهند.\n\nباشگاه شطرنج مدرسه هر هفته دوشنبه‌ها برای علاقه‌مندان فعال است و ثبت‌نام در آن همچنان ادامه دارد.",
        imageUrl: PHOTO.chess,
        author: "روابط عمومی",
        categoryId: cats["competitions"],
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 20 * DAY),
      },
      {
        title: "اردوی طبیعت‌گردی پایه‌های سوم و چهارم",
        slug: "nature-camp-grades-3-4",
        summary: "دانش‌آموزان پایه‌های سوم و چهارم یک روز را در دامان طبیعت و با برنامه‌های آموزشی گذراندند.",
        content:
          "این اردوی یک‌روزه شامل پیاده‌روی، بازی‌های گروهی و فعالیت‌های آموزشی دربارهٔ گیاهان و حفظ محیط زیست بود.\n\nبچه‌ها با همراهی معلمان و مربیان، تجربه‌ای شاد و به‌یادماندنی داشتند و از طبیعت زباله‌ای جا نگذاشتند.",
        imageUrl: PHOTO.hiking,
        author: "گروه تربیتی",
        categoryId: cats["camps"],
        status: NewsStatus.PUBLISHED,
        publishedAt: new Date(Date.now() - 27 * DAY),
      },
      {
        // DRAFT: used to prove the website only shows PUBLISHED news.
        title: "پیش‌نویس: برنامهٔ جشن پایان ترم",
        slug: "draft-end-of-term-party",
        summary: "این خبر هنوز منتشر نشده و نباید در سایت دیده شود.",
        content: "متن این خبر هنوز آماده نیست.",
        imageUrl: PHOTO.auditorium2,
        author: "دفتر مدرسه",
        categoryId: cats["announcements"],
        status: NewsStatus.DRAFT,
        publishedAt: null,
      },
    ],
  });
  log(true, "news (6 published + 1 draft)");
}

// ---------------------------------------------------------------------------
// 5) Events (dates are relative to today, so they are always "upcoming")
// ---------------------------------------------------------------------------

async function seedEvents() {
  const categoryData = [
    { name: "جشن", slug: "celebrations" },
    { name: "آموزشی", slug: "educational" },
    { name: "ورزشی", slug: "sports" },
    { name: "فرهنگی", slug: "cultural" },
    { name: "اردو", slug: "camps" },
    { name: "جلسه", slug: "meetings" },
  ];
  const cats: Record<string, number> = {};
  for (const c of categoryData) {
    const row = await prisma.eventCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
    cats[c.slug] = row.id;
  }

  if ((await prisma.event.count()) > 0) return log(false, "events already has data (categories checked)");

  await prisma.event.createMany({
    data: [
      {
        title: "جلسهٔ انجمن اولیا و مربیان",
        description:
          "جلسهٔ ماهانهٔ انجمن اولیا و مربیان با موضوع بررسی روند آموزشی و پیشنهادهای خانواده‌ها.",
        imageUrl: PHOTO.auditorium,
        eventDate: dayOffset(3),
        startTime: "16:00",
        location: "سالن اجتماعات",
        categoryId: cats["meetings"],
      },
      {
        title: "جشن عاطفه‌ها",
        description:
          "برنامهٔ نیکوکاری دانش‌آموزان برای کمک به همکلاسی‌ها و همسالان کم‌برخوردار، همراه با نمایش و غرفه‌های هنری.",
        imageUrl: PHOTO.auditorium2,
        eventDate: dayOffset(8),
        startTime: "09:00",
        location: "سالن اجتماعات و حیاط مدرسه",
        categoryId: cats["celebrations"],
      },
      {
        title: "مسابقات فوتسال بین‌پایه‌ای",
        description:
          "رقابت دوستانهٔ تیم‌های پایه‌های اول تا ششم با حضور داوران و تشویق همکلاسی‌ها.",
        imageUrl: PHOTO.kidsSoccer,
        eventDate: dayOffset(14),
        startTime: "10:00",
        location: "سالن ورزشی",
        categoryId: cats["sports"],
      },
      {
        title: "نمایشگاه علوم و اختراعات کوچک",
        description:
          "دانش‌آموزان پروژه‌های علمی ساخته‌شده با مواد ساده را به والدین و دیگر کلاس‌ها معرفی می‌کنند.",
        imageUrl: PHOTO.artClass,
        eventDate: dayOffset(21),
        startTime: "09:30",
        location: "راهروی اصلی و آزمایشگاه",
        categoryId: cats["educational"],
      },
      {
        title: "اردوی یک‌روزهٔ طبیعت‌گردی",
        description:
          "اردوی آموزشی-تفریحی دانش‌آموزان پایه‌های پنجم و ششم با همراهی معلمان؛ لطفاً فرم رضایت‌نامه تکمیل شود.",
        imageUrl: PHOTO.hiking,
        eventDate: dayOffset(30),
        startTime: "07:00",
        location: "مبدأ: درب اصلی مدرسه",
        categoryId: cats["camps"],
      },
      {
        title: "هفتهٔ کتاب و کتاب‌خوانی",
        description:
          "نمایشگاه کتاب کودک، قصه‌گویی، کتاب‌بازی و معرفی کتاب‌های برتر توسط دانش‌آموزان.",
        imageUrl: PHOTO.library,
        eventDate: dayOffset(45),
        startTime: "08:30",
        location: "کتابخانهٔ مدرسه",
        categoryId: cats["cultural"],
      },
    ],
  });
  log(true, "events (6 upcoming)");
}

// ---------------------------------------------------------------------------
// 6) Gallery (15 images, 6 categories)
// ---------------------------------------------------------------------------

async function seedGallery() {
  const categoryData = [
    { name: "اردوها", slug: "camps" },
    { name: "مسابقات", slug: "competitions" },
    { name: "جشن‌ها", slug: "celebrations" },
    { name: "کلاس‌ها", slug: "classes" },
    { name: "مراسم‌ها", slug: "ceremonies" },
    { name: "فعالیت‌های فرهنگی", slug: "cultural" },
  ];
  const cats: Record<string, number> = {};
  for (const c of categoryData) {
    const row = await prisma.galleryCategory.upsert({ where: { slug: c.slug }, update: {}, create: c });
    cats[c.slug] = row.id;
  }

  if ((await prisma.galleryImage.count()) > 0) return log(false, "gallery_images already has data (categories checked)");

  const items: { title: string; description: string; photo: string; days: number; cat: string }[] = [
    { title: "اردوی طبیعت‌گردی", description: "پیاده‌روی گروهی دانش‌آموزان در مسیر طبیعت.", photo: PHOTO.hiking, days: -27, cat: "camps" },
    { title: "روز فضای سبز", description: "بازی و فعالیت در فضای باز مدرسه.", photo: PHOTO.playStructure, days: -35, cat: "camps" },
    { title: "فینال فوتسال", description: "لحظه‌های هیجان‌انگیز مسابقات فوتسال منطقه.", photo: PHOTO.kidsSoccer, days: -14, cat: "competitions" },
    { title: "مسابقات شطرنج", description: "رقابت فکری دانش‌آموزان در باشگاه شطرنج.", photo: PHOTO.chess, days: -20, cat: "competitions" },
    { title: "المپیاد ورزشی پایه‌ها", description: "سالن ورزشی در روز المپیاد درون‌مدرسه‌ای.", photo: PHOTO.gym, days: -40, cat: "competitions" },
    { title: "روز بازی و نشاط", description: "زنگ تفریح پرنشاط در حیاط مدرسه.", photo: PHOTO.playground, days: -18, cat: "celebrations" },
    { title: "جشن آغاز سال تحصیلی", description: "جشن شروع سال تحصیلی در سالن اجتماعات.", photo: PHOTO.auditorium2, days: -30, cat: "celebrations" },
    { title: "کارگاه نقاشی و کاردستی", description: "دانش‌آموزان در کلاس هنر مشغول خلاقیت‌اند.", photo: PHOTO.artClass, days: -12, cat: "classes" },
    { title: "کلاس درس", description: "فضای روشن و منظم کلاس‌های مدرسه.", photo: PHOTO.classroom, days: -8, cat: "classes" },
    { title: "نمای ساختمان مدرسه", description: "ساختمان اصلی مدرسه فرهنگ.", photo: PHOTO.schoolClockTower, days: -60, cat: "ceremonies" },
    { title: "حیاط و ساختمان", description: "نمایی از حیاط و محوطهٔ مدرسه.", photo: PHOTO.schoolExterior, days: -55, cat: "ceremonies" },
    { title: "مراسم صبحگاهی", description: "مراسم صبحگاهی در سالن اجتماعات.", photo: PHOTO.auditorium, days: -3, cat: "ceremonies" },
    { title: "ساعت کتاب‌خوانی", description: "مطالعهٔ آزاد در گوشهٔ دنج کتابخانه.", photo: PHOTO.boyReading, days: -9, cat: "cultural" },
    { title: "کتاب و کودک", description: "کودکی غرق در دنیای کتاب‌ها.", photo: PHOTO.childLibrary, days: -10, cat: "cultural" },
    { title: "کتابخانهٔ مدرسه", description: "قفسه‌های کتاب مناسب هر پایه.", photo: PHOTO.library, days: -22, cat: "cultural" },
  ];

  await prisma.galleryImage.createMany({
    data: items.map((it, i) => ({
      title: it.title,
      description: it.description,
      imageUrl: it.photo,
      takenAt: dayOffset(it.days),
      categoryId: cats[it.cat],
      sortOrder: i + 1,
    })),
  });
  log(true, "gallery_images (15 rows)");
}

// ---------------------------------------------------------------------------
// 7) Demo accounts (used in the next steps for login)
// ---------------------------------------------------------------------------

async function seedUsers() {
  const demo = [
    { email: "admin@farhang.school", password: "Admin@12345", role: Role.ADMIN, firstName: "مدیر", lastName: "سیستم" },
    { email: "teacher@farhang.school", password: "Teacher@12345", role: Role.TEACHER, firstName: "محمد", lastName: "احمدی" },
  ];

  for (const u of demo) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (exists) {
      log(false, `user ${u.email} already exists`);
      continue;
    }
    const user = await prisma.user.create({
      data: {
        email: u.email,
        passwordHash: await bcrypt.hash(u.password, 10),
        role: u.role,
        firstName: u.firstName,
        lastName: u.lastName,
      },
    });

    // Link the demo teacher account to the public teacher "محمد احمدی".
    if (u.role === Role.TEACHER) {
      await prisma.teacher.updateMany({
        where: { firstName: "محمد", lastName: "احمدی", userId: null },
        data: { userId: user.id },
      });
    }
    log(true, `user ${u.email}`);
  }
}

// ---------------------------------------------------------------------------

async function main() {
  console.log("Seeding the database (nothing will be deleted) ...");
  await seedSchoolInfo();
  await seedStatistics();
  await seedFacilities();
  await seedTeachers();
  await seedNews();
  await seedEvents();
  await seedGallery();
  await seedUsers();
  await seedAcademic(prisma, log);
  console.log("Done.");
}

main()
  .catch((error) => {
    console.error("\nSeed failed:");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
