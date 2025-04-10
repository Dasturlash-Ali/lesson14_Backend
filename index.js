const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(bodyParser.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todos',
  password: 'aliyev05',
  port: 5432,
});


pool.query(`
  CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE
  )
`);

app.get('/todos', async (req, res) => {
  const result = await pool.query('SELECT * FROM todos ORDER BY id DESC');
  res.json(result.rows);
});

app.post('/todos', async (req, res) => {
  const { title } = req.body;
  const result = await pool.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]);
  res.json(result.rows[0]);
});

app.patch('/todos/:id/complete', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('UPDATE todos SET is_completed = true WHERE id = $1 RETURNING *', [id]);
  res.json(result.rows[0]);
});

app.delete('/todos/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM todos WHERE id = $1', [id]);
  res.json({ message: 'Todo deleted' });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
