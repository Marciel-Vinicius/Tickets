# 🎫 Tickets

## Descrição
Aplicação web para gerenciamento de atendimentos (tickets).  
- Backend em **Node.js** + **Express**, com banco **PostgreSQL**.  
- Frontend em **React** (create-react-app) + **Material-UI** + **Chart.js** / **Recharts**.  
- Geração de relatórios em PDF via **PDFKit**.  
- Deploy de front e back no **Render**.

---

## Tecnologias

- **Node.js** (v16+), **Express**, **dotenv**, **pg**, **JWT**, **bcryptjs**, **PDFKit**  
- **React** (v18), **@mui/material**, **Chart.js**, **Recharts**  
- **PostgreSQL** (v13+), **pgAdmin** (opcional)  

---

## Estrutura do Projeto

```
/Tickets
├── backend
│   ├── .env.example
│   ├── db.js
│   ├── migrate.js
│   ├── index.js
│   ├── middleware/auth.js
│   └── routes/
│       ├── auth.js
│       ├── users.js
│       ├── categories.js
│       ├── atendimentos.js
│       └── reports.js
├── frontend
│   ├── public/
│   ├── src/
│   │   ├── config.js
│   │   ├── index.js
│   │   ├── App.js
│   │   └── components/
│   └── package.json
├── .gitignore
└── README.md  ← (este arquivo)
```

---

## Pré-requisitos

- Git  
- Node.js & npm  
- Conta no Render (deploy)  
- Acesso a uma VM com PostgreSQL instalado  
- (Opcional) **pgAdmin** para gerenciamento visual do banco

---

## Backend

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

```env
# URL do front-end (permitido pelo CORS)
FRONTEND_URL=https://tickets-frontend-kvf1.onrender.com

# 🚨 Adicione também:
DATABASE_URL=postgres://postgres:SUASENHA@HOST:PORTA/tickets
```

- **DATABASE_URL**  
  - Em produção (Render):  
    ```
    postgres://postgres:84365646@20.197.180.62:5430/tickets
    ```
  - Local (VM ou host):  
    ```
    postgres://postgres:<SuaSenhaLocal>@localhost:5430/tickets
    ```

### 2. Instalação

```bash
cd backend
npm install
```

### 3. Migrações

Gera as tabelas necessárias (users, categorias, atendimentos, contatos, etc.):

```bash
npm run migrate
```

### 4. Execução

```bash
npm start
```

Servidor abrirá em `http://localhost:10000`.

---

## Frontend

### 1. Configuração da API

No arquivo `frontend/src/config.js`:

```js
const DEFAULT_LOCAL = 'http://localhost:3001';
const PROD_BACKEND = 'https://tickets-backend-bx9t.onrender.com';
const API_URL =
  process.env.REACT_APP_API_URL ||
  (window.location.hostname.endsWith('.onrender.com')
    ? PROD_BACKEND
    : DEFAULT_LOCAL);
export default API_URL;
```

Se quiser forçar a URL da API, defina no Render (variáveis de ambiente) `REACT_APP_API_URL`.

### 2. Instalação

```bash
cd frontend
npm install
```

### 3. Execução em desenvolvimento

```bash
npm start
```

Abre em `http://localhost:3000`.

### 4. Build para produção

```bash
npm run build
```

---

## Deploy no Render

1. **Backend**  
   - Conectar repositório GitHub  
   - Build command: `npm install`  
   - Start command: `npm start`  
   - Variáveis de ambiente:
     - `DATABASE_URL`
     - `FRONTEND_URL`

2. **Frontend**  
   - Conectar repositório GitHub  
   - Build command: `npm install && npm run build`  
   - Serve static: `serve -s build` (ou conforme sua escolha)  
   - Variável de ambiente opcional: `REACT_APP_API_URL`

---

## Conexão com o Banco via pgAdmin

### A) Dentro da VM

1. Abra o **pgAdmin** (na própria VM).  
2. Clique em **"Create → Server..."**.  
3. Preencha:

   | Campo               | Valor                               |
   |---------------------|-------------------------------------|
   | **Name**            | TicketsLocal                        |
   | **Host name/address** | localhost (ou 127.0.0.1)          |
   | **Port**            | 5430                                |
   | **Maintenance DB**  | tickets                             |
   | **Username**        | postgres                            |
   | **Password**        | `<SuaSenhaLocal>`                   |

4. Em **Connection** → **SSL**, selecionar **disable**.  
5. Clique em **Save**.

### B) Fora da VM (host ou outra máquina)

1. Abra o **pgAdmin** local.  
2. Clique em **"Create → Server..."**.  
3. Preencha:

   | Campo               | Valor                                |
   |---------------------|--------------------------------------|
   | **Name**            | TicketsRemote                        |
   | **Host name/address** | 20.197.180.62                       |
   | **Port**            | 5430                                 |
   | **Maintenance DB**  | tickets                              |
   | **Username**        | postgres                             |
   | **Password**        | 84365646                             |

4. Em **Connection** → **SSL**:
   - **SSL mode**: `disable`  
   - **Connection timeout**: `10`  

5. Clique em **Save**.

---

## Rotas Principais

- **Auth**
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- **Users** (protegido)
  - `GET /api/users`
  - `PUT /api/users/:id`
- **Categories** (protegido)
  - `GET /api/categories`
  - `POST /api/categories`
- **Atendimentos** (protegido)
  - `GET /api/atendimentos`
  - `POST /api/atendimentos`
- **Reports** (protegido)
  - `GET /api/reports/summary`
  - `GET /api/reports/pdf`

---

## Histórico de Versões

- **v1.0.0** – Estrutura inicial, cadastro/login, CRUD básico, relatórios em PDF.

---

> **Licença**: MIT  
> **Autor**: Marciel de Lara
