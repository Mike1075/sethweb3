#!/usr/bin/env node
/*
 Simple SQL runner: DATABASE_URL must be set.
 Usage: node scripts/run-sql.js path/to/file.sql [path/to/another.sql]
*/
const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function run() {
  const files = process.argv.slice(2)
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required')
    process.exit(1)
  }
  if (files.length === 0) {
    console.error('Please provide at least one .sql file to execute')
    process.exit(1)
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  await client.connect()
  try {
    for (const f of files) {
      const abs = path.resolve(f)
      const sql = fs.readFileSync(abs, 'utf8')
      console.log(`\n=== Executing: ${abs} ===`)
      await client.query(sql)
      console.log(`=== Done: ${abs} ===`)
    }
  } finally {
    await client.end()
  }
}

run().catch((err) => {
  console.error('\nSQL execution failed:', err.message)
  process.exit(1)
})

