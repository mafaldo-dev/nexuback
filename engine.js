import fetch from 'node-fetch';
import * as cheerio from 'cheerio';



const fetchWithTimeout = (url, timeout = 5000) => {
  return Promise.race([
    fetch(url).then(res => res.json()),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
  ]);
};

async function searchDuckDuckGo(query) {
  try {
    const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&pretty=1&no_html=1&skip_disambig=1`;
    const response = await fetchWithTimeout(endpoint);

    if (!response.RelatedTopics) return [];

    return response.RelatedTopics.map(topic => ({
      title: topic.Text || null,
      url: topic.FirstURL || null,
      snippet: topic.Text || null,
      image: topic.Icon?.URL ? `https://duckduckgo.com${topic.Icon.URL}` : null
    }));
  } catch (error) {
    console.error("Erro DuckDuckGo:", error);
    return [];
  }
}

async function searchWikipedia(query) {
  try {
    const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(endpoint);

    if (!response.title) return [];

    return [{
      title: response.title,
      url: response.content_urls?.desktop?.page || null,
      snippet: response.extract,
      image: response.thumbnail?.source || null
    }];
  } catch (error) {
    console.error("Erro Wikipedia:", error);
    return [];
  }
}

async function searchOpenLibrary(query) {
  try {
    const endpoint = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(endpoint);

    if (!response.docs) return [];

    return response.docs.slice(0, 5).map(book => ({
      title: book.title || null,
      url: `https://openlibrary.org${book.key}` || null,
      snippet: book.author_name ? `Autor: ${book.author_name.join(", ")}` : null,
      image: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg` : null
    }));
  } catch (error) {
    console.error("Erro OpenLibrary:", error);
    return [];
  }
}

async function searchAll(query) {
  try {
    const results = await Promise.allSettled([
      searchDuckDuckGo(query),
      searchWikipedia(query),
      searchOpenLibrary(query),
    ]);

    let finalResults = [];

    results.forEach(result => {
      if (result.status === "fulfilled") {
        finalResults.push(...result.value);
      }
    });

    return { query, totalResults: finalResults.length, results: finalResults };
  } catch (error) {
    console.error("Erro na busca:", error);
    return { query, totalResults: 0, results: [] };
  }
}

// Exportando a função
export default searchAll ;
