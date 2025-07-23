// server.js
const express = require('express');
const fs      = require('fs');
const https   = require('https');
const path    = require('path');

// Importa o app exportado pelo backend/index.js
const apiApp = require('./backend');

const app = express();
app.use(express.json());

// Monta as rotas da API (já definidas com prefixo /api no backend)
app.use(apiApp);

// Serve o build do seu React (gerado em frontend/build)
app.use('/', express.static(path.join(__dirname, 'frontend', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Caminho para os seus certs gerados pelo win-acme
const certsDir = path.join(__dirname, 'certs');
const options = {
  key:  fs.readFileSync(path.join(certsDir, '20.197.180.62.nip.io-key.pem')),
  cert: fs.readFileSync(path.join(certsDir, '20.197.180.62.nip.io-crt.pem')),
  ca:   fs.readFileSync(path.join(certsDir, '20.197.180.62.nip.io-chain.pem'))
};

// Inicia o HTTPS na porta 443
https.createServer(options, app).listen(443, () => {
  console.log('🛡️  Servidor HTTPS rodando em https://20.197.180.62.nip.io');
});
