.PHONY: help clone clone-api clone-worker clone-worker-publish create-network \
        api worker worker-publish frontend up down stop restart clean \
        logs-api logs-worker logs-frontend \
        bash-api bash-worker bash-worker-publish \
        setup-api setup-worker setup-worker-publish \
        migrate-api seed-api swagger-api

# =========================
# Configuração de clone
# =========================

API_REPO_URL := https://github.com/Caue0Vieira/Api-Occurrence.git
WORKER_REPO_URL := https://github.com/Caue0Vieira/Worker-Occurrence.git
WORKER_PUBLISH_REPO_URL := https://github.com/Caue0Vieira/Worker-Publish.git

BASE_DIR ?= $(CURDIR)

API_PROJECT_NAME ?= Api-Occurrence
WORKER_PROJECT_NAME ?= Worker-Occurrence
WORKER_PUBLISH_PROJECT_NAME ?= Worker-Publish

API_PATH ?= $(BASE_DIR)/$(API_PROJECT_NAME)
WORKER_PATH ?= $(BASE_DIR)/$(WORKER_PROJECT_NAME)
WORKER_PUBLISH_PATH ?= $(BASE_DIR)/$(WORKER_PUBLISH_PROJECT_NAME)

API_DIR := $(API_PATH)/docker
WORKER_DIR := $(WORKER_PATH)/docker
WORKER_PUBLISH_DIR := $(WORKER_PUBLISH_PATH)/docker

FRONTEND_DIR := Front-Occurrence
FRONTEND_DOCKER_DIR := $(FRONTEND_DIR)/docker

# =========================
# Helpers
# =========================

API_CID = $$(docker ps -q \
	--filter "label=com.docker.compose.project=api" \
	--filter "label=com.docker.compose.service=app" \
	| head -n 1)

WORKER_CID = $$(docker ps -q \
	--filter "label=com.docker.compose.project=worker" \
	--filter "label=com.docker.compose.service=app" \
	| head -n 1)

WORKER_PUBLISH_CID = $$(docker ps -q \
	--filter "label=com.docker.compose.project=worker-publish" \
	--filter "label=com.docker.compose.service=app" \
	| head -n 1)

API_EXEC = docker exec -it $(API_CID) bash -lc
WORKER_EXEC = docker exec -it $(WORKER_CID) bash -lc
WORKER_PUBLISH_EXEC = docker exec -it $(WORKER_PUBLISH_CID) bash -lc

GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

# =========================
# Help
# =========================

help:
	@echo "$(GREEN)=== Comandos Disponíveis ===$(NC)"
	@echo "$(YELLOW)make up BASE_DIR=/caminho$(NC)        - Sobe tudo"
	@echo "$(YELLOW)make api$(NC)                         - Sobe API"
	@echo "$(YELLOW)make worker$(NC)                      - Sobe Worker"
	@echo "$(YELLOW)make worker-publish$(NC)              - Sobe Worker-Publish"
	@echo "$(YELLOW)make frontend$(NC)                    - Sobe Frontend (Docker)"
	@echo "$(YELLOW)make down$(NC)                        - Derruba tudo"
	@echo "$(YELLOW)make clean$(NC)                       - Remove containers e volumes"
	@echo ""

# =========================
# Clone
# =========================

clone: clone-api clone-worker clone-worker-publish

clone-api:
	@mkdir -p "$(dir $(API_PATH))"
	@if [ -d "$(API_PATH)/.git" ]; then \
		echo "$(YELLOW)API já clonada$(NC)"; \
	else \
		git clone "$(API_REPO_URL)" "$(API_PATH)"; \
	fi

clone-worker:
	@mkdir -p "$(dir $(WORKER_PATH))"
	@if [ -d "$(WORKER_PATH)/.git" ]; then \
		echo "$(YELLOW)Worker já clonado$(NC)"; \
	else \
		git clone "$(WORKER_REPO_URL)" "$(WORKER_PATH)"; \
	fi

clone-worker-publish:
	@mkdir -p "$(dir $(WORKER_PUBLISH_PATH))"
	@if [ -d "$(WORKER_PUBLISH_PATH)/.git" ]; then \
		echo "$(YELLOW)Worker-Publish já clonado$(NC)"; \
	else \
		git clone "$(WORKER_PUBLISH_REPO_URL)" "$(WORKER_PUBLISH_PATH)"; \
	fi

