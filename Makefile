.PHONY: help network clone clone-api clone-worker api worker frontend up down clean stop restart logs-api logs-worker

# =========================
# Configuração de clone
# =========================

# URL dos repositórios
API_REPO_URL := https://github.com/Caue0Vieira/Api-Occurrence.git
WORKER_REPO_URL := https://github.com/Caue0Vieira/worker-Occurence.git

# Diretório base padrão (pode ser sobrescrito: make up BASE_DIR=/caminho)
BASE_DIR ?= $(CURDIR)

# Nome das pastas (caso clone no BASE_DIR)
API_PROJECT_NAME ?= Api-Occurrence
WORKER_PROJECT_NAME ?= Worker-Occurrence
FRONTEND_PROJECT_NAME ?= Front-Occurrence

# Caminhos finais (podem ser sobrescritos individualmente)
API_PATH ?= $(BASE_DIR)/$(API_PROJECT_NAME)
WORKER_PATH ?= $(BASE_DIR)/$(WORKER_PROJECT_NAME)
FRONTEND_PATH ?= $(BASE_DIR)/$(FRONTEND_PROJECT_NAME)

# Caminhos para docker-compose dentro de cada projeto
API_DIR := $(API_PATH)/docker
WORKER_DIR := $(WORKER_PATH)/docker
FRONTEND_DIR := $(FRONTEND_PATH)

NETWORK_NAME := internal

# =========================
# Cores para output
# =========================
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

help: ## Mostra esta mensagem de ajuda
	@echo "$(GREEN)=== Comandos Disponíveis ===$(NC)"
	@echo ""
	@echo "$(YELLOW)make clone BASE_DIR=/caminho$(NC)    - Clona API/Worker (e Frontend se quiser) no diretório escolhido"
	@echo "$(YELLOW)make up BASE_DIR=/caminho$(NC)       - Clona (se necessário) e inicia todos os serviços"
	@echo "$(YELLOW)make network$(NC)                   - Cria a rede Docker 'internal' se não existir"
	@echo "$(YELLOW)make api$(NC)                        - Inicia apenas a API"
	@echo "$(YELLOW)make worker$(NC)                    - Inicia apenas o Worker"
	@echo "$(YELLOW)make frontend$(NC)                  - Inicia apenas o Frontend"
	@echo "$(YELLOW)make down$(NC)                      - Para todos os serviços Docker"
	@echo "$(YELLOW)make stop$(NC)                      - Para todos os serviços sem remover containers"
	@echo "$(YELLOW)make restart$(NC)                   - Reinicia todos os serviços"
	@echo "$(YELLOW)make clean$(NC)                     - Remove containers, volumes e rede"
	@echo "$(YELLOW)make logs-api$(NC)                  - Mostra logs da API"
	@echo "$(YELLOW)make logs-worker$(NC)               - Mostra logs do Worker"
	@echo ""
	@echo "$(GREEN)=== Caminhos atuais ===$(NC)"
	@echo "BASE_DIR:      $(BASE_DIR)"
	@echo "API_PATH:      $(API_PATH)"
	@echo "WORKER_PATH:   $(WORKER_PATH)"
	@echo "FRONTEND_PATH: $(FRONTEND_PATH)"
	@echo ""

# =========================
# Rede Docker
# =========================
network: ## Cria a rede Docker 'internal' se não existir
	@echo "$(GREEN)Verificando rede Docker '$(NETWORK_NAME)'...$(NC)"
	@docker network inspect $(NETWORK_NAME) >/dev/null 2>&1 || \
		(docker network create $(NETWORK_NAME) && \
		echo "$(GREEN)✓ Rede '$(NETWORK_NAME)' criada com sucesso$(NC)")

# =========================
# Clone
# =========================
clone: clone-api clone-worker ## Clona API e Worker (se não existirem)
	@echo "$(GREEN)✓ Clone concluído$(NC)"

clone-api: ## Clona a API no caminho escolhido (API_PATH)
	@echo "$(GREEN)Preparando clone da API em: $(API_PATH)$(NC)"
	@mkdir -p "$(dir $(API_PATH))"
	@if [ -d "$(API_PATH)/.git" ]; then \
		echo "$(YELLOW)✓ API já clonada. Pulando...$(NC)"; \
	else \
		echo "$(GREEN)Clonando API...$(NC)"; \
		git clone "$(API_REPO_URL)" "$(API_PATH)"; \
		echo "$(GREEN)✓ API clonada com sucesso$(NC)"; \
	fi

