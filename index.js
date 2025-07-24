// index.js
const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  pool.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      console.error('Erro na conexão com o banco:', err);
      return res.status(500).send('Erro de conexão com o banco');
    }
    res.send(`Conexão bem-sucedida! Resultado: ${results[0].result}`);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
