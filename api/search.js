
const {searchAll} = require("./engine");

export default async function handler(req, res) {
  const { query } = req.query;  

  if (!query) {
    return res.status(400).json({ error: "Query é necessária" });
  }

  try {
    const searchResults = await searchAll(query);
    return res.status(200).json(searchResults);  
  } catch (error) {
    return res.status(500).json({ error: "Erro ao realizar a busca" });
  }
}
