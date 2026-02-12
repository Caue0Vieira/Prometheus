.PHONY: help network api worker frontend up down clean stop restart logs-api logs-worker

# Variáveis
API_DIR := Api-Occurrence/docker
WORKER_DIR := Worker-Occurrence/docker
FRONTEND_DIR := Front-Occurrence
NETWORK_NAME := internal

# Cores para output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## Mostra esta mensagem de ajuda
	@echo "$(GREEN)=== Comandos Disponíveis ===$(NC)"
	@echo ""
	@echo "$(YELLOW)make up$(NC)          - Inicia todos os serviços (API, Worker e Frontend)"
	@echo "$(YELLOW)make network$(NC)     - Cria a rede Docker 'internal' se não existir"
	@echo "$(YELLOW)make api$(NC)          - Inicia apenas a API"
	@echo "$(YELLOW)make worker$(NC)      - Inicia apenas o Worker"
	@echo "$(YELLOW)make frontend$(NC)    - Inicia apenas o Frontend"
	@echo "$(YELLOW)make down$(NC)        - Para todos os serviços Docker"
	@echo "$(YELLOW)make stop$(NC)        - Para todos os serviços sem remover containers"
	@echo "$(YELLOW)make restart$(NC)     - Reinicia todos os serviços"
	@echo "$(YELLOW)make clean$(NC)       - Remove containers, volumes e rede"
	@echo "$(YELLOW)make logs-api$(NC)    - Mostra logs da API"
	@echo "$(YELLOW)make logs-worker$(NC) - Mostra logs do Worker"
	@echo ""

network: ## Cria a rede Docker 'internal' se não existir
	@echo "$(GREEN)Verificando rede Docker '$(NETWORK_NAME)'...$(NC)"
	@docker network inspect $(NETWORK_NAME) >/dev/null 2>&1 || \
		(docker network create $(NETWORK_NAME) && \
		echo "$(GREEN)✓ Rede '$(NETWORK_NAME)' criada com sucesso$(NC)") || \
		echo "$(YELLOW)✓ Rede '$(NETWORK_NAME)' já existe$(NC)"

api: network ## Inicia a API
	@echo "$(GREEN)Iniciando API...$(NC)"
	@cd $(API_DIR) && docker-compose -p api up -d
	@echo "$(GREEN)✓ API iniciada na porta 8089$(NC)"
	@echo "$(YELLOW)Aguardando API ficar pronta...$(NC)"
	@sleep 5

worker: network ## Inicia o Worker
	@echo "$(GREEN)Iniciando Worker...$(NC)"
	@cd $(WORKER_DIR) && docker-compose -p worker up -d
	@echo "$(GREEN)✓ Worker iniciado na porta 8014$(NC)"
	@echo "$(YELLOW)Aguardando Worker ficar pronto...$(NC)"
	@sleep 3

frontend: ## Inicia o Frontend
	@echo "$(GREEN)Iniciando Frontend...$(NC)"
	@if [ ! -d "$(FRONTEND_DIR)/node_modules" ]; then \
		echo "$(YELLOW)Instalando dependências do Frontend...$(NC)"; \
		cd $(FRONTEND_DIR) && npm install; \
	fi
	@cd $(FRONTEND_DIR) && npm run dev
	@echo "$(GREEN)✓ Frontend iniciado$(NC)"

up: network ## Inicia todos os serviços na ordem: API -> Worker -> Frontend
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

down: ## Para todos os serviços Docker
	@echo "$(YELLOW)Parando serviços Docker...$(NC)"
	@cd $(API_DIR) && docker-compose -p api down 2>/dev/null || true
	@cd $(WORKER_DIR) && docker-compose -p worker down 2>/dev/null || true
	@echo "$(GREEN)✓ Todos os serviços Docker foram parados$(NC)"

stop: ## Para todos os serviços sem remover containers
	@echo "$(YELLOW)Parando serviços Docker (sem remover containers)...$(NC)"
	@cd $(API_DIR) && docker-compose -p api stop 2>/dev/null || true
	@cd $(WORKER_DIR) && docker-compose -p worker stop 2>/dev/null || true
	@echo "$(GREEN)✓ Serviços Docker parados$(NC)"

restart: stop up ## Reinicia todos os serviços

clean: down ## Remove containers, volumes e rede
	@echo "$(RED)Removendo containers, volumes e rede...$(NC)"
	@cd $(API_DIR) && docker-compose -p api down -v 2>/dev/null || true
	@cd $(WORKER_DIR) && docker-compose -p worker down -v 2>/dev/null || true
	@docker network rm $(NETWORK_NAME) 2>/dev/null || true
	@echo "$(GREEN)✓ Limpeza concluída$(NC)"

logs-api: ## Mostra logs da API
	@cd $(API_DIR) && docker-compose -p api logs -f

logs-worker: ## Mostra logs do Worker
	@cd $(WORKER_DIR) && docker-compose -p worker logs -f