# =========================
# Rede Compartilhada
# =========================

create-network:
	@docker network inspect occurrence_shared >/dev/null 2>&1 || docker network create occurrence_shared >/dev/null

# =========================
# Subidas
# =========================

api: clone-api create-network
	@cd "$(API_DIR)" && docker-compose -p api up -d
	@sleep 6
	@$(MAKE) setup-api

worker: clone-worker create-network
	@cd "$(WORKER_DIR)" && docker-compose -p worker up -d
	@sleep 6
	@$(MAKE) setup-worker

worker-publish: clone-worker-publish create-network
	@cd "$(WORKER_PUBLISH_DIR)" && docker-compose -p worker-publish up -d
	@sleep 6
	@$(MAKE) setup-worker-publish

frontend:
	@cd "$(FRONTEND_DOCKER_DIR)" && docker-compose -p frontend up -d --build
	@echo "$(GREEN)Frontend disponível em http://localhost:3000$(NC)"

up: clone api worker worker-publish frontend

# =========================
# Setup API
# =========================

setup-api:
	@if [ -z "$(API_CID)" ]; then echo "$(RED)Container API não encontrado$(NC)"; exit 1; fi
	@$(API_EXEC) "cp -n .env.example .env || true"
	@$(API_EXEC) "php artisan migrate:fresh --seed --force"
	@$(API_EXEC) "php artisan l5-swagger:generate || true"

migrate-api:
	@$(API_EXEC) "php artisan migrate:fresh --force"

seed-api:
	@$(API_EXEC) "php artisan db:seed --force"

swagger-api:
	@$(API_EXEC) "php artisan l5-swagger:generate"

# =========================
# Setup Worker
# =========================

setup-worker:
	@if [ -z "$(WORKER_CID)" ]; then echo "$(RED)Container Worker não encontrado$(NC)"; exit 1; fi
	@$(WORKER_EXEC) "cp -n .env.example .env || true"

setup-worker-publish:
	@if [ -z "$(WORKER_PUBLISH_CID)" ]; then echo "$(RED)Container Worker-Publish não encontrado$(NC)"; exit 1; fi
	@$(WORKER_PUBLISH_EXEC) "cp -n .env.example .env || true"

# =========================
# Bash
# =========================

bash-api:
	@docker exec -it $(API_CID) bash

bash-worker:
	@docker exec -it $(WORKER_CID) bash

bash-worker-publish:
	@docker exec -it $(WORKER_PUBLISH_CID) bash

# =========================
# Logs
# =========================

logs-api:
	@cd "$(API_DIR)" && docker-compose -p api logs -f

logs-worker:
	@cd "$(WORKER_DIR)" && docker-compose -p worker logs -f

logs-frontend:
	@cd "$(FRONTEND_DOCKER_DIR)" && docker-compose -p frontend logs -f

# =========================
# Stop / Down / Clean
# =========================

down:
	@cd "$(API_DIR)" && docker-compose -p api down || true
	@cd "$(WORKER_DIR)" && docker-compose -p worker down || true
	@cd "$(WORKER_PUBLISH_DIR)" && docker-compose -p worker-publish down || true
	@cd "$(FRONTEND_DOCKER_DIR)" && docker-compose -p frontend down || true

stop:
	@cd "$(API_DIR)" && docker-compose -p api stop || true
	@cd "$(WORKER_DIR)" && docker-compose -p worker stop || true
	@cd "$(WORKER_PUBLISH_DIR)" && docker-compose -p worker-publish stop || true
	@cd "$(FRONTEND_DOCKER_DIR)" && docker-compose -p frontend stop || true

clean: down
	@cd "$(API_DIR)" && docker-compose -p api down -v || true
	@cd "$(WORKER_DIR)" && docker-compose -p worker down -v || true
	@cd "$(WORKER_PUBLISH_DIR)" && docker-compose -p worker-publish down -v || true
	@cd "$(FRONTEND_DOCKER_DIR)" && docker-compose -p frontend down -v || true
