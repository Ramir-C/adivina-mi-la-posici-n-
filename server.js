const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public"));

// Conexión a MySQL usando variables de entorno
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a MySQL:", err);
    return;
  }
  console.log("✅ Conectado a MySQL");

  // Crear tabla si no existe
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS players (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100),
      intento INT,
      tiempo INT,
      errores INT
    )
  `;
  db.query(createTableQuery, (err) => {
    if (err) console.error("❌ Error creando tabla:", err);
    else console.log("✅ Tabla 'players' lista.");
  });
});

// Endpoint para guardar datos
app.post("/save", (req, res) => {
  const { nombre, intento, tiempo, errores } = req.body;
  const query = "INSERT INTO players (nombre, intento, tiempo, errores) VALUES (?, ?, ?, ?)";
  db.query(query, [nombre, intento, tiempo, errores], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId });
  });
});

// Endpoint para obtener datos
app.get("/users", (req, res) => {
  const query = "SELECT * FROM players";
  db.query(query, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ users: rows });
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor escuchando en puerto ${port}`);
});
