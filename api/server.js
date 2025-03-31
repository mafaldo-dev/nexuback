const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { searchAll } = require("./engine");


const app = express();
const PORT = 3002;

// Middleware para CORS
app.use(cors()); 

app.use(express.json()); // Habilita JSON no Express

// Rota de busca com cache no Redis
app.get("/api/searchAll", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "É necessário fornecer um termo de busca" });
  }

  // Removido o código do Redis para cache
  try {
    const searchResults = await searchAll(query);
    console.log(process.env.TEST)
    return res.status(200).json(searchResults); // Retorna os resultados da pesquisa
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
