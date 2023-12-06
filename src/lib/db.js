import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { readFile } from 'fs/promises';
import pg from 'pg';
import xss from 'xss';

dotenv.config();

const { BCRYPT_ROUNDS: bcryptRounds = 11 } = process.env;

const SCHEMA_FILE = 'sql/schema.sql';
const DROP_SCHEMA_FILE = 'sql/drop.sql';

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

// Sentence Queries

export async function listAllSimplifiedSentencesFromDb(verified = true) {
  const q = `
    SELECT
      sentences.sentence, simplifiedSentences.simplifiedSentence
    FROM
      sentences, simplifiedSentences
    WHERE sentences.simplified = true
    AND simplifiedSentences.verified = $1
    AND sentences.id = simplifiedSentences.sentenceId 
    LIMIT 9999
  `;

  const result = await query(q, [verified]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function listSentencesFromDb(offset = 0, limit = 10) {
  const q = `
    SELECT
      id, sentence, simplified, created, updated
    FROM
      sentences
    OFFSET $1 LIMIT $2
  `;

  const result = await query(q, [offset, limit]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function getSentenceFromDb(sentenceId) {
  const q = `
    SELECT
      id, sentence, simplified, created, updated
    FROM
      sentences
    WHERE id = $1
  `;

  const result = await query(q, [sentenceId]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function getRandomSentenceFromDb() {
  const q = `
    SELECT 
      id, sentence 
    FROM 
      sentences 
    WHERE 
      simplified = false
    ORDER BY RANDOM()
    LIMIT 1
  `;

  const result = await query(q);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function addSentenceToDb(sentence) {
  const q = `
    INSERT INTO sentences
      (sentence)
    VALUES
      ($1)
    RETURNING id, sentence, simplified, created
  `;

  const result = await query(q, [sentence]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function deleteSentenceFromDb(sentenceId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const deleteSimplified =
      'DELETE FROM simplifiedSentences WHERE sentenceId = $1';
    await client.query(deleteSimplified, [sentenceId]);

    const deleteSentenceQuery = 'DELETE FROM sentences WHERE id = $1';
    await client.query(deleteSentenceQuery, [sentenceId]);
    await client.query('COMMIT');

    return true;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('unable to delete sentence', e);
    return false;
  } finally {
    client.release();
  }
}

export async function listSimplifiedSentencesFromDb(offset = 0, limit = 10) {
  const q = `
    SELECT
    simplifiedSentences.id, simplifiedSentences.userId, 
    simplifiedSentences.simplifiedSentence, sentences.sentence as originalSentence, 
    rejected, verified, simplifiedSentences.created, simplifiedSentences.updated
    FROM
      simplifiedSentences, sentences
    WHERE sentences.id = simplifiedSentences.sentenceId
    OFFSET $1 LIMIT $2
  `;

  // SELECT
  //   id, userId, sentenceId, simplifiedSentence, verified, created, updated
  // FROM
  //   simplifiedSentences
  // OFFSET $1 LIMIT $2

  const result = await query(q, [offset, limit]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function addSimplifiedSentenceToDb(
  simplifiedSentence,
  sentenceId,
  userId
) {
  const q = `
    INSERT INTO simplifiedSentences
      (simplifiedSentence, sentenceId, userId)
    VALUES
      ($1, $2, $3)
    RETURNING id, simplifiedSentence, sentenceId, userId, created
  `;

  const result = await query(q, [simplifiedSentence, sentenceId, userId]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function getSimplifiedSentenceFromDb(sentenceId) {
  const q = `
    SELECT
      id, userId, sentenceId, simplifiedSentence, verified, created, updated
    FROM
      simplifiedSentences
    WHERE id = $1
  `;

  const result = await query(q, [sentenceId]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function getRandomSimplifiedSentenceFromDb() {
  const q = `
    SELECT 
    sentences.sentence as originalsentence, simplifiedSentences.id, simplifiedSentences.simplifiedSentence 
    FROM 
      sentences, simplifiedSentences 
    WHERE 
      simplifiedSentences.sentenceId = sentences.id
    AND
      simplifiedSentences.verified = false
    AND
      simplifiedSentences.rejected = false
    ORDER BY RANDOM()
    LIMIT 1
  `;

  const result = await query(q);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return null;
}

export async function deleteSimplifiedSentenceFromDb(sentenceId) {
  const q = 'DELETE FROM simplifiedSentences WHERE id = $1';

  const result = await query(q, [sentenceId]);

  if (result && result.rowCount >= 1) {
    return true;
  }

  return null;
}

// User queries

export async function listUsersFromDb(
  order = 'default',
  offset = 0,
  limit = 10
) {
  let q;

  if (order === 'sentences') {
    q = `
      SELECT
        id, name, username, admin, completedSentences, completedVerifications, created
      FROM
        users
      ORDER BY completedSentences DESC
      OFFSET $1 LIMIT $2
    `;
  } else if (order === 'verifications') {
    q = `
      SELECT
        id, name, username, admin, completedSentences, completedVerifications, created
      FROM
        users
      ORDER BY completedVerifications DESC
      OFFSET $1 LIMIT $2
    `;
  } else if (order === 'leaderboard') {
    q = `
      SELECT
        id, name, username, admin, completedSentences, completedVerifications, created
      FROM
        users
      ORDER BY
        CASE
          WHEN completedSentences < completedVerifications THEN completedSentences
          ELSE completedVerifications
        END DESC
      OFFSET $1 LIMIT $2
    `;
  } else {
    q = `
      SELECT
        id, name, username, admin, completedSentences, completedVerifications, created
      FROM
        users
      ORDER BY id ASC
      OFFSET $1 LIMIT $2
    `;
  }

  const result = await query(q, [offset, limit]);

  if (result) {
    return result.rows;
  }

  return null;
}

export async function findByUsername(username) {
  const q = 'SELECT * FROM users WHERE username = $1';

  const result = await query(q, [username]);

  if (result && result.rowCount === 1) {
    return result.rows[0];
  }

  return false;
}

export async function findByUserId(id) {
  const q = 'SELECT * FROM users WHERE id = $1';

  try {
    const result = await query(q, [id]);

    if (result.rowCount === 1) {
      return result.rows[0];
    }
  } catch (e) {
    console.error('Gat ekki fundið notanda eftir id');
  }

  return null;
}

export async function comparePasswords(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (e) {
    console.error('Gat ekki borið saman lykilorð', e);
  }

  return false;
}

export async function createUser(name, username, password) {
  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(bcryptRounds, 10)
  );

  const q = `
    INSERT INTO
      users (name, username, password)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [xss(name), xss(username), hashedPassword];
  const result = await query(q, values);

  if (result) {
    return result.rows[0];
  }

  console.warn('unable to create user');

  return null;
}

export async function deleteUserFromDb(userId) {
  const q = 'DELETE FROM users WHERE id = $1';

  const result = await query(q, [userId]);

  if (result && result.rowCount >= 1) {
    return true;
  }

  return null;
}

export async function conditionalUpdate(table, id, fields, values) {
  const filteredFields = fields.filter((i) => typeof i === 'string');
  const filteredValues = values.filter(
    (i) => typeof i === 'string' || typeof i === 'number' || i instanceof Date
  );

  if (filteredFields.length === 0) {
    return false;
  }

  if (filteredFields.length !== filteredValues.length) {
    throw new Error('fields and values must be of equal length');
  }

  // id is field = 1
  const updates = filteredFields.map((field, i) => `${field} = $${i + 2}`);

  const q = `
    UPDATE ${table}
      SET ${updates.join(', ')}
    WHERE
      id = $1
    RETURNING *
    `;

  const queryValues = [id].concat(filteredValues);
  const result = await query(q, queryValues);

  return result;
}
