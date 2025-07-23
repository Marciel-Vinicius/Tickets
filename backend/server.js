// server.js
const express = require('express');
const fs      = require('fs');
const https   = require('https');
const path    = require('path');

// Ajuste este require para o arquivo que monta seu app/rotas Express do backend
const apiRouter = require('./backend');  

const app = express();
app.use(express.json());

// Rotas da API
app.use('/api', apiRouter);

// Serve o build do React
app.use('/', express.static(path.join(__dirname, 'frontend', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Carrega os PEMs gerados pelo win‑acme
const certsDir = path.join(__dirname, 'certs');
const options = {
  key: fs.readFileSync(path.join(certsDir, '20.197.180.62.nip.io-key.pem')),
  cert: fs.readFileSync(path.join(certsDir, '20.197.180.62.nip.io-crt.pem')),
  ca: fs.readFileSync(path.join(certsDir, '20.197.180.62.nip.io-chain.pem'))
};

// Inicia o servidor HTTPS na porta 443
https.createServer(options, app).listen(443, () => {
  console.log('🛡️  Servidor HTTPS rodando em https://20.197.180.62.nip.io');
});
