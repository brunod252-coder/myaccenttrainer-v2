#!/usr/bin/env node

const path = require("path");
const { createJiti } = require("jiti");

const root = path.resolve(__dirname, "..");
const mode = process.argv[2] ?? "preview";

const envFile = path.join(root, ".env");

if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile(envFile);
  } catch (error) {
    console.error(
      `ERROR: Unable to load application environment from ${envFile}.`,
    );
    console.error(error);
    process.exit(1);
  }
}

if (!process.env.DATABASE_URL) {
  console.error(
    "ERROR: DATABASE_URL is not configured.",
  );
  process.exit(1);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

if (
  mode !== "preview" &&
  mode !== "execute"
) {
  fail(
    `Unsupported mode "${mode}". Use preview or execute.`,
  );
}

const confirmationArgument =
  process.argv.find(
    (argument) =>
      argument.startsWith("--confirm="),
  );

const confirmation =
  confirmationArgument?.slice(
    "--confirm=".length,
  );

const EXECUTION_CONFIRMATION =
  "SYNC_CORE_CURRICULUM";

const EXECUTION_ENVIRONMENT_VALUE =
  "YES";

if (mode === "execute") {
  if (
    process.env.ALLOW_PRODUCTION_CURRICULUM_SYNC !==
    EXECUTION_ENVIRONMENT_VALUE
  ) {
    fail(
      [
        "Production curriculum synchronization is locked.",
        "Set ALLOW_PRODUCTION_CURRICULUM_SYNC=YES",
        "only for a deliberate synchronization run.",
      ].join(" "),
    );
  }

  if (
    confirmation !==
    EXECUTION_CONFIRMATION
  ) {
    fail(
      [
        "Explicit confirmation missing.",
        "Required:",
        "--confirm=SYNC_CORE_CURRICULUM",
      ].join(" "),
    );
  }
}

const jiti = createJiti(__filename, {
  tsconfigPaths: path.join(root, "tsconfig.json"),
});

const {
  CORE_COURSE,
  CORE_MODULE,
  syncCoreCurriculum,
} = jiti(
  path.join(
    root,
    "lib/curriculum/sync-core-curriculum.ts",
  ),
);

const {
  getAllLessons,
} = jiti(
  path.join(
    root,
    "lib/lessons/index.ts",
  ),
);

if (typeof syncCoreCurriculum !== "function") {
  fail("Canonical sync service is unavailable.");
}

if (typeof getAllLessons !== "function") {
  fail("Canonical lesson catalog is unavailable.");
}

const lessons = getAllLessons();

if (!Array.isArray(lessons)) {
  fail("Canonical lesson catalog did not return an array.");
}

if (lessons.length !== 10) {
  fail(
    `Expected 10 built-in lessons, found ${lessons.length}.`,
  );
}

const seen = new Set();

const previewLessons = lessons.map(
  (lesson, index) => {
    if (!lesson.slug) {
      fail(
        `Lesson at index ${index} has no slug.`,
      );
    }

    if (seen.has(lesson.slug)) {
      fail(
        `Duplicate lesson slug: ${lesson.slug}`,
      );
    }

    seen.add(lesson.slug);

    return {
      sortOrder: index,
      slug: lesson.slug,
      title: lesson.subtitle,
      description: lesson.description,
      difficulty: lesson.difficulty,
    };
  },
);

if (mode === "execute") {
  console.log(
    "============================================================",
  );
  console.log(
    " MYACCENTTRAINER — CORE CURRICULUM SYNCHRONIZATION",
  );
  console.log(
    "============================================================",
  );
  console.log();
  console.log("MODE:           EXECUTE");
  console.log("DATABASE WRITE: ENABLED");
  console.log("DELETIONS:      NONE");
  console.log();
  console.log(
    "Explicit production gate accepted.",
  );
  console.log(
    "Invoking canonical syncCoreCurriculum()...",
  );
  console.log();

  syncCoreCurriculum()
    .then((result) => {
      console.log(
        JSON.stringify(
          result,
          null,
          2,
        ),
      );
      console.log();
      console.log(
        "Canonical curriculum synchronization complete.",
      );
    })
    .catch((error) => {
      console.error(
        "ERROR: Curriculum synchronization failed.",
      );
      console.error(error);
      process.exitCode = 1;
    });

  return;
}

const preview = {
  mode: "preview",
  writesEnabled: false,
  deletionPolicy: "none",
  course: {
    slug: CORE_COURSE.slug,
    title: CORE_COURSE.title,
    description: CORE_COURSE.description,
    sortOrder: CORE_COURSE.sortOrder,
    isPublished: true,
  },
  module: {
    title: CORE_MODULE.title,
    description: CORE_MODULE.description,
    sortOrder: CORE_MODULE.sortOrder,
  },
  lessons: previewLessons,
  summary: {
    courses: 1,
    modules: 1,
    lessons: previewLessons.length,
    deletions: 0,
  },
};

console.log(
  "============================================================",
);
console.log(
  " MYACCENTTRAINER — CORE CURRICULUM SYNCHRONIZATION PREVIEW",
);
console.log(
  "============================================================",
);
console.log();
console.log("MODE:           PREVIEW ONLY");
console.log("DATABASE WRITE: DISABLED");
console.log("DELETIONS:      NONE");
console.log();

console.log("COURSE");
console.log(`  slug:        ${preview.course.slug}`);
console.log(`  title:       ${preview.course.title}`);
console.log(
  `  description: ${preview.course.description}`,
);
console.log(
  `  published:   ${preview.course.isPublished}`,
);
console.log(
  `  sortOrder:   ${preview.course.sortOrder}`,
);
console.log();

console.log("MODULE");
console.log(`  title:       ${preview.module.title}`);
console.log(
  `  description: ${preview.module.description}`,
);
console.log(
  `  sortOrder:   ${preview.module.sortOrder}`,
);
console.log();

console.log("LESSONS");

for (const lesson of preview.lessons) {
  console.log(
    `  ${String(lesson.sortOrder + 1).padStart(2, "0")}. ` +
      `${lesson.slug} — ${lesson.title}`,
  );
}

console.log();
console.log("SUMMARY");
console.log(
  `  Courses:   ${preview.summary.courses}`,
);
console.log(
  `  Modules:   ${preview.summary.modules}`,
);
console.log(
  `  Lessons:   ${preview.summary.lessons}`,
);
console.log(
  `  Deletions: ${preview.summary.deletions}`,
);
console.log();
console.log(
  "syncCoreCurriculum() was NOT invoked.",
);
console.log(
  "No database mutation was requested.",
);
console.log(
  "============================================================",
);
