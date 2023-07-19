/* eslint-disable no-unused-vars -- Remove me */
import 'dotenv/config';
import pg from 'pg';
import express from 'express';

const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const app = express();

app.use(express.json());

app.get('/api/entries', async (req, res, next) => {
  try {
    const sql = `
      select *
        from "entries"
        order by "entryId" desc
    `;
    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/entries', async (req, res, next) => {
  try {
    const { title, notes, photoUrl } = req.body;
    if (!title || !notes || !photoUrl) {
      res.status(400).json({ error: 'The grade is invalid.' });
      return;
    }
    const sql = `
      insert into "entries" ("title", "notes", "photoUrl")
        values ($1, $2, $3)
        returning *
    `;
    const params = [title, notes, photoUrl];
    const result = await db.query(sql, params);
    const [grade] = result.rows;
    res.status(201).json(grade);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occured.' });
  }
});

app.put('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.gradeId);
    const { title, notes, photoUrl } = req.body;
    if (!title || !notes || !photoUrl) {
      res.status(400).json({ error: 'The grade is invalid.' });
      return;
    }
    if (entryId < 1) {
      res.status(400).json({ error: 'gradeId must be a positive integer' });
      return;
    }
    const sql = `
      update "entries"
        set "title" = $1,
            "notes" = $2,
            "photoUrl" = $3
        where "entryId" = $4
        returning *
    `;
    const params = [title, notes, photoUrl, entryId];
    const result = await db.query(sql, params);
    const [entry] = result.rows;
    if (entry) {
      res.status(201).json(entry);
    } else {
      res
        .status(404)
        .json({ error: `Cannot find grade with entryId ${entryId}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occured.' });
  }
});

app.delete('/api/entries/:entryId', async (req, res, next) => {
  try {
    const entryId = Number(req.params.gradeId);
    if (entryId < 1) {
      res.status(400).json({ error: 'gradeId must be a positive integer' });
      return;
    }
    const sql = `
      delete "entries"
        where "entryId" = $1
        returning *
    `;
    const params = [entryId];
    const result = await db.query(sql, params);
    const [entry] = result.rows[0];
    if (entry) {
      res.status(204).json(entry);
    } else {
      res
        .status(404)
        .json({ error: `Cannot find grade with entryId ${entryId}` });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An unexpected error occured.' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`express server listening on port ${process.env.PORT}`);
});
