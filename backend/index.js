require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const atendRouter = require('./routes/atendimentos');
const categoryRouter = require('./routes/categories');
const reportsRouter = require('./routes/reports');

const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, {
    cors: { origin: '*' }
});

app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRouter);
app.use('/api/users', authenticateToken, userRouter);
app.use('/api/atendimentos', authenticateToken, (req, res, next) => {
    req.io = io;
    next();
}, atendRouter);
app.use('/api/categories', authenticateToken, categoryRouter);
app.use('/api/atendimentos/report', authenticateToken, reportsRouter);

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
});