# TeleEstomato App

Aplicacao web para apoio ao fluxo de telessaude em estomatologia, com frontend em React/Vite e backend em FastAPI.

Este README evita expor credenciais, dados clinicos, dados pessoais, enderecos internos e detalhes sensiveis de infraestrutura. Use sempre valores locais ou de ambiente para configuracao.

## Visao Geral

- Frontend: React, TypeScript, Vite e Tailwind CSS.
- Backend: FastAPI, SQLAlchemy e PostgreSQL.
- Banco local: PostgreSQL via Docker Compose.
- Deploy do frontend: GitHub Pages via `.github/workflows/pages.yml`.
- Deploy do backend e banco: deve ser feito separadamente em ambiente proprio.

## Requisitos

- Node.js 22 ou versao compativel com o projeto.
- npm.
- Python 3.9 ou superior.
- Docker e Docker Compose para o PostgreSQL local.

## Configuracao

Crie o arquivo de ambiente do backend a partir do exemplo:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com os valores do seu ambiente. Nao publique esse arquivo e nao reutilize chaves de desenvolvimento em producao.

Variaveis esperadas:

```text
APP_NAME
DATABASE_URL
SECRET_KEY
ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES
FRONTEND_ORIGINS
```

Para o frontend, a API e definida por:

```text
VITE_API_BASE_URL
```

Sem essa variavel, o frontend usa a API local em `http://127.0.0.1:8000`.

## Execucao Local

Instale as dependencias do frontend:

```bash
npm install
```

Suba o banco local:

```bash
cd backend
docker compose up -d
```

Crie e ative um ambiente virtual Python:

```bash
python -m venv .venv
source .venv/bin/activate
```

Instale as dependencias do backend:

```bash
pip install -r requirements.txt
```

Crie ou atualize as tabelas:

```bash
python create_tables.py
```

Inicie a API:

```bash
uvicorn app.main:app --reload
```

Em outro terminal, inicie o frontend na raiz do projeto:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Deploy no GitHub Pages

O workflow em `.github/workflows/pages.yml` publica apenas o frontend. Antes de usar em producao, configure a variavel do repositorio:

```text
VITE_API_BASE_URL=https://url-publica-do-backend
```

No GitHub: `Settings` > `Secrets and variables` > `Actions` > `Variables`.

O backend FastAPI, o PostgreSQL e o armazenamento de uploads precisam estar hospedados separadamente.

## Cuidados de Seguranca

- Nao versionar `.env`, bancos locais, uploads, arquivos de pacientes ou ambientes virtuais.
- Usar uma `SECRET_KEY` forte e exclusiva por ambiente.
- Manter `FRONTEND_ORIGINS` restrito aos dominios realmente usados.
- Nao incluir dados pessoais, dados clinicos, imagens, exames ou exemplos reais na documentacao.
- Revisar permissoes e armazenamento de uploads antes de publicar o backend.

## Observacoes Para Desenvolvimento

O diretorio `uploads/` e usado pelo backend para arquivos enviados em casos, chat e laudos. Em producao, avalie armazenamento persistente, backup, controle de acesso e politicas de retencao adequadas ao tipo de dado tratado.
