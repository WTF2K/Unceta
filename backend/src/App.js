

const express = require("express");
const cors = require("cors");
const path = require('path');
require('dotenv').config({ override: true });
const routes = require("./Routes");
const seedConteudos = require("./Seeds/conteudos.seed");
const db = require("./Config/database");

const app = express();

// CORS configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3000/admin"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ message: "Rota não encontrada." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: "Erro interno do servidor." });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  db.initializeDatabase()
    .then(() => Promise.all([seedConteudos(db), require('./Seeds/admin.seed')(db)]))
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Servidor a correr na porta ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('Unable to initialize the database:', error);
      process.exit(1);
    });
}

module.exports = app;