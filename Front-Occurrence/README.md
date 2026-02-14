# 🖥️ Frontend - Sistema de Ocorrências

Interface administrativa React para gerenciamento de ocorrências do Corpo de Bombeiros. Desenvolvida com **React**, **TypeScript** e **Vite**.

## 🚀 Como Rodar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com as configurações da API

# Iniciar servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Build de Produção

```bash
npm run build
npm run preview
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8089/api
VITE_API_KEY=sua-api-key-aqui
```

## 🎯 Funcionalidades

### Dashboard de Ocorrências
- **Lista de ocorrências** com filtros por status e tipo
- **Paginação** e atualização automática
- **Detalhamento** completo de cada ocorrência

### Gerenciamento
- **Iniciar atendimento** de ocorrências
- **Encerrar ocorrências** resolvidas
- **Criar e gerenciar despachos**
- **Visualizar histórico** de ações

### Interface
- Atualização automática de dados
- Feedback visual de operações assíncronas
- Interface responsiva e moderna

## 🔄 Como Funciona

O frontend consome a API REST e exibe as informações de forma reativa:

1. **Consulta dados** → Busca ocorrências e despachos da API
2. **Exibe informações** → Renderiza dados em tempo real
3. **Envia comandos** → Dispara ações assíncronas via API
4. **Monitora status** → Acompanha processamento de comandos
5. **Atualiza interface** → Refresh automático quando necessário

### Tecnologias Utilizadas

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **React Query** - Gerenciamento de estado e cache
- **Tailwind CSS** - Estilização
- **React Router** - Navegação

---
