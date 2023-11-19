import dotenv from 'dotenv';
import express from 'express';
import { cors } from './lib/cors.js';
import { router } from './routes/api.js';

dotenv.config();

const {
  PORT: port = 3000,
  SESSION_SECRET: sessionSecret,
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString || !sessionSecret) {
  console.error('Vantar gögn í env');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(cors);

app.use(router);

// const port = process.env.PORT || 3000;


/** Middleware sem sér um 404 villur. */
app.use((req, res) => {
  console.warn('Not found', req.originalUrl);
  res.status(404).json({ error: 'Not found' });
});

/** Middleware sem sér um villumeðhöndlun. */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'invalid json' });
  }
  console.error('error handling route', err);
  return res.status(500).json({ error: err.message ?? 'internal server error' });
});

app.listen(port, () => {
  console.info(`Server running at http://localhost:${port}/`);
});