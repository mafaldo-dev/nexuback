import axios from 'axios';

// Função para fazer a requisição com timeout
const fetchWithTimeout = async (url, timeout = 5000) => {
  try {
    const response = await axios.get(url, { timeout });
    return response.data;
  } catch (error) {
    throw new Error(error.message || 'Erro ao fazer a requisição');
  }
};

// Função para buscar no Serper.dev
async function searchSerper(query) {
  try {
    const apiKey = process.env.SERPER_API_KEY;  // Sua chave de API do Serper.dev
    const endpoint = `https://google.serper.dev/search?q=${encodeURIComponent(query)}`;

    // Requisição para a Serper.dev API com timeout usando Axios
    const response = await fetchWithTimeout(endpoint, 5000);

    if (!response || !response.organic_results) {
      console.error("Nenhum resultado encontrado ou resposta mal formatada.");
      return [];
    }

    // Formatar os resultados
    return response.organic_results.map(result => ({
      title: result.title || null,
      url: result.link || null,
      snippet: result.snippet || null,
      image: result.image ? result.image.source : null
    }));
  } catch (error) {
    console.error("Erro Serper.dev:", error);
    return [];
  }
}

// Função para buscar em todas as fontes (agora apenas Serper.dev)
async function searchAll(query) {
  try {
    const serperResults = await searchSerper(query); // Usando o Serper.dev

    // Retornar resultados
    return { query, totalResults: serperResults.length, results: serperResults };
  } catch (error) {
    console.error("Erro na busca:", error);
    return { query, totalResults: 0, results: [] };
  }
}

export default searchAll;
