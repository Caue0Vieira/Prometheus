# Frontend - Sistema de Ocorrências

Interface administrativa React para gerenciamento de ocorrências do Corpo de Bombeiros.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **React Query** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilização
- **date-fns** - Formatação de datas

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn

## 🛠️ Instalação

1. Instale as dependências:

```bash
npm install
```

2. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8089/api
VITE_API_KEY=dev-key-12345
```

## 🏃 Executando

### Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build de Produção

```bash
npm run build
```

### Preview do Build

```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── api/              # Cliente HTTP e serviços de API
├── components/       # Componentes React
│   └── common/       # Componentes reutilizáveis
├── hooks/            # Custom hooks (React Query)
├── pages/            # Páginas da aplicação
├── types/            # Definições TypeScript
├── utils/            # Funções utilitárias
├── App.tsx           # Componente principal
└── main.tsx          # Ponto de entrada
```

## 🎯 Funcionalidades

### Lista de Ocorrências
- Visualização em tabela
- Filtros por status e tipo
- Paginação
- Atualização automática (30s)

### Detalhe da Ocorrência
- Informações completas
- Histórico de despachos
- Ações:
  - Iniciar atendimento
  - Encerrar ocorrência
  - Criar despacho
- Atualização automática (15s)

## 🔧 Configuração

### Variáveis de Ambiente

- `VITE_API_URL` - URL base da API (padrão: `http://localhost:8089/api`)
- `VITE_API_KEY` - Chave de autenticação da API (padrão: `dev-key-12345`)

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa linter

## 🎨 Componentes Principais

- **Button** - Botões com variantes e estados de loading
- **Input** - Inputs de formulário com validação
- **Select** - Dropdowns reutilizáveis
- **StatusBadge** - Badges de status coloridos
- **Modal** - Modais genéricos
- **LoadingSpinner** - Indicadores de carregamento
- **ErrorAlert** - Alertas de erro

## 🔄 Integração com API

O frontend consome os seguintes endpoints:

- `GET /api/occurrences` - Lista ocorrências
- `GET /api/occurrences/:id` - Detalhes da ocorrência
- `POST /api/occurrences/:id/start` - Iniciar atendimento
- `POST /api/occurrences/:id/resolve` - Encerrar ocorrência
- `POST /api/occurrences/:id/dispatches` - Criar despacho

Todas as requisições incluem automaticamente:
- Header `X-API-Key` para autenticação
- Header `Idempotency-Key` para requisições POST/PUT/PATCH

## 🧹 Clean Code

O projeto segue princípios de clean code:

- Componentes pequenos e focados
- Separação de responsabilidades
- Custom hooks para lógica reutilizável
- TypeScript para type safety
- Tratamento consistente de erros
- Código documentado quando necessário

