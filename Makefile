.PHONY: help dev start install-deps
.DEFAULT_GOAL := help

help:
	@echo ""
	@echo "  🛠️  Development:"
	@echo "    dev                - Start Next.js dev server"
	@echo "    start              - Interactive start (dev/docker/prod)"
	@echo ""

dev:
	npm run dev

install-deps:
	npm install

start:
	@echo ""
	@echo "🚀 Select how to start the frontend:"
	@echo "  1) Dev mode      - Next.js dev server, uses .env.local / .env.development"
	@echo "  2) Docker (test) - Frontend in Docker, uses .env.test"
	@echo "  3) Prod mode     - Optimized build + start, uses .env.production"
	@echo ""
	@read -p "Enter choice [1-3]: " choice; \
	case $$choice in \
		1) \
			echo ""; \
			echo "▶ Starting frontend in dev mode (logs below)..."; \
			$(MAKE) dev || (echo "Dev failed, installing dependencies and retrying..."; $(MAKE) install-deps; $(MAKE) dev); \
			;; \
		2) \
			echo ""; \
			echo "▶ Starting frontend Docker stack for testing (showing logs)..."; \
			[ -f .env.test ] || (echo ".env.test not found"; exit 1); \
			docker compose --env-file .env.test up; \
			;; \
		3) \
			echo ""; \
			echo "▶ Starting frontend in production mode (build + start, logs below)..."; \
			[ -f .env.production ] || (echo ".env.production not found"; exit 1); \
			NODE_ENV=production npm run build && NODE_ENV=production npm run start; \
			;; \
		*) \
			echo "Invalid choice. Aborting."; \
			exit 1; \
			;; \
	esac

