import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import pg from 'pg';


dotenv.config();

const SCHEMA_FILE = './Backend/sql/schema.sql';
const DROP_SCHEMA_FILE = './Backend/sql/drop.sql';

const { DATABASE_URL: connectionString, NODE_ENV: nodeEnv = 'development' } =
  process.env;

if (!connectionString) {
  console.error('vantar DATABASE_URL í .env');
  process.exit(-1);
}

const ssl = nodeEnv === 'production' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Villa í tengingu við gagnagrunn, forrit hættir', err);
  process.exit(-1);
});

export async function query(q, values = []) {
  let client;
  try {
    client = await pool.connect();
  } catch (e) {
    console.error('unable to get client from pool', e);
    return null;
  }

  try {
    const result = await client.query(q, values);
    return result;
  } catch (e) {
    console.error('unable to query', e);
    console.info(q, values);
    return null;
  } finally {
    client.release();
  }
}

export async function end() {
  await pool.end();
}

export async function createSchema(schemaFile = SCHEMA_FILE) {
  const data = await readFile(schemaFile);

  return query(data.toString('utf-8'));
}

export async function dropSchema(dropFile = DROP_SCHEMA_FILE) {
  const data = await readFile(dropFile);

  return query(data.toString('utf-8'));
}


export async function listSentencesFromDb(offset=0, limit=10) {
  const q = `
    SELECT
      id, sentence, created, updated
    FROM
      sentences
    OFFSET $1 LIMIT $2
  `;

  let result = await query(q, [offset, limit]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function getRandomSentenceFromDb() {
  const q = `
    SELECT 
      * 
    FROM 
      sentences 
    WHERE 
      simplified = FALSE
    ORDER BY RANDOM()
    LIMIT 1;
  `;

  const result = await query(q);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}