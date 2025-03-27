import http from "http";
import url  from "url"
import searchAll  from "./engine.js"
import cors from "cors"

app.use(cors({
	origin: 'https://nexuback.onrender.com'
}))

// Criar o servidor HTTP
const server = http.createServer(async (req, res) => {
  // Configurar cabeçalhos CORS
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  // Analisar a URL da requisição
  const parsedUrl = url.parse(req.url, true)
  const path = parsedUrl.pathname

  // Rota de busca
  if (path === "/api/searchAll" && req.method === "GET") {
    const query = parsedUrl.query.q

    if (!query) {
      res.statusCode = 400
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify({ error: "É necessário fornecer um termo de busca" }))
      return
    }

    try {
      const searchResults = await searchAll(query)

      res.statusCode = 200
      res.setHeader("Content-Type", "application/json")
      res.end(JSON.stringify(searchResults))
    } catch (error) {
      res.statusCode = 500
      res.setHeader("Content-Type", "application/json")
      res.end(
        JSON.stringify({
          error: "Erro ao processar a busca",
          message: error.message,
        }),
      )
    }

    return
  }

  // Rota para página inicial com formulário de busca simples
  if (path === "/" && req.method === "GET") {
    res.statusCode = 200
    res.setHeader("Content-Type", "text/html")
    return
  }

  // Rota para verificação de saúde do servidor
  if (path === "/api/health" && req.method === "GET") {
    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify({ status: "ok" }))
    return
  }

  // Rota não encontrada
  res.statusCode = 404
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify({ error: "Rota não encontrada" }))
})



