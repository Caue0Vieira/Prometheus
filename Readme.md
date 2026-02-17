# Prova Bomb (Prometheus) — Sistema de Gerenciamento de Ocorrências

## Acesso ao Sistema em Dev

**Frontend**: [http://138.197.101.197:8088](http://138.197.101.197:8088)

> Para desenvolvimento local, consulte "Como Rodar Backend e Frontend".

---

## Sumário

1. [Como Rodar Backend e Frontend](#1-como-rodar-backend-e-frontend)
2. [Desenho de Arquitetura](#2-desenho-de-arquitetura)
3. [Estratégia de Integração Externa](#3-estratégia-de-integração-externa)
4. [Padrão Outbox](#4-padrão-outbox)
5. [Estratégia de Idempotência](#5-estratégia-de-idempotência)
6. [Estratégia de Concorrência](#6-estratégia-de-concorrência)
7. [Pontos de Falha e Recuperação](#7-pontos-de-falha-e-recuperação)
8. [Como Validar Rapidamente (CURLs)](#8-como-validar-rapidamente-curls)
9. [Testes Automatizados](#9-testes-automatizados)
10. [O que ficou de fora](#10-o-que-ficou-de-fora)
11. [Possível Evolução na Corporação](#11-possível-evolução-na-corporação)

---

## 1. Como Rodar Backend e Frontend

### Ambiente Recomendado

Para evitar problemas de compatibilidade e permissões, recomenda-se executar todo o projeto em um ambiente **Linux (Ubuntu 22.04 ou superior)**.

> Embora seja possível rodar no Windows ou macOS, o ambiente Ubuntu oferece maior estabilidade com Docker e Make.

O ideal é:

- Clonar o projeto diretamente no Ubuntu
- Ter o Node.js instalado no Ubuntu
- Executar o make diretamente no terminal do Ubuntu
- Utilizar Docker Desktop (ou Docker Engine) instalado no Ubuntu

### Pré-requisitos

Antes de iniciar o projeto, certifique-se de ter instalado:

- **Docker** (versão 20.10 ou superior)
- **Docker Compose** (versão 2.0 ou superior)
- **Node.js** (versão 18 ou superior)
- **npm** (versão 9 ou superior)
- **Make**
- **Git**

### Clonando o Projeto

> **Importante**: O Makefile clona automaticamente os repositórios necessários quando você executa `make up`, `make api`, `make worker` ou `make worker-publish`. Se preferir clonar manualmente, siga os passos abaixo.

1. **Clone o repositório principal**:
```bash
git clone <URL_DO_REPOSITORIO>
cd Prometheus
```

2. **Verifique se o Makefile existe na raiz**:
```bash
ls -la Makefile
```

3. **Certifique-se de que o Docker está rodando**:
```bash
docker --version
docker compose version
```

> **Nota**: Os repositórios da API, Worker-Occurrence e Worker-Publish serão clonados automaticamente na primeira execução dos comandos `make`. Você também pode cloná-los manualmente usando `make clone` ou comandos individuais (`make clone-api`, `make clone-worker`, `make clone-worker-publish`).

### Como Rodar

O projeto possui um `Makefile` na raiz que automatiza o processo de inicialização.

#### Iniciar todos os serviços

```bash
make up BASE_DIR=/diretorio/desejado
```

Este comando irá:
1. Iniciar a API (porta 8089)
2. Iniciar o Worker-Occurrence (porta 8014)
3. Iniciar o Worker-Publish (porta 8015)
4. Iniciar o Frontend (porta 3000)

> **Nota**: O parâmetro `BASE_DIR` é opcional. Se não especificado, o Makefile usa o diretório atual (`$(CURDIR)`). Recomenda-se especificar o caminho absoluto quando os repositórios estão em locais diferentes.

#### Rodando os serviços individualmente

**Ordem recomendada:**

1. **API** (depende de PostgreSQL, Redis e RabbitMQ)
```bash
make api BASE_DIR=/diretorio/desejado
```
   - O `make api` executa automaticamente setup inicial (cria .env, roda migrations, seeds e swagger).
   - Aguarde a API iniciar completamente antes de prosseguir.

2. **Worker-Publish** (depende da API e do RabbitMQ)
```bash
make worker-publish BASE_DIR=/diretorio/desejado
```

3. **Worker-Occurrence** (depende do RabbitMQ e da API)
```bash
make worker BASE_DIR=/diretorio/desejado
```

4. **Frontend** (depende da API acessível)
```bash
make frontend
```

> **Importante**: sempre use o mesmo `BASE_DIR` em todos os comandos.

### Comandos úteis do Makefile

```bash
# Ver todos os comandos disponíveis
make help

# Iniciar apenas a API
make api BASE_DIR=/diretorio/desejado

# Iniciar apenas o Worker-Occurrence
make worker BASE_DIR=/diretorio/desejado

# Iniciar apenas o Worker-Publish
make worker-publish BASE_DIR=/diretorio/desejado

# Iniciar apenas o Frontend
make frontend

# Iniciar tudo (API + Worker-Occurrence + Worker-Publish + Frontend)
make up BASE_DIR=/diretorio/desejado

# Setup completo da API (.env + composer + key + migrate + seed + swagger)
make setup-api

# Rodar migrations da API
make migrate-api

# Rodar seeds da API
make seed-api

# Gerar documentação Swagger da API
make swagger-api

# Entrar no container da API
make bash-api

# Entrar no container do Worker-Occurrence
make bash-worker

# Entrar no container do Worker-Publish
make bash-worker-publish

# Parar todos os serviços Docker
make down BASE_DIR=/diretorio/desejado

# Parar serviços sem remover containers
make stop BASE_DIR=/diretorio/desejado

# Ver logs da API
make logs-api

# Ver logs do Worker-Occurrence
make logs-worker

# Ver logs do Frontend
make logs-frontend

# Limpar tudo (containers, volumes e rede)
make clean

# Clonar repositórios (executado automaticamente pelo make up/api/worker/worker-publish)
make clone                    # Clona todos os repositórios
make clone-api                # Clona apenas a API
make clone-worker             # Clona apenas o Worker-Occurrence
make clone-worker-publish     # Clona apenas o Worker-Publish
```

### Estrutura de Portas

| Serviço | Porta | Descrição |
|---------|-------|-----------|
| API HTTP | 8089 | API principal |
| Worker-Occurrence HTTP | 8014 | Worker de processamento de ocorrências |
| Worker-Publish HTTP | 8015 | Worker de publicação de eventos (Outbox) |
| PostgreSQL | 5433 | Banco de dados |
| Redis | 6379 | Cache e sessões |
| RabbitMQ AMQP | 5672 | Mensageria |
| RabbitMQ Management | 15672 | Interface web do RabbitMQ |

**Links úteis (local):**
- **Swagger**: http://localhost:8089/api/documentation
- **RabbitMQ Management**: http://localhost:15672

---

## 2. Desenho de Arquitetura

### Visão Geral do Sistema

O sistema é composto por componentes que trabalham em conjunto para gerenciar ocorrências, garantindo idempotência, processamento assíncrono e otimização através de cache. Utiliza o padrão **Outbox** para garantir publicação atômica de eventos na fila de mensageria.

### Diagrama de Arquitetura

![Arquitetura do Sistema](assets/Diagrama.png)

---

## 3. Estratégia de Integração Externa

A integração externa foi desenhada para ser segura, resiliente e escalável. Foi adotado um modelo baseado em **API REST** com processamento assíncrono, separando claramente o momento de recebimento da requisição do momento de processamento da regra de negócio.

### Princípios

- **API recebe, valida e registra o comando**: o processamento ocorre desacoplado via fila
- **Padrão Outbox**: eventos são registrados na tabela `outbox` antes da publicação na fila, garantindo atomicidade
- **Resposta rápida**: API retorna `202 Accepted` com `command_id`
- **Rastreabilidade**: comandos e eventos são auditáveis e reprocessáveis

### Fluxo

1. **Sistema Externo** envia `POST /api/integrations/occurrences` com `X-API-Key` e `Idempotency-Key`
2. **API** valida autenticação, rate limit, idempotência e payload
3. **API** registra comando no `command_inbox` (status: `RECEIVED`) com lock pessimista
4. **API** registra evento na tabela `outbox` (status: `PENDING`) na mesma transação
5. **API** retorna `202 Accepted` com `command_id`
6. **Worker-Publish** processa eventos `PENDING` na `outbox` periodicamente
7. **Worker-Publish** busca comando no `command_inbox` e publica Job na fila RabbitMQ
8. **Worker-Publish** marca evento como `SENT` na `outbox` e comando como `ENQUEUED`
9. **Worker-Occurrence** consome job da fila e processa o comando assincronamente
10. **Worker-Occurrence** atualiza status do `command_inbox` (`PROCESSING`, `SUCCEEDED` ou `FAILED`)

---

## 4. Padrão Outbox

O sistema utiliza o padrão **Outbox** para garantir publicação atômica de eventos na fila de mensageria, resolvendo o problema de consistência entre transações de banco de dados e publicação de mensagens.

### Por que Outbox?

Sem Outbox, há risco de inconsistência:

- **Persistir no banco e falhar ao publicar na fila** → comando "perdido"
- **Publicar na fila e falhar ao persistir** → efeitos fora de sincronia / duplicidade

### Como funciona

1. **API registra `command_inbox` e `outbox` na mesma transação**
2. **Worker-Publish publica eventos pendentes na fila**
3. **Evento passa por estados** (`PENDING` → `PROCESSING` → `SENT`/`FAILED`)

### Estados

- **PENDING**: aguardando publicação
- **PROCESSING**: sendo publicado (lock ativo)
- **SENT**: publicado com sucesso
- **FAILED**: falha definitiva (ex.: comando inexistente, tipo inválido)

### Benefícios

- ✅ **Atomicidade**
- ✅ **Rastreabilidade**
- ✅ **Resiliência**
- ✅ **Reprocessamento**
- ✅ **Concorrência segura** (com `SKIP LOCKED`)

---

## 5. Estratégia de Idempotência

A idempotência é **obrigatória** na criação de ocorrências e em todas as operações de escrita.

### Requisitos

- Toda requisição de escrita (POST/PUT/PATCH) deve enviar `Idempotency-Key`
- O sistema registra o comando no `command_inbox` antes de qualquer processamento
- **Rotas com idempotência** (middleware):
  - `POST /api/integrations/occurrences`
  - `POST /api/occurrences/{id}/start`
  - `POST /api/occurrences/{id}/resolve`
  - `POST /api/occurrences/{id}/cancel`
  - `POST /api/occurrences/{id}/dispatches`
  - `POST /api/dispatches/{id}/close`
  - `PATCH /api/dispatches/{id}/status`
- O frontend React envia automaticamente `Idempotency-Key` via interceptor Axios em todas as requisições mutáveis.

### Controle

A deduplicação é feita pela combinação:

- `idempotency_key` (chave do cliente)
- `scope_key` (escopo; ex.: `externalId`, `occurrenceId`, `dispatchId`)
- `type` (tipo do comando, ex.: `create_occurrence`)

### Payload diferente com mesma key

Se (`idempotency_key` + `scope_key` + `type`) já existe e o `payload_hash` diverge:

- retorna `409 Conflict`
- não executa nenhum efeito

### Validações de negócio adicionais

- Criação de despacho valida que não existe outro despacho com o mesmo `resource_code` na mesma ocorrência.
- Transições de status são validadas no domínio (ex.: não resolve ocorrência cancelada).

### TTL e Cleanup (Expiração de comandos)

Para evitar crescimento infinito do `command_inbox`, o sistema define expiração (TTL) dos comandos.

- **TTL padrão**: 24 horas
- **Configurável via ENV** (ex.: `IDEMPOTENCY_TTL=86400` em segundos)
- A expiração é registrada em `expires_at`. Isso permite deduplicação e rastreabilidade durante a janela de 24h (ou conforme configurado).

#### Estratégia de Cleanup (não pesa request)

O cleanup foi pensado para **não rodar dentro do fluxo de request**, evitando custo extra (locks/deletes) em cada chamada.

✅ **Abordagem:**

Um processo/worker separado (ex.: "Cleanup Worker" ou um schedule dedicado) roda 1x por dia de madrugada e remove comandos expirados:

**Exemplo de comando esperado:**
```bash
php artisan command-inbox:cleanup-expired
```

Nesta entrega, o cleanup pode estar descrito como estratégia e/ou implementado como job agendado, dependendo do estágio do projeto.

---

## 6. Estratégia de Concorrência

Para evitar race conditions, o sistema utiliza múltiplas camadas de proteção.

### Mecanismos

#### Transações atômicas

```php
DB::transaction(function () {
    // Operações atômicas
});
```

#### Lock pessimista (lockForUpdate)

- **No `command_inbox`** (evita corrida na criação/leitura do comando)
- **Nas entidades** (serializa mudança de status e evita lost update)

```php
CommandInboxModel::query()
    ->where('idempotency_key', $key)
    ->where('scope_key', $scope)
    ->lockForUpdate()
    ->first();
```

#### Outbox transacional

- `command_inbox` + `outbox` na mesma transação

#### Worker-Publish com FOR UPDATE SKIP LOCKED

- Permite múltiplas instâncias processarem eventos diferentes
- Evita 2 workers processarem o mesmo evento

### Garantias

- ✅ Requisições simultâneas não duplicam comandos
- ✅ Apenas um worker processa uma entidade por vez
- ✅ Transições inválidas são bloqueadas pelo domínio
- ✅ Consistência sob concorrência

---

## 7. Pontos de Falha e Recuperação

### 1. Falha na API (antes do commit)

- Nada é persistido
- Cliente pode reenviar com a mesma `Idempotency-Key`

### 2. Falha durante a transação (antes do commit)

- Ex.: erro ao inserir `outbox`/`command`
- A transação dá rollback e nenhum registro é persistido
- Cliente pode reenviar com segurança

### 3. Falha no Worker-Publish

- Eventos ficam `PENDING`/`PROCESSING`
- Reprocessamento automático na próxima execução
- Eventos travados em `PROCESSING` podem ser retomados via rotina de manutenção

### 4. Falha no Worker-Occurrence

- Comando vai para `FAILED` (com erro)
- `failed_jobs` pode receber job após retries
- Pode ser reprocessado manualmente conforme estratégia

### 5. Falha no RabbitMQ

- API não perde eventos: ficam no Outbox
- Worker-Publish retenta quando o broker voltar

### 6. Falha no banco

- Escritas falham (API retorna erro)
- Worker-Publish não consegue ler Outbox
- **Recuperação**: retentativa após o DB voltar + práticas de HA (fora do escopo)

### Estratégias de resiliência

- **Idempotência** (retries seguros)
- **Outbox** (não perde evento)
- **Rastreamento total** (`command_inbox` + `outbox`)
- **Desacoplamento** (API não bloqueia processamento)
- **DLQ tripla**: `outbox`(FAILED) + `command_inbox`(FAILED) + `failed_jobs`

---

## 8. Como Validar Rapidamente (CURLs)

Ajuste `X-API-Key` conforme seu `.env` / `.env.example`.

Exemplos abaixo assumem API local em `http://localhost:8089`.

### 1) Criar ocorrência via integração externa (assíncrono)

```bash
curl -X POST "http://localhost:8089/api/integrations/occurrences" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: <API_KEY_EXTERNA>" \
  -H "Idempotency-Key: ext-2026-000123-create" \
  -d '{
    "externalId": "EXT-2026-000123",
    "type": "incendio_urbano",
    "description": "Incêndio em residência",
    "reportedAt": "2026-02-01T14:32:00-03:00"
  }'
```

**Resposta esperada**: `202 Accepted` com `command_id`.

### 2) Consultar status do comando

```bash
curl -X GET "http://localhost:8089/api/commands/<command_id>" \
  -H "X-API-Key: <API_KEY_INTERNA>"
```

### 3) Listar ocorrências

```bash
curl -X GET "http://localhost:8089/api/occurrences?status=in_progress&type=incendio_urbano" \
  -H "X-API-Key: <API_KEY_INTERNA>"
```

---

## 9. Testes Automatizados

Existem testes automatizados na API e nos Workers.

### Rodando testes na API

1. Suba o ambiente (se necessário):
```bash
make api BASE_DIR=/diretorio/desejado
```

2. Entre no container:
```bash
make bash-api
```

3. Rode os testes:
```bash
php artisan test
# ou
./vendor/bin/phpunit
```

### Rodando testes no Worker-Occurrence

```bash
make worker BASE_DIR=/diretorio/desejado
make bash-worker
php artisan test
```

### Rodando testes no Worker-Publish

```bash
make worker-publish BASE_DIR=/diretorio/desejado
make bash-worker-publish
php artisan test
```

Os testes cobrem cenários como: idempotência, transições válidas/inválidas, auditoria, e concorrência simulada (quando aplicável).

---

## 10. O que ficou de fora

Para manter a solução viável no contexto atual, não foram implementados (ou ficaram como evolução):

- **Cleanup automático completo** (rodando em produção como worker/schedule dedicado) — estratégia descrita
- **DLQ dedicada no RabbitMQ** (além do `failed_jobs` e status `FAILED`)
- **Retry com backoff exponencial real**
- **Observabilidade avançada** (métricas + tracing + correlation-id fim-a-fim)
- **Circuit breaker** para integrações externas

A arquitetura já permite adicionar esses itens sem grandes refatorações.

---

## 11. Possível Evolução na Corporação

- **CQRS formal** (read model separado)
- **Event sourcing** (histórico imutável)
- **Observabilidade** (Prometheus/Grafana + OpenTelemetry)
- **DLQ estruturada no RabbitMQ** + reprocessamento assistido
- **API gateway** (Kong/AWS API Gateway)
- **Auth mais robusta** (OAuth2/JWT)
- **Autoscaling de workers** (Kubernetes/HPA com métricas de fila/outbox)
