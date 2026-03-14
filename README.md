# 📡 Pinger - Monitor de Status de Sites

Um sistema **Full Stack** para monitoramento de disponibilidade de serviços web. O sistema verifica automaticamente a saúde de URLs cadastradas em intervalos regulares e mantém um histórico de status, ideal para prevenir inatividade em serviços PaaS (como Render, Heroku, etc).

## 🛠️ Tecnologias Utilizadas

### Backend & Infra:
- **NestJS** (Framework Node.js)
- **Prisma ORM** (v7)
- **PostgreSQL** (Via Docker)
- **Docker ComposeCron Jobs:** Verificação automática de status agendada.

### Frontend:
- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Custom Hooks:** Lógica separada da interface.

## 🚀 Funcionalidades
- ✅ **CRUD Completo:** Adicionar, listar, editar e remover sites para monitoramento.
- ✅ **Monitoramento Automático:** Um Cron Job no backend verifica o status (HTTP 200) dos sites a cada 14 minutos.
- ✅ **Atualização em Tempo Real:** O Frontend se atualiza automaticamente (polling) sem necessidade de refresh.
- ✅ **Dockerizado:** Banco de dados roda isolado em container para fácil setup.
- ✅ **Interface Moderna:** Design limpo com Tailwind CSS e suporte a Modo Escuro (Dark Mode).

## 📦 Como Rodar o Projeto

### Pré-requisitos
- Node.js (v18+) e pnpm
- Docker Desktop instalado e rodando

### 1. Clone o repositório
```bash
git clone [https://github.com/hrvieira/pinger.git](https://github.com/hrvieira/pinger.git)
cd pinger
```

### 2. Suba o Banco de Dados
```bash
docker-compose up -d
```

### 3. Configuração do Backend
```bash
cd packages/backend

# 1. Instale as dependências
pnpm install

# 2. Configure o .env (Crie um arquivo .env na pasta packages/backend)
# Conteúdo sugerido para desenvolvimento local:
# DATABASE_URL="postgresql://postgres:password123@127.0.0.1:5433/pinger_db?schema=public"

# 3. Crie as tabelas no banco
pnpm dlx prisma migrate dev --name init

# 4. Inicie o servidor
pnpm start:dev
```
*O Backend rodará em http://localhost:3000*

### 4. Configuração do Frontend
Em um novo terminal:
```bash
cd packages/frontend

# 1. Instale as dependências
pnpm install

# 2. Inicie o servidor web
pnpm dev
```
*O Frontend rodará em http://localhost:3001*

## 🤝 Como Contribuir
1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (git checkout -b feature/IncrivelFeature)
3. Faça o Commit (git commit -m 'Add some IncrivelFeature')
4. Push para a Branch (git push origin feature/IncrivelFeature)
5. Abra um Pull Request
