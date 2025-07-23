// api-server.js
// Este script vai apenas expor a sua API em HTTP na porta 10000,
// para que o Caddy possa proxyar /api/* → http://localhost:10000

const app = require('./backend');   // importa o express app do backend/index.js
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 API HTTP rodando em http://localhost:${PORT}`);
});