clone-worker: ## Clona o Worker no caminho escolhido (WORKER_PATH)
	@echo "$(GREEN)Preparando clone do Worker em: $(WORKER_PATH)$(NC)"
	@mkdir -p "$(dir $(WORKER_PATH))"
	@if [ -d "$(WORKER_PATH)/.git" ]; then \
		echo "$(YELLOW)✓ Worker já clonado. Pulando...$(NC)"; \
	else \
		echo "$(GREEN)Clonando Worker...$(NC)"; \
		git clone "$(WORKER_REPO_URL)" "$(WORKER_PATH)"; \
		echo "$(GREEN)✓ Worker clonado com sucesso$(NC)"; \
	fi

# =========================
# Subidas
# =========================
api: network clone-api ## Inicia a API
	@echo "$(GREEN)Iniciando API...$(NC)"
	@cd "$(API_DIR)" && docker-compose -p api up -d
	@echo "$(GREEN)✓ API iniciada na porta 8089$(NC)"
	@echo "$(YELLOW)Aguardando API ficar pronta...$(NC)"
	@sleep 5

worker: network clone-worker ## Inicia o Worker
	@echo "$(GREEN)Iniciando Worker...$(NC)"
	@cd "$(WORKER_DIR)" && docker-compose -p worker up -d
	@echo "$(GREEN)✓ Worker iniciado na porta 8014$(NC)"
	@echo "$(YELLOW)Aguardando Worker ficar pronto...$(NC)"
	@sleep 3

frontend: ## Inicia o Frontend (assume que o Frontend já existe em FRONTEND_PATH)
	@echo "$(GREEN)Iniciando Frontend...$(NC)"
	@if [ ! -d "$(FRONTEND_DIR)" ]; then \
		echo "$(RED)✗ Frontend não encontrado em: $(FRONTEND_DIR)$(NC)"; \
		echo "$(YELLOW)Dica: ajuste FRONTEND_PATH ou clone o Frontend para esse local.$(NC)"; \
		exit 1; \
	fi
	@if [ ! -d "$(FRONTEND_DIR)/node_modules" ]; then \
		echo "$(YELLOW)Instalando dependências do Frontend...$(NC)"; \
		cd "$(FRONTEND_DIR)" && npm install; \
	fi
	@cd "$(FRONTEND_DIR)" && npm run dev
	@echo "$(GREEN)✓ Frontend iniciado$(NC)"

up: network clone ## Inicia todos os serviços na ordem: API -> Worker -> Frontend
	@echo "$(GREEN)=== Iniciando todos os serviços ===$(NC)"
	@echo ""
	@$(MAKE) api
	@echo ""
	@$(MAKE) worker
	@echo ""
	@echo "$(GREEN)=== Serviços Docker iniciados ===$(NC)"
	@echo "$(YELLOW)Iniciando Frontend (pressione Ctrl+C para parar)...$(NC)"
	@echo ""
	@$(MAKE) frontend

# =========================
# Down / Stop / Clean
# =========================
down: ## Para todos os serviços Docker
	@echo "$(YELLOW)Parando serviços Docker...$(NC)"
	@cd "$(API_DIR)" && docker-compose -p api down 2>/dev/null || true
	@cd "$(WORKER_DIR)" && docker-compose -p worker down 2>/dev/null || true
	@echo "$(GREEN)✓ Todos os serviços Docker foram parados$(NC)"

stop: ## Para todos os serviços sem remover containers
	@echo "$(YELLOW)Parando serviços Docker (sem remover containers)...$(NC)"
	@cd "$(API_DIR)" && docker-compose -p api stop 2>/dev/null || true
	@cd "$(WORKER_DIR)" && docker-compose -p worker stop 2>/dev/null || true
	@echo "$(GREEN)✓ Serviços Docker parados$(NC)"

restart: stop up ## Reinicia todos os serviços

clean: down ## Remove containers, volumes e rede
	@echo "$(RED)Removendo containers, volumes e rede...$(NC)"
	@cd "$(API_DIR)" && docker-compose -p api down -v 2>/dev/null || true
	@cd "$(WORKER_DIR)" && docker-compose -p worker down -v 2>/dev/null || true
	@docker network rm "$(NETWORK_NAME)" 2>/dev/null || true
	@echo "$(GREEN)✓ Limpeza concluída$(NC)"

logs-api: ## Mostra logs da API
	@cd "$(API_DIR)" && docker-compose -p api logs -f

logs-worker: ## Mostra logs do Worker
	@cd "$(WORKER_DIR)" && docker-compose -p worker logs -f
