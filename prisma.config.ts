import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Prefer process.env so missing vars don't cause an error at config-load.
    url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
  },
})