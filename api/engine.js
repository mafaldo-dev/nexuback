const axios = require('axios');
const dotenv = require('dotenv');


const test = process.env.TEST;  // Sua chave de API do Serper.dev

// Função para fazer a requisição com timeout usando axios
const fetchWithTimeout = (url, timeout = 5000) => {
  const timeoutInMs = parseInt(timeout, 20);

  if (isNaN(timeoutInMs) || timeoutInMs <= 0) {
    throw new Error("O valor do timeout deve ser um número positivo.");
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": '2aa7ad0640f183c9f0cf692c0d7c9366b6953cab',  // Adicionando chave da API no cabeçalho
    },
    timeout: timeoutInMs,  // Timeout em milissegundos
  };

  return axios.get(url, config)
    .then((response) => response.data)
    .catch((error) => {
      if (error.code === 'ECONNABORTED') {
        throw new Error("Requisição excedeu o tempo limite.");
      }
      throw error;
    });
};

// Função para buscar no Serper.dev com axios
async function searchSerper(query) {
  try {
    const endpoint = `https://google.serper.dev/search?q=${encodeURIComponent(query)}`;

    // Requisição para a Serper.dev API com timeout
    const response = await fetchWithTimeout(endpoint, 5000);
    console.log(response.organic)
    console.log(test)

    if (!response || !response.organic) {
      console.error("Nenhum resultado encontrado ou resposta mal formatada.");
      return [];
    }

    // Formatar os resultados
    return response.organic.map(result => ({
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
    console.log('Resultados',serperResults)
    return { query, totalResults: serperResults.length, results: serperResults };

  } catch (error) {
    console.error("Erro na busca:", error);
    return { query, totalResults: 0, results: [] };
  }
}

module.exports = { searchAll };
