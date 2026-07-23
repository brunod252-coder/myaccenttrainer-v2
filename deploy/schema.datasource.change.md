# One-line change in prisma/schema.prisma

Find this block near the top of `prisma/schema.prisma`:

    datasource db {
      provider = "sqlite"
    }

Change it to:

    datasource db {
      provider = "postgresql"
    }

Nothing else in the schema needs to change — every model stays the same.
