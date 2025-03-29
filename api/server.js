import express from "express";
import cors from "cors";
import { createClient } from "redis"; // Importar a nova versão do Redis
import dotenv from "dotenv";
import searchAll from "./engine.js";

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = 3000;

// Configuração do Redis
/* const client = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
});

client.connect(); // Conecta ao Redis

client.on("connect", () => {
  console.log("Conectado ao Redis");
});

client.on("error", (err) => {
  console.error("Erro ao conectar ao Redis:", err);
});
 */
// Configuração do CORS
const corsOptions = {
  origin: "*", // Aceitar todas as origens
  methods: ["GET", "OPTIONS"], // Aceitar apenas GET e OPTIONS
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions)); // Middleware para CORS
app.use(express.json()); // Habilita JSON no Express

// Rota de busca com cache no Redis
app.get("/api/searchAll", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "É necessário fornecer um termo de busca" });
  }

  // Verificar no cache Redis
  client.get(query, async (err, cachedResults) => {
    if (err) {
      console.error("Erro ao acessar o Redis:", err);
    }

    if (cachedResults) {
      console.log("Resultados encontrados no cache");
      return res.status(200).json(JSON.parse(cachedResults)); // Retorna os dados do cache
    }

    // Se não houver no cache, realizar a busca
    try {
      const searchResults = await searchAll(query);

      // Armazenar os resultados no cache Redis com um tempo de expiração de 1 hora (3600 segundos)
      client.setEx(query, 3600, JSON.stringify(searchResults));

      return res.status(200).json(searchResults); // Retorna os resultados da pesquisa
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao processar a busca",
        message: error.message,
      });
    }
  });
});

// Rota para verificação de saúde do servidor
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
