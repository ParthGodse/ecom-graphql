// src/db.js
require('dotenv/config'); // loads .env for runtime
const { PrismaClient } = require('@prisma/client');

// NO adapters for Postgres
const prisma = new PrismaClient();

module.exports = prisma;
