const axios = require('axios');
const apiKey = require('../config');

const fetchWithTimeout = (url, timeout = 5000) => {
  const timeoutInMs = parseInt(timeout, 10);

  if (isNaN(timeoutInMs) || timeoutInMs <= 0) {
    throw new Error("O valor do timeout deve ser um número positivo.");
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey.SERPER_API_KEY,  
    },
    timeout: timeoutInMs, 
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


async function searchSerper(query) {
  try {
    const endpoint = `https://google.serper.dev/search?q=${encodeURIComponent(query)}`;

    const response = await fetchWithTimeout(endpoint, 5000);
    if (!response || !response.organic) {
      console.error("Nenhum resultado encontrado na Serper.");
      return [];
    }

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


async function searchDuckDuckGo(query) {
  try {
    const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;
    const response = await axios.get(endpoint);

    if (!response.data || !response.data.RelatedTopics) {
      console.error("Nenhum resultado encontrado no DuckDuckGo.");
      return [];
    }

    return response.data.RelatedTopics.map(result => ({
      title: result.Text || null,
      url: result.FirstURL || null,
      snippet: result.Text || null,
      image: result.Icon ? result.Icon.URL : null
    }));
  } catch (error) {
    console.error("Erro DuckDuckGo:", error);
    return [];
  }
}

const stripHtml = (html) => html.replace(/<[^>]*>?/gm, '');

async function searchWikipedia(query) {
  try {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;

    const response = await axios.get(endpoint);

    if (!response.data.query || !response.data.query.search) {
      console.error("Nenhum resultado encontrado no Wikipedia.");
      return [];
    }

    return response.data.query.search.map(result => ({
      title: result.title || null,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}`,
      snippet: result.snippet ? stripHtml(result.snippet): null,
      image: null 
    }));
  } catch (error) {
    console.error("Erro Wikipedia:", error);
    return [];
  }
}

async function searchAll(query) {
  try {
    const [serperResults, duckDuckGoResults, wikipediaResults] = await Promise.all([
      searchSerper(query), 
      searchDuckDuckGo(query),
      searchWikipedia(query)
    ]);

    const allResults = [...serperResults, ...duckDuckGoResults, ...wikipediaResults];
    const uniqueResults = allResults.filter(
      (result, index, self) => self.findIndex((r) => r.url === result.url) === index
    );

    return { query, totalResults: uniqueResults.length, results: uniqueResults };
  } catch (error) {
    console.error("Erro na busca:", error);
    return { query, totalResults: 0, results: [] };
  }
}

module.exports = { searchAll };
