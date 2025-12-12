// src/db.js
require('dotenv/config'); // loads .env for runtime
const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

// create adapter for runtime
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db' });

// pass adapter to client
const prisma = new PrismaClient({ adapter });

module.exports = prisma;