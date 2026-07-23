# package.json changes for deployment

## 1. Scripts — add two lines to the "scripts" block

    "postinstall": "prisma generate",
    "build": "prisma generate && next build"

("postinstall" makes the database client rebuild automatically on the
server; the updated "build" guarantees it exists before the site is built.)

## 2. Dependencies — swap the database driver

REMOVE these two (they are for the local SQLite file):
    "@prisma/adapter-better-sqlite3"
    "better-sqlite3"

ADD these (they connect to cloud Postgres):
    "@prisma/adapter-pg"
    "pg"

And in devDependencies ADD:
    "@types/pg"

The one-time commands that do this for you:

    npm uninstall @prisma/adapter-better-sqlite3 better-sqlite3
    npm install @prisma/adapter-pg pg
    npm install -D @types/pg
