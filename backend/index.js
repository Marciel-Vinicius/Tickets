const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 10000;

const atendimentosRouter = require('./routes/atendimentos');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const authRouter = require('./routes/auth'); // ADICIONE ESTA LINHA

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api/atendimentos', atendimentosRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/auth', authRouter); // ADICIONE ESTA LINHA

app.get('/', (req, res) => {
    res.send('Backend funcionando!');
});

app.listen(port, () => {
    console.log(`🚀 Backend rodando na porta ${port}`);
});
