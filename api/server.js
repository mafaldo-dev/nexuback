import express from "express";
import cors from "cors";
import searchAll from "./engine.js";

const app = express();
const PORT = 3000;

// Middleware CORS
app.use(cors());

app.use(express.json()); // Habilita JSON no Express

// Rota de busca
app.get("/api/searchAll", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "É necessário fornecer um termo de busca" });
  }

  try {
    const searchResults = await searchAll(query);
    return res.status(200).json(searchResults);
  } catch (error) {
    return res.status(500).json({
      error: "Erro ao processar a busca",
      message: error.message,
    });
  }
});

// Rota para verificação de saúde do servidor
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Inicia o servidor
app.listen(PORT, () => {
	console.log(`Servidor rodando na porta ${PORT}`);
});
