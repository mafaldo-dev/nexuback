import redis from 'redis';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Configura a conexão com o Redis usando as variáveis do .env
import redis from 'redis'; // Certifique-se de que o redis está instalado e importado

// Configurações do Redis a partir do arquivo .env
const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

client.on('connect', () => {
  console.log('Conectado ao Redis com sucesso!');
});

client.on('error', (err) => {
  console.log('Erro ao conectar no Redis: ' + err);
});

// Exemplo de uso do Redis
client.set('chave', 'valor', (err, reply) => {
  if (err) {
    console.log('Erro ao salvar no Redis:', err);
  } else {
    console.log('Resposta do Redis:', reply); // Resposta esperada: "OK"
  }
});

// Recuperando o valor da chave
client.get('chave', (err, reply) => {
  if (err) {
    console.log('Erro ao buscar do Redis:', err);
  } else {
    console.log('Valor recuperado do Redis:', reply); // "valor"
  }
});

